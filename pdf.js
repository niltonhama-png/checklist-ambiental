/* Geração do relatório PDF no próprio celular (jsPDF). */

const COR = {
  verdeEscuro: [0, 71, 62], verde: [11, 107, 92], verdeClaro: [124, 193, 66], azul: [13, 106, 168],
  texto: [28, 43, 39], cinza: [91, 107, 102], borda: [219, 229, 225], zebra: [246, 249, 248],
  ok: [30, 158, 74], nc: [211, 47, 47], na: [120, 144, 156], ncBg: [253, 236, 236], azulBg: [230, 241, 249],
};

/* As fontes padrão do PDF não têm alguns símbolos tipográficos: troca por equivalentes seguros. */
const pt = (s) => String(s ?? '')
  .replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/…/g, '...').replace(/•/g, '-').replace(/[≤]/g, '<=').replace(/[≥]/g, '>=')
  .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');

async function urlParaDataURL(url) {
  const blob = await (await fetch(url)).blob();
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
}

async function gerarPDF(insp, fotos, emissor) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = 210, H = 297, M = 15, CW = W - 2 * M;
  const TOPO = 30, BASE = H - 16;
  const d = insp.dados;

  const [logoA, logoL] = await Promise.all([urlParaDataURL('img/logo-agrohama.jpg'), urlParaDataURL('img/logo-loren.jpg')]);
  const RA = 900 / 505, RL = 800 / 416; // proporções das logos

  const fotosPor = {};
  fotos.sort((a, b) => a.ts - b.ts).forEach((f) => { (fotosPor[f.key] = fotosPor[f.key] || []).push(f); });

  /* ---- helpers ---- */
  let y = TOPO;
  const cor = (c, tipo = 'text') => (tipo === 'text' ? doc.setTextColor(...c) : tipo === 'fill' ? doc.setFillColor(...c) : doc.setDrawColor(...c));
  const fonte = (estilo = 'normal', tam = 10) => { doc.setFont('helvetica', estilo); doc.setFontSize(tam); };
  const linhas = (txt, larg) => doc.splitTextToSize(pt(txt), larg);
  const LH = (tam) => tam * 0.3528 * 1.25; // altura de linha em mm

  function cabecalho() {
    doc.addImage(logoA, 'JPEG', M, 8, 13 * RA, 13, 'logoA', 'FAST');
    doc.addImage(logoL, 'JPEG', W - M - 13 * RL, 8, 13 * RL, 13, 'logoL', 'FAST');
    fonte('bold', 10); cor(COR.verdeEscuro);
    doc.text(pt('Relatório de Inspeção - Gestão Ambiental'), W / 2, 14, { align: 'center' });
    fonte('normal', 8); cor(COR.cinza);
    doc.text(pt([d.empresa, d.fazenda].filter(Boolean).join(' - ')), W / 2, 18.5, { align: 'center', maxWidth: 110 });
    cor(COR.verdeClaro, 'draw'); doc.setLineWidth(0.8); doc.line(M, 24, W - M, 24);
  }
  function novaPagina() { doc.addPage(); cabecalho(); y = TOPO; }
  function garantir(h) { if (y + h > BASE) novaPagina(); }

  function tituloSecao(txt) {
    garantir(16);
    cor(COR.verdeEscuro, 'fill'); doc.roundedRect(M, y, CW, 9, 1.5, 1.5, 'F');
    fonte('bold', 11); cor([255, 255, 255]);
    doc.text(pt(txt).toUpperCase(), M + 3, y + 6.2);
    y += 12;
  }

  function selo(r, x, yy, w) {
    const map = { C: ['CONFORME', COR.ok], NC: ['NÃO CONFORME', COR.nc], NA: ['NÃO SE APLICA', COR.na] };
    const [txt, c] = map[r] || ['NÃO AVALIADO', null];
    if (c) { cor(c, 'fill'); doc.roundedRect(x, yy, w, 5.6, 1.2, 1.2, 'F'); cor([255, 255, 255]); }
    else { cor(COR.borda, 'draw'); doc.setLineWidth(0.3); doc.roundedRect(x, yy, w, 5.6, 1.2, 1.2, 'S'); cor(COR.cinza); }
    fonte('bold', 7); doc.text(pt(txt), x + w / 2, yy + 3.9, { align: 'center' });
  }

  /* ---- numeração das não conformidades ---- */
  const ncs = [];
  CHECKLIST.forEach((s) => itensDaSecao(insp, s).forEach((it) => {
    const r = insp.resp[it.key];
    if (r?.r === 'NC') ncs.push({ sec: s, it, r, cod: 'NC-' + String(ncs.length + 1).padStart(2, '0'), fotos: fotosPor[it.key] || [] });
  }));
  const codNC = Object.fromEntries(ncs.map((n) => [n.it.key, n.cod]));

  /* =========================== CAPA =========================== */
  cor(COR.verdeEscuro, 'fill'); doc.rect(0, 0, W, 4, 'F');
  cor(COR.verdeClaro, 'fill'); doc.rect(0, 4, W, 1.2, 'F');
  doc.addImage(logoA, 'JPEG', M, 12, 28 * RA, 28, 'logoA', 'FAST');
  doc.addImage(logoL, 'JPEG', W - M - 26 * RL, 13, 26 * RL, 26, 'logoL', 'FAST');

  y = 54;
  fonte('bold', 22); cor(COR.verdeEscuro); doc.text(pt('Relatório de Inspeção'), M, y);
  fonte('normal', 15); cor(COR.azul); doc.text(pt('Gestão Ambiental - Check List de Regularização'), M, y + 8);
  cor(COR.verdeClaro, 'draw'); doc.setLineWidth(1.2); doc.line(M, y + 13, M + 40, y + 13);

  // Quadro de identificação
  y += 19;
  const ident = [
    ['Empresa', d.empresa], ['Fazenda', d.fazenda], ['Inspeção realizada em', dataBR(d.data)],
    ['Preparado por', emissor.consultoria], ['CNPJ', emissor.cnpj],
    ['Executado por', `${emissor.profissional} - ${emissor.cargo}, ${emissor.registro}`],
  ];
  fonte('normal', 10);
  const altIdent = ident.reduce((a, [, v]) => a + Math.max(1, linhas(v || '-', CW - 58).length) * 4.6 + 2.4, 3);
  cor(COR.zebra, 'fill'); cor(COR.borda, 'draw'); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, CW, altIdent, 2, 2, 'FD');
  let yy = y + 6;
  ident.forEach(([k, v]) => {
    fonte('bold', 9); cor(COR.cinza); doc.text(pt(k).toUpperCase(), M + 5, yy);
    fonte('normal', 10.5); cor(COR.texto);
    const ls = linhas(v || '-', CW - 58); doc.text(ls, M + 53, yy);
    yy += Math.max(1, ls.length) * 4.6 + 2.4;
  });
  y += altIdent + 8;

  // Resumo
  const tot = contarTudo(insp), pct = pctConf(tot);
  fonte('bold', 12); cor(COR.verdeEscuro); doc.text(pt('Resumo da inspeção'), M, y); y += 5;
  const caixas = [
    ['Itens avaliados', `${tot.resp}/${tot.total}`, COR.azul],
    ['Conformes', String(tot.C), COR.ok],
    ['Não conformes', String(tot.NC), COR.nc],
    ['Não se aplica', String(tot.NA), COR.na],
    ['Índice de conformidade', pct === null ? '-' : pct + '%', COR.verdeEscuro],
  ];
  const bw = (CW - 4 * 3) / 5;
  caixas.forEach(([l, v, c], i) => {
    const x = M + i * (bw + 3);
    cor(c, 'fill'); doc.roundedRect(x, y, bw, 18, 2, 2, 'F');
    fonte('bold', 15); cor([255, 255, 255]); doc.text(v, x + bw / 2, y + 9, { align: 'center' });
    fonte('normal', 7); doc.text(linhas(l, bw - 4), x + bw / 2, y + 14, { align: 'center' });
  });
  y += 23;

  // Tabela por seção
  const cols = [M, M + 104, M + 118, M + 132, M + 146, M + 160];
  const cab = ['Item inspecionado', 'C', 'NC', 'N/A', 'Pend.', '% Conf.'];
  cor(COR.verdeEscuro, 'fill'); doc.rect(M, y, CW, 6.5, 'F');
  fonte('bold', 8); cor([255, 255, 255]);
  cab.forEach((c, i) => doc.text(c, i ? cols[i] + 7 + (i === 5 ? 5 : 0) : cols[0] + 2, y + 4.4, i ? { align: 'center' } : {}));
  y += 6.5;
  const RH = 4.9;
  CHECKLIST.forEach((s, i) => {
    if (y + RH > BASE) { novaPagina(); }
    const c = contar(insp, s), p = pctConf(c);
    if (i % 2) { cor(COR.zebra, 'fill'); doc.rect(M, y, CW, RH, 'F'); }
    fonte('normal', 8); cor(COR.texto);
    doc.text(pt(`${s.id}. ${s.titulo}`), cols[0] + 2, y + 3.4, { maxWidth: 100 });
    [c.C, c.NC, c.NA, c.total - c.resp].forEach((v, j) => {
      cor(j === 1 && v ? COR.nc : COR.texto); fonte(j === 1 && v ? 'bold' : 'normal', 8);
      doc.text(String(v), cols[j + 1] + 7, y + 3.4, { align: 'center' });
    });
    fonte('bold', 8); cor(p === null ? COR.cinza : p === 100 ? COR.ok : p >= 70 ? COR.azul : COR.nc);
    doc.text(p === null ? '-' : p + '%', cols[5] + 12, y + 3.4, { align: 'center' });
    y += RH;
  });
  cor(COR.borda, 'draw'); doc.setLineWidth(0.2); doc.line(M, y, W - M, y);
  y += 4;
  fonte('italic', 7); cor(COR.cinza);
  doc.text(pt('Índice de conformidade = conformes / (conformes + não conformes). Itens "não se aplica" não entram no cálculo.'), M, y + 2);

  /* ======================= CHECKLIST ======================= */
  novaPagina();
  const XN = M + 2, XT = M + 13, WT = CW - 13 - 34, XS = W - M - 31, WS = 30;
  CHECKLIST.forEach((s) => {
    tituloSecao(`${s.id}. ${s.titulo}`);
    blocosDaSecao(insp, s).forEach((b) => {
      if (b.rotulo) {
        garantir(12);
        fonte('bold', 9); cor(COR.azul);
        doc.text(pt(b.rotulo + (b.nomeInst ? ' - ' + b.nomeInst : '')).toUpperCase(), M + 1, y + 3.5);
        cor(COR.azul, 'draw'); doc.setLineWidth(0.3); doc.line(M, y + 5, W - M, y + 5);
        y += 7.5;
      }
      if (!b.itens.length) return;
      b.itens.forEach((it, i) => {
        const r = insp.resp[it.key];
        fonte('normal', 9);
        const ls = linhas(it.texto, WT);
        const extra = r?.r === 'NC' ? 4.2 : 0;
        const h = Math.max(7.5, ls.length * LH(9) + 3.5 + extra);
        garantir(h);
        if (i % 2 === 0) { cor(COR.zebra, 'fill'); doc.rect(M, y, CW, h, 'F'); }
        if (r?.r === 'NC') { cor(COR.ncBg, 'fill'); doc.rect(M, y, CW, h, 'F'); cor(COR.nc, 'fill'); doc.rect(M, y, 1, h, 'F'); }
        fonte('bold', 8.5); cor(COR.verde); doc.text(it.num, XN, y + 4.8);
        fonte('normal', 9); cor(COR.texto); doc.text(ls, XT, y + 4.8);
        if (r?.r === 'NC') {
          const nf = (fotosPor[it.key] || []).length;
          fonte('bold', 7.5); cor(COR.nc);
          doc.text(pt(`Ver ${codNC[it.key]} no Registro de Não Conformidades${nf ? ` (${nf} foto${nf > 1 ? 's' : ''})` : ''}`), XT, y + 4.8 + ls.length * LH(9) + 0.6);
        }
        selo(r?.r, XS, y + (h - 5.6) / 2, WS);
        y += h;
      });
      y += 2;
    });
    if (s.nota) {
      fonte('italic', 8.5);
      const ls = linhas('Nota: ' + s.nota, CW - 8);
      const h = ls.length * LH(8.5) + 5;
      garantir(h + 2);
      cor(COR.azulBg, 'fill'); doc.rect(M, y, CW, h, 'F'); cor(COR.azul, 'fill'); doc.rect(M, y, 1, h, 'F');
      cor(COR.texto); doc.text(ls, M + 4, y + 4.5);
      y += h + 2;
    }
    y += 4;
  });

  /* ================= REGISTRO DE NÃO CONFORMIDADES ================= */
  novaPagina();
  tituloSecao('Registro de Não Conformidades');
  if (!ncs.length) {
    fonte('normal', 10); cor(COR.ok);
    doc.text(pt('Nenhuma não conformidade foi registrada nesta inspeção.'), M, y + 4); y += 12;
  }
  ncs.forEach((n) => {
    fonte('bold', 10);
    const lsItem = linhas(n.it.texto, CW - 8);
    fonte('normal', 9.5);
    const lsObs = linhas(n.r.obs?.trim() || 'Sem observação registrada.', CW - 8);
    const hTexto = 9 + lsItem.length * LH(10) + 6 + lsObs.length * LH(9.5) + (n.r.prazo ? 7 : 2);
    garantir(hTexto + (n.fotos.length ? 40 : 0)); // mantém o início da NC junto com a 1ª linha de fotos

    // cabeçalho da NC
    cor(COR.nc, 'fill'); doc.roundedRect(M, y, CW, 7.5, 1.5, 1.5, 'F');
    fonte('bold', 10); cor([255, 255, 255]);
    doc.text(n.cod, M + 3, y + 5.2);
    fonte('normal', 9);
    doc.text(pt(`Item ${n.it.num}  |  ${n.sec.titulo}${n.it.bloco.repetivel ? '  |  ' + n.it.bloco.rotulo + (n.it.bloco.nomeInst ? ' (' + n.it.bloco.nomeInst + ')' : '') : ''}`), M + 22, y + 5.2, { maxWidth: CW - 25 });
    y += 10;
    fonte('bold', 10); cor(COR.texto); doc.text(lsItem, M + 2, y + 2); y += lsItem.length * LH(10) + 2.5;
    fonte('bold', 8); cor(COR.cinza); doc.text(pt('OBSERVAÇÕES'), M + 2, y + 2); y += 4.5;
    fonte('normal', 9.5); cor(COR.texto);
    // observação pode ser longa: quebra entre páginas
    lsObs.forEach((l) => { garantir(LH(9.5) + 1); doc.text(l, M + 2, y + 2.5); y += LH(9.5); });
    y += 2;
    if (n.r.prazo) {
      garantir(7);
      fonte('bold', 8); cor(COR.cinza); doc.text(pt('PRAZO PARA ADEQUAÇÃO: '), M + 2, y + 2.5);
      fonte('bold', 9); cor(COR.nc); doc.text(pt(n.r.prazo), M + 42, y + 2.5);
      y += 6;
    }

    // fotos em grade de 2 colunas
    if (n.fotos.length) {
      y += 2;
      const gap = 6, cw = (CW - gap) / 2, chMax = 68;
      for (let i = 0; i < n.fotos.length; i += 2) {
        const par = n.fotos.slice(i, i + 2);
        const dims = par.map((f) => { const k = Math.min(cw / f.w, chMax / f.h); return { w: f.w * k, h: f.h * k }; });
        const hl = Math.max(...dims.map((x) => x.h)) + 7;
        garantir(hl);
        par.forEach((f, j) => {
          const x0 = M + j * (cw + gap), dm = dims[j];
          const xi = x0 + (cw - dm.w) / 2;
          cor(COR.borda, 'draw'); doc.setLineWidth(0.3); doc.rect(xi - 0.5, y - 0.5, dm.w + 1, dm.h + 1, 'S');
          doc.addImage(f.data, 'JPEG', xi, y, dm.w, dm.h, 'f' + f.id, 'FAST');
          fonte('normal', 7.5); cor(COR.cinza);
          const letra = String.fromCharCode(97 + i + j);
          doc.text(pt(`Foto ${n.cod}-${letra} - ${dataHoraBR(f.ts)}`), x0 + cw / 2, y + dm.h + 4.2, { align: 'center' });
        });
        y += hl + 2;
      }
    }
    y += 4;
    cor(COR.borda, 'draw'); doc.setLineWidth(0.2); doc.line(M, y - 2, W - M, y - 2);
    y += 2;
  });

  if ((d.obsGerais || '').trim()) {
    y += 4;
    tituloSecao('Observações gerais');
    fonte('normal', 10); cor(COR.texto);
    linhas(d.obsGerais.trim(), CW - 4).forEach((l) => { garantir(LH(10) + 1); doc.text(l, M + 2, y + 2); y += LH(10); });
  }

  /* ================= TERMO DE CIÊNCIA E RESPONSABILIDADE ================= */
  novaPagina();
  y = 48;
  fonte('bold', 15); cor(COR.verdeEscuro);
  doc.text(pt('TERMO DE CIÊNCIA E RESPONSABILIDADE'), W / 2, y, { align: 'center' });
  cor(COR.verdeClaro, 'draw'); doc.setLineWidth(1); doc.line(W / 2 - 25, y + 4, W / 2 + 25, y + 4);
  y += 20;
  const par1 = `A empresa ${d.empresa}, responsável pela propriedade ${d.fazenda}, declara ter tomado conhecimento do Relatório de Inspeção - Gestão Ambiental, disponibilizado pela empresa ${emissor.consultoria}, CNPJ ${emissor.cnpj}, emitido pelo(a) profissional ${emissor.profissional}, ${emissor.registro}, referente à inspeção realizada em ${dataBR(d.data)}.`;
  const par2 = 'Declara, ainda, que concorda inteiramente com todos os registros e observações apontados no mencionado Relatório e se responsabiliza por tomar todas as providências necessárias para atender aos itens de regularização ambiental.';
  fonte('normal', 11.5); cor(COR.texto);
  [par1, par2].forEach((p) => {
    const ls = linhas(p, CW - 10);
    doc.text(ls, M + 5, y, { align: 'justify', maxWidth: CW - 10, lineHeightFactor: 1.5 });
    y += ls.length * LH(11.5) * 1.2 + 8;
  });
  y += 6;
  doc.text(pt(`${d.cidade || emissor.cidade}, ${dataExtenso(d.data)}.`), W - M - 5, y, { align: 'right' });

  // assinaturas
  const ya = 215, larg = 75;
  const blocosAss = [
    { x: M + 5, img: insp.assinaturas?.prof, l: [emissor.profissional, emissor.cargo, emissor.registro], neg: emissor.consultoria },
    { x: W - M - 5 - larg, img: insp.assinaturas?.resp, l: [d.responsavel || '', d.cargoResp || 'Responsável', d.empresa].filter((v, i) => v || i), neg: '' },
  ];
  blocosAss.forEach((b) => {
    if (b.img) {
      const pr = doc.getImageProperties(b.img);
      const k = Math.min(larg / pr.width, 26 / pr.height), iw = pr.width * k, ih = pr.height * k;
      doc.addImage(b.img, 'PNG', b.x + (larg - iw) / 2, ya - ih - 0.5, iw, ih, undefined, 'FAST');
    }
    cor(COR.texto, 'draw'); doc.setLineWidth(0.3); doc.line(b.x, ya, b.x + larg, ya);
    let yl = ya + 5;
    b.l.forEach((t, i) => {
      if (!t) { yl += 4.5; return; }
      fonte(i === 0 ? 'bold' : 'normal', i === 0 ? 10 : 9); cor(i === 0 ? COR.texto : COR.cinza);
      const ls = linhas(t, larg); doc.text(ls, b.x + larg / 2, yl, { align: 'center' }); yl += ls.length * 4.5;
    });
  });

  /* ================= rodapé com paginação ================= */
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    cor(COR.borda, 'draw'); doc.setLineWidth(0.2); doc.line(M, H - 11, W - M, H - 11);
    fonte('normal', 7.5); cor(COR.cinza);
    doc.text(pt(`${emissor.consultoria} - CNPJ ${emissor.cnpj}`), M, H - 7);
    doc.text(`Página ${i} de ${n}`, W - M, H - 7, { align: 'right' });
  }

  return doc.output('blob');
}

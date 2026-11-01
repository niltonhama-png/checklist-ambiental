/* =========================================================
 * Check List – Inspeção Ambiental
 * App principal: telas, respostas, fotos e fluxo de finalização
 * ========================================================= */

/* ---------- utilidades ---------- */
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const hojeISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
function dataExtenso(iso) { if (!iso) return ''; const [a, m, d] = iso.split('-'); return `${d} de ${MESES[+m - 1]} de ${a}`; }
function dataBR(iso) { if (!iso) return ''; const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; }
function dataHoraBR(ts) { const d = new Date(ts); return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); }

function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), ms);
}
function overlay(msg) {
  const o = $('#overlay');
  if (msg === false) { o.hidden = true; return; }
  $('#overlay-msg').textContent = msg; o.hidden = false;
}

const PRAZOS = ['', 'Imediato', '7 dias', '15 dias', '30 dias', '60 dias', '90 dias', '180 dias'];

/* ---------- configuração (localStorage) ---------- */
function lerConfig() {
  let c = {};
  try { c = JSON.parse(localStorage.getItem('config') || '{}'); } catch (e) { /* vazio */ }
  return {
    emissor: { ...EMISSOR_PADRAO, ...(c.emissor || {}) },
    teams: { ...TEAMS_CONFIG_PADRAO, subpasta: 'Relatórios de Inspeção', porFazenda: true, auto: true, ...(c.teams || {}) },
  };
}
function salvarConfig(c) { try { localStorage.setItem('config', JSON.stringify(c)); } catch (e) { toast('Não foi possível salvar a configuração'); } }
let CONFIG = lerConfig();

/* ---------- modelo da inspeção ---------- */
function novaInspecao() {
  return {
    id: uid(), criadoEm: Date.now(), atualizadoEm: Date.now(), status: 'andamento',
    resp: {}, inst: {}, instNomes: {},
    dados: { empresa: '', fazenda: '', data: hojeISO(), cidade: CONFIG.emissor.cidade, responsavel: '', cargoResp: 'Gerente da propriedade', obsGerais: '' },
    assinaturas: { prof: null, resp: null },
    teams: null,
  };
}

/** Monta os blocos de itens da seção (com instâncias repetíveis e numeração sequencial). */
function blocosDaSecao(insp, sec) {
  const blocos = []; let n = 0;
  sec.grupos.forEach((g, gIdx) => {
    const qtd = g.repetivel ? Math.max(0, insp.inst[`${sec.id}:${gIdx}`] ?? 1) : 1;
    for (let i = 0; i < qtd; i++) {
      const instKey = `${sec.id}:${gIdx}:${i}`;
      const rotulo = g.repetivel ? `${g.rotulo} ${i + 1}` : (g.rotulo || '');
      blocos.push({
        gIdx, inst: i, instKey, repetivel: !!g.repetivel, rotulo, rotuloBase: g.rotulo || '', qtd,
        nomeInst: insp.instNomes[instKey] || '',
        itens: g.itens.map((texto, iIdx) => ({ key: `${instKey}:${iIdx}`, num: `${sec.id}.${++n}`, texto })),
      });
    }
  });
  return blocos;
}
const itensDaSecao = (insp, sec) => blocosDaSecao(insp, sec).flatMap((b) => b.itens.map((it) => ({ ...it, bloco: b })));

function contar(insp, sec) {
  const itens = itensDaSecao(insp, sec);
  const c = { total: itens.length, C: 0, NC: 0, NA: 0 };
  itens.forEach((it) => { const r = insp.resp[it.key]?.r; if (r) c[r]++; });
  c.resp = c.C + c.NC + c.NA;
  return c;
}
function contarTudo(insp) {
  return CHECKLIST.reduce((acc, s) => { const c = contar(insp, s); for (const k in c) acc[k] = (acc[k] || 0) + c[k]; return acc; }, {});
}
const pctConf = (c) => (c.C + c.NC ? Math.round((c.C / (c.C + c.NC)) * 100) : null);

/* ---------- estado atual ---------- */
let INSP = null;
let salvarTimer;
async function carregarAtual() {
  const id = localStorage.getItem('inspAtual');
  if (id) INSP = await DB.get('inspecoes', id);
  if (!INSP) { INSP = novaInspecao(); await salvarJa(); }
  // migração/compatibilidade
  INSP.instNomes = INSP.instNomes || {}; INSP.inst = INSP.inst || {};
}
async function salvarJa() {
  clearTimeout(salvarTimer);
  INSP.atualizadoEm = Date.now();
  try { await DB.put('inspecoes', INSP); localStorage.setItem('inspAtual', INSP.id); }
  catch (e) { toast('Erro ao salvar: ' + e.message, 5000); }
}
function salvarDepois() { clearTimeout(salvarTimer); salvarTimer = setTimeout(salvarJa, 500); }
window.addEventListener('pagehide', () => { if (INSP) DB.put('inspecoes', INSP); });
document.addEventListener('visibilitychange', () => { if (document.hidden && INSP) DB.put('inspecoes', INSP); });

/* ---------- roteamento ---------- */
const app = $('#app');
function ir(hash) { if (location.hash === hash) render(); else location.hash = hash; }
window.addEventListener('hashchange', render);

async function render() {
  const h = location.hash || '#/';
  const m = h.match(/^#\/s\/(\d+)/);
  window.scrollTo(0, 0);
  if (m) return telaSecao(+m[1]);
  if (h.startsWith('#/finalizar')) return telaFinalizar();
  if (h.startsWith('#/relatorio')) return telaRelatorio();
  if (h.startsWith('#/historico')) return telaHistorico();
  if (h.startsWith('#/config')) return telaConfig();
  return telaInicio();
}

/* =========================================================
 * TELA INICIAL – itens numerados
 * ========================================================= */
function telaInicio() {
  const tot = contarTudo(INSP);
  const pct = tot.total ? Math.round((tot.resp / tot.total) * 100) : 0;
  const ident = [INSP.dados.empresa, INSP.dados.fazenda].filter(Boolean).join(' — ');

  app.innerHTML = `
  <div class="wrap">
    <header class="hero">
      <img class="logo" src="img/logo-agrohama.jpg" alt="Agrohama">
      <h1>Check List</h1>
      <h2>Inspeção Ambiental</h2>
    </header>

    <div class="acoes">
      <button class="acao" data-acao="nova"><span>＋</span>Nova inspeção</button>
      <button class="acao" data-acao="hist"><span>🗂️</span>Inspeções salvas</button>
      <button class="acao" data-acao="config"><span>⚙️</span>Configurações</button>
    </div>

    <div class="card">
      <h3>${ident ? esc(ident) : 'Inspeção em andamento'}</h3>
      <div class="muted">${INSP.status === 'finalizada' ? '✅ Relatório gerado · ' : ''}Iniciada em ${dataHoraBR(INSP.criadoEm)}</div>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="stats">
        <span class="pill pend">${tot.resp}/${tot.total} respondidos</span>
        <span class="pill ok">${tot.C} conformes</span>
        <span class="pill nc">${tot.NC} não conformes</span>
        <span class="pill na">${tot.NA} N/A</span>
      </div>
    </div>

    <div class="secao-titulo">Itens da inspeção</div>
    <div class="lista-secoes">
      ${CHECKLIST.map((s) => {
        const c = contar(INSP, s);
        const cls = c.NC ? 'com-nc' : c.resp === c.total && c.total ? 'completa' : c.resp ? 'iniciada' : '';
        return `<button class="secao-btn ${cls}" data-secao="${s.id}">
          <div class="secao-num">${s.id}</div>
          <div class="secao-info">
            <div class="secao-nome">${esc(s.titulo)}</div>
            <div class="secao-meta">${c.resp}/${c.total} respondidos ${c.NC ? `<span class="badge-nc">${c.NC} NC</span>` : ''} ${c.resp === c.total && c.total ? '✓' : ''}</div>
          </div>
          <div class="chev">›</div>
        </button>`;
      }).join('')}
    </div>

    <div class="parceiro"><small>Elaborado por</small><img src="img/logo-loren.jpg" alt="Loren Alvarenga Consultoria Ambiental"></div>
  </div>
  <div class="rodape"><div class="in">
    <button class="btn btn-pri" data-acao="finalizar">📄 Finalizar e gerar relatório</button>
  </div></div>`;

  app.onclick = async (e) => {
    const s = e.target.closest('[data-secao]'); if (s) return ir('#/s/' + s.dataset.secao);
    const a = e.target.closest('[data-acao]')?.dataset.acao;
    if (a === 'finalizar') ir('#/finalizar');
    if (a === 'hist') ir('#/historico');
    if (a === 'config') ir('#/config');
    if (a === 'nova') {
      if (tot.resp && !confirm('Iniciar uma nova inspeção? A atual continua salva em "Inspeções salvas".')) return;
      await salvarJa(); INSP = novaInspecao(); await salvarJa(); toast('Nova inspeção iniciada'); render();
    }
  };
}

/* =========================================================
 * TELA DA SEÇÃO – subitens com Conforme / Não conforme / N/A
 * ========================================================= */
let FOTOS_CACHE = {}; // key -> [foto]
async function carregarFotos() {
  FOTOS_CACHE = {};
  (await DB.fotosDa(INSP.id)).sort((a, b) => a.ts - b.ts).forEach((f) => { (FOTOS_CACHE[f.key] = FOTOS_CACHE[f.key] || []).push(f); });
}

function htmlItem(it) {
  const r = INSP.resp[it.key] || {};
  const fotos = FOTOS_CACHE[it.key] || [];
  return `<div class="item ${r.r ? 'r-' + r.r : ''}" data-key="${it.key}">
    <div class="item-txt"><span class="item-num">${it.num}</span><span>${esc(it.texto)}</span></div>
    <div class="botoes">
      <button class="b b-ok ${r.r === 'C' ? 'on' : ''}" data-r="C">✓ Conforme</button>
      <button class="b b-nc ${r.r === 'NC' ? 'on' : ''}" data-r="NC">✕ Não conforme</button>
      <button class="b b-na ${r.r === 'NA' ? 'on' : ''}" data-r="NA" title="Não se aplica">N/A</button>
    </div>
    ${r.r === 'NC' ? `<div class="nc-box">
      <div><label class="lbl" for="obs-${it.key}">Observações</label>
        <textarea id="obs-${it.key}" data-campo="obs" placeholder="Descreva a não conformidade e a ação recomendada…">${esc(r.obs || '')}</textarea></div>
      <div><label class="lbl" for="prz-${it.key}">Prazo para adequação</label>
        <select id="prz-${it.key}" data-campo="prazo">${PRAZOS.map((p) => `<option value="${p}" ${p === (r.prazo || '') ? 'selected' : ''}>${p || 'Não definido'}</option>`).join('')}</select></div>
      <div class="foto-acoes">
        <button class="b-cam" data-foto="cam">📷 Tirar foto</button>
        <button class="b-gal" data-foto="gal" title="Escolher da galeria">🖼️ Galeria</button>
      </div>
      ${fotos.length ? `<div class="fotos">${fotos.map((f) => `<div class="foto"><img src="${f.data}" alt="Foto"><button data-delfoto="${f.id}" aria-label="Excluir foto">×</button></div>`).join('')}</div>` : ''}
    </div>` : ''}
  </div>`;
}

async function telaSecao(id) {
  const sec = CHECKLIST.find((s) => s.id === id);
  if (!sec) return ir('#/');
  await carregarFotos();
  const idx = CHECKLIST.indexOf(sec);
  const ant = CHECKLIST[idx - 1], prox = CHECKLIST[idx + 1];

  const blocos = blocosDaSecao(INSP, sec);
  let html = '';
  sec.grupos.forEach((g, gIdx) => {
    const bs = blocos.filter((b) => b.gIdx === gIdx);
    bs.forEach((b) => {
      if (b.rotulo) {
        html += `<div class="grupo-rotulo">${esc(b.rotulo)}
          ${b.repetivel ? `<input type="text" data-instnome="${b.instKey}" value="${esc(b.nomeInst)}" placeholder="Identificação (opcional)">` : ''}
          ${b.repetivel && b.inst === b.qtd - 1 ? `<button class="b-rem" data-reminst="${sec.id}:${gIdx}">Remover</button>` : ''}
        </div>`;
      }
      html += b.itens.map(htmlItem).join('');
    });
    if (g.repetivel) html += `<button class="b-add" data-addinst="${sec.id}:${gIdx}">＋ Adicionar ${esc(g.rotulo)}</button>`;
  });

  const c = contar(INSP, sec);
  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="btn-voltar" data-nav="#/" aria-label="Voltar">‹</button>
      <h1>${sec.id}. ${esc(sec.titulo)}<span class="sub" id="sec-cont">${c.resp}/${c.total} respondidos · ${c.NC} não conforme${c.NC === 1 ? '' : 's'}</span></h1>
    </div>
    ${sec.nota ? `<div class="nota">ℹ️ ${esc(sec.nota)}</div>` : ''}
    ${html || '<div class="card muted">Nenhum item. Use o botão para adicionar.</div>'}
  </div>
  <div class="rodape"><div class="in">
    ${ant ? `<button class="btn btn-ghost" data-nav="#/s/${ant.id}">‹ ${ant.id}</button>` : ''}
    <button class="btn btn-sec" data-nav="#/">☰ Itens</button>
    ${prox ? `<button class="btn btn-pri" data-nav="#/s/${prox.id}">${ant ? '' : 'Próximo '}${prox.id} ›</button>` : `<button class="btn btn-pri" data-nav="#/finalizar">Finalizar ›</button>`}
  </div></div>`;

  const atualizarCont = () => {
    const c2 = contar(INSP, sec);
    $('#sec-cont').textContent = `${c2.resp}/${c2.total} respondidos · ${c2.NC} não conforme${c2.NC === 1 ? '' : 's'}`;
  };
  const refazItem = (key) => {
    const el = $(`.item[data-key="${CSS.escape(key)}"]`);
    const it = itensDaSecao(INSP, sec).find((x) => x.key === key);
    if (el && it) el.outerHTML = htmlItem(it);
  };

  app.onclick = async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) return ir(nav.dataset.nav);
    const itemEl = e.target.closest('.item');
    const btnR = e.target.closest('[data-r]');
    if (btnR && itemEl) {
      const key = itemEl.dataset.key, r = btnR.dataset.r;
      const atual = INSP.resp[key] || {};
      if (atual.r === r) { // tocar de novo desmarca
        if (r === 'NC' && (atual.obs || (FOTOS_CACHE[key] || []).length) && !confirm('Desmarcar "Não conforme"? A observação será mantida, mas não aparecerá no relatório.')) return;
        INSP.resp[key] = { ...atual, r: null };
      } else INSP.resp[key] = { ...atual, r };
      if (INSP.status === 'finalizada') INSP.status = 'andamento';
      refazItem(key); atualizarCont(); await salvarJa();
      if (r === 'NC' && INSP.resp[key].r === 'NC') setTimeout(() => $(`.item[data-key="${CSS.escape(key)}"] textarea`)?.focus({ preventScroll: true }), 50);
      return;
    }
    const bf = e.target.closest('[data-foto]');
    if (bf && itemEl) return capturarFoto(itemEl.dataset.key, bf.dataset.foto === 'cam', sec, refazItem);
    const df = e.target.closest('[data-delfoto]');
    if (df && itemEl) {
      if (!confirm('Excluir esta foto?')) return;
      await DB.del('fotos', df.dataset.delfoto);
      await carregarFotos(); refazItem(itemEl.dataset.key); return;
    }
    const add = e.target.closest('[data-addinst]');
    if (add) {
      const k = add.dataset.addinst; INSP.inst[k] = (INSP.inst[k] ?? 1) + 1; await salvarJa(); return telaSecao(id);
    }
    const rem = e.target.closest('[data-reminst]');
    if (rem) {
      const k = rem.dataset.reminst, n = INSP.inst[k] ?? 1, ultimo = `${k}:${n - 1}`;
      const temDados = Object.keys(INSP.resp).some((rk) => rk.startsWith(ultimo + ':') && INSP.resp[rk]?.r);
      if (temDados && !confirm('Remover este bloco e as respostas dele?')) return;
      Object.keys(INSP.resp).forEach((rk) => { if (rk.startsWith(ultimo + ':')) delete INSP.resp[rk]; });
      (await DB.fotosDa(INSP.id)).filter((f) => f.key.startsWith(ultimo + ':')).forEach((f) => DB.del('fotos', f.id));
      INSP.inst[k] = n - 1; await salvarJa(); return telaSecao(id);
    }
  };
  app.oninput = (e) => {
    const itemEl = e.target.closest('.item');
    if (itemEl && e.target.dataset.campo) {
      const key = itemEl.dataset.key;
      INSP.resp[key] = { ...(INSP.resp[key] || {}), [e.target.dataset.campo]: e.target.value };
      salvarDepois();
    }
    if (e.target.dataset.instnome) { INSP.instNomes[e.target.dataset.instnome] = e.target.value; salvarDepois(); }
  };
  app.onchange = app.oninput;
}

/* ---------- câmera / fotos ---------- */
let ultimaPosicao = null;
function obterPosicao() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(ultimaPosicao);
    navigator.geolocation.getCurrentPosition(
      (p) => { ultimaPosicao = { lat: p.coords.latitude, lon: p.coords.longitude }; resolve(ultimaPosicao); },
      () => resolve(ultimaPosicao),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 }
    );
  });
}

function capturarFoto(key, camera, sec, refazItem) {
  const posP = obterPosicao(); // em paralelo enquanto a câmera abre
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.className = 'hidden-input';
  if (camera) inp.setAttribute('capture', 'environment'); else inp.multiple = true;
  document.body.appendChild(inp);
  inp.onchange = async () => {
    const arquivos = [...inp.files]; inp.remove();
    if (!arquivos.length) return;
    overlay('Processando foto…');
    try {
      const pos = await Promise.race([posP, new Promise((r) => setTimeout(() => r(ultimaPosicao), 3000))]);
      const it = itensDaSecao(INSP, sec).find((x) => x.key === key);
      for (const f of arquivos) {
        const ts = camera ? Date.now() : (f.lastModified || Date.now());
        const foto = await processarImagem(f, { ts, pos, ref: it ? `Item ${it.num}` : '' });
        await DB.put('fotos', { id: uid(), inspId: INSP.id, key, ts, gps: pos, ...foto });
      }
      await carregarFotos(); refazItem(key); salvarJa();
      toast(arquivos.length > 1 ? `${arquivos.length} fotos adicionadas` : 'Foto adicionada');
    } catch (err) {
      console.error(err); toast('Não foi possível processar a imagem: ' + err.message, 5000);
    } finally { overlay(false); }
  };
  inp.click();
}

/** Redimensiona (máx. 1280 px), comprime (JPEG 70%) e grava data/hora/GPS na foto. */
function processarImagem(file, { ts, pos, ref }) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 1280;
      let w = img.naturalWidth, h = img.naturalHeight;
      const k = Math.min(1, MAX / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const ctx = cv.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      // carimbo
      const fs = Math.max(16, Math.round(Math.max(w, h) / 40));
      const linhas = [dataHoraBR(ts) + (ref ? '  ·  ' + ref : '')];
      if (pos) linhas.push(`GPS ${pos.lat.toFixed(6)}, ${pos.lon.toFixed(6)}`);
      const bh = linhas.length * fs * 1.35 + fs * 0.6;
      ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, h - bh, w, bh);
      ctx.fillStyle = '#fff'; ctx.font = `600 ${fs}px sans-serif`; ctx.textBaseline = 'top';
      linhas.forEach((l, i) => ctx.fillText(l, fs * 0.6, h - bh + fs * 0.35 + i * fs * 1.35));
      resolve({ data: cv.toDataURL('image/jpeg', 0.7), w, h });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('formato de imagem não suportado')); };
    img.src = url;
  });
}

/* =========================================================
 * FINALIZAR – dados da empresa, data e assinaturas
 * ========================================================= */
function telaFinalizar() {
  const d = INSP.dados, tot = contarTudo(INSP), pend = tot.total - tot.resp;
  const ncSemObs = CHECKLIST.flatMap((s) => itensDaSecao(INSP, s)).filter((it) => INSP.resp[it.key]?.r === 'NC' && !(INSP.resp[it.key].obs || '').trim()).length;

  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="btn-voltar" data-nav="#/" aria-label="Voltar">‹</button>
      <h1>Finalizar inspeção<span class="sub">Dados do relatório e do termo de ciência</span></h1>
    </div>

    ${pend ? `<div class="alerta" style="margin-bottom:12px">⚠️ ${pend} ${pend === 1 ? 'item ainda não foi respondido e aparecerá' : 'itens ainda não foram respondidos e aparecerão'} como <b>"Não avaliado"</b> no relatório.</div>` : ''}
    ${ncSemObs ? `<div class="alerta" style="margin-bottom:12px">⚠️ ${ncSemObs} não conformidade(s) sem observação escrita.</div>` : ''}

    <div class="card form-grid">
      <h3>Dados da empresa inspecionada</h3>
      <div><label class="lbl" for="f-empresa">Empresa (razão social) *</label><input type="text" id="f-empresa" data-d="empresa" value="${esc(d.empresa)}" autocomplete="organization"></div>
      <div><label class="lbl" for="f-fazenda">Fazenda / propriedade *</label><input type="text" id="f-fazenda" data-d="fazenda" value="${esc(d.fazenda)}"></div>
      <div class="form-grid duas">
        <div><label class="lbl" for="f-data">Data da inspeção *</label><input type="date" id="f-data" data-d="data" value="${esc(d.data)}"></div>
        <div><label class="lbl" for="f-cidade">Local de emissão</label><input type="text" id="f-cidade" data-d="cidade" value="${esc(d.cidade)}"></div>
      </div>
      <div><label class="lbl" for="f-obs">Observações gerais (opcional)</label><textarea id="f-obs" data-d="obsGerais" placeholder="Considerações gerais sobre a propriedade…">${esc(d.obsGerais)}</textarea></div>
    </div>

    <div class="card form-grid">
      <h3>Termo de Ciência e Responsabilidade</h3>
      <div class="form-grid duas">
        <div><label class="lbl" for="f-resp">Nome do responsável pela empresa</label><input type="text" id="f-resp" data-d="responsavel" value="${esc(d.responsavel)}" autocomplete="name"></div>
        <div><label class="lbl" for="f-cargo">Cargo</label><input type="text" id="f-cargo" data-d="cargoResp" value="${esc(d.cargoResp)}"></div>
      </div>
      <div><label class="lbl">Assinatura do responsável (opcional)</label>${htmlAssin('resp')}</div>
      <div><label class="lbl">Assinatura de ${esc(CONFIG.emissor.profissional)} (opcional)</label>${htmlAssin('prof')}</div>
      <div class="muted">Se não assinar na tela, o PDF sai com a linha em branco para assinatura física.</div>
    </div>
  </div>
  <div class="rodape"><div class="in">
    <button class="btn btn-pri" id="gerar">📄 Gerar relatório PDF</button>
  </div></div>`;

  ['resp', 'prof'].forEach((q) => iniciarAssin(q));

  app.oninput = (e) => { const k = e.target.dataset.d; if (k) { INSP.dados[k] = e.target.value; salvarDepois(); } };
  app.onchange = app.oninput;
  app.onclick = async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) return ir(nav.dataset.nav);
    if (e.target.closest('#gerar')) {
      if (!INSP.dados.empresa.trim() || !INSP.dados.fazenda.trim() || !INSP.dados.data) {
        toast('Preencha empresa, fazenda e data'); (!INSP.dados.empresa.trim() ? $('#f-empresa') : !INSP.dados.fazenda.trim() ? $('#f-fazenda') : $('#f-data')).focus(); return;
      }
      await gerarRelatorio();
    }
  };
}

function htmlAssin(q) {
  return `<div class="assin" id="assin-${q}"><canvas></canvas><button class="limpar" type="button">Limpar</button><div class="dica">${INSP.assinaturas[q] ? '' : 'Assine aqui com o dedo'}</div></div>`;
}
function iniciarAssin(q) {
  const box = $('#assin-' + q), cv = $('canvas', box), dica = $('.dica', box);
  const dpr = window.devicePixelRatio || 1;
  const r = cv.getBoundingClientRect();
  cv.width = r.width * dpr; cv.height = r.height * dpr;
  const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
  ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0a2540';
  if (INSP.assinaturas[q]) { const im = new Image(); im.onload = () => ctx.drawImage(im, 0, 0, r.width, r.height); im.src = INSP.assinaturas[q]; }
  let des = false, last;
  const pt = (e) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
  cv.addEventListener('pointerdown', (e) => { des = true; last = pt(e); cv.setPointerCapture(e.pointerId); dica.textContent = ''; });
  cv.addEventListener('pointermove', (e) => {
    if (!des) return; const p = pt(e);
    ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
  });
  const fim = () => { if (!des) return; des = false; INSP.assinaturas[q] = cv.toDataURL('image/png'); salvarDepois(); };
  cv.addEventListener('pointerup', fim); cv.addEventListener('pointercancel', fim);
  $('.limpar', box).onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); INSP.assinaturas[q] = null; dica.textContent = 'Assine aqui com o dedo'; salvarDepois(); };
}

function nomeArquivo(insp) {
  const limpa = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_');
  return `Relatorio_Inspecao_${limpa(insp.dados.fazenda) || 'Fazenda'}_${insp.dados.data}.pdf`;
}

async function gerarRelatorio() {
  overlay('Gerando relatório PDF…');
  try {
    await salvarJa();
    const fotos = await DB.fotosDa(INSP.id);
    const blob = await gerarPDF(INSP, fotos, CONFIG.emissor);
    INSP.status = 'finalizada'; INSP.teams = null; INSP.emissor = { ...CONFIG.emissor };
    await DB.put('pdfs', { inspId: INSP.id, blob, nome: nomeArquivo(INSP), geradoEm: Date.now() });
    await salvarJa();
    overlay(false);
    ir('#/relatorio');
    if (CONFIG.teams.auto && Teams.pronto()) enviarTeams();
  } catch (err) {
    console.error(err); overlay(false); toast('Erro ao gerar PDF: ' + err.message, 6000);
  }
}

/* =========================================================
 * RELATÓRIO GERADO – salvar, imprimir, compartilhar, Teams
 * ========================================================= */
async function telaRelatorio() {
  const pdf = await DB.get('pdfs', INSP.id);
  if (!pdf) return ir('#/finalizar');
  const arquivo = new File([pdf.blob], pdf.nome, { type: 'application/pdf' });
  const podeCompartilhar = !!(navigator.canShare && navigator.canShare({ files: [arquivo] }));
  const url = URL.createObjectURL(pdf.blob);
  const mb = (pdf.blob.size / 1048576).toFixed(1);
  const t = INSP.teams;
  const teamsCfg = CONFIG.teams.clientId && CONFIG.teams.tenantId && CONFIG.teams.channelId;

  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="btn-voltar" data-nav="#/" aria-label="Voltar">‹</button>
      <h1>Relatório gerado<span class="sub">${esc(pdf.nome)} · ${mb} MB</span></h1>
    </div>
    <div class="sucesso" style="margin-bottom:14px">✅ Relatório de <b>${esc(INSP.dados.fazenda)}</b> gerado em ${dataHoraBR(pdf.geradoEm)}.</div>

    <div class="card col">
      <h3>Salvar ou imprimir no celular</h3>
      ${podeCompartilhar ? `<button class="btn btn-azul" id="compartilhar">📤 Compartilhar / Salvar / Imprimir</button>
        <div class="muted">Abre o menu do celular: salvar em Arquivos, imprimir, enviar por WhatsApp, e-mail, Teams…</div>` : ''}
      <a class="btn btn-sec" href="${url}" download="${esc(pdf.nome)}">⬇️ Baixar PDF</a>
      <a class="btn btn-ghost" href="${url}" target="_blank" rel="noopener">👁️ Abrir PDF</a>
    </div>

    <div class="card col">
      <h3>Microsoft Teams</h3>
      <div id="teams-status">${t?.webUrl
        ? `<div class="sucesso">✅ Enviado ao canal em ${dataHoraBR(t.em)}. <a href="${esc(t.webUrl)}" target="_blank" rel="noopener">Abrir no SharePoint</a></div>`
        : teamsCfg ? '<div class="muted">Ainda não enviado.</div>' : '<div class="alerta">Envio automático não configurado. Configure em ⚙️ Configurações → Microsoft Teams.</div>'}</div>
      ${teamsCfg ? `<button class="btn btn-pri" id="enviar-teams">${t?.webUrl ? '🔁 Enviar novamente' : '☁️ Enviar para o Teams'}</button>` : `<button class="btn btn-ghost" data-nav="#/config">⚙️ Configurar Teams</button>`}
    </div>

    <div class="card col">
      <button class="btn btn-ghost" data-nav="#/">✏️ Voltar e editar o checklist</button>
      <div class="muted">Se editar algo depois, gere o relatório novamente em "Finalizar".</div>
    </div>
  </div>`;

  app.oninput = app.onchange = null;
  app.onclick = async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) return ir(nav.dataset.nav);
    if (e.target.closest('#compartilhar')) {
      try { await navigator.share({ files: [arquivo], title: pdf.nome }); }
      catch (err) { if (err.name !== 'AbortError') toast('Não foi possível compartilhar: ' + err.message); }
    }
    if (e.target.closest('#enviar-teams')) enviarTeams();
  };
}

async function enviarTeams() {
  const st = () => $('#teams-status');
  const setSt = (h) => { if (st()) st().innerHTML = h; };
  try {
    if (!Teams.pronto()) await Teams.iniciar(CONFIG.teams);
    if (!Teams.conta()) {
      localStorage.setItem('teamsPendente', INSP.id);
      localStorage.setItem('voltarPara', '#/relatorio');
      return Teams.entrar();
    }
    const pdf = await DB.get('pdfs', INSP.id);
    setSt('<div class="muted">⏳ Enviando para o Teams…</div>');
    toast('Enviando para o Teams…');
    const item = await Teams.enviar(pdf.blob, pdf.nome, CONFIG.teams, INSP.dados.fazenda, (p) => setSt(`<div class="muted">⏳ Enviando… ${p}%</div>`));
    INSP.teams = { em: Date.now(), webUrl: item.webUrl };
    await salvarJa();
    localStorage.removeItem('teamsPendente');
    setSt(`<div class="sucesso">✅ Enviado ao canal em ${dataHoraBR(INSP.teams.em)}. <a href="${esc(item.webUrl)}" target="_blank" rel="noopener">Abrir no SharePoint</a></div>`);
    toast('Relatório enviado ao Teams ✅');
  } catch (err) {
    if (err.redirecionando) return; // vai para o login Microsoft e volta
    console.error(err);
    const offline = !navigator.onLine;
    setSt(`<div class="alerta">❌ ${offline ? 'Sem internet. O PDF está salvo no celular; envie quando tiver sinal.' : 'Falha no envio: ' + esc(err.message)}</div>`);
  }
}

/* =========================================================
 * HISTÓRICO
 * ========================================================= */
async function telaHistorico() {
  const lista = (await DB.all('inspecoes')).sort((a, b) => b.atualizadoEm - a.atualizadoEm);
  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="btn-voltar" data-nav="#/" aria-label="Voltar">‹</button>
      <h1>Inspeções salvas<span class="sub">${lista.length} no celular</span></h1>
    </div>
    ${lista.map((i) => {
      const c = contarTudo(i);
      const nome = [i.dados.empresa, i.dados.fazenda].filter(Boolean).join(' — ') || 'Sem identificação';
      return `<div class="card hist-item">
        <div class="secao-info" data-abrir="${i.id}">
          <div class="secao-nome">${esc(nome)} ${i.id === INSP.id ? '<span class="pill pend">atual</span>' : ''}</div>
          <div class="secao-meta">${i.dados.data ? dataBR(i.dados.data) : dataHoraBR(i.criadoEm)} · ${c.resp}/${c.total} · ${c.NC} NC ${i.status === 'finalizada' ? '· 📄 relatório' : ''} ${i.teams ? '· ☁️ Teams' : ''}</div>
        </div>
        <button class="mini" data-abrir="${i.id}">Abrir</button>
        <button class="mini perigo" data-apagar="${i.id}" aria-label="Excluir">🗑</button>
      </div>`;
    }).join('') || '<div class="card muted">Nenhuma inspeção salva.</div>'}
    <div class="muted" style="margin-top:12px">As inspeções ficam salvas somente neste celular. Gere o PDF e envie ao Teams para ter a cópia na nuvem.</div>
  </div>`;
  app.oninput = app.onchange = null;
  app.onclick = async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) return ir(nav.dataset.nav);
    const ab = e.target.closest('[data-abrir]');
    if (ab) { await salvarJa(); INSP = await DB.get('inspecoes', ab.dataset.abrir); localStorage.setItem('inspAtual', INSP.id); INSP.instNomes = INSP.instNomes || {}; INSP.inst = INSP.inst || {}; return ir('#/'); }
    const ap = e.target.closest('[data-apagar]');
    if (ap) {
      if (!confirm('Excluir esta inspeção, suas fotos e o PDF? Esta ação não pode ser desfeita.')) return;
      await DB.apagarInspecao(ap.dataset.apagar);
      if (ap.dataset.apagar === INSP.id) { INSP = novaInspecao(); await salvarJa(); }
      toast('Inspeção excluída'); telaHistorico();
    }
  };
}

/* =========================================================
 * CONFIGURAÇÕES – emissor e Microsoft Teams
 * ========================================================= */
async function telaConfig() {
  const em = CONFIG.emissor, tm = CONFIG.teams;
  const conta = Teams.pronto() ? Teams.conta() : null;
  const url = location.origin + location.pathname;
  app.innerHTML = `
  <div class="wrap">
    <div class="topbar">
      <button class="btn-voltar" data-nav="#/" aria-label="Voltar">‹</button>
      <h1>Configurações</h1>
    </div>

    <div class="card form-grid">
      <h3>Dados do emissor do relatório</h3>
      ${[['consultoria', 'Empresa de consultoria'], ['cnpj', 'CNPJ'], ['profissional', 'Profissional responsável'], ['cargo', 'Cargo / formação'], ['registro', 'Registro profissional (CREA)'], ['cidade', 'Cidade padrão de emissão']]
        .map(([k, l]) => `<div><label class="lbl" for="e-${k}">${l}</label><input type="text" id="e-${k}" data-em="${k}" value="${esc(em[k])}"></div>`).join('')}
    </div>

    <div class="card form-grid">
      <h3>Microsoft Teams (envio automático)</h3>
      <div class="muted">Preencha com os dados do aplicativo cadastrado no Microsoft Entra ID (veja o guia LEIA-ME). Endereço de redirecionamento a cadastrar:<br><code style="word-break:break-all">${esc(url)}</code></div>
      <div><label class="lbl" for="t-client">ID do aplicativo (cliente)</label><input type="text" id="t-client" data-tm="clientId" value="${esc(tm.clientId)}" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="off" spellcheck="false"></div>
      <div><label class="lbl" for="t-tenant">ID do diretório (locatário)</label><input type="text" id="t-tenant" data-tm="tenantId" value="${esc(tm.tenantId)}" placeholder="00000000-0000-0000-0000-000000000000" autocapitalize="off" spellcheck="false"></div>
      ${conta
        ? `<div class="sucesso">Conectado como <b>${esc(conta.username)}</b></div>
           <div><label class="lbl" for="t-team">Equipe</label><select id="t-team"><option value="">Carregando…</option></select></div>
           <div><label class="lbl" for="t-canal">Canal</label><select id="t-canal"><option value="">Escolha a equipe primeiro</option></select></div>
           <div><label class="lbl" for="t-sub">Pasta dentro do canal</label><input type="text" id="t-sub" data-tm="subpasta" value="${esc(tm.subpasta)}" placeholder="ex.: Relatórios de Inspeção"></div>
           <label><input type="checkbox" data-tmck="porFazenda" ${tm.porFazenda ? 'checked' : ''}> Criar uma subpasta para cada fazenda</label>
           <label><input type="checkbox" data-tmck="auto" ${tm.auto ? 'checked' : ''}> Enviar automaticamente ao gerar o PDF</label>
           <button class="btn btn-ghost" id="t-sair">Desconectar conta</button>`
        : `<button class="btn btn-azul" id="t-entrar">🔑 Entrar com conta Microsoft</button>`}
    </div>
    <div class="muted" style="text-align:center">Versão 1.0 · dados salvos neste aparelho</div>
  </div>`;

  app.onchange = app.oninput = (e) => {
    const t = e.target;
    if (t.dataset.em) CONFIG.emissor[t.dataset.em] = t.value;
    if (t.dataset.tm) CONFIG.teams[t.dataset.tm] = t.value.trim();
    if (t.dataset.tmck) CONFIG.teams[t.dataset.tmck] = t.checked;
    salvarConfig(CONFIG);
  };
  app.onclick = async (e) => {
    const nav = e.target.closest('[data-nav]'); if (nav) return ir(nav.dataset.nav);
    if (e.target.closest('#t-entrar')) {
      if (!CONFIG.teams.clientId || !CONFIG.teams.tenantId) return toast('Preencha os dois IDs primeiro');
      try { await Teams.iniciar(CONFIG.teams, true); localStorage.setItem('voltarPara', '#/config'); await Teams.entrar(); }
      catch (err) { if (!err.redirecionando) toast('Erro: ' + err.message, 6000); }
    }
    if (e.target.closest('#t-sair')) { await Teams.sair(); CONFIG.teams.channelId = ''; salvarConfig(CONFIG); telaConfig(); }
  };

  if (conta) {
    const selT = $('#t-team'), selC = $('#t-canal');
    const carregarCanais = async (teamId) => {
      selC.innerHTML = '<option>Carregando…</option>';
      try {
        const canais = await Teams.canais(teamId);
        selC.innerHTML = '<option value="">Selecione…</option>' + canais.map((c) => `<option value="${esc(c.id)}" ${c.id === CONFIG.teams.channelId ? 'selected' : ''}>${esc(c.displayName)}</option>`).join('');
      } catch (err) { selC.innerHTML = '<option value="">Erro ao carregar</option>'; toast(err.message, 5000); }
    };
    try {
      const eqs = await Teams.equipes();
      selT.innerHTML = '<option value="">Selecione…</option>' + eqs.map((t) => `<option value="${esc(t.id)}" ${t.id === CONFIG.teams.teamId ? 'selected' : ''}>${esc(t.displayName)}</option>`).join('');
      if (CONFIG.teams.teamId) carregarCanais(CONFIG.teams.teamId);
    } catch (err) { if (!err.redirecionando) { selT.innerHTML = '<option value="">Erro ao carregar</option>'; toast(err.message, 5000); } }
    selT.onchange = (e) => { e.stopPropagation(); CONFIG.teams.teamId = selT.value; CONFIG.teams.channelId = ''; salvarConfig(CONFIG); if (selT.value) carregarCanais(selT.value); };
    selC.onchange = (e) => {
      e.stopPropagation(); CONFIG.teams.channelId = selC.value;
      CONFIG.teams.channelName = selC.selectedOptions[0]?.textContent || ''; salvarConfig(CONFIG);
      if (selC.value) toast('Canal salvo ✅');
    };
  }
}

/* ---------- inicialização ---------- */
(async function iniciar() {
  try {
    // Retorno do login Microsoft (precisa rodar antes do roteador)
    if (CONFIG.teams.clientId && CONFIG.teams.tenantId) {
      try { await Teams.iniciar(CONFIG.teams); } catch (e) { console.warn('MSAL', e); }
      const voltar = localStorage.getItem('voltarPara');
      if (voltar) { localStorage.removeItem('voltarPara'); history.replaceState(null, '', location.pathname + voltar); }
    }
    await carregarAtual();
    await render();
    const pend = localStorage.getItem('teamsPendente');
    if (pend && pend === INSP.id && Teams.pronto() && Teams.conta() && location.hash.startsWith('#/relatorio')) enviarTeams();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="wrap"><div class="card alerta" style="margin-top:20px">Erro ao iniciar o app: ${esc(err.message)}</div></div>`;
  }
})();

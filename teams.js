/* Envio do PDF para a pasta de um canal do Microsoft Teams (SharePoint) via Microsoft Graph.
 * Usa login delegado (a própria conta Microsoft da profissional) — sem servidor, sem custo extra. */
const Teams = (() => {
  const ESCOPOS = ['User.Read', 'Team.ReadBasic.All', 'Channel.ReadBasic.All', 'Files.ReadWrite.All'];
  const GRAPH = 'https://graph.microsoft.com/v1.0';
  let pca = null;
  let cfgAtual = '';

  function redirecionando() { const e = new Error('Redirecionando para login Microsoft'); e.redirecionando = true; return e; }

  async function iniciar(cfg, forcar) {
    const chave = cfg.clientId + '|' + cfg.tenantId;
    if (pca && chave === cfgAtual && !forcar) return;
    if (!window.msal) throw new Error('Biblioteca de login não carregada');
    pca = new msal.PublicClientApplication({
      auth: {
        clientId: cfg.clientId,
        authority: `https://login.microsoftonline.com/${cfg.tenantId}`,
        redirectUri: location.origin + location.pathname,
        navigateToLoginRequestUrl: false,
      },
      cache: { cacheLocation: 'localStorage' },
    });
    await pca.initialize();
    cfgAtual = chave;
    const r = await pca.handleRedirectPromise();
    if (r && r.account) pca.setActiveAccount(r.account);
    else if (!pca.getActiveAccount() && pca.getAllAccounts().length) pca.setActiveAccount(pca.getAllAccounts()[0]);
    if (location.hash.includes('code=') || location.hash.includes('error=')) history.replaceState(null, '', location.pathname);
  }

  const pronto = () => !!pca;
  const conta = () => (pca ? pca.getActiveAccount() : null);

  async function entrar() {
    await pca.loginRedirect({ scopes: ESCOPOS, prompt: 'select_account' });
    throw redirecionando();
  }
  async function sair() { if (pca) { await pca.clearCache(); } }

  async function token() {
    const account = conta();
    if (!account) { await entrar(); }
    try {
      const r = await pca.acquireTokenSilent({ scopes: ESCOPOS, account });
      return r.accessToken;
    } catch (e) {
      if (e instanceof msal.InteractionRequiredAuthError || /interaction_required|login_required|consent_required/.test(e.errorCode || '')) {
        if (!localStorage.getItem('voltarPara')) localStorage.setItem('voltarPara', location.hash || '#/');
        await pca.acquireTokenRedirect({ scopes: ESCOPOS, account });
        throw redirecionando();
      }
      throw e;
    }
  }

  async function graph(path, opts = {}) {
    const t = await token();
    const res = await fetch(path.startsWith('http') ? path : GRAPH + path, {
      ...opts,
      headers: { Authorization: 'Bearer ' + t, ...(opts.body && !(opts.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...(opts.headers || {}) },
    });
    if (opts.aceitar404 && res.status === 404) return null;
    if (!res.ok) {
      let msg = res.status + ' ' + res.statusText;
      try { const j = await res.json(); msg = j.error?.message || msg; } catch (e) { /* sem json */ }
      if (res.status === 403) msg = 'Sem permissão (' + msg + '). Verifique o consentimento de administrador no Entra ID e se a conta é membro da equipe.';
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  }

  const equipes = async () => (await graph('/me/joinedTeams?$select=id,displayName')).value.sort((a, b) => a.displayName.localeCompare(b.displayName));
  const canais = async (teamId) => (await graph(`/teams/${teamId}/channels?$select=id,displayName`)).value;

  const limparNome = (s) => (s || '').replace(/["*:<>?/\\|#%]/g, '').replace(/\s+/g, ' ').trim().slice(0, 120);

  async function garantirPasta(driveId, parentId, nome) {
    const enc = encodeURIComponent(nome);
    const existente = await graph(`/drives/${driveId}/items/${parentId}:/${enc}`, { aceitar404: true });
    if (existente) return existente.id;
    try {
      const nova = await graph(`/drives/${driveId}/items/${parentId}/children`, {
        method: 'POST', body: JSON.stringify({ name: nome, folder: {}, '@microsoft.graph.conflictBehavior': 'fail' }),
      });
      return nova.id;
    } catch (e) { // criada em paralelo
      const de = await graph(`/drives/${driveId}/items/${parentId}:/${enc}`);
      return de.id;
    }
  }

  /** Envia o PDF para: canal → [subpasta] → [fazenda]. Retorna o driveItem (com webUrl). */
  async function enviar(blob, nomeArquivo, cfg, fazenda, progresso) {
    if (!cfg.teamId || !cfg.channelId) throw new Error('Escolha a equipe e o canal em Configurações');
    const raiz = await graph(`/teams/${cfg.teamId}/channels/${encodeURIComponent(cfg.channelId)}/filesFolder`);
    const driveId = raiz.parentReference.driveId;
    let pasta = raiz.id;
    const partes = (cfg.subpasta || '').split('/').map(limparNome).filter(Boolean);
    if (cfg.porFazenda && limparNome(fazenda)) partes.push(limparNome(fazenda));
    for (const p of partes) pasta = await garantirPasta(driveId, pasta, p);

    const sessao = await graph(`/drives/${driveId}/items/${pasta}:/${encodeURIComponent(nomeArquivo)}:/createUploadSession`, {
      method: 'POST', body: JSON.stringify({ item: { '@microsoft.graph.conflictBehavior': 'rename' } }),
    });
    const PEDACO = 327680 * 10; // múltiplo de 320 KiB exigido pela API
    let ini = 0, resultado = null;
    while (ini < blob.size) {
      const fim = Math.min(ini + PEDACO, blob.size);
      const res = await fetch(sessao.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Range': `bytes ${ini}-${fim - 1}/${blob.size}` },
        body: blob.slice(ini, fim),
      });
      if (!res.ok && res.status !== 202) throw new Error('Falha no envio (' + res.status + ')');
      if (res.status === 200 || res.status === 201) resultado = await res.json();
      ini = fim;
      progresso && progresso(Math.round((ini / blob.size) * 100));
    }
    return resultado || { webUrl: '' };
  }

  return { iniciar, pronto, conta, entrar, sair, equipes, canais, enviar };
})();

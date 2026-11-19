class ApiClient {
  constructor() {
    console.log('[ApiClient] Constructor - baseUrl: /api');
    this.baseUrl = '/api';
    this.defaultTimeout = 15000; // Allows the server's 10s engine timeout to return its fallback.
  }

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const defaultOptions = {
      headers: { 'Content-Type': 'application/json' },
      ...options
    };

    if (defaultOptions.body && typeof defaultOptions.body === 'object') {
      defaultOptions.body = JSON.stringify(defaultOptions.body);
    }

    // Timeout usando AbortController
    const timeout = options.timeout ?? this.defaultTimeout;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    defaultOptions.signal = controller.signal;

    const startTime = performance.now();
    console.log('[ApiClient] request -', options.method || 'GET', url);

    try {
      const res = await fetch(url, defaultOptions);
      const duration = Math.round(performance.now() - startTime);

      // Tentar parsear resposta
      let data = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => ({}));
      } else {
        const text = await res.text().catch(() => '');
        data = { raw: text };
      }

      console.log('[ApiClient] response -', res.status, res.ok ? 'OK' : 'ERROR', `${duration}ms`);

      if (!res.ok) {
        // Classificar por status HTTP
        let codigo = 'ERRO_SERVIDOR';
        let mensagem = 'Erro no servidor';
        
        if (res.status === 404) {
          codigo = 'NAO_ENCONTRADO';
          mensagem = 'Recurso não encontrado.';
        } else if (res.status === 408 || res.status === 504) {
          codigo = 'TIMEOUT';
          mensagem = 'Tempo de resposta excedido. Tente novamente.';
        } else if (res.status >= 500) {
          codigo = 'ERRO_SERVIDOR';
          mensagem = 'Erro interno do servidor.';
        } else if (res.status >= 400) {
          codigo = 'DADOS_INVALIDOS';
          mensagem = data?.erro?.mensagem || 'Dados inválidos.';
        }

        if (typeof data?.erro?.codigo === 'string' && typeof data?.erro?.mensagem === 'string') {
          codigo = data.erro.codigo;
          mensagem = data.erro.mensagem;
        }
        return { status: res.status, ok: false, data: { erro: { codigo, mensagem } } };
      }

      return { status: res.status, ok: true, data };
      
    } catch (err) {
      clearTimeout(timeoutId);
      const duration = Math.round(performance.now() - startTime);
      console.error('[ApiClient] request error -', options.method || 'GET', url, `${duration}ms`, err);
      
      // Erro de abort/timeout
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        return { status: 0, ok: false, data: { erro: { codigo: 'TIMEOUT', mensagem: 'Tempo de resposta excedido. Tente novamente.' } } };
      }
      
      // Erro de rede real (fetch rejected - offline, DNS, etc.)
      if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch'))) {
        return { status: 0, ok: false, data: { erro: { codigo: 'ERRO_REDE', mensagem: 'Falha na conexão. Verifique sua internet.' } } };
      }
      
      // Erro desconhecido
      return { status: 0, ok: false, data: { erro: { codigo: 'ERRO_DESCONHECIDO', mensagem: 'Erro inesperado. Tente novamente.' } } };
    } finally { clearTimeout(timeoutId); }
  }

  async getTopics() {
    console.log('[ApiClient] getTopics - buscando...');
    const { status, ok, data } = await this.request('/conteudos');
    return ok ? data : { ok: false, erro: data?.erro || { codigo: 'ERRO_REDE', mensagem: 'Falha ao carregar tópicos' } };
  }

  async getTopicDetail(slug) {
    console.log('[ApiClient] getTopicDetail - slug:', slug);
    const { status, ok, data } = await this.request(`/conteudos/${slug}`);
    return ok ? data : { ok: false, erro: data?.erro || { codigo: 'ERRO_REDE', mensagem: 'Falha ao carregar conteúdo' } };
  }

  async getQuiz(slug) {
    console.log('[ApiClient] getQuiz - slug:', slug);
    const { status, ok, data } = await this.request(`/conteudos/${slug}/quiz`);
    return ok ? data : { ok: false, erro: data?.erro || { codigo: 'ERRO_REDE', mensagem: 'Falha ao carregar quiz' } };
  }

  async analyze(tipo, conteudo) {
    console.log('[ApiClient] analyze - tipo:', tipo, 'tamanho:', conteudo?.length);
    const { status, ok, data } = await this.request('/analises', {
      method: 'POST',
      body: { tipo, conteudo }
    });
    console.log('[ApiClient] analyze response - ok:', ok);
    return ok ? data : { ok: false, erro: data?.erro || { codigo: 'ERRO_ANALISE', mensagem: 'Falha na análise' } };
  }
}

window.apiClient = new ApiClient();

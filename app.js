"use strict";

/*
 * Portal de Notícias Experimental — aplicação do estudo de Verificação e
 * Validação de Software.
 *
 * A URL seleciona um cenário desta mesma aplicação (tipo, versão e condição de
 * carga); não são aplicações diferentes. Cada execução insere somente um
 * componente em #componente, de acordo com o parâmetro "tipo".
 *
 * Os cinco defeitos são intencionais e controlados: existem apenas na versão
 * "defeito" e são o objeto de análise do experimento. Não devem ser corrigidos
 * indiscriminadamente, pois isso eliminaria a condição comparada. A aplicação
 * apenas disponibiliza o componente e informa a prontidão; as estratégias S1,
 * S2 e S3 serão responsabilidade da futura automação, não desta aplicação.
 */
(() => {
  // Listas fechadas de valores aceitos; qualquer outro valor é rejeitado pela validação.
  const TIPOS_VALIDOS = ["imagem", "campo", "botao", "contraste", "link"];
  const VERSOES_VALIDAS = ["defeito", "corrigida"];
  const CARGAS_VALIDAS = ["imediata", "fixa", "variavel"];
  const PARAMETROS_RECONHECIDOS = ["tipo", "versao", "carga", "atraso"];

  const CAMINHO_IMAGEM = "assets/noticia.svg";
  const ALT_IMAGEM = "Ilustração de uma janela de navegador com barra superior, menu lateral de ícones e área de conteúdo com títulos, um botão de alternância, um botão com símbolo de acessibilidade, outro botão e um ponteiro de mouse.";
  const ATRASO_MAXIMO_MS = 10000;
  const ATRASO_PADRAO_FIXA_MS = 2000;
  const LIMITE_CARREGAMENTO_MS = 15000;
  const SVG_NS = "http://www.w3.org/2000/svg";

  class ErroConfiguracao extends Error {}

  /*
   * Contrato observável descrito em SPEC.md. A automação consulta este objeto
   * para saber qual configuração foi aplicada e em que momento o componente
   * ficou disponível.
   *
   * Os instantes usam performance.now(), portanto são relativos ao início da
   * navegação. Campos de eventos ainda não ocorridos permanecem null.
   *
   * Estados: "carregando" indica componente ainda não inserido ou imagem ainda
   * não concluída; "pronto" indica disponível para análise; "erro" indica
   * configuração inválida, falha da imagem ou estouro do limite de carga.
   */
  const experimento = {
    configuracao: null,
    estado: "carregando",
    atrasoProgramado: null,
    instanteDomContentLoaded: null,
    instanteInsercao: null,
    instanteProntidao: null,
    erro: null
  };

  window.experimento = experimento;

  const cenario = document.getElementById("cenario");
  const componente = document.getElementById("componente");
  const mensagemEstado = document.getElementById("mensagem-estado");

  let configuracao = null;

  /*
   * As condições temporizadas (fixa e variavel) contam o atraso a partir do
   * instante em que este listener registra DOMContentLoaded. O componente da
   * condição imediata não passa por aqui: ele já foi inserido durante a
   * inicialização, antes do evento.
   *
   * O atraso de "variavel" vem externamente pela URL; a aplicação não sorteia
   * valores. O atraso é uma condição experimental, não um defeito.
   */
  document.addEventListener("DOMContentLoaded", () => {
    experimento.instanteDomContentLoaded = performance.now();

    if (
      configuracao !== null &&
      configuracao.carga !== "imediata" &&
      experimento.estado === "carregando"
    ) {
      agendarInsercao(configuracao);
    }
  }, { once: true });

  try {
    configuracao = validarConfiguracao(window.location.search);
  } catch (erro) {
    if (erro instanceof ErroConfiguracao) {
      definirErro(erro.message);
    } else {
      definirErro("Não foi possível interpretar a configuração da URL.");
      console.error(erro);
    }
    return;
  }

  experimento.configuracao = { ...configuracao };
  // atrasoProgramado é o atraso do agendamento, não o tempo efetivamente
  // observado. Na condição imediata não há agendamento, então o campo
  // permanece null; o valor configurado para a execução continua em
  // configuracao.atraso (0).
  experimento.atrasoProgramado = configuracao.carga === "imediata" ? null : configuracao.atraso;

  // Condição imediata: a inserção ocorre durante a inicialização, antes de DOMContentLoaded.
  if (configuracao.carga === "imediata") {
    inserirComponente(configuracao);
  }

  /*
   * A validação rejeita configurações inválidas com mensagem explícita em vez
   * de aplicar um padrão silencioso: uma troca de valor executaria outro
   * cenário sem que a automação percebesse.
   */
  function validarConfiguracao(search) {
    const parametros = new URLSearchParams(search);

    const desconhecidos = [
      ...new Set([...parametros.keys()].filter((nome) => !PARAMETROS_RECONHECIDOS.includes(nome)))
    ];

    if (desconhecidos.length > 0) {
      const lista = desconhecidos
        .map((nome) => (nome === "" ? "(nome vazio)" : `"${nome}"`))
        .join(", ");
      throw new ErroConfiguracao(
        `Parâmetro(s) desconhecido(s): ${lista}. Parâmetros aceitos: tipo, versao, carga e atraso.`
      );
    }

    const repetidos = PARAMETROS_RECONHECIDOS.filter(
      (nome) => parametros.getAll(nome).length > 1
    );

    if (repetidos.length > 0) {
      const lista = repetidos.map((nome) => `"${nome}"`).join(", ");
      throw new ErroConfiguracao(
        `Parâmetro(s) informado(s) mais de uma vez: ${lista}. Informe cada parâmetro no máximo uma vez.`
      );
    }

    const vazios = PARAMETROS_RECONHECIDOS.filter(
      (nome) => parametros.has(nome) && parametros.get(nome) === ""
    );

    if (vazios.length > 0) {
      const lista = vazios.map((nome) => `"${nome}"`).join(", ");
      throw new ErroConfiguracao(
        `Parâmetro(s) com valor vazio: ${lista}. Informe um valor válido ou omita o parâmetro.`
      );
    }

    const tipo = parametros.has("tipo") ? parametros.get("tipo") : "imagem";
    const versao = parametros.has("versao") ? parametros.get("versao") : "corrigida";
    const carga = parametros.has("carga") ? parametros.get("carga") : "imediata";

    if (!TIPOS_VALIDOS.includes(tipo)) {
      throw new ErroConfiguracao(
        `Valor inválido para "tipo": "${tipo}". Valores aceitos: imagem, campo, botao, contraste e link.`
      );
    }

    if (!VERSOES_VALIDAS.includes(versao)) {
      throw new ErroConfiguracao(
        `Valor inválido para "versao": "${versao}". Valores aceitos: defeito e corrigida.`
      );
    }

    if (!CARGAS_VALIDAS.includes(carga)) {
      throw new ErroConfiguracao(
        `Valor inválido para "carga": "${carga}". Valores aceitos: imediata, fixa e variavel.`
      );
    }

    let atraso;

    if (parametros.has("atraso")) {
      atraso = converterAtraso(parametros.get("atraso"));
    } else if (carga === "imediata") {
      atraso = 0;
    } else if (carga === "fixa") {
      atraso = ATRASO_PADRAO_FIXA_MS;
    } else {
      throw new ErroConfiguracao(
        'Para carga=variavel, o parâmetro "atraso" é obrigatório e deve ser informado explicitamente.'
      );
    }

    if (carga === "imediata" && atraso !== 0) {
      throw new ErroConfiguracao(
        'Para carga=imediata, o parâmetro "atraso" deve ser ausente ou igual a 0.'
      );
    }

    return { tipo, versao, carga, atraso };
  }

  function converterAtraso(texto) {
    if (!/^[0-9]+$/.test(texto)) {
      throw new ErroConfiguracao(
        `Valor inválido para "atraso": "${texto}". Use um inteiro decimal entre 0 e ${ATRASO_MAXIMO_MS}.`
      );
    }

    const valor = Number(texto);

    if (!Number.isInteger(valor) || valor < 0 || valor > ATRASO_MAXIMO_MS) {
      throw new ErroConfiguracao(
        `Valor inválido para "atraso": "${texto}". Use um inteiro decimal entre 0 e ${ATRASO_MAXIMO_MS}.`
      );
    }

    return valor;
  }

  function agendarInsercao(config) {
    window.setTimeout(() => inserirComponente(config), config.atraso);
  }

  function inserirComponente(config) {
    // Só insere enquanto o estado é carregando; pronto e erro são terminais.
    if (experimento.estado !== "carregando") {
      return;
    }

    if (cenario === null || componente === null) {
      definirErro("Não foi possível localizar a região experimental na página.");
      return;
    }

    cenario.dataset.estado = "carregando";

    if (config.tipo === "imagem") {
      inserirImagem(config);
      return;
    }

    const elemento = criarElementoExperimental(config);
    experimento.instanteInsercao = performance.now();
    componente.replaceChildren(elemento);

    // Os demais componentes não possuem recurso assíncrono próprio:
    // após a inserção e a aplicação das classes, já estão disponíveis para análise.
    definirPronto();
  }

  function criarElementoExperimental(config) {
    switch (config.tipo) {
      case "campo":
        return criarCampo(config.versao);
      case "botao":
        return criarBotao(config.versao);
      case "contraste":
        return criarContraste(config.versao);
      case "link":
        return criarLink(config.versao);
      default:
        throw new Error(`Tipo não reconhecido: ${config.tipo}`);
    }
  }

  /*
   * Defeito intencional (versao=defeito): o texto próximo ao campo fica em um
   * span sem associação com o input, portanto não lhe fornece nome acessível.
   * Correção (versao=corrigida): o mesmo texto vira um label associado por
   * "for", mantendo aparência e estrutura equivalentes.
   */
  function criarCampo(versao) {
    const grupo = document.createElement("div");
    grupo.className = "campo-experimental";

    const rotulo = document.createElement(versao === "corrigida" ? "label" : "span");
    rotulo.id = "rotulo-campo-busca";
    rotulo.className = "rotulo-campo";
    rotulo.textContent = "Pesquisar notícias";

    if (versao === "corrigida") {
      rotulo.htmlFor = "campo-busca";
    }

    const campo = document.createElement("input");
    campo.type = "text";
    campo.id = "campo-busca";
    campo.name = "busca";
    campo.className = "campo-busca";

    grupo.append(rotulo, campo);
    return grupo;
  }

  /*
   * Defeito intencional: o botão contém apenas um ícone decorativo e não recebe
   * nome acessível. Correção: somente a versão corrigida recebe aria-label,
   * que informa a finalidade do botão.
   */
  function criarBotao(versao) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.id = "botao-compartilhar";
    botao.className = "botao-icone";

    if (versao === "corrigida") {
      botao.setAttribute("aria-label", "Compartilhar notícia");
    }

    botao.append(criarIconeCompartilhar());
    return botao;
  }

  /*
   * Defeito intencional: a classe --defeito aplica #aaaaaa sobre #ffffff.
   * Correção: a classe --corrigida aplica #333333 sobre o mesmo fundo branco.
   * O texto é idêntico nas duas versões; apenas a cor muda, e essa decisão
   * fica no CSS para não duplicar o conteúdo.
   */
  function criarContraste(versao) {
    const texto = document.createElement("p");
    texto.id = "texto-contraste";
    texto.className = `texto-contraste texto-contraste--${versao}`;
    texto.textContent = "Uma publicação do Laboratório de Inovação Goiás discute aplicações de inteligência artificial na acessibilidade, como legendas automáticas, descrições de imagens e adaptações de interface. O texto destaca a importância da autonomia dos usuários e da participação de pessoas com deficiência na validação das soluções.";
    return texto;
  }

  /*
   * Defeito intencional: o link formado por um ícone decorativo não possui nome
   * acessível. Correção: somente a versão corrigida recebe aria-label, que
   * informa o propósito do link. O destino é o mesmo nas duas versões.
   */
  function criarLink(versao) {
    const link = document.createElement("a");
    link.id = "link-noticia";
    link.className = "link-icone";
    // O identificador do destino foi mantido por compatibilidade com a etapa anterior.
    link.href = "#noticia-corredor-verde";

    if (versao === "corrigida") {
      link.setAttribute("aria-label", "Ler notícia sobre acessibilidade na urna eletrônica");
    }

    link.append(criarIconeNoticia());
    return link;
  }

  /*
   * Ícone decorativo compartilhado por botão e link: aria-hidden e focusable
   * impedem que o SVG forneça nome acessível nas duas versões. Por isso, a
   * correção do botão e do link depende apenas do aria-label do elemento pai.
   */
  function criarSvgIcone() {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    return svg;
  }

  function criarIconeCompartilhar() {
    const svg = criarSvgIcone();
    const grupo = document.createElementNS(SVG_NS, "g");
    grupo.setAttribute("fill", "none");
    grupo.setAttribute("stroke", "currentColor");
    grupo.setAttribute("stroke-width", "2");
    grupo.setAttribute("stroke-linecap", "round");
    grupo.setAttribute("stroke-linejoin", "round");

    for (const [cx, cy] of [[18, 5], [6, 12], [18, 19]]) {
      const circulo = document.createElementNS(SVG_NS, "circle");
      circulo.setAttribute("cx", String(cx));
      circulo.setAttribute("cy", String(cy));
      circulo.setAttribute("r", "3");
      grupo.append(circulo);
    }

    const caminho = document.createElementNS(SVG_NS, "path");
    caminho.setAttribute("d", "M8.6 10.7 15.4 6.8M8.6 13.3l6.8 4.1");
    grupo.append(caminho);
    svg.append(grupo);
    return svg;
  }

  function criarIconeNoticia() {
    const svg = criarSvgIcone();
    const grupo = document.createElementNS(SVG_NS, "g");
    grupo.setAttribute("fill", "none");
    grupo.setAttribute("stroke", "currentColor");
    grupo.setAttribute("stroke-width", "2");
    grupo.setAttribute("stroke-linecap", "round");
    grupo.setAttribute("stroke-linejoin", "round");

    const contorno = document.createElementNS(SVG_NS, "rect");
    contorno.setAttribute("x", "4");
    contorno.setAttribute("y", "4");
    contorno.setAttribute("width", "16");
    contorno.setAttribute("height", "16");
    contorno.setAttribute("rx", "2");
    grupo.append(contorno);

    const linhas = document.createElementNS(SVG_NS, "path");
    linhas.setAttribute("d", "M8 8h8M8 12h8M8 16h5");
    grupo.append(linhas);
    svg.append(grupo);
    return svg;
  }

  /*
   * Defeito intencional: em versao=defeito a imagem informativa é inserida sem
   * alt. Correção: em versao=corrigida a mesma imagem recebe o alt descritivo.
   *
   * A imagem é o único componente com recurso assíncrono próprio. Por isso a
   * prontidão aguarda o carregamento bem-sucedido, cobre o caso de cache e pode
   * terminar em erro por falha do recurso ou por estouro do limite de tempo.
   */
  function inserirImagem(config) {
    const imagem = document.createElement("img");
    imagem.id = "imagem-noticia";
    imagem.width = 960;
    imagem.height = 540;
    imagem.className = "imagem-noticia";

    if (config.versao === "corrigida") {
      imagem.alt = ALT_IMAGEM;
    }

    let finalizado = false;
    let limiteId = null;

    // A trava "finalizado" garante uma única transição terminal. Assim, um load
    // que chegue depois de uma falha ou do timeout não transforma erro em pronto.
    const finalizar = (sucesso, textoErro) => {
      if (finalizado) {
        return;
      }

      finalizado = true;

      if (limiteId !== null) {
        window.clearTimeout(limiteId);
        limiteId = null;
      }

      if (sucesso) {
        definirPronto();
      } else {
        definirErro(textoErro);
      }
    };

    imagem.addEventListener("load", () => {
      if (imagem.naturalWidth > 0) {
        finalizar(true);
      } else {
        finalizar(false, "A imagem do cenário carregou, mas não possui dimensões naturais válidas.");
      }
    }, { once: true });

    imagem.addEventListener("error", () => {
      finalizar(false, `Não foi possível carregar a imagem do cenário (${CAMINHO_IMAGEM}).`);
    }, { once: true });

    imagem.src = CAMINHO_IMAGEM;
    experimento.instanteInsercao = performance.now();
    componente.replaceChildren(imagem);

    // Limite de 15000 ms contado a partir da inserção: evita permanecer
    // indefinidamente em carregando quando o recurso não conclui.
    limiteId = window.setTimeout(() => {
      finalizar(
        false,
        `A imagem do cenário não carregou dentro do limite de ${LIMITE_CARREGAMENTO_MS} ms.`
      );
    }, LIMITE_CARREGAMENTO_MS);

    // Cobre o caso de a imagem já estar disponível no cache: complete e
    // dimensões naturais válidas permitem registrar a prontidão sem esperar
    // um novo evento de load.
    if (imagem.complete) {
      if (imagem.naturalWidth > 0) {
        finalizar(true);
      } else {
        finalizar(false, `Não foi possível carregar a imagem do cenário (${CAMINHO_IMAGEM}).`);
      }
    }
  }

  function definirPronto() {
    // Callbacks tardios não podem reverter um estado terminal de erro.
    if (experimento.estado !== "carregando") {
      return;
    }

    // "pronto" significa disponível para análise, não aprovado em acessibilidade.
    // A sinalização é a mesma nas versões defeito e corrigida.
    experimento.estado = "pronto";
    experimento.instanteProntidao = performance.now();
    experimento.erro = null;
    cenario.dataset.estado = "pronto";

    if (mensagemEstado !== null) {
      mensagemEstado.hidden = true;
      mensagemEstado.textContent = "";
    }
  }

  // Estado terminal de erro: a mensagem fica visível em #mensagem-estado e
  // também em window.experimento.erro para observação pela automação.
  function definirErro(texto) {
    experimento.estado = "erro";
    experimento.erro = texto;

    if (cenario !== null) {
      cenario.dataset.estado = "erro";
    }

    if (mensagemEstado !== null) {
      mensagemEstado.textContent = texto;
      mensagemEstado.hidden = false;
    }
  }
})();

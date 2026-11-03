# SPEC — Portal de Notícias Experimental

## 1. Objetivo

Disponibilizar uma aplicação web experimental para investigar como o momento de execução dos testes automatizados influencia a detecção de violações de acessibilidade.

O estudo comparará três condições de carregamento do componente:

- **imediata**: componente inserido durante a inicialização, antes de `DOMContentLoaded`;
- **fixa**: componente inserido após `DOMContentLoaded`, com atraso fixo configurado;
- **variável**: componente inserido após `DOMContentLoaded`, com atraso diferente entre execuções.

A aplicação apenas disponibiliza o componente e informa seu estado de prontidão. A observação, a medição e a classificação de acessibilidade pertencem aos futuros scripts de teste (S1, S2 e S3) e às ferramentas axe-core, QualWeb e Playwright, que não são integradas nesta etapa. A capacidade de detecção dessas ferramentas será avaliada no estudo-piloto.

Condição de carregamento e estratégia de teste são conceitos distintos: a aplicação implementa as condições `imediata`, `fixa` e `variavel`; as estratégias S1, S2 e S3 pertencem aos futuros scripts de teste.

## 2. Escopo

O projeto contempla cinco tipos de componente, cada um com duas versões. Todos estão implementados nesta etapa:

| Tipo | Versão `defeito` | Versão `corrigida` |
| --- | --- | --- |
| `imagem` | imagem informativa sem `alt` | mesma imagem com `alt` adequado |
| `campo` | campo sem nome acessível | campo com `label` visível associado |
| `botao` | botão com ícone sem nome acessível | mesmo botão com `aria-label` |
| `contraste` | texto com contraste insuficiente | texto com contraste adequado |
| `link` | link com ícone sem nome acessível | mesmo link com `aria-label` |

Cada execução avalia um tipo por vez. O planejamento completo contempla 5 tipos × 2 versões × 3 condições de carregamento = 30 combinações, além das diferentes execuções e repetições experimentais.

As 30 combinações — 5 tipos × 2 versões × 3 condições de carregamento — representam configurações da aplicação. Estratégias de teste, ferramentas, repetições e coleta de resultados serão definidas separadamente. A disponibilidade dos cenários não comprova que qualquer ferramenta detecte as violações. As combinações foram verificadas quanto a funcionamento, presença do defeito/correção, prontidão, consistência entre DOM e `window.experimento` e ausência de erros JavaScript; **nenhuma avaliação de conformidade por ferramenta automatizada foi realizada nesta etapa**.

## 3. Página

A página deve:

- estar em português, com `lang="pt-BR"`;
- possuir título e metadados básicos;
- exibir o cabeçalho “Portal de Notícias Experimental”;
- conter um único `h1`;
- conter conteúdo principal e rodapé;
- conter a região experimental com `id="cenario"`;
- usar conteúdo educativo adaptado de publicações identificadas, com créditos e fontes, além de CSS local e recursos locais;
- identificar o caráter experimental e a origem adaptada do conteúdo em uma observação visível;
- manter a estrutura e o conteúdo de apoio iguais entre as versões e entre os tipos;
- apresentar somente o componente correspondente ao parâmetro `tipo` dentro de `#componente`;
- não conter painel de configuração: os cenários são selecionados pela URL.

A página básica deve evitar violações adicionais conhecidas, usando HTML semântico, hierarquia de títulos, contraste adequado no conteúdo de apoio e landmarks. O indicador de foco da estrutura de apoio usa uma cor com contraste de pelo menos 3:1 sobre o fundo branco, conforme a WCAG 2.2 SC 1.4.11. Essa é uma verificação da estrutura de apoio, não dos cinco defeitos intencionais.

### 3.1 Conteúdo editorial

O conteúdo de apoio é composto por adaptações educativas de três publicações sobre acessibilidade. Os textos são paráfrases, não transcrições, e não representam os veículos ou órgãos citados.

| Conteúdo | Título usado na adaptação | Crédito | Origem |
| --- | --- | --- | --- |
| Notícia 1 | IA pode apoiar o desenvolvimento de interfaces mais inclusivas | Tatiane Marinho — Laboratório de Inovação Goiás (LIGO), 12/12/2025 | `goias.gov.br/ligo/` |
| Notícia 2 | Atualização do GOV.BR busca facilitar o uso por pessoas com deficiência | Metrô News, com crédito à Agência Brasil, 11/11/2025 | `metronews.com.br` |
| Notícia 3 | TSE apresenta mudanças na interface da urna para ampliar a acessibilidade | Tribunal Superior Eleitoral (TSE), publicada em 08/08/2026 e atualizada em 08/10/2026 | `tse.jus.br` |

Cada notícia exibe título, resumo, crédito e um link descritivo para a fonte. Os créditos ficam fora de `#componente` e não são associados por `label`, `aria-label` ou `aria-labelledby` aos elementos experimentais, para não lhes fornecer nome acessível acidental.

As notícias e atribuições estão armazenadas no próprio HTML; o texto do componente `contraste` repete o resumo da notícia 1 e é criado em `app.js`. A aplicação não faz `fetch`, `iframe`, `prefetch` ou `prerender`; os endereços das fontes são apenas links de navegação, preferencialmente na mesma aba.

A ilustração `assets/noticia.svg` é um recurso próprio do projeto, identificado como ilustração, e não reproduz fotografias, logotipos ou imagens das fontes.

## 4. Parâmetros de URL

| Parâmetro | Valores aceitos | Obrigatório | Padrão |
| --- | --- | --- | --- |
| `tipo` | `imagem`, `campo`, `botao`, `contraste`, `link` | não | `imagem` |
| `versao` | `defeito`, `corrigida` | não | `corrigida` |
| `carga` | `imediata`, `fixa`, `variavel` | não | `imediata` |
| `atraso` | inteiro decimal de 0 a 10000 (milissegundos) | depende da carga | ver regras abaixo |

### 4.1 Regras de atraso

- O atraso é expresso em **milissegundos inteiros**.
- `carga=imediata`: `atraso` ausente ou igual a `0`. Qualquer outro valor é inválido.
- `carga=fixa`: se `atraso` estiver ausente, usar `2000` ms. Um valor explícito entre `0` e `10000` é aceito.
- `carga=variavel`: `atraso` deve ser informado explicitamente e estar entre `0` e `10000`.
- A aplicação não sorteia atrasos. A sequência de atrasos da condição variável será definida externamente pela automação.
- Os valores de atraso são configurações iniciais e estão sujeitos ao estudo-piloto; poderão ser ajustados no planejamento ou no piloto futuro.

### 4.2 Validação

A aplicação deve rejeitar, com mensagem clara e sem conversão silenciosa:

- valores vazios, como `?tipo=` ou `?tipo`;
- valores fora das listas aceitas;
- `atraso` não inteiro, negativo, acima de `10000` ou com outra notação;
- parâmetros reconhecidos repetidos, como `?tipo=imagem&tipo=imagem`;
- parâmetros desconhecidos;
- `carga=variavel` sem `atraso` explícito;
- `carga=imediata` com `atraso` diferente de `0`.

Configurações inválidas resultam em estado `erro`, sem inserir o componente. A mensagem deve ser exibida na região `#cenario` e registrada em `window.experimento.erro`.

## 5. Componentes implementados

Todos os componentes usam o conteúdo educativo adaptado descrito na seção 3.1. Apenas o componente solicitado é inserido em `#componente`; os demais não são criados.

### 5.1 `imagem`

- Recurso local: `assets/noticia.svg`, com as mesmas dimensões e aparência nas duas versões.
- **`defeito`**: elemento `img#imagem-noticia` sem o atributo `alt`. O atributo não deve ser substituído por `alt=""`, `aria-label`, `aria-labelledby` ou `title`.
- **`corrigida`**: mesmo `img#imagem-noticia`, com `alt` descritivo adequado ao conteúdo da ilustração.

Texto alternativo usado na versão corrigida:

> Ilustração de uma janela de navegador com barra superior, menu lateral de ícones e área de conteúdo com títulos, um botão de alternância, um botão com símbolo de acessibilidade, outro botão e um ponteiro de mouse.

A imagem é o único componente com recurso assíncrono próprio. Seu carregamento, cache, falha e limite de tempo são tratados conforme a seção 7.

### 5.2 `campo`

- Estrutura: `div.campo-experimental` contendo o texto de rótulo e `input#campo-busca[type="text"][name="busca"]`.
- Texto visível do rótulo: “Pesquisar notícias”.
- **`defeito`**: `span#rotulo-campo-busca` visível, não associado ao campo. O `input` não tem `label` associado, `aria-label`, `aria-labelledby`, `title` nem `placeholder`.
- **`corrigida`**: `label#rotulo-campo-busca[for="campo-busca"]` com o mesmo texto e a mesma aparência; o `input` permanece estruturalmente igual.
- Não há pesquisa real.

### 5.3 `botao`

- Estrutura: `button#botao-compartilhar[type="button"]` com ícone SVG inline local.
- O ícone tem `aria-hidden="true"` e `focusable="false"`, sem `title` ou `desc`, para ser decorativo nas duas versões.
- **`defeito`**: botão sem `aria-label`, `title`, texto visível ou conteúdo oculto que forneça nome.
- **`corrigida`**: mesmo botão com `aria-label="Compartilhar notícia"`.
- Não há compartilhamento real.

### 5.4 `contraste`

- Estrutura: `p#texto-contraste` com o resumo da notícia 1 (inteligência artificial e acessibilidade).
- Texto, posição, tamanho de `16px`, peso `400`, fundo branco sólido e `line-height` são iguais nas duas versões. O fundo não usa transparência, gradiente ou imagem.
- **`defeito`**: cor do texto `#aaaaaa` sobre `#ffffff`, relação de contraste de aproximadamente **2,32:1**, abaixo de `4,5:1`.
- **`corrigida`**: cor do texto `#333333` sobre `#ffffff`, relação de contraste de aproximadamente **12,63:1**, acima de `4,5:1`.
- A alteração de cor atinge somente `#texto-contraste`; nenhuma outra parte da página muda entre as versões.
- O crédito da fonte permanece em um elemento separado do componente, com contraste adequado.
- O texto do componente foi alterado nesta etapa: passou a ser o resumo da notícia 1. Os tempos e resultados de etapas futuras deverão corresponder a esta versão do conteúdo.

Cálculo pelas luminâncias relativas das cores:

- `#aaaaaa` sobre `#ffffff`: **2,3231:1**;
- `#333333` sobre `#ffffff`: **12,6347:1**.

### 5.5 `link`

- Estrutura: `a#link-noticia` com ícone SVG inline local.
- Destino local válido: `#noticia-corredor-verde`, âncora do artigo sobre a urna eletrônica presente na página. O identificador foi mantido por compatibilidade com a etapa anterior; apenas o conteúdo do destino foi atualizado.
- O ícone tem `aria-hidden="true"` e `focusable="false"`, sem `title` ou `desc`, para ser decorativo nas duas versões. Não há imagem sem `alt` dentro do link.
- **`defeito`**: link sem `aria-label`, `title`, texto visível ou conteúdo oculto que forneça nome.
- **`corrigida`**: mesmo link com `aria-label="Ler notícia sobre acessibilidade na urna eletrônica"`.
- O link externo da fonte fica separado do link experimental, no bloco editorial de apoio.

### 5.6 Identificadores, violações, correções e prontidão

| Tipo | Identificador do elemento | Violação intencional | Correção correspondente | Condição de prontidão |
| --- | --- | --- | --- | --- |
| `imagem` | `#imagem-noticia` (`img`) | imagem informativa sem `alt` e sem outro nome acessível | mesmo `img` com `alt` descritivo | após carregamento bem-sucedido ou cache com `complete` e dimensões válidas; `erro` em falha ou timeout de 15000 ms |
| `campo` | `#campo-busca` (`input`); rótulo `#rotulo-campo-busca` | texto visível em `span` não associado; `input` sem nome acessível | `label[for="campo-busca"]` com o mesmo texto visível | imediatamente após a inserção e a aplicação das classes |
| `botao` | `#botao-compartilhar` (`button`) | SVG decorativo sem nome acessível; botão sem nome | mesmo botão com `aria-label="Compartilhar notícia"` | imediatamente após a inserção e a aplicação dos atributos |
| `contraste` | `#texto-contraste` (`p`) | texto `#aaaaaa` sobre `#ffffff` (2,3231:1) | mesmo texto em `#333333` sobre `#ffffff` (12,6347:1) | imediatamente após a inserção e a aplicação da classe de cor |
| `link` | `#link-noticia` (`a`) | SVG decorativo sem nome acessível; link sem nome | mesmo link com `aria-label="Ler notícia sobre acessibilidade na urna eletrônica"` | imediatamente após a inserção e a aplicação do atributo |

O link aponta para o destino local estável `#noticia-corredor-verde`, identificador mantido por compatibilidade e associado ao artigo sobre a urna eletrônica. Também são estáveis `#cenario`, `#componente` e `#mensagem-estado`.

### 5.7 Critérios WCAG 2.2 correspondentes

A tabela relaciona cada defeito intencional ao critério WCAG 2.2 que ele contraria. Ela não afirma que uma ferramenta específica detectará a violação.

| Tipo | Critério WCAG 2.2 | Nível | Regra ACT relacionada (W3C) |
| --- | --- | --- | --- |
| `imagem` | 1.1.1 Non-text Content | A | Image has non-empty accessible name |
| `campo` | 4.1.2 Name, Role, Value | A | Form field has non-empty accessible name |
| `campo` | 1.3.1 Info and Relationships | A | Form field has non-empty accessible name |
| `botao` | 4.1.2 Name, Role, Value | A | Button has non-empty accessible name |
| `contraste` | 1.4.3 Contrast (Minimum) | AA | Text has minimum contrast |
| `link` | 4.1.2 Name, Role, Value | A | Link has non-empty accessible name |
| `link` | 2.4.4 Link Purpose (In Context) | A | Link has non-empty accessible name |

Os critérios WCAG são normativos; as regras ACT são métodos de teste informativos do W3C e não equivalentes aos critérios. Regras implementadas por axe-core ou QualWeb podem cobrir apenas parte de um critério, ter outro nome e outro escopo. A correspondência entre regras de ferramenta e critérios, bem como a detecção efetiva, só será verificada no estudo-piloto; nada nesta seção antecipa esse resultado.

Fontes consultadas: [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/) e [ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/).

## 6. Condições de carregamento

O `app.js` deve ser carregado de modo que sua inicialização ocorra antes de `DOMContentLoaded`, com o HTML necessário já disponível.

- **`imediata`**: inserir o componente durante a inicialização, antes de `DOMContentLoaded`.
- **`fixa`**: a partir de `DOMContentLoaded`, agendar a inserção com o atraso configurado.
- **`variavel`**: usar o mesmo mecanismo de agendamento da condição fixa, com o atraso explicitamente informado para a execução.

Todos os tipos usam o mesmo agendamento. Não devem existir esperas artificiais, `requestAnimationFrame` ou temporizações adicionais destinadas a forçar diferenças entre os resultados das ferramentas.

O marco inicial dos atrasos `fixa` e `variavel` é o instante em que o listener de `DOMContentLoaded` registra `instanteDomContentLoaded`; a contagem do agendamento começa nesse marco. Na condição `imediata`, não há atraso: a inserção ocorre durante a inicialização, antes de `DOMContentLoaded`.

`atrasoProgramado`, exposto em `window.experimento`, é o atraso usado no agendamento, em milissegundos; permanece `null` na condição `imediata`, pois não há agendamento, e em configuração inválida. O valor configurado para a condição `imediata` continua disponível em `configuracao.atraso` (0). O tempo efetivamente observado é obtido por `instanteInsercao - instanteDomContentLoaded` nas condições temporizadas; ele pode ser maior que o programado por variação natural do agendador de tarefas e do carregamento da página, e não deve ser tratado como valor exato.

A condição `variavel` não sorteia valores nem define uma sequência experimental: depende de uma sequência externa de atrasos fornecida pela automação. Os valores atuais são configurações iniciais e poderão ser ajustados no planejamento ou no piloto futuro.

## 7. Estado e prontidão

A região `#cenario` expõe `data-estado` com um dos valores:

- `carregando`: componente ainda não inserido ou imagem ainda não concluída;
- `pronto`: componente inserido e disponível para análise;
- `erro`: configuração inválida, falha da imagem ou estouro do limite de carregamento.

Para `campo`, `botao`, `contraste` e `link`, o estado `pronto` é definido imediatamente após a inserção no DOM e a aplicação das classes e atributos. Esses componentes não têm recurso assíncrono próprio; por isso não há espera adicional. A justificativa é evitar atraso artificial sem necessidade demonstrada.

Para `imagem`, `pronto` só pode ser definido depois que o elemento `img` estiver no DOM e a imagem tiver carregado com sucesso. O caso de imagem já disponível no cache deve ser tratado: se `complete` for verdadeiro e a imagem tiver dimensões naturais válidas, a prontidão pode ser registrada imediatamente.

Se a imagem falhar, o cenário passa para `erro` e exibe uma mensagem clara. O limite para falha de carregamento ou decodificação do recurso é de **15000 ms**, contado a partir da inserção. Esse limite evita que o cenário permaneça indefinidamente em `carregando`.

`pronto` nunca é definido antes de o elemento estar inserido em `#componente`. Uma vez atingido o estado terminal `erro`, callbacks tardios — por exemplo, um `load` de imagem que chegue após o timeout — não podem alterar o estado para `pronto`; a prontidão só é aplicada quando o estado atual é `carregando`.

`pronto` significa que o componente está disponível para análise, não que ele foi aprovado em acessibilidade. A sinalização é igual nas versões `defeito` e `corrigida`.

## 8. Contrato de `window.experimento`

A aplicação expõe um objeto para observação pela automação:

```js
window.experimento = {
  configuracao: null,
  estado: 'carregando',
  atrasoProgramado: null,
  instanteDomContentLoaded: null,
  instanteInsercao: null,
  instanteProntidao: null,
  erro: null
};
```

| Campo | Significado |
| --- | --- |
| `configuracao` | configuração normalizada e validada (`tipo`, `versao`, `carga`, `atraso`); `null` em caso de validação inválida |
| `estado` | espelha o `data-estado` de `#cenario` |
| `atrasoProgramado` | atraso usado no agendamento em ms; `null` na condição `imediata` (sem agendamento) e em configuração inválida |
| `instanteDomContentLoaded` | instante de `DOMContentLoaded` |
| `instanteInsercao` | instante em que o componente foi inserido no DOM |
| `instanteProntidao` | instante em que o componente ficou disponível para análise e o estado passou a `pronto` |
| `erro` | mensagem de erro quando o estado é `erro`; caso contrário, `null` |

Todos os instantes usam `performance.now()` e são relativos ao início da navegação. Campos ainda não disponíveis permanecem `null`. Na condição imediata, `instanteInsercao` pode ser anterior a `instanteDomContentLoaded`; nos componentes sem recurso assíncrono, `instanteProntidao` também pode anteceder `DOMContentLoaded`.

A resolução de `performance.now()` pode fazer dois instantes muito próximos coincidirem numericamente. Na condição `imediata`, a ordem é garantida pela execução síncrona do script `defer` antes de `DOMContentLoaded`, não pela desigualdade numérica entre os dois campos.

A aplicação não registra resultados de detecção de acessibilidade. As estratégias S1, S2 e S3 pertencem aos futuros scripts de teste.

## 9. Fora de escopo

- Integração com axe-core, QualWeb ou Playwright.
- Scripts de análise, estratégias S1/S2/S3, coleta de resultados, estudo-piloto e execução do experimento.
- Sorteio ou sequência automática de atrasos.
- Painel de configuração.
- Resultados, métricas ou alegações de detecção de acessibilidade.
- Pesquisa real, compartilhamento real ou navegação automática para fora da página. Os links de fonte só navegam quando acionados pelo usuário, na mesma aba.
- Backend, banco de dados, framework, TypeScript, etapa de build, bibliotecas externas, fontes remotas, analytics, CDN ou outros recursos remotos; a aplicação usa HTML, CSS e JavaScript puros e somente recursos locais.

### 9.1 Decisões metodológicas pendentes

As decisões abaixo não estão definidas nesta etapa e não devem ser tratadas como parâmetros finais. A aplicação apenas disponibiliza os cenários e o contrato de observação; não escolhe nem implementa esses valores.

- Definição operacional de S1, S2 e S3: quando exatamente a ferramenta é executada em cada estratégia.
- Valor da espera fixa de S2 e sua relação com o `atraso` da condição de carga.
- Sequência de atrasos da condição `variavel`, número de repetições e ordem das execuções.
- Configuração de axe-core, QualWeb e Playwright, incluindo escopo de regras, limites de espera e tratamento de timeout.
- Métricas de detecção (por tipo, por regra e por critério) e de custo (tempo total, tempo até a análise e número de execuções).
- Critérios de inclusão ou exclusão de execuções e forma de registro dos resultados.

## 10. Registro da mudança editorial

- O conteúdo de apoio foi substituído por adaptações educativas de três publicações sobre acessibilidade, com créditos e fontes identificados.
- A mudança atinge títulos, resumos, créditos, o texto do componente `contraste`, o `alt` da imagem corrigida e o nome acessível do link corrigido.
- A ilustração local `assets/noticia.svg` foi refeita como uma interface digital acessível. Ela é um recurso do projeto e não reproduz imagens das fontes.
- O contrato experimental foi preservado: parâmetros de URL, 30 combinações, estados `carregando`, `pronto` e `erro`, `window.experimento`, marcos de temporização, tratamento de cache, erro e timeout da imagem e proteção contra callbacks tardios.
- Nenhum resultado de temporização ou de detecção de acessibilidade havia sido registrado com o conteúdo anterior. Tempos e resultados de etapas futuras deverão corresponder a esta versão do conteúdo.

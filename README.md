# Portal de Notícias Experimental

Aplicação web experimental do trabalho da disciplina de Verificação e Validação de Software. O estudo investiga como o momento de execução dos testes automatizados afeta a detecção de violações de acessibilidade, comparando carregamento imediato, espera fixa e espera baseada no estado da aplicação.

Os cinco cenários estão implementados: **imagem**, **campo**, **botao**, **contraste** e **link**, cada um nas versões `defeito` e `corrigida`. A integração com axe-core, QualWeb e Playwright ainda **não** foi realizada; a capacidade de detecção dessas ferramentas será avaliada no estudo-piloto.

## Conteúdo editorial e fontes

O conteúdo de apoio da página é uma **adaptação educativa** de publicações reais sobre acessibilidade. Os textos são paráfrases produzidas para este trabalho; não são reportagens originais das pessoas responsáveis pela aplicação e não representam os veículos ou órgãos citados. Cada notícia exibe título, resumo, crédito e um link para a fonte.

| Título usado na adaptação | Autoria ou instituição | Data | Fonte |
| --- | --- | --- | --- |
| IA pode apoiar o desenvolvimento de interfaces mais inclusivas | Tatiane Marinho — Laboratório de Inovação Goiás (LIGO) | 12/12/2025 | <https://goias.gov.br/ligo/inteligencia-artificial-e-acessibilidade-em-ux-caminhos-para-interfaces-digitais-mais-inclusivas/> |
| Atualização do GOV.BR busca facilitar o uso por pessoas com deficiência | Metrô News, com crédito à Agência Brasil | 11/11/2025 | <https://metronews.com.br/atualizacao-do-app-gov-br-melhora-acessibilidade-para-pessoas-com-deficiencia/> |
| TSE apresenta mudanças na interface da urna para ampliar a acessibilidade | Tribunal Superior Eleitoral (TSE) | publicada em 08/08/2026 e atualizada em 08/10/2026 | <https://www.tse.jus.br/comunicacao/noticias/2026/Agosto/urna-eletronica-ganha-nova-interface-para-tornar-votacao-mais-acessivel-e-intuitiva> |

Os dados editoriais foram fornecidos integralmente no pedido. **As páginas de origem não foram acessadas nesta execução**, portanto não há data de consulta registrada e os títulos originais não puderam ser conferidos; os títulos acima são os utilizados nas adaptações.

A autoria da aplicação — código, desenho experimental, textos de apoio e a ilustração local `assets/noticia.svg` — pertence ao projeto acadêmico da disciplina de Verificação e Validação de Software. A autoria e a responsabilidade pelas informações jornalísticas são dos veículos, órgãos e pessoas citados. A ilustração é um recurso próprio do projeto e não reproduz fotografias, logotipos ou imagens das fontes.

Os endereços das fontes são apenas links de navegação, abertos na mesma aba quando acionados. A aplicação não faz `fetch`, `iframe`, `prefetch`, `prerender`, nem carregamento automático de recursos externos.

## Requisitos utilizados

- Node.js `v22.23.3`
- npm `10.9.9`
- `http-server` `14.1.1` (dependência de desenvolvimento com versão fixada)

A verificação foi feita no Google Chrome `156` em modo headless. A aplicação em si não exige navegador específico além de um navegador moderno com suporte a `URLSearchParams`, `performance.now()` e `DOMContentLoaded`.

## Instalação e execução

```bash
npm install
npm start
```

O servidor estático é iniciado em:

- <http://localhost:3000>

Se a porta 3000 estiver ocupada, não encerre o processo existente. Inicie em outra porta livre usando a dependência local, por exemplo:

```bash
npx http-server -p 3001
```

Nesse caso, use `http://localhost:3001` nas URLs abaixo.

## Parâmetros de URL

| Parâmetro | Valores | Padrão |
| --- | --- | --- |
| `tipo` | `imagem`, `campo`, `botao`, `contraste`, `link` | `imagem` |
| `versao` | `defeito`, `corrigida` | `corrigida` |
| `carga` | `imediata`, `fixa`, `variavel` | `imediata` |
| `atraso` | inteiro decimal de `0` a `10000` ms | `0` para imediata; `2000` para fixa |

Regras principais:

- `carga=imediata` aceita apenas `atraso` ausente ou `0`.
- `carga=fixa` usa `2000` ms quando `atraso` não é informado.
- `carga=variavel` exige `atraso` explícito.
- A aplicação não sorteia atrasos. A sequência será definida externamente pela automação.
- Os atrasos são configurações iniciais, sujeitas ao estudo-piloto.

## Condições de carregamento

| Condição | Marco inicial | Atraso | Comportamento |
| --- | --- | --- | --- |
| `imediata` | inicialização do `app.js`, antes de `DOMContentLoaded` | `0` | componente inserido antes de `DOMContentLoaded` |
| `fixa` | evento `DOMContentLoaded` | padrão `2000` ms; explicitamente `0` a `10000` ms | inserção agendada a partir do evento |
| `variavel` | evento `DOMContentLoaded` | obrigatório, `0` a `10000` ms | mesmo agendamento; o valor de cada execução vem de uma sequência externa |

O `atrasoProgramado`, exposto em `window.experimento`, é o valor configurado, não uma medição. O tempo efetivamente observado nas condições temporizadas é aproximadamente `instanteInsercao - instanteDomContentLoaded` e pode ser maior que o programado por variação natural do agendador de tarefas e do carregamento.

Modelo de URL para qualquer tipo, versão e condição:

```text
http://localhost:3000/?tipo=<tipo>&versao=<versao>&carga=<condicao>[&atraso=<ms>]
```

## Componentes implementados

| Tipo | Versão `defeito` | Versão `corrigida` |
| --- | --- | --- |
| `imagem` | imagem sem atributo `alt` | mesma imagem com `alt` descritivo |
| `campo` | campo sem nome acessível | campo com `label` visível associado |
| `botao` | botão com ícone sem nome acessível | mesmo botão com `aria-label="Compartilhar notícia"` |
| `contraste` | texto `#aaaaaa` sobre branco | texto `#333333` sobre branco |
| `link` | link com ícone sem nome acessível | mesmo link com `aria-label="Ler notícia sobre acessibilidade na urna eletrônica"` |

Relações de contraste do componente `contraste`:

- `#aaaaaa` sobre `#ffffff`: **2,3231:1** (abaixo de 4,5:1).
- `#333333` sobre `#ffffff`: **12,6347:1** (acima de 4,5:1).

Os ícones de `botao` e `link` são SVG inline locais, decorativos e marcados com `aria-hidden="true"` e `focusable="false"` nas duas versões.

### Mudança editorial desta etapa

- O texto do componente `contraste` passou a ser o resumo da notícia sobre inteligência artificial e acessibilidade (notícia 1), mantendo-se idêntico nas versões `defeito` e `corrigida`.
- O `alt` da versão corrigida de `imagem` foi atualizado para descrever a nova ilustração de interface digital acessível.
- O nome acessível da versão corrigida de `link` passou a ser “Ler notícia sobre acessibilidade na urna eletrônica”.
- O destino local `#noticia-corredor-verde` foi mantido por compatibilidade com a etapa anterior; apenas o conteúdo e o nome acessível do link foram atualizados.
- Nenhum resultado de temporização ou de detecção de acessibilidade havia sido registrado com o conteúdo anterior. Os tempos e resultados de etapas futuras deverão corresponder a esta nova versão do conteúdo.

As cinco opções de `tipo`, duas de `versao` e três de `carga` resultam nas **30 combinações disponíveis** da aplicação: 5 × 2 × 3. Elas são configurações da aplicação; estratégias de teste, repetições, ferramentas e coleta de resultados serão definidas separadamente. A disponibilidade das combinações não comprova detecção de violações por ferramenta alguma.

## Exemplos de URL — novos tipos

As URLs abaixo usam a condição imediata padrão e mostram as duas versões de cada novo tipo:

1. Campo, defeito:
   <http://localhost:3000/?tipo=campo&versao=defeito&carga=imediata>
2. Campo, corrigida:
   <http://localhost:3000/?tipo=campo&versao=corrigida&carga=imediata>
3. Botão, defeito:
   <http://localhost:3000/?tipo=botao&versao=defeito&carga=imediata>
4. Botão, corrigida:
   <http://localhost:3000/?tipo=botao&versao=corrigida&carga=imediata>
5. Contraste, defeito:
   <http://localhost:3000/?tipo=contraste&versao=defeito&carga=imediata>
6. Contraste, corrigida:
   <http://localhost:3000/?tipo=contraste&versao=corrigida&carga=imediata>
7. Link, defeito:
   <http://localhost:3000/?tipo=link&versao=defeito&carga=imediata>
8. Link, corrigida:
   <http://localhost:3000/?tipo=link&versao=corrigida&carga=imediata>

As condições temporizadas funcionam para todos os tipos. Exemplos:

- Campo, defeito, espera fixa:
  <http://localhost:3000/?tipo=campo&versao=defeito&carga=fixa&atraso=2000>
- Link, corrigida, espera variável:
  <http://localhost:3000/?tipo=link&versao=corrigida&carga=variavel&atraso=3000>

## Exemplos de imagem

As seis URLs correspondem a duas versões × três condições de carregamento:

1. Defeito, imediata:
   <http://localhost:3000/?tipo=imagem&versao=defeito&carga=imediata>
2. Defeito, fixa (atraso padrão de 2000 ms):
   <http://localhost:3000/?tipo=imagem&versao=defeito&carga=fixa&atraso=2000>
3. Defeito, variável (atraso explícito de 1500 ms):
   <http://localhost:3000/?tipo=imagem&versao=defeito&carga=variavel&atraso=1500>
4. Corrigida, imediata (padrão da aplicação):
   <http://localhost:3000/?tipo=imagem&versao=corrigida&carga=imediata>
5. Corrigida, fixa:
   <http://localhost:3000/?tipo=imagem&versao=corrigida&carga=fixa>
6. Corrigida, variável:
   <http://localhost:3000/?tipo=imagem&versao=corrigida&carga=variavel&atraso=3000>

## Exemplos de configurações inválidas

Todas resultam em estado `erro`, com mensagem exibida na região do cenário:

- `?tipo=` — valor vazio.
- `?tipo=video` — valor não aceito.
- `?tipo=imagem&tipo=imagem` — parâmetro reconhecido repetido.
- `?foo=bar` — parâmetro desconhecido.
- `?carga=variavel` — atraso explícito ausente.
- `?carga=imediata&atraso=10` — atraso diferente de zero em carga imediata.
- `?atraso=1.5` — atraso não inteiro.
- `?atraso=10001` — atraso acima do limite.

Para conferir um erro, observe `#cenario[data-estado="erro"]`, a mensagem visível em `#mensagem-estado` e o campo `window.experimento.erro`. Configurações inválidas não inserem componente em `#componente`.

## Sinal de prontidão

A automação deve observar a região `#cenario` e/ou `window.experimento`.

- `#cenario[data-estado="carregando"]`: componente ainda não inserido ou imagem ainda não concluída.
- `#cenario[data-estado="pronto"]`: componente inserido e disponível para análise.
- `#cenario[data-estado="erro"]`: configuração inválida, falha da imagem ou estouro do limite de carregamento.

`window.experimento` disponibiliza:

```js
{
  configuracao: { tipo, versao, carga, atraso },
  estado: 'carregando' | 'pronto' | 'erro',
  atrasoProgramado: number | null,
  instanteDomContentLoaded: number | null,
  instanteInsercao: number | null,
  instanteProntidao: number | null,
  erro: string | null
}
```

Os instantes usam `performance.now()` e são relativos ao início da navegação. Na condição imediata, a inserção ocorre antes de `DOMContentLoaded`. Para `campo`, `botao`, `contraste` e `link`, a prontidão é registrada logo após a inserção e a preparação do elemento, pois não há recurso assíncrono próprio. Para a imagem, a prontidão aguarda o carregamento com sucesso, inclusive no caso de cache.

Uma vez em `erro`, callbacks tardios não alteram o estado para `pronto`; por exemplo, uma imagem que carregue após o timeout permanece no estado de erro.

O limite para falha de carregamento da imagem é de **15000 ms**, contado a partir da inserção. Ele evita que o cenário permaneça indefinidamente em `carregando`.

Pronto significa “disponível para análise”, não “aprovado em acessibilidade”. A sinalização é igual nas versões defeito e corrigida.

### Consulta no console

Com a página aberta, use o console do navegador para inspecionar o estado:

```js
window.experimento
```

Para uma leitura formatada:

```js
JSON.stringify(window.experimento, null, 2)
```

Também é possível conferir o estado diretamente no DOM com `document.querySelector("#cenario").dataset.estado`. Os campos ainda indisponíveis permanecem `null`.

## Estrutura

```text
.
├── AGENTS.md
├── SPEC.md
├── README.md
├── package.json
├── package-lock.json
├── .gitignore
├── index.html
├── styles.css
├── app.js
└── assets/
    └── noticia.svg
```

## Limitações e próximos passos

- Os cinco tipos estão implementados, mas nenhuma ferramenta de acessibilidade foi integrada. Nenhum resultado de detecção foi medido ou registrado.
- Axe-core, QualWeb e Playwright não estão integrados; a capacidade de detecção das ferramentas será avaliada no estudo-piloto.
- **Nenhuma análise automatizada de acessibilidade foi realizada nesta etapa.** Inspeções funcionais de DOM e de estado não substituem uma avaliação de acessibilidade.
- A sequência de atrasos da condição variável ainda será definida pela automação.
- Os valores de atraso são iniciais e podem mudar após o estudo-piloto.
- As estratégias S1, S2 e S3 serão implementadas nos futuros scripts de teste, não nesta aplicação.
- O conteúdo de apoio é composto por adaptações educativas de publicações reais, com créditos e fontes identificados. Nenhum resultado de detecção foi medido com esse conteúdo.
- Não há pesquisa real nem compartilhamento real. Os links de fonte levam a páginas externas apenas quando acionados pelo usuário; não há carregamento automático de recursos externos.
- Próximo incremento recomendado: realizar o estudo-piloto de detecção com os componentes já disponíveis, avaliando as ferramentas e as estratégias de espera sem antecipar resultados científicos.

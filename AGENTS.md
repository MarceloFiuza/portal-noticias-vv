# AGENTS.md

## Contexto

Aplicação web experimental do projeto `portal-noticias`, usada para estudar o efeito do momento de execução de testes automatizados na detecção de violações de acessibilidade. Os cinco cenários estão implementados: `imagem`, `campo`, `botao`, `contraste` e `link`.

## Estrutura e tecnologia

- Manter a estrutura mínima do projeto e usar somente recursos locais.
- Usar HTML, CSS e JavaScript puro, sem frameworks, TypeScript, banco de dados ou etapa de build.
- Não introduzir camadas, dependências ou funcionalidades desnecessárias.
- Não usar bibliotecas externas, fontes remotas, analytics ou recursos por CDN.
- O único pacote de desenvolvimento previsto é o servidor HTTP estático, com versão fixada.

## Cenários de acessibilidade

- Preservar as violações intencionais nas versões `defeito`.
- Aplicar exatamente a correção correspondente nas versões `corrigida`.
- Não fornecer nomes acessíveis alternativos que neutralizem uma violação pretendida.
- Evitar violações adicionais conhecidas na estrutura básica, no conteúdo de apoio e no CSS.
- Manter a estrutura e o conteúdo de apoio iguais entre as versões de um mesmo cenário e entre os tipos.
- Manter dimensões e aparência equivalentes entre as versões de um mesmo cenário.

## Contratos estáveis

- Preservar os identificadores `#cenario`, `#componente` e `#mensagem-estado`.
- Preservar o atributo `data-estado` de `#cenario` com os valores `carregando`, `pronto` e `erro`.
- Preservar o contrato de `window.experimento`: `configuracao`, `estado`, `atrasoProgramado`, `instanteDomContentLoaded`, `instanteInsercao`, `instanteProntidao` e `erro`.
- Usar `performance.now()` para os instantes e manter a semântica de tempos relativos à navegação.
- Manter os parâmetros de URL e as regras de validação descritos em `SPEC.md`.
- Atualizar `SPEC.md` sempre que o comportamento mudar.

## Escopo

- Distinguir claramente funcionalidades implementadas de funcionalidades planejadas na documentação.
- Preservar os cinco tipos implementados (`imagem`, `campo`, `botao`, `contraste` e `link`) e o contrato comum de carregamento, estado e prontidão.
- Manter a prontidão como disponibilidade para análise, nunca como aprovação em acessibilidade.
- Não integrar axe-core, QualWeb, Playwright ou qualquer outra ferramenta de acessibilidade nesta etapa.
- Não implementar scripts de análise, estratégias S1/S2/S3, coleta de resultados, estudo-piloto ou execução do experimento nesta etapa.
- Não registrar resultados de detecção de acessibilidade que ainda não foram medidos.
- Não criar arquivos de planejamento, resultados ou relatórios sem necessidade concreta.
- As estratégias S1, S2 e S3 pertencem aos futuros scripts de teste, não à aplicação.

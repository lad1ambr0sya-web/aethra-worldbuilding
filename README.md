# Aethra — Ateliê de mundos

Aplicação em HTML, CSS e JavaScript nativos, sem dependências de execução. Requer um navegador moderno com WebGL para o globo.

## Executar

Na pasta `aethra`, execute `npm run dev` e abra http://127.0.0.1:4173. Não abra o HTML diretamente pelo protocolo file: (os módulos JavaScript precisam de HTTP). Com Live Server, abra `dist/index.html`.

## Funcionalidades

- Ambientes independentes e abas configuráveis, tema claro e escuro.
- Notas com pastas, formatação, listas, citações, links e cor de texto.
- Personagens e bestiário com fichas editáveis e imagem.
- Trama em quadro com arraste e seleção de progresso na edição (inclusive no celular).
- Mapas importados, zoom, arraste e regiões com descrição e imagem.
- Globo WebGL com textura do mapa, rotação, arraste e zoom.
- Busca global por clique ou Ctrl+K (⌘+K no Mac).
- Exportação e importação de backup JSON.

## Dados e desempenho

Persistência em `localStorage`, separada por origem do site. Não há backend, login ou sincronização entre dispositivos. Exporte backups regularmente; os dados locais não acompanham a publicação e podem ser apagados pelo navegador. O navegador costuma limitar o espaço do localStorage a poucos MB; fotos são redimensionadas até 1800 px e comprimidas, mas muitos mapas exigirão migração para IndexedDB ou armazenamento remoto. A aplicação avisa quando o espaço se esgota.

O globo é uma esfera renderizada com um shader WebGL, uma chamada de desenho por quadro, resolução limitada e cerca de 30 fps. A animação para em abas ocultas, respeita redução de movimento e libera os recursos ao sair da página. Mapas 2:1 equiretangulares são recomendados. Pinagens pertencem ao atlas 2D, não ao globo.

`dist/store.js` contém os modelos e persistência; `dist/globe.js`, o renderizador; `dist/app.js`, a interface. Esses limites facilitam a futura migração para TypeScript. O editor usa contenteditable/execCommand (API legada ainda suportada); uma evolução pode substituí-lo por um editor estruturado.

Os exemplos são fictícios e editáveis. Imagens fornecidas pela usuária foram incorporadas como referências visuais. Tipografia Google Fonts é opcional e tem fontes locais alternativas. O mapa SVG original está em `dist/assets/eldoria.svg`.

Validação de sintaxe: `npm run check`. Testes de migração dos documentos: `npm test`.

## Editor e personalização

`dist/editor.js` contém a barra de formatação, seleção preservada, presets de cor, links com validação, desfazer/refazer e modo de escrita expandido. O itálico usa estilos isolados dos indicadores de status. O botão Expandir volta ao layout anterior ao clicar em Restaurar ou pressionar Escape.

`dist/overview.js` permite personalizar os textos e a capa da visão geral, a citação e as seções visíveis. As escolhas são salvas por ambiente e incluídas nos backups. `dist/enhancements.css` contém as animações e a paleta escura em tons de grafite e lavanda, respeitando a preferência por redução de movimento.

As pastas e a aba Notas & documentos são independentes. Documentos anteriormente associados a pastas são preservados em `folderNotes`, nas respectivas pastas, enquanto as notas sem pasta permanecem em `notes`. Excluir uma pasta remove apenas seus documentos, mediante confirmação. O botão Todos os documentos e a seleção de pasta nas notas foram retirados.

## Oficina de escrita 2.0

- Editor com modos Visualizar e Editar. Visualizar bloqueia alterações ao título, texto e tarefas; os links podem ser abertos normalmente. Na edição, Ctrl+clique abre vínculos internos.
- Negrito, itálico, sublinhado, tachado, sobrescrito, subscrito, caixa alta/baixa, quatro famílias de fontes, tamanhos de 8 a 72 px, cores, marca-texto, limpeza e código inline.
- Três níveis de título, parágrafo, quatro alinhamentos, listas, checklist, recuo, seis espaçamentos, citação e separador. As operações estruturais usam blocos válidos, sem inserir listas dentro de parágrafos.
- Histórico por documento com até 80 estados, incluindo formatação e tarefas. Ctrl+Z, Ctrl+Shift+Z e Ctrl+Y funcionam no conteúdo. O histórico é da sessão; o conteúdo permanece salvo no navegador.
- Paleta aberta até clicar fora, com seleção transparente durante a escolha da cor personalizada. Emojis podem ser escolhidos antes do título.
- Vínculos internos persistem como `#document/<id>` e são resolvidos apenas no ambiente atual. Documentos removidos geram um aviso, sem navegar para páginas arbitrárias.
- Calendário mensal com agenda por dia, eventos editáveis e vínculos a pastas, notas ou documentos. Eventos são independentes por ambiente e estão incluídos no backup.
- Personalização direta na visão geral: clique nos textos para editar, use Trocar capa sobre a imagem e Seções para escolher os painéis visíveis.
- Globo com arraste horizontal corrigido, expansão reversível, fundo personalizável salvo por ambiente e retorno ao mapa padrão sem apagar mapas importados. O globo se ajusta também a telas verticais.
- Temas verde e dourado, cursor em estrela e animação Slider de Hamburgers, de Jonathan Suh, adaptada sob licença MIT. A licença está em `dist/assets/hamburgers-LICENSE.txt`; os assets são locais, sem dependência de CDN.

`dist/calendar.js` e `dist/document-links.js` implementam a agenda e os destinos internos. `dist/workshop.css` contém os estilos desta rodada.

Testes automatizados cobrem migração, vínculos, datas inválidas/anos bissextos e direção do arraste. Também foram exercitados no navegador os controles do editor, os modos, a persistência das cores, os links, os eventos e a personalização direta.

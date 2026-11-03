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

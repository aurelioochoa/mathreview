// Las formas que WorldModel.jsx sabe dibujar. Vive aparte del componente por la misma
// razón que celebrationVariants.js: un fichero que exporta algo más que componentes
// rompe el fast refresh de Vite.
//
// La lista existe para poder cruzarla en un test con los `shape` de worldMap.js: si
// entra un mundo nuevo con una forma sin diorama, salta el test en vez de aparecer una
// isla con nada encima.
export const FORMAS = ['castle', 'rocket', 'mountain', 'crystal', 'ferris', 'maze', 'island', 'pizza']

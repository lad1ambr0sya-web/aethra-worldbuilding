export const defaultThemeCover=palette=>`assets/theme-covers/${['sapphire','pond','aurora'].includes(palette)?palette:'sapphire'}.jpg`;
export const usesDefaultCover=overview=>overview?.coverMode==='default'||(!overview?.coverMode&&(!overview?.cover||['assets/castle.jpg','assets/eldoria.svg'].includes(overview.cover)||overview.cover.startsWith('assets/theme-covers/')));
export const themeCover=(overview,palette)=>usesDefaultCover(overview)?defaultThemeCover(palette):overview.cover;

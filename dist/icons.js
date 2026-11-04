const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 folder:'<path d="M3 7V5a2 2 0 0 1 2-2h5l3 3h6a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
 notes:'<path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
 characters:'<circle cx="12" cy="8" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/>',
 plot:'<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="14" width="7" height="6" rx="1"/><path d="M10 7h7v7M3 17h7"/>',
 maps:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 bestiary:'<path d="M8 9 5 4l6 2h2l6-2-3 5 3 5-3 6H8l-3-6Z"/><path d="M9 12h.01M15 12h.01M10 16h4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M13 14h2M7 18h2"/>',
 connections:'<circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 11 7-4M8 13l7 4"/>',
 timeline:'<path d="M3 12h18M6 9v6M12 5v14M18 9v6"/>',
 scenes:'<path d="m4 16 12-12 4 4L8 20l-5 1Z M13 7l4 4"/>',
 settings:'<path d="M3 7h7m4 0h7M3 17h3m4 0h11"/><circle cx="12" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
 arrowUpRight:'<path d="M6 18 18 6M6 6h12v12"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',plus:'<path d="M12 4v16M4 12h16"/>'
};
export const navIcon=key=>`<svg class="nav-svg" viewBox="0 0 24 24" aria-hidden="true">${paths[key]||paths.folder}</svg>`;

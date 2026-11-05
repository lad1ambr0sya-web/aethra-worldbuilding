// One responsive sidebar controller for both Live Server and the hosted app.
const compact = matchMedia('(max-width: 850px)');
let collapsed = false;
try { const key=window.AETHRA_USER_NAMESPACE?`aethra.sidebarCollapsed.${window.AETHRA_USER_NAMESPACE}`:'aethra.sidebarCollapsed'; collapsed = localStorage.getItem(key) === 'true'; } catch {}
let mobileOpen = false;

function syncSidebar() {
  const sidebar = document.querySelector('#sidebar');
  const toggle = document.querySelector('#mobileMenu');
  const visible = compact.matches ? mobileOpen : !collapsed;
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  sidebar.classList.toggle('open', compact.matches && mobileOpen);
  sidebar.inert = !visible;
  document.querySelector('#sidebarBackdrop').hidden = !(compact.matches && mobileOpen);
  toggle.setAttribute('aria-expanded', String(visible));
  toggle.setAttribute('aria-label', visible ? 'Recolher barra lateral' : 'Expandir barra lateral');
  toggle.title = visible ? 'Recolher barra lateral' : 'Expandir barra lateral';
}

export function closeMobileSidebar() {
  if (mobileOpen) {
    mobileOpen = false;
    syncSidebar();
    document.querySelector('#mobileMenu').focus({preventScroll: true});
  }
}

export function initSidebar() {
  document.querySelector('#mobileMenu').onclick = () => {
    if (compact.matches) mobileOpen = !mobileOpen;
    else {
      collapsed = !collapsed;
      try { const key=window.AETHRA_USER_NAMESPACE?`aethra.sidebarCollapsed.${window.AETHRA_USER_NAMESPACE}`:'aethra.sidebarCollapsed'; localStorage.setItem(key, String(collapsed)); } catch {}
    }
    syncSidebar();
  };
  document.querySelector('#sidebarClose').onclick = closeMobileSidebar;
  document.querySelector('#sidebarBackdrop').onclick = closeMobileSidebar;
  compact.addEventListener('change', () => { mobileOpen = false; syncSidebar(); });
  syncSidebar();
}

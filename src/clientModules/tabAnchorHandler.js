function activateTabForAnchor(hash) {
  if (!hash) return false;

  const targetId = hash.replace('#', '');
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return false;

  const tabPanel = targetEl.closest('[role="tabpanel"]');
  if (!tabPanel) return false;

  if (!tabPanel.hasAttribute('hidden')) return false;

  const tabContainer = tabPanel.closest('.tabs-container');
  if (!tabContainer) return false;

  const panels = Array.from(
    tabContainer.querySelectorAll(':scope > div > [role="tabpanel"]')
  );
  const panelIndex = panels.indexOf(tabPanel);
  if (panelIndex === -1) return false;

  const tabButtons = tabContainer.querySelectorAll('[role="tab"]');
  if (tabButtons[panelIndex]) {
    tabButtons[panelIndex].dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true })
    );
    requestAnimationFrame(() => {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return true;
  }

  return false;
}

export function onRouteDidUpdate({ location }) {
  if (location.hash) {
    setTimeout(() => activateTabForAnchor(location.hash), 100);
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    activateTabForAnchor(window.location.hash);
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.includes('#')) return;

    const hash = '#' + href.split('#')[1];
    if (hash === '#') return;

    setTimeout(() => activateTabForAnchor(hash), 50);
  });
}

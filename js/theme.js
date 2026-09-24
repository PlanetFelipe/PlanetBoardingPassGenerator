/**
 * theme.js
 * Dark/light theme toggle. Preference is persisted in localStorage; if
 * unset, falls back to the OS/browser `prefers-color-scheme`. The actual
 * theme attribute is applied earlier (inline script in index.html <head>)
 * to avoid a flash of the wrong theme - this module only wires up the
 * toggle button and keeps its icon/aria state in sync.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'theme';

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('btnThemeToggle');
    const icon = document.getElementById('themeToggleIcon');
    if (!btn || !icon) { return; }

    syncButton(document.documentElement.getAttribute('data-theme') || 'light');

    btn.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* localStorage unavailable - theme still applies for this session */ }
      syncButton(next);
    });

    function syncButton(theme) {
      const isDark = theme === 'dark';
      icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  });
})();

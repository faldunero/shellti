/* ═══════════════════════════════════════════════════════════════
   LEYKARIN GUARD — v1.0
   Protege leykarin.html validando token contra /leykarin/validate
═══════════════════════════════════════════════════════════════ */
(function () {

  const RAILWAY  = 'https://web-production-372660.up.railway.app';
  const TOKEN_KEY = 'leykarin_token';

  function getToken() {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
      return urlToken;
    }
    return localStorage.getItem(TOKEN_KEY) || null;
  }

  function clearToken() { localStorage.removeItem(TOKEN_KEY); }
  function hideOverlay() {
    var el = document.getElementById('access-overlay');
    if (el) el.style.display = 'none';
    window.dispatchEvent(new Event('shellti-guard-ok'));
  }
  function showOverlay() {
    var el = document.getElementById('access-overlay');
    if (el) el.style.display = 'flex';
  }

  async function validate() {
    var token = getToken();
    if (!token) { showOverlay(); return; }

    try {
      var res  = await fetch(RAILWAY + '/leykarin/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: token })
      });
      var data = await res.json();

      if (!data.valid) {
        clearToken();
        showOverlay();
        return;
      }
      hideOverlay();
    } catch (err) {
      console.warn('[leykarin-guard] Error de conexión:', err.message);
      // En caso de error de red, dejar pasar (no bloquear al usuario)
      hideOverlay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validate);
  } else {
    validate();
  }

})();

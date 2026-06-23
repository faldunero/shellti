(function () {
  var RAILWAY  = 'https://web-production-372660.up.railway.app';
  var TOKEN_KEY = 'copropiedad_token';

  function getToken() {
    var urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      var url = new URL(window.location.href);
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
    var token = getToken();
    window.dispatchEvent(new CustomEvent('shellti-guard-ok', { detail: { token: token } }));
  }
  function showOverlay() {
    var el = document.getElementById('access-overlay');
    if (el) el.style.display = 'flex';
  }

  async function validate() {
    var token = getToken();
    if (!token) { showOverlay(); return; }
    try {
      var res  = await fetch(RAILWAY + '/copropiedad/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token })
      });
      var data = await res.json();
      if (!data.valid) { clearToken(); showOverlay(); return; }
      hideOverlay();
    } catch (err) {
      console.warn('[copropiedad-guard]', err.message);
      hideOverlay();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validate);
  } else {
    validate();
  }
})();

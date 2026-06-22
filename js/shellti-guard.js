/* ═══════════════════════════════════════════════════════════════
   SHELLTI GUARD — v1.0
   Protege páginas de shellti.com validando token contra el Scanner.
   Uso: <script src="/js/shellti-guard.js" data-resource="agente"></script>
   Recursos válidos: agente | diagnostico | biblioteca | scanner
═══════════════════════════════════════════════════════════════ */

(function () {

  const SCANNER_URL = 'https://web-production-372660.up.railway.app';
  const TOKEN_KEY   = 'shellti_token';

  /* ── Obtener recurso requerido desde el script tag ────────── */
  const scriptEl   = document.currentScript ||
    document.querySelector('script[data-resource]');
  const RESOURCE   = scriptEl ? scriptEl.getAttribute('data-resource') : null;

  /* ── Helpers ──────────────────────────────────────────────── */
  function getToken() {
    // 1. Intentar desde URL (?token=xxx)
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      // Limpiar token de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
      return urlToken;
    }
    // 2. Desde localStorage
    return localStorage.getItem(TOKEN_KEY) || null;
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  /* ── Overlay de carga ─────────────────────────────────────── */
  function showLoading() {
    // Ocultar el body hasta validar — evita flash de contenido
    document.documentElement.style.visibility = 'hidden';
  }

  function hideLoading() {
    document.documentElement.style.visibility = 'visible';
  }

  /* ── Pantalla de solicitud de acceso ─────────────────────── */
  function showRequestForm(reason) {
    hideLoading();
    document.body.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap');
  body{background:#020617;color:#E2E8F0;font-family:'Inter',sans-serif;
    min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
  .guard-box{max-width:480px;width:100%;border:1px solid rgba(0,212,255,0.2);
    background:linear-gradient(135deg,rgba(4,13,30,0.98),rgba(6,15,28,0.98));padding:2.5rem;border-radius:4px}
  .guard-logo{display:flex;align-items:center;gap:.75rem;margin-bottom:2rem}
  .guard-logo img{width:36px;height:36px}
  .guard-logo span{font-family:'JetBrains Mono',monospace;font-size:.75rem;
    letter-spacing:2px;color:#00D4FF;text-transform:uppercase}
  .guard-title{font-size:1.35rem;font-weight:700;margin-bottom:.5rem}
  .guard-sub{font-size:.85rem;color:#64748B;margin-bottom:2rem;line-height:1.6}
  .guard-notice{font-family:'JetBrains Mono',monospace;font-size:.62rem;
    letter-spacing:1px;color:#F59E0B;background:rgba(245,158,11,0.08);
    border:1px solid rgba(245,158,11,0.25);padding:8px 14px;border-radius:2px;
    margin-bottom:1.75rem;text-transform:uppercase}
  label{display:block;font-family:'JetBrains Mono',monospace;font-size:.6rem;
    letter-spacing:1.5px;text-transform:uppercase;color:#64748B;margin-bottom:.4rem;margin-top:1rem}
  input,textarea{width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(0,212,255,0.15);
    color:#E2E8F0;padding:10px 14px;font-family:'Inter',sans-serif;font-size:.85rem;
    border-radius:2px;outline:none;transition:border-color .2s}
  input:focus,textarea:focus{border-color:rgba(0,212,255,0.5)}
  textarea{resize:vertical;min-height:80px}
  .guard-btn{width:100%;margin-top:1.5rem;background:rgba(0,212,255,0.1);
    border:1px solid rgba(0,212,255,0.4);color:#00D4FF;padding:12px;
    font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:2px;
    text-transform:uppercase;cursor:pointer;border-radius:2px;transition:background .2s}
  .guard-btn:hover{background:rgba(0,212,255,0.18)}
  .guard-btn:disabled{opacity:.5;cursor:not-allowed}
  .guard-msg{margin-top:1rem;font-size:.8rem;text-align:center;min-height:1.2rem}
  .guard-msg.ok{color:#34D399}
  .guard-msg.err{color:#EF4444}
  .guard-back{margin-top:1.25rem;text-align:center}
  .guard-back a{font-family:'JetBrains Mono',monospace;font-size:.6rem;
    letter-spacing:1px;color:#64748B;text-decoration:none;text-transform:uppercase}
  .guard-back a:hover{color:#00D4FF}
</style>
<div class="guard-box">
  <div class="guard-logo">
    <img src="https://shellti.com/lobo_shellti.webp" onerror="this.style.display='none'">
    <span>ShellTI · Acceso Restringido</span>
  </div>
  <h2 class="guard-title">Área Premium</h2>
  <p class="guard-sub">${reason || 'Esta herramienta requiere autorización. Completa el formulario y recibirás acceso por email una vez aprobado.'}</p>
  <div class="guard-notice">⚡ Acceso sujeto a aprobación del equipo ShellTI</div>

  <form id="guardForm">
    <label>Nombre completo</label>
    <input type="text" id="g-name" required placeholder="Felipe Aldunero">

    <label>Empresa</label>
    <input type="text" id="g-company" required placeholder="Empresa S.A.">

    <label>Email corporativo</label>
    <input type="email" id="g-email" required placeholder="nombre@empresa.cl">

    <label>¿Por qué necesitas acceso?</label>
    <textarea id="g-reason" required placeholder="Brevemente, describe tu caso de uso..."></textarea>

    <button type="submit" class="guard-btn" id="guardSubmit">SOLICITAR ACCESO →</button>
  </form>
  <p class="guard-msg" id="guardMsg"></p>
  <div class="guard-back"><a href="/">← Volver al inicio</a></div>
</div>
<script>
document.getElementById('guardForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('guardSubmit');
  const msg = document.getElementById('guardMsg');
  btn.disabled = true;
  btn.textContent = 'ENVIANDO...';
  msg.textContent = '';
  msg.className = 'guard-msg';
  try {
    const res = await fetch('${SCANNER_URL}/auth/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:    document.getElementById('g-name').value.trim(),
        company: document.getElementById('g-company').value.trim(),
        email:   document.getElementById('g-email').value.trim(),
        reason:  document.getElementById('g-reason').value.trim()
      })
    });
    const data = await res.json();
    if (data.id || data.success !== false) {
      msg.className = 'guard-msg ok';
      msg.textContent = 'Solicitud enviada. Recibirás un email cuando sea aprobada.';
      document.getElementById('guardForm').style.display = 'none';
    } else {
      throw new Error(data.error || 'Error al enviar');
    }
  } catch(err) {
    msg.className = 'guard-msg err';
    msg.textContent = err.message || 'Error de conexión. Intenta nuevamente.';
    btn.disabled = false;
    btn.textContent = 'SOLICITAR ACCESO →';
  }
});
</script>`;
  }

  /* ── Pantalla de acceso expirado ──────────────────────────── */
  function showExpired(type) {
    hideLoading();
    const messages = {
      EXPIRED:  { title: 'Acceso expirado',         sub: 'Tu período de acceso ha finalizado. Contacta al equipo ShellTI para renovar.' },
      NO_SCANS: { title: 'Consultas agotadas',       sub: 'Has utilizado todas tus consultas disponibles. Contacta al equipo ShellTI.' },
      NO_ACCESS:{ title: 'Sin acceso a este recurso',sub: 'Tu cuenta no tiene acceso a esta herramienta. Contacta a contacto@shellti.com.' }
    };
    const m = messages[type] || messages.EXPIRED;
    document.body.innerHTML = `
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#020617;color:#E2E8F0;font-family:'Inter',sans-serif;
    min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem}
  .exp-box{max-width:420px;text-align:center;border:1px solid rgba(239,68,68,0.25);
    background:rgba(4,13,30,0.98);padding:2.5rem;border-radius:4px}
  .exp-icon{font-size:2.5rem;margin-bottom:1.25rem}
  .exp-title{font-size:1.2rem;font-weight:700;margin-bottom:.75rem}
  .exp-sub{font-size:.85rem;color:#64748B;line-height:1.7;margin-bottom:2rem}
  .exp-btn{display:inline-block;background:rgba(0,212,255,0.1);
    border:1px solid rgba(0,212,255,0.35);color:#00D4FF;padding:10px 28px;
    font-family:'JetBrains Mono',monospace;font-size:.62rem;letter-spacing:1.5px;
    text-transform:uppercase;text-decoration:none;border-radius:2px}
  .exp-back{margin-top:1rem;display:block;font-family:'JetBrains Mono',monospace;
    font-size:.58rem;color:#64748B;text-decoration:none;letter-spacing:1px}
</style>
<div class="exp-box">
  <div class="exp-icon">⏱</div>
  <h2 class="exp-title">${m.title}</h2>
  <p class="exp-sub">${m.sub}</p>
  <a href="mailto:contacto@shellti.com" class="exp-btn">CONTACTAR SHELLTI</a>
  <a href="/" class="exp-back">← Volver al inicio</a>
</div>`;
  }

  /* ── Validación principal ─────────────────────────────────── */
  async function validate() {
    showLoading();
    const token = getToken();

    if (!token) {
      showRequestForm();
      return;
    }

    try {
      const res  = await fetch(`${SCANNER_URL}/auth/validate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, strict: true })
      });
      const data = await res.json();

      if (!data.valid) {
        clearToken();
        showRequestForm('Tu sesión no es válida o ha expirado. Solicita un nuevo acceso.');
        return;
      }

      // Verificar expiración
      if (data.expired) {
        clearToken();
        showExpired('EXPIRED');
        return;
      }

      // Verificar consultas (solo relevante para scanner, no para agente/diagnostico)
      if (data.scansDone && RESOURCE === 'scanner') {
        showExpired('NO_SCANS');
        return;
      }

      // Verificar acceso al recurso específico
      if (RESOURCE && data.resources && data.resources.length > 0) {
        if (!data.resources.includes(RESOURCE)) {
          showExpired('NO_ACCESS');
          return;
        }
      }

      // Todo OK — mostrar la página
      hideLoading();

    } catch (err) {
      console.warn('[shellti-guard] Error de conexión con el scanner:', err.message);
      // En caso de error de red, permitir acceso si hay token guardado
      // (modo degradado — no bloquear por problemas de conectividad)
      hideLoading();
    }
  }

  /* ── Ejecutar antes de que el DOM esté listo ──────────────── */
  showLoading();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', validate);
  } else {
    validate();
  }

})();

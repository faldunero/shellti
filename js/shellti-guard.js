/**
 * shellti-guard.js — ShellTI Access Guard
 * 
 * Incluir en cualquier página de shellti.com que requiera autenticación.
 * 
 * USO:
 *   <script src="/js/shellti-guard.js" data-resource="agente"></script>
 * 
 * El atributo data-resource debe coincidir con el id del recurso en admin:
 *   agente | diagnostico | recursos | scanner
 * 
 * El guard valida el token contra el servidor de autenticación y verifica
 * que el usuario tenga acceso al recurso específico de esta página.
 * Si no tiene acceso, muestra un overlay bloqueando la página.
 */

(function () {
  // ── Configuración ─────────────────────────────────────────────────────────
  const AUTH_SERVER  = 'https://shellti-scanner.up.railway.app'; // URL de tu servidor
  const VALIDATE_URL = AUTH_SERVER + '/auth/validate';
  const REQUEST_URL  = AUTH_SERVER + '/auth/request';
  const TOKEN_KEY    = 'shellti_token';

  // Detectar qué recurso protege esta página
  const scriptTag    = document.currentScript;
  const RESOURCE_ID  = scriptTag ? scriptTag.getAttribute('data-resource') : null;

  // ── Leer token ────────────────────────────────────────────────────────────
  function getToken() {
    const params   = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem(TOKEN_KEY, urlToken);
      params.delete('token');
      const clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', clean);
      return urlToken;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  // ── Overlay de bloqueo ────────────────────────────────────────────────────
  function showOverlay(mode, data) {
    // Oscurecer la página inmediatamente
    document.body.style.overflow = 'hidden';

    const overlay = document.createElement('div');
    overlay.id = 'shellti-guard-overlay';
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:999999',
      'background:rgba(2,6,23,0.97)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-family:\'Plus Jakarta Sans\',\'JetBrains Mono\',sans-serif',
      'padding:24px'
    ].join(';');

    const RESOURCE_NAMES = {
      agente:      'Agente Compliance',
      diagnostico: 'Diagnóstico Ley 21.719',
      recursos:    'Biblioteca de Recursos',
      scanner:     'Scanner Web'
    };
    const resourceName = RESOURCE_NAMES[RESOURCE_ID] || 'este recurso';

    if (mode === 'request') {
      // Formulario de solicitud de acceso
      overlay.innerHTML = `
        <div style="
          background:linear-gradient(145deg,#030c1f,#020a1a);
          border:1px solid rgba(0,212,255,0.3);
          border-radius:8px;
          padding:2.5rem;
          max-width:420px;
          width:100%;
          position:relative;
          box-shadow:0 0 60px rgba(0,212,255,0.1);
        ">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00D4FF,transparent);border-radius:8px 8px 0 0;"></div>
          
          <div style="text-align:center;margin-bottom:1.5rem;">
            <img src="imagenes/webp/lobo_shellti.webp" alt="ShellTI" style="height:60px;filter:drop-shadow(0 0 12px rgba(0,212,255,0.8));margin-bottom:1rem;" onerror="this.style.display='none'" />
            <div style="font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#00D4FF;margin-bottom:.4rem;">Acceso restringido</div>
            <h2 style="color:#E2E8F0;font-size:1.2rem;font-weight:700;margin:0 0 .4rem;">Solicitar acceso</h2>
            <p style="color:#94A3B8;font-size:.82rem;margin:0;">a <strong style="color:#E2E8F0;">${resourceName}</strong></p>
          </div>

          <div id="guard-form" style="display:flex;flex-direction:column;gap:10px;">
            <input id="guard-name"    type="text"  placeholder="Nombre completo" style="${inputStyle()}" />
            <input id="guard-company" type="text"  placeholder="Empresa" style="${inputStyle()}" />
            <input id="guard-email"   type="email" placeholder="Email corporativo" style="${inputStyle()}" />
            <textarea id="guard-reason" placeholder="¿Para qué necesita acceso? (opcional)" rows="2" style="${inputStyle()}resize:vertical;"></textarea>
            <button onclick="guardSubmitRequest()" style="${btnStyle()}">SOLICITAR ACCESO</button>
          </div>

          <div id="guard-sent" style="display:none;text-align:center;padding:1rem 0;">
            <div style="font-size:2rem;margin-bottom:.5rem;">✓</div>
            <p style="color:#34D399;font-weight:700;margin:0 0 .4rem;">Solicitud enviada</p>
            <p style="color:#94A3B8;font-size:.82rem;margin:0;">Recibirás un email con tu enlace de acceso una vez que sea aprobado.</p>
          </div>

          <div id="guard-err" style="display:none;margin-top:10px;padding:8px 12px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);color:#FF6B6B;font-size:.75rem;border-radius:2px;"></div>

          <p style="text-align:center;margin:1rem 0 0;font-size:.7rem;color:#475569;">
            ¿Ya tienes acceso? 
            <a href="#" onclick="guardShowTokenForm();return false;" style="color:#00D4FF;">Ingresa tu token</a>
          </p>
        </div>`;

    } else if (mode === 'token') {
      // Formulario para ingresar token manualmente
      overlay.innerHTML = `
        <div style="
          background:linear-gradient(145deg,#030c1f,#020a1a);
          border:1px solid rgba(0,212,255,0.3);
          border-radius:8px;
          padding:2.5rem;
          max-width:400px;
          width:100%;
          position:relative;
          box-shadow:0 0 60px rgba(0,212,255,0.1);
        ">
          <div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#00D4FF,transparent);border-radius:8px 8px 0 0;"></div>
          <div style="text-align:center;margin-bottom:1.5rem;">
            <img src="imagenes/webp/lobo_shellti.webp" alt="ShellTI" style="height:60px;filter:drop-shadow(0 0 12px rgba(0,212,255,0.8));margin-bottom:1rem;" onerror="this.style.display='none'" />
            <div style="font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#00D4FF;margin-bottom:.4rem;">Acceso restringido</div>
            <h2 style="color:#E2E8F0;font-size:1.2rem;font-weight:700;margin:0;">Ingresa tu token</h2>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            <input id="guard-token-input" type="text" placeholder="Token de acceso" style="${inputStyle()}font-family:'JetBrains Mono',monospace;" />
            <button onclick="guardSubmitToken()" style="${btnStyle()}">ACCEDER</button>
          </div>
          <div id="guard-err" style="display:none;margin-top:10px;padding:8px 12px;background:rgba(255,107,107,0.1);border:1px solid rgba(255,107,107,0.3);color:#FF6B6B;font-size:.75rem;border-radius:2px;"></div>
          <p style="text-align:center;margin:1rem 0 0;font-size:.7rem;color:#475569;">
            <a href="#" onclick="guardShowRequestForm();return false;" style="color:#00D4FF;">Solicitar acceso</a>
          </p>
        </div>`;

    } else if (mode === 'denied') {
      // Acceso denegado — token válido pero sin permiso para este recurso
      overlay.innerHTML = `
        <div style="
          background:linear-gradient(145deg,#030c1f,#020a1a);
          border:1px solid rgba(255,107,107,0.3);
          border-radius:8px;
          padding:2.5rem;
          max-width:400px;
          width:100%;
          text-align:center;
          box-shadow:0 0 60px rgba(255,107,107,0.08);
        ">
          <div style="font-size:2.5rem;margin-bottom:.75rem;">🔒</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#FF6B6B;margin-bottom:.5rem;">Sin acceso</div>
          <h2 style="color:#E2E8F0;font-size:1.1rem;font-weight:700;margin:0 0 .5rem;">No tienes permiso</h2>
          <p style="color:#94A3B8;font-size:.82rem;margin:0 0 1.5rem;">Tu cuenta no incluye acceso a <strong style="color:#E2E8F0;">${resourceName}</strong>. Contacta al administrador para ampliar tu acceso.</p>
          <a href="mailto:contacto@shellti.com" style="display:inline-block;padding:10px 24px;background:rgba(0,212,255,0.1);border:1px solid rgba(0,212,255,0.3);color:#00D4FF;text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:1px;border-radius:2px;">CONTACTAR SHELLTI</a>
          <p style="margin:1rem 0 0;font-size:.7rem;color:#475569;">
            <a href="#" onclick="localStorage.removeItem('${TOKEN_KEY}');location.reload();return false;" style="color:#475569;">Usar otra cuenta</a>
          </p>
        </div>`;

    } else if (mode === 'expired') {
      overlay.innerHTML = `
        <div style="
          background:linear-gradient(145deg,#030c1f,#020a1a);
          border:1px solid rgba(255,217,61,0.3);
          border-radius:8px;
          padding:2.5rem;
          max-width:400px;
          width:100%;
          text-align:center;
        ">
          <div style="font-size:2rem;margin-bottom:.75rem;">⏰</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:2px;text-transform:uppercase;color:#FFD93D;margin-bottom:.5rem;">Acceso expirado</div>
          <p style="color:#94A3B8;font-size:.82rem;margin:0 0 1.5rem;">Tu acceso a ${resourceName} ha expirado. Contacta al administrador para renovarlo.</p>
          <a href="mailto:contacto@shellti.com" style="display:inline-block;padding:10px 24px;background:rgba(255,217,61,0.1);border:1px solid rgba(255,217,61,0.3);color:#FFD93D;text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:.68rem;letter-spacing:1px;border-radius:2px;">CONTACTAR SHELLTI</a>
          <p style="margin:1rem 0 0;font-size:.7rem;color:#475569;">
            <a href="#" onclick="localStorage.removeItem('${TOKEN_KEY}');location.reload();return false;" style="color:#475569;">Usar otra cuenta</a>
          </p>
        </div>`;
    }

    document.body.appendChild(overlay);
  }

  function inputStyle() {
    return 'width:100%;padding:10px 14px;background:rgba(3,9,24,0.95);border:1px solid rgba(0,212,255,0.15);color:#E2E8F0;font-family:\'Plus Jakarta Sans\',sans-serif;font-size:.85rem;border-radius:2px;outline:none;box-sizing:border-box;';
  }

  function btnStyle() {
    return 'width:100%;padding:13px;background:linear-gradient(135deg,#00D4FF,#00b8e6);border:none;color:#020617;font-weight:800;font-family:\'JetBrains Mono\',monospace;font-size:.7rem;letter-spacing:2px;text-transform:uppercase;cursor:pointer;border-radius:2px;';
  }

  // ── Funciones globales para el overlay ───────────────────────────────────
  window.guardShowRequestForm = function() {
    const ov = document.getElementById('shellti-guard-overlay');
    if (ov) { ov.remove(); document.body.style.overflow = 'hidden'; }
    showOverlay('request');
  };

  window.guardShowTokenForm = function() {
    const ov = document.getElementById('shellti-guard-overlay');
    if (ov) { ov.remove(); document.body.style.overflow = 'hidden'; }
    showOverlay('token');
  };

  window.guardSubmitToken = async function() {
    const token = (document.getElementById('guard-token-input')?.value || '').trim();
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    location.reload();
  };

  window.guardSubmitRequest = async function() {
    const name    = document.getElementById('guard-name')?.value.trim();
    const company = document.getElementById('guard-company')?.value.trim();
    const email   = document.getElementById('guard-email')?.value.trim();
    const reason  = document.getElementById('guard-reason')?.value.trim();
    const errEl   = document.getElementById('guard-err');

    if (!name || !email) {
      if (errEl) { errEl.textContent = 'Nombre y email son requeridos'; errEl.style.display = 'block'; }
      return;
    }

    try {
      const res = await fetch(REQUEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email, reason: (reason || '') + (RESOURCE_ID ? ` [recurso: ${RESOURCE_ID}]` : '') })
      });
      const data = await res.json();
      if (data.id || data.success) {
        document.getElementById('guard-form').style.display = 'none';
        document.getElementById('guard-sent').style.display = 'block';
      } else {
        if (errEl) { errEl.textContent = data.error || 'Error al enviar'; errEl.style.display = 'block'; }
      }
    } catch(e) {
      if (errEl) { errEl.textContent = 'Error de conexión con el servidor'; errEl.style.display = 'block'; }
    }
  };

  // ── Validar token ─────────────────────────────────────────────────────────
  async function validate(token) {
    try {
      const res  = await fetch(VALIDATE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, strict: false })
      });
      return await res.json();
    } catch(e) {
      return null;
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  async function init() {
    const token = getToken();

    if (!token) {
      showOverlay('request');
      return;
    }

    const data = await validate(token);

    if (!data || !data.valid) {
      localStorage.removeItem(TOKEN_KEY);
      showOverlay('request');
      return;
    }

    if (data.expired) {
      showOverlay('expired');
      return;
    }

    // Verificar acceso al recurso específico
    if (RESOURCE_ID) {
      const allowed = data.resources || [];
      if (!allowed.includes(RESOURCE_ID)) {
        showOverlay('denied');
        return;
      }
    }

    // ✅ Acceso concedido — no hay overlay, la página se muestra normalmente
    // Exponer datos de sesión por si la página los necesita
    window.shelltiSession = {
      name:      data.name,
      email:     data.email,
      expiresAt: data.expiresAt,
      resources: data.resources || [],
      canScan:   data.canScan
    };
  }

  // Ejecutar al cargar el DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

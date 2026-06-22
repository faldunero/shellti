/* ═══════════════════════════════════════════════════════
   SHELLTI · TAGS MODAL SYSTEM
   Versión: 1.0 — 2026-06-21
   Uso: <script src="../js/tags-modal.js"></script>
        Los <span class="htag"> se vuelven clicables automáticamente.
═══════════════════════════════════════════════════════ */

(function () {

  /* ── Base de conocimiento ───────────────────────────── */
  const TAG_DATA = {

    /* ── ISO 27001 ─────────────────────────────────────── */
    'SGSI': {
      color: 'cyan',
      title: 'Sistema de Gestión de Seguridad de la Información',
      subtitle: 'ISO/IEC 27001:2022',
      desc: 'Marco sistemático para establecer, implementar, mantener y mejorar continuamente la seguridad de la información en una organización. No es un proyecto puntual: es un ciclo vivo de gestión del riesgo.',
      points: [
        'Cubre personas, procesos y tecnología de forma integral.',
        'Basado en el ciclo PDCA: Planificar, Hacer, Verificar, Actuar.',
        'Requiere compromiso de la alta dirección y asignación de recursos.',
        'El alcance del SGSI puede ser toda la organización o una unidad específica.',
        'Base obligatoria para obtener la certificación ISO 27001.'
      ]
    },
    '93 Controles': {
      color: 'cyan',
      title: '93 Controles de Seguridad',
      subtitle: 'ISO/IEC 27001:2022 — Anexo A',
      desc: 'La versión 2022 redujo y reorganizó los controles de 114 a 93, agrupados en 4 categorías: Organizacionales (37), Personas (8), Físicos (14) y Tecnológicos (34). Cada control mitiga riesgos específicos.',
      points: [
        '11 controles son completamente nuevos en la versión 2022.',
        'Incluye controles de threat intelligence, seguridad cloud y privacidad.',
        'No todos los controles son obligatorios: se seleccionan según riesgo (SoA).',
        'La Declaración de Aplicabilidad (SoA) documenta qué controles aplican y por qué.',
        'Complementado por ISO 27002:2022 que da guía de implementación detallada.'
      ]
    },
    'Anexo A': {
      color: 'cyan',
      title: 'Anexo A — Controles de Referencia',
      subtitle: 'ISO/IEC 27001:2022',
      desc: 'Catálogo normativo de controles que toda organización certificada debe evaluar. No es obligatorio implementarlos todos, pero sí justificar en la SoA por qué se excluye alguno.',
      points: [
        'Organizado en 4 temas: Organizacional, Personas, Físico, Tecnológico.',
        'Cada control tiene un propósito, atributos y guía de implementación en ISO 27002.',
        'Los 11 controles nuevos abordan amenazas actuales como ransomware y cloud.',
        'La SoA (Statement of Applicability) mapea cada control al riesgo que mitiga.',
        'Auditores certificadores verifican la coherencia entre riesgos identificados y controles seleccionados.'
      ]
    },
    'ISO 27002': {
      color: 'cyan',
      title: 'ISO/IEC 27002:2022',
      subtitle: 'Guía de Implementación de Controles',
      desc: 'Estándar complementario a ISO 27001 que proporciona guía detallada sobre cómo implementar cada uno de los 93 controles del Anexo A. Es la referencia práctica para los equipos técnicos.',
      points: [
        'No es certificable por sí solo: es una guía, no un sistema de gestión.',
        'Para cada control define: propósito, atributos, guía de implementación y otros.',
        'Introduce 5 atributos de clasificación: tipo, propiedades, conceptos, capacidades, dominios.',
        'Indispensable para auditorías internas y diseño de políticas de seguridad.',
        'Uso conjunto con ISO 27001 es el estándar de la industria a nivel global.'
      ]
    },
    'Ley 21.719': {
      color: 'green',
      title: 'Ley N° 21.719',
      subtitle: 'Protección de Datos Personales — Chile',
      desc: 'Nueva ley chilena de protección de datos personales que reemplaza la Ley 19.628. Establece derechos de los titulares, obligaciones de los responsables y un régimen sancionatorio con multas de hasta 5.000 UTM.',
      points: [
        'Entrada en vigor: 2 años desde su promulgación (diciembre 2026).',
        'Crea la Agencia de Protección de Datos Personales (APDP).',
        'Exige consentimiento explícito, informado y revocable para tratar datos.',
        'Notificación de brechas de seguridad en máximo 72 horas a la autoridad.',
        'Multas de hasta 5.000 UTM (~$400M CLP) por infracciones graves.'
      ]
    },
    'Certificable': {
      color: 'yellow',
      title: 'Certificación ISO 27001',
      subtitle: 'Proceso de Certificación',
      desc: 'ISO 27001 es el único estándar de seguridad de la información que permite obtener una certificación formal emitida por un organismo acreditado (ej. BSI, Bureau Veritas, TÜV). Demuestra a clientes y reguladores que la organización gestiona la seguridad de forma sistemática.',
      points: [
        'Auditoría en 2 etapas: revisión documental y auditoría en sitio.',
        'Certificado válido por 3 años con auditorías de seguimiento anuales.',
        'En Chile, organismos como Bureau Veritas y SGS emiten certificados acreditados.',
        'Exigido como requisito por empresas del sector financiero, salud y gobierno.',
        'Puede reducir primas de seguros cibernéticos y acelerar procesos de licitación.'
      ]
    },

    /* ── Ley 21.719 ────────────────────────────────────── */
    '72 horas': {
      color: 'cyan',
      title: 'Notificación en 72 Horas',
      subtitle: 'Ley 21.719 — Art. 44',
      desc: 'Plazo máximo legal para notificar a la Agencia de Protección de Datos Personales (APDP) tras detectar una brecha de seguridad que afecte datos personales. Inspirado en el Art. 33 del RGPD europeo.',
      points: [
        'El plazo corre desde que el responsable tiene conocimiento de la brecha.',
        'La notificación debe incluir: naturaleza de la brecha, datos afectados, medidas adoptadas.',
        'Si afecta derechos fundamentales, también se notifica a los titulares afectados.',
        'Incumplir el plazo es una infracción grave con multa de hasta 5.000 UTM.',
        'Requiere tener un protocolo de respuesta a incidentes activo y probado.'
      ]
    },
    '5.000 UTM': {
      color: 'yellow',
      title: 'Multa Máxima: 5.000 UTM',
      subtitle: 'Ley 21.719 — Régimen Sancionatorio',
      desc: 'Sanción máxima aplicable por la Agencia de Protección de Datos Personales por infracciones graves. A junio 2026, 1 UTM equivale aproximadamente a $68.000 CLP, haciendo el máximo ~$340 millones CLP.',
      points: [
        'Infracciones leves: hasta 100 UTM. Graves: hasta 1.000 UTM. Gravísimas: hasta 5.000 UTM.',
        'Las multas se aplican por cada infracción, no por expediente.',
        'Reincidencia puede duplicar la sanción.',
        'Organizaciones con más de 25.000 trabajadores enfrentan límites mayores.',
        'Cumplimiento proactivo y demostrable puede ser atenuante ante la APDP.'
      ]
    },
    'Consentimiento': {
      color: 'cyan',
      title: 'Consentimiento del Titular',
      subtitle: 'Ley 21.719 — Principio Fundamental',
      desc: 'Base de licitud principal para el tratamiento de datos personales. Debe ser libre, informado, específico, inequívoco y revocable en cualquier momento sin consecuencias negativas para el titular.',
      points: [
        'No puede ser genérico: debe especificar finalidad, tipo de datos y destinatarios.',
        'El silencio o la inacción NO constituyen consentimiento.',
        'El titular puede revocar su consentimiento en cualquier momento.',
        'El responsable debe poder demostrar que obtuvo el consentimiento válidamente.',
        'Existen bases de licitud alternativas: contrato, interés legítimo, obligación legal.'
      ]
    },
    'DPIA': {
      color: 'cyan',
      title: 'Evaluación de Impacto en Protección de Datos',
      subtitle: 'Data Protection Impact Assessment',
      desc: 'Proceso sistemático para identificar y minimizar los riesgos de privacidad antes de implementar nuevos tratamientos de datos de alto riesgo. Obligatorio en casos específicos bajo la Ley 21.719.',
      points: [
        'Requerida cuando el tratamiento pueda generar riesgo alto para los titulares.',
        'Casos típicos: perfilamiento masivo, datos sensibles, vigilancia sistemática.',
        'Debe incluir: descripción del tratamiento, evaluación de necesidad y proporcionalidad.',
        'Si el riesgo residual es alto, se debe consultar a la APDP antes de proceder.',
        'Documentación de la DPIA es evidencia de cumplimiento ante auditorías.'
      ]
    },
    'RAT': {
      color: 'cyan',
      title: 'Registro de Actividades de Tratamiento',
      subtitle: 'Ley 21.719 — Art. 14 bis',
      desc: 'Inventario documentado de todos los tratamientos de datos personales que realiza la organización. Equivalente al "Records of Processing Activities" del RGPD europeo. Obligatorio para todo responsable de datos.',
      points: [
        'Debe incluir: finalidad, categorías de datos, destinatarios, plazos de retención.',
        'Debe mantenerse actualizado ante cualquier cambio en los tratamientos.',
        'Es el primer documento que solicita la APDP en una inspección.',
        'Permite identificar brechas de cumplimiento y tratamientos sin base legal.',
        'Herramienta base para el ejercicio de derechos ARCOP por los titulares.'
      ]
    },
    'ARCOP': {
      color: 'green',
      title: 'Derechos ARCOP',
      subtitle: 'Acceso · Rectificación · Cancelación · Oposición · Portabilidad',
      desc: 'Conjunto de derechos que la Ley 21.719 garantiza a todos los titulares de datos personales. Las organizaciones deben tener canales habilitados para recibir y responder estas solicitudes en los plazos legales.',
      points: [
        'Acceso: conocer qué datos tiene la organización sobre el titular y cómo los usa.',
        'Rectificación: corregir datos inexactos, desactualizados o incompletos.',
        'Cancelación: eliminar datos cuando ya no sean necesarios o el titular retire consentimiento.',
        'Oposición: oponerse al tratamiento por razones legítimas personales.',
        'Portabilidad: recibir los datos en formato estructurado y transferirlos a otro responsable.',
        'Plazo de respuesta: 30 días hábiles. Silencio equivale a rechazo recurrible.'
      ]
    },

    /* ── NIST CSF 2.0 ──────────────────────────────────── */
    'Governar': {
      color: 'cyan',
      title: 'Función GOVERNAR',
      subtitle: 'NIST CSF 2.0 — GV',
      desc: 'Nueva función incorporada en CSF 2.0 (antes no existía en la versión 1.1). Establece el contexto organizacional, las políticas de ciberseguridad y la supervisión ejecutiva. Es la función que da dirección estratégica a las demás.',
      points: [
        'Abarca: política, roles y responsabilidades, estrategia, supervisión, cadena de suministro.',
        'Requiere compromiso visible de la alta dirección en ciberseguridad.',
        'Define el apetito de riesgo y los criterios para tomar decisiones.',
        'Coordina ciberseguridad con objetivos del negocio y cumplimiento normativo.',
        'Sin GV sólido, las otras 5 funciones operan sin dirección ni rendición de cuentas.'
      ]
    },
    'Identificar': {
      color: 'cyan',
      title: 'Función IDENTIFICAR',
      subtitle: 'NIST CSF 2.0 — ID',
      desc: 'Base del marco: comprender el contexto organizacional, activos críticos, riesgos y capacidades para gestionar la ciberseguridad. Sin inventario no hay protección posible.',
      points: [
        'Categorías: gestión de activos, evaluación de riesgos, mejora continua.',
        'Requiere inventario completo de hardware, software, datos y sistemas.',
        'Incluye identificación de proveedores críticos y riesgos de terceros.',
        'La evaluación de riesgos debe ser periódica, no un evento único.',
        'Insumo directo para las funciones Proteger y Detectar.'
      ]
    },
    'Proteger': {
      color: 'cyan',
      title: 'Función PROTEGER',
      subtitle: 'NIST CSF 2.0 — PR',
      desc: 'Implementación de salvaguardas para garantizar la entrega de servicios críticos y limitar el impacto de un incidente. Abarca controles técnicos, administrativos y físicos.',
      points: [
        'Categorías: identidad y acceso, concienciación, seguridad de datos, plataformas, infraestructura.',
        'Controles clave: MFA, cifrado, gestión de parches, segmentación de red.',
        'Incluye formación y sensibilización del personal.',
        'La protección de datos personales es parte central de esta función.',
        'Controles deben ser proporcionales al riesgo identificado.'
      ]
    },
    'Detectar': {
      color: 'cyan',
      title: 'Función DETECTAR',
      subtitle: 'NIST CSF 2.0 — DE',
      desc: 'Capacidad para identificar oportunamente la ocurrencia de eventos de ciberseguridad. La velocidad de detección es determinante para limitar el daño de un incidente.',
      points: [
        'Categorías: monitoreo continuo, análisis de eventos adversos.',
        'Incluye SIEM, IDS/IPS, análisis de logs y alertas en tiempo real.',
        'Promedio global de detección de brechas: 204 días (IBM 2023). El objetivo es reducirlo drásticamente.',
        'Monitoreo de la cadena de suministro incluido explícitamente en CSF 2.0.',
        'Vinculado directamente con el plazo de 72 horas de notificación de la Ley 21.719.'
      ]
    },
    'Responder': {
      color: 'cyan',
      title: 'Función RESPONDER',
      subtitle: 'NIST CSF 2.0 — RS',
      desc: 'Acciones a tomar ante un incidente de ciberseguridad detectado. Define cómo la organización contiene, analiza y comunica los incidentes para minimizar su impacto.',
      points: [
        'Categorías: gestión de incidentes, análisis, mitigación, comunicación.',
        'Requiere un Plan de Respuesta a Incidentes (IRP) documentado y probado.',
        'Comunicación incluye notificación a autoridades, clientes y medios según gravedad.',
        'Los primeros 60 minutos son críticos: el "golden hour" de ciberseguridad.',
        'Debe coordinarse con el protocolo de 72 horas de la Ley 21.719.'
      ]
    },
    'Recuperar': {
      color: 'cyan',
      title: 'Función RECUPERAR',
      subtitle: 'NIST CSF 2.0 — RC',
      desc: 'Restauración de capacidades y servicios afectados por un incidente de ciberseguridad. Incluye lecciones aprendidas para mejorar continuamente la resiliencia organizacional.',
      points: [
        'Categorías: ejecución del plan de recuperación, comunicación.',
        'Define el RTO (Recovery Time Objective) y RPO (Recovery Point Objective).',
        'Backups verificados y probados son el núcleo de esta función.',
        'Las lecciones aprendidas deben realimentar las funciones Governar e Identificar.',
        'Comunicación post-incidente es parte de la gestión reputacional y regulatoria.'
      ]
    },

    /* ── CIS Controls ──────────────────────────────────── */
    '18 Controles': {
      color: 'cyan',
      title: '18 Controles CIS v8',
      subtitle: 'CIS Critical Security Controls',
      desc: 'Conjunto priorizado de acciones defensivas desarrollado por el Center for Internet Security. Diseñado para organizaciones de cualquier tamaño, organizado en 3 grupos de implementación (IG) según madurez y capacidad.',
      points: [
        'Control 1: Inventario de activos empresariales. Control 2: Inventario de software.',
        'Controls 1-6 son los más críticos: atacan el 80% de los vectores más comunes.',
        'Cada control tiene salvaguardas específicas asignadas a un IG.',
        'Prioridad basada en datos reales de ataques, no en teoría.',
        'Mapeable a NIST CSF, ISO 27001 y PCI DSS para organizaciones con múltiples marcos.'
      ]
    },
    '153 Salvaguardas': {
      color: 'cyan',
      title: '153 Salvaguardas CIS v8',
      subtitle: 'CIS Critical Security Controls',
      desc: 'Acciones concretas y específicas que implementan los 18 controles CIS. Cada salvaguarda está asignada a un Grupo de Implementación (IG1, IG2 o IG3) según la complejidad y recursos que requiere.',
      points: [
        'IG1: 56 salvaguardas. Higiene básica, válida para toda organización.',
        'IG2: 74 salvaguardas adicionales. Para organizaciones con departamento TI dedicado.',
        'IG3: 23 salvaguardas adicionales. Para organizaciones con equipos de seguridad especializados.',
        'Cada salvaguarda tiene tipo de activo, función de seguridad y perfil de implementación.',
        'CIS proporciona herramientas gratuitas para evaluar el nivel de cumplimiento.'
      ]
    },
    'IG1': {
      color: 'green',
      title: 'Grupo de Implementación 1',
      subtitle: 'CIS Controls — Higiene Básica',
      desc: 'Conjunto mínimo de salvaguardas que toda organización debe implementar, independiente de su tamaño o sector. Diseñado para empresas con recursos y experiencia en ciberseguridad limitados. Cubre los riesgos más comunes y de mayor impacto.',
      points: [
        '56 salvaguardas de los 18 controles CIS.',
        'Foco en: inventario de activos, configuraciones seguras, gestión de accesos y copias de seguridad.',
        'No requiere herramientas especializadas ni personal dedicado de seguridad.',
        'Punto de partida obligatorio antes de avanzar a IG2.',
        'Implementar IG1 reduce el riesgo de los ataques más frecuentes en más del 70%.'
      ]
    },
    'IG2': {
      color: 'cyan',
      title: 'Grupo de Implementación 2',
      subtitle: 'CIS Controls — Seguridad Intermedia',
      desc: 'Salvaguardas para organizaciones que gestionan datos sensibles o infraestructura crítica, con un departamento de TI dedicado pero sin equipo de seguridad especializado a tiempo completo.',
      points: [
        '74 salvaguardas adicionales sobre IG1 (130 en total).',
        'Incluye IG1 completo más controles de detección, respuesta y protección avanzada.',
        'Requiere herramientas como SIEM, gestión de vulnerabilidades y EDR.',
        'Adecuado para empresas de tamaño mediano en sectores regulados.',
        'Cubre la mayoría de los controles exigidos por Ley 21.719 e ISO 27001.'
      ]
    },
    'IG3': {
      color: 'cyan',
      title: 'Grupo de Implementación 3',
      subtitle: 'CIS Controls — Seguridad Avanzada',
      desc: 'Nivel más alto de los CIS Controls. Para organizaciones que enfrentan amenazas sofisticadas y persistentes, con equipos de seguridad dedicados y madurez alta en gestión de riesgos.',
      points: [
        '23 salvaguardas adicionales sobre IG2 (153 en total).',
        'Incluye: threat hunting, red team, análisis forense y SOC dedicado.',
        'Diseñado para infraestructura crítica nacional, banca, defensa y salud.',
        'Requiere inversión significativa en personal especializado y herramientas avanzadas.',
        'Proporciona el nivel de protección más alto documentado en los CIS Controls.'
      ]
    },

    /* ── OWASP ─────────────────────────────────────────── */
    'A01:2021': {
      color: 'cyan',
      title: 'A01:2021 — Control de Acceso Roto',
      subtitle: 'OWASP Top 10:2021 — Vulnerabilidad #1',
      desc: 'La vulnerabilidad más crítica en aplicaciones web según OWASP 2021. Ocurre cuando los usuarios pueden actuar fuera de sus permisos: acceder a datos de otros, modificar registros sin autorización o escalar privilegios.',
      points: [
        'Subió del puesto 5 en 2017 al puesto 1 en 2021.',
        'Incluye: IDOR, path traversal, acceso a API sin autenticación, elevación de privilegios.',
        'Prevención: denegar por defecto, verificar permisos en cada petición, log de fallos de acceso.',
        'El 94% de las aplicaciones testeadas tenían alguna forma de control de acceso roto.',
        'Crítico para cumplimiento: exponer datos de terceros puede violar la Ley 21.719.'
      ]
    },
    'SAST': {
      color: 'cyan',
      title: 'Análisis Estático de Seguridad',
      subtitle: 'Static Application Security Testing',
      desc: 'Técnica de testing que analiza el código fuente, bytecode o binario de una aplicación sin ejecutarla, buscando vulnerabilidades de seguridad desde dentro. Es parte del ciclo de desarrollo seguro (Secure SDLC).',
      points: [
        'Detecta vulnerabilidades en etapas tempranas: más barato corregirlas que en producción.',
        'Herramientas populares: SonarQube, Checkmarx, Semgrep, Bandit (Python), ESLint Security.',
        'Limitación: alta tasa de falsos positivos; requiere calibración y revisión humana.',
        'Se integra en CI/CD para análisis automático en cada commit.',
        'Complementario con DAST: SAST ve el código, DAST ve el comportamiento en ejecución.'
      ]
    },
    'DAST': {
      color: 'cyan',
      title: 'Análisis Dinámico de Seguridad',
      subtitle: 'Dynamic Application Security Testing',
      desc: 'Técnica de testing que evalúa una aplicación en ejecución, simulando ataques externos para descubrir vulnerabilidades que solo se manifiestan en tiempo de ejecución. Complementa al SAST.',
      points: [
        'Prueba la aplicación como lo haría un atacante real: desde afuera, sin ver el código.',
        'Herramientas populares: OWASP ZAP (gratuito), Burp Suite, Nikto.',
        'Detecta: inyección SQL, XSS, problemas de autenticación, exposición de datos.',
        'Requiere un ambiente de pruebas: no debe ejecutarse en producción sin precauciones.',
        'Combinado con SAST forma el enfoque IAST para cobertura completa.'
      ]
    },
    'WSTG': {
      color: 'cyan',
      title: 'Web Security Testing Guide',
      subtitle: 'OWASP WSTG',
      desc: 'Guía de referencia más completa para testear la seguridad de aplicaciones web y servicios. Mantiene por OWASP con más de 400 páginas de técnicas, casos de prueba y listas de verificación para auditores y pentesters.',
      points: [
        'Organizada en 12 categorías: configuración, autenticación, sesiones, validación de inputs, etc.',
        'Cada caso de prueba incluye: objetivo, cómo probar, herramientas y remediación.',
        'Versión actual: WSTG v4.2 (2021).',
        'Referencia estándar en contratos de pentesting y auditorías de seguridad.',
        'Disponible gratuitamente en owasp.org y en formato PDF, GitBook y checklist Excel.'
      ]
    },
    'Secure SDLC': {
      color: 'green',
      title: 'Ciclo de Desarrollo Seguro',
      subtitle: 'Secure Software Development Lifecycle',
      desc: 'Integración de prácticas de seguridad en cada fase del ciclo de vida del desarrollo de software: desde los requisitos hasta el retiro. El objetivo es que la seguridad sea parte del proceso, no un añadido posterior.',
      points: [
        'Fases: Requisitos → Diseño → Desarrollo → Testing → Despliegue → Mantenimiento.',
        'Incluye: modelado de amenazas, revisión de código, SAST/DAST, gestión de dependencias.',
        'DevSecOps es la implementación ágil del Secure SDLC en equipos modernos.',
        'Reduce el costo de vulnerabilidades: encontrar un bug en diseño es 100x más barato que en producción.',
        'ISO 27001 Control A.8.25 exige un ciclo de desarrollo seguro para sistemas críticos.'
      ]
    },

    /* ── ANCI ──────────────────────────────────────────── */
    'CSIRT Nacional': {
      color: 'cyan',
      title: 'CSIRT Nacional de Chile',
      subtitle: 'Computer Security Incident Response Team',
      desc: 'Equipo nacional de respuesta a incidentes de ciberseguridad de Chile, coordinado por la ANCI. Es el punto central para reportar incidentes críticos y recibir alertas y asistencia técnica en ciberseguridad.',
      points: [
        'Opera 24/7 para respuesta a incidentes de infraestructura crítica.',
        'Coordina con CSIRTs sectoriales: financiero, salud, energía, telecomunicaciones.',
        'Emite alertas y boletines de inteligencia sobre amenazas activas en Chile.',
        'Es el receptor de notificaciones de brechas de infraestructura crítica bajo Ley 21.663.',
        'Contacto: csirt.gob.cl — para reporte de incidentes y solicitud de asistencia técnica.'
      ]
    },
    'Infraestructura Crítica': {
      color: 'cyan',
      title: 'Infraestructura Crítica Nacional',
      subtitle: 'Ley 21.663 — Marco de Ciberseguridad',
      desc: 'Sistemas, redes y activos cuya interrupción o destrucción tendría un impacto grave en la seguridad nacional, la economía, la salud pública o la continuidad del Estado. Su protección es obligación de los operadores bajo la Ley 21.663.',
      points: [
        'Sectores designados: energía, agua, telecomunicaciones, finanzas, salud, transporte.',
        'Los operadores deben registrarse ante la ANCI y cumplir estándares mínimos de seguridad.',
        'Obligación de reportar incidentes al CSIRT Nacional en plazos definidos por la ley.',
        'Deben implementar planes de continuidad operacional y realizar ejercicios periódicos.',
        'La ANCI puede realizar inspecciones y aplicar sanciones ante incumplimiento.'
      ]
    },
    'Ley 21.663': {
      color: 'green',
      title: 'Ley N° 21.663',
      subtitle: 'Marco de Ciberseguridad — Chile',
      desc: 'Ley Marco de Ciberseguridad de Chile. Crea la Agencia Nacional de Ciberseguridad (ANCI), establece obligaciones para operadores de infraestructura crítica e instituciones del Estado, y regula la respuesta a incidentes de ciberseguridad a nivel nacional.',
      points: [
        'Promulgada en 2024, en vigencia desde 2025.',
        'Crea la ANCI como autoridad técnica de ciberseguridad del Estado chileno.',
        'Establece el CSIRT Nacional y red de CSIRTs sectoriales.',
        'Operadores de infraestructura crítica deben registrarse y cumplir estándares mínimos.',
        'Complementa la Ley 21.719 (datos personales) en el ecosistema regulatorio digital chileno.'
      ]
    },
    'Reporte de Incidentes': {
      color: 'cyan',
      title: 'Reporte de Incidentes',
      subtitle: 'Ley 21.663 — Obligación de Notificación',
      desc: 'Obligación legal de los operadores de infraestructura crítica de notificar incidentes de ciberseguridad significativos al CSIRT Nacional dentro de los plazos establecidos por la ANCI. Parte del ecosistema de respuesta coordinada del Estado.',
      points: [
        'Incidentes significativos deben reportarse en el plazo que defina el reglamento de la ANCI.',
        'El reporte incluye: naturaleza del incidente, sistemas afectados, impacto potencial y medidas.',
        'La ANCI puede requerir información adicional y coordinar la respuesta.',
        'El incumplimiento del reporte es una infracción sancionable bajo la Ley 21.663.',
        'Los reportes son confidenciales y no pueden usarse como prueba en contra del reportante.'
      ]
    },

    /* ── Protección de Datos ───────────────────────────── */
    'Bases de Licitud': {
      color: 'cyan',
      title: 'Bases de Licitud del Tratamiento',
      subtitle: 'Ley 21.719 — Art. 13',
      desc: 'Fundamentos legales que autorizan el tratamiento de datos personales. Toda operación sobre datos debe respaldarse en al menos una base de licitud. Tratar datos sin base legal es una infracción grave.',
      points: [
        '1. Consentimiento: libre, informado, específico e inequívoco del titular.',
        '2. Contrato: necesario para ejecutar o negociar un contrato con el titular.',
        '3. Obligación legal: el tratamiento lo exige una ley o reglamento.',
        '4. Interés vital: proteger la vida o integridad física del titular u otro.',
        '5. Interés legítimo: propósito legítimo del responsable, salvo que prevalezcan los derechos del titular.'
      ]
    },
    'DPO': {
      color: 'cyan',
      title: 'Delegado de Protección de Datos',
      subtitle: 'Data Protection Officer',
      desc: 'Figura responsable de supervisar el cumplimiento de las normas de protección de datos dentro de la organización. En el contexto de la Ley 21.719, su designación puede ser obligatoria para ciertos tratamientos de alto riesgo.',
      points: [
        'Funciones: asesorar, supervisar, capacitar y ser punto de contacto con la APDP.',
        'Debe tener conocimientos especializados en derecho y práctica de protección de datos.',
        'Puede ser interno o externo (outsorcing del rol de DPO).',
        'Debe actuar con independencia: no puede recibir instrucciones del responsable en su función.',
        'ShellTI ofrece el servicio de DPO as a Service para empresas en Chile.'
      ]
    },
    'Privacy by Design': {
      color: 'green',
      title: 'Privacidad desde el Diseño',
      subtitle: 'Privacy by Design & by Default',
      desc: 'Principio que exige incorporar la privacidad en el diseño de sistemas, procesos y productos desde su concepción, no como un añadido posterior. La Ley 21.719 lo eleva a obligación legal.',
      points: [
        'Proactivo: anticipar y prevenir problemas de privacidad antes de que ocurran.',
        'Privacidad por defecto: la configuración inicial debe ser la más protectora de la privacidad.',
        'Suma cero positiva: seguridad y privacidad no son contrapuestos, se refuerzan.',
        'Requiere evaluaciones de impacto (DPIA) para nuevos productos y servicios.',
        'Aplica a sistemas de TI, prácticas de negocio y diseño de infraestructura física.'
      ]
    },
    'Biometría': {
      color: 'yellow',
      title: 'Datos Biométricos',
      subtitle: 'Datos Sensibles — Protección Reforzada',
      desc: 'Los datos biométricos (huella dactilar, reconocimiento facial, iris, voz) son una categoría especial de datos sensibles bajo la Ley 21.719. Su tratamiento está sujeto a restricciones adicionales y requiere base de licitud explícita.',
      points: [
        'Permiten identificar unívocamente a una persona: son inmutables y no reemplazables.',
        'Su tratamiento requiere consentimiento explícito salvo excepciones muy limitadas.',
        'Los sistemas de control de acceso biométrico deben cumplir requisitos reforzados.',
        'Una brecha que exponga datos biométricos siempre activa la notificación a titulares.',
        'La DPIA es obligatoria antes de implementar cualquier sistema biométrico.'
      ]
    },
    'Datos Laborales': {
      color: 'cyan',
      title: 'Datos Personales Laborales',
      subtitle: 'Tratamiento en el Contexto del Empleo',
      desc: 'Los empleados son titulares de datos personales y sus derechos aplican en el contexto laboral. La relación de subordinación no equivale a consentimiento libre, lo que limita las bases de licitud disponibles para el empleador.',
      points: [
        'El empleador trata datos de nómina, salud, rendimiento, ubicación y comunicaciones.',
        'El consentimiento del trabajador rara vez es libre: puede haber coerción implícita.',
        'La base legal más sólida es el contrato de trabajo o la obligación legal (Código del Trabajo).',
        'Monitoreo de comunicaciones y geolocalización requieren bases legales específicas.',
        'Los trabajadores mantienen derechos ARCOP frente a su empleador.'
      ]
    },
    'Transferencias': {
      color: 'cyan',
      title: 'Transferencias Internacionales de Datos',
      subtitle: 'Ley 21.719 — Cap. V',
      desc: 'Regulación del flujo de datos personales desde Chile hacia otros países. Solo se permite transferir datos a países con nivel de protección adecuado o cuando existen garantías suficientes (contratos, normas vinculantes corporativas).',
      points: [
        'La APDP determinará qué países tienen nivel de protección adecuado.',
        'Sin adecuación, se necesitan cláusulas contractuales tipo o consentimiento explícito.',
        'Afecta a empresas que usan proveedores cloud fuera de Chile (AWS, Azure, GCP).',
        'El subcontratista (encargado) debe ofrecer garantías equivalentes al responsable.',
        'La transferencia sin base legal es una infracción grave sancionable por la APDP.'
      ]
    },
    'Principios': {
      color: 'cyan',
      title: 'Principios del Tratamiento de Datos',
      subtitle: 'Ley 21.719 — Art. 3',
      desc: 'Conjunto de principios que deben guiar toda operación sobre datos personales. Actúan como criterios interpretativos y de cumplimiento que trascienden las reglas específicas de la ley.',
      points: [
        'Licitud: el tratamiento debe tener una base legal válida.',
        'Finalidad: los datos solo pueden usarse para el propósito declarado al momento de recolección.',
        'Proporcionalidad: solo se deben tratar los datos estrictamente necesarios.',
        'Calidad: los datos deben ser exactos, actualizados y completos.',
        'Responsabilidad proactiva: el responsable debe poder demostrar en todo momento el cumplimiento.'
      ]
    },
    'RR.HH.': {
      color: 'cyan',
      title: 'Protección de Datos en RR.HH.',
      subtitle: 'Recursos Humanos y Ley 21.719',
      desc: 'El departamento de Recursos Humanos es uno de los mayores tratadores de datos personales en cualquier organización. Gestiona datos de salud, remuneraciones, rendimiento, antecedentes y comunicaciones de los trabajadores.',
      points: [
        'Requiere RAT específico para todos los procesos de RRHH.',
        'Los procesos de selección deben respetar los derechos de los candidatos desde el primer contacto.',
        'Los datos de salud son datos sensibles: requieren base de licitud reforzada.',
        'Los trabajadores pueden ejercer derechos ARCOP sobre sus datos personales laborales.',
        'La retención de datos de ex-trabajadores debe justificarse y limitarse en el tiempo.'
      ]
    },
    'Cumplimiento': {
      color: 'green',
      title: 'Cumplimiento Normativo',
      subtitle: 'Compliance en Protección de Datos',
      desc: 'Estado de adecuación de una organización respecto a las obligaciones legales y reglamentarias aplicables al tratamiento de datos personales. El cumplimiento proactivo y demostrable es la mejor defensa ante la APDP.',
      points: [
        'No es un estado binario: el cumplimiento es un proceso continuo de mejora.',
        'Elementos clave: RAT, políticas, consentimiento, contratos con encargados, DPIA.',
        'La APDP puede iniciar procedimientos de inspección de oficio o por denuncia.',
        'La responsabilidad proactiva exige documentar el cumplimiento, no solo cumplir.',
        'ShellTI acompaña a empresas en el camino de adecuación a la Ley 21.719.'
      ]
    },

    /* ── Aliases para filter-btn (blog/biblioteca) ─────── */
    'ISO 27001': {
      color: 'cyan',
      title: 'ISO/IEC 27001:2022',
      subtitle: 'Sistema de Gestión de Seguridad de la Información',
      desc: 'Estándar internacional más adoptado para proteger la información. Define los requisitos para establecer, implementar, mantener y mejorar un SGSI certificable. Adoptado por más de 70.000 organizaciones en 150 países.',
      points: [
        'Aplicable a cualquier organización, independiente de tamaño o sector.',
        '93 controles organizados en 4 categorías: Organizacional, Personas, Físico, Tecnológico.',
        'Certificación válida por 3 años con auditorías anuales de seguimiento.',
        'Complementa directamente la Ley 21.719 en la gestión de datos personales.',
        'ShellTI acompaña el proceso completo: GAP analysis, implementación y preparación para auditoría.'
      ]
    },
    'NIST CSF': {
      color: 'cyan',
      title: 'NIST Cybersecurity Framework 2.0',
      subtitle: 'Marco de Referencia en Ciberseguridad',
      desc: 'Marco voluntario desarrollado por el NIST de EE.UU. para gestionar y reducir el riesgo de ciberseguridad. La versión 2.0 (2024) agrega la función Governar y amplía el alcance a organizaciones de cualquier tamaño y sector.',
      points: [
        '6 funciones: Governar, Identificar, Proteger, Detectar, Responder, Recuperar.',
        'No es prescriptivo: se adapta al contexto, tamaño y madurez de cada organización.',
        'Ampliamente usado en sectores críticos: banca, salud, energía, gobierno.',
        'Mapeable a ISO 27001, CIS Controls, COBIT y otros marcos.',
        'Referencia recomendada por la ANCI para operadores de infraestructura crítica en Chile.'
      ]
    },
    'CIS Controls': {
      color: 'cyan',
      title: 'CIS Critical Security Controls v8',
      subtitle: '18 Controles Priorizados de Seguridad',
      desc: 'Conjunto de 18 controles y 153 salvaguardas desarrollado por el Center for Internet Security. Diseñado para ser práctico, priorizado por datos reales de ataques y aplicable a organizaciones de cualquier tamaño mediante 3 Grupos de Implementación.',
      points: [
        'IG1 (56 salvaguardas): higiene básica para toda organización.',
        'IG2 (74 adicionales): para empresas con equipo TI dedicado.',
        'IG3 (23 adicionales): para organizaciones con madurez avanzada.',
        'Basado en evidencia: cada control ataca los vectores de ataque más frecuentes.',
        'Mapeable a NIST CSF, ISO 27001 y regulaciones sectoriales.'
      ]
    },
    'OWASP': {
      color: 'cyan',
      title: 'OWASP — Open Web Application Security Project',
      subtitle: 'Seguridad de Aplicaciones Web',
      desc: 'Fundación sin fines de lucro que produce guías, herramientas y estándares de seguridad de aplicaciones de uso libre y global. Su Top 10 es la referencia más citada para vulnerabilidades web críticas.',
      points: [
        'OWASP Top 10:2021 — las 10 vulnerabilidades más críticas en aplicaciones web.',
        'WSTG — guía completa de testing de seguridad web con +400 casos de prueba.',
        'ASVS — estándar de verificación de seguridad para aplicaciones.',
        'ZAP — herramienta gratuita de escaneo dinámico (DAST) para desarrollo y QA.',
        'Referencia obligatoria en contratos de pentesting y auditorías de seguridad.'
      ]
    },
    'ANCI': {
      color: 'cyan',
      title: 'Agencia Nacional de Ciberseguridad',
      subtitle: 'Ley 21.663 — Chile',
      desc: 'Organismo técnico del Estado chileno creado por la Ley Marco de Ciberseguridad (21.663). Regula, supervisa y coordina la ciberseguridad nacional, incluyendo la protección de infraestructura crítica y la operación del CSIRT Nacional.',
      points: [
        'Autoridad competente en ciberseguridad para el sector público y privado.',
        'Administra el CSIRT Nacional: punto central de respuesta a incidentes.',
        'Registra y supervisa a operadores de infraestructura crítica.',
        'Emite directivas técnicas de obligatorio cumplimiento para entidades reguladas.',
        'Coordina con la APDP (Ley 21.719) en incidentes que involucren datos personales.'
      ]
    },

  };

  /* ── HTML del modal ─────────────────────────────────── */
  const COLORS = {
    cyan:   { text: '#00D4FF', bg: 'rgba(0,212,255,0.08)',   border: 'rgba(0,212,255,0.35)'  },
    green:  { text: '#34D399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.35)' },
    yellow: { text: '#FFD93D', bg: 'rgba(255,217,61,0.08)',  border: 'rgba(255,217,61,0.35)' }
  };

  function injectStyles() {
    if (document.getElementById('tm-styles')) return;
    const s = document.createElement('style');
    s.id = 'tm-styles';
    s.textContent = `
#tm-overlay{position:fixed;inset:0;background:rgba(2,6,23,0.92);backdrop-filter:blur(10px);
  display:flex;align-items:center;justify-content:center;z-index:9900;
  opacity:0;visibility:hidden;transition:opacity .3s,visibility .3s;padding:1rem;}
#tm-overlay.tm-open{opacity:1;visibility:visible;}
#tm-box{background:linear-gradient(135deg,rgba(4,13,30,0.98) 0%,rgba(6,15,28,0.98) 100%);
  border:1px solid rgba(0,212,255,0.3);border-radius:4px;padding:2.25rem 2.5rem;
  max-width:580px;width:100%;position:relative;
  box-shadow:0 0 60px rgba(0,212,255,0.1),0 32px 64px rgba(0,0,0,0.6);
  animation:tmIn .3s ease forwards;max-height:90vh;overflow-y:auto;}
@keyframes tmIn{from{opacity:0;transform:translateY(16px) scale(0.97)}to{opacity:1;transform:none}}
#tm-close{position:absolute;top:.9rem;right:1.1rem;background:none;border:none;
  color:#64748B;font-size:1.3rem;cursor:pointer;line-height:1;padding:4px;transition:color .2s;}
#tm-close:hover{color:#00D4FF;}
#tm-color-bar{height:3px;border-radius:2px;margin-bottom:1.5rem;}
#tm-subtitle{font-family:'JetBrains Mono',monospace;font-size:.6rem;letter-spacing:2.5px;
  text-transform:uppercase;margin-bottom:.6rem;display:block;opacity:.9;}
#tm-title{font-size:1.45rem;font-weight:800;color:#E2E8F0;margin-bottom:1rem;line-height:1.2;}
#tm-desc{color:#94A3B8;font-size:.88rem;line-height:1.8;margin-bottom:1.4rem;font-weight:300;}
#tm-points{list-style:none;display:flex;flex-direction:column;gap:.55rem;margin-bottom:1.5rem;}
#tm-points li{display:flex;align-items:flex-start;gap:.7rem;
  color:#94A3B8;font-size:.84rem;line-height:1.65;font-weight:300;}
#tm-points li::before{content:'▸';font-size:.75rem;flex-shrink:0;margin-top:.18rem;color:var(--tm-accent,#00D4FF);}
#tm-footer{padding-top:1.1rem;border-top:1px solid rgba(0,212,255,0.1);display:flex;justify-content:flex-end;}
#tm-btn{font-family:'JetBrains Mono',monospace;font-size:.65rem;letter-spacing:1.5px;
  text-transform:uppercase;border:1px solid rgba(0,212,255,0.4);color:#00D4FF;
  background:rgba(0,212,255,0.07);padding:8px 20px;border-radius:2px;
  cursor:pointer;transition:background .2s,box-shadow .2s;}
#tm-btn:hover{background:rgba(0,212,255,0.14);box-shadow:0 0 18px rgba(0,212,255,0.25);}
.tm-clickable{cursor:pointer;transition:filter .15s,transform .15s;}
.tm-clickable:hover{filter:brightness(1.25);transform:scale(1.05);}
`;
    document.head.appendChild(s);
  }

  function injectHTML() {
    if (document.getElementById('tm-overlay')) return;
    const div = document.createElement('div');
    div.innerHTML = `
<div id="tm-overlay" role="dialog" aria-modal="true" aria-labelledby="tm-title">
  <div id="tm-box">
    <button id="tm-close" aria-label="Cerrar">&times;</button>
    <div id="tm-color-bar"></div>
    <span id="tm-subtitle"></span>
    <h3 id="tm-title"></h3>
    <p id="tm-desc"></p>
    <ul id="tm-points"></ul>
    <div id="tm-footer"><button id="tm-btn">CERRAR</button></div>
  </div>
</div>`;
    document.body.appendChild(div.firstElementChild);

    const overlay = document.getElementById('tm-overlay');
    document.getElementById('tm-close').addEventListener('click', closeModal);
    document.getElementById('tm-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e){ if(e.target===this) closeModal(); });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModal(); });
  }

  function openModal(key) {
    const d = TAG_DATA[key];
    if (!d) return;
    const c = COLORS[d.color] || COLORS.cyan;
    document.getElementById('tm-color-bar').style.background = c.text;
    document.getElementById('tm-subtitle').textContent = d.subtitle;
    document.getElementById('tm-subtitle').style.color = c.text;
    document.getElementById('tm-title').textContent = d.title;
    document.getElementById('tm-box').style.borderColor = c.border;
    document.getElementById('tm-desc').textContent = d.desc;
    const ul = document.getElementById('tm-points');
    ul.innerHTML = d.points.map(p => `<li style="--tc:${c.text}">${p}</li>`).join('');
    ul.querySelectorAll('li::before');
    // color de bullets via style
    ul.querySelectorAll('li').forEach(li => {
      li.style.setProperty('--tc', c.text);
    });
    // Aplicar color a bullets con pseudo, lo hacemos con un span
    ul.innerHTML = d.points.map(p => `<li>${p}</li>`).join('');
    document.getElementById('tm-points').style.setProperty('--tm-accent', c.text);
    document.getElementById('tm-btn').style.color = c.text;
    document.getElementById('tm-btn').style.borderColor = c.border;
    document.getElementById('tm-btn').style.background = c.bg;
    document.getElementById('tm-overlay').classList.add('tm-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('tm-overlay').classList.remove('tm-open');
    document.body.style.overflow = '';
  }

  function init() {
    injectStyles();
    injectHTML();
    // Hacer clicables htag, filter-btn y rc-badge que tengan datos
    document.querySelectorAll('.htag, [class*="htag"], .filter-btn, .rc-badge').forEach(function(el) {
      const key = el.textContent.trim();
      if (TAG_DATA[key]) {
        el.classList.add('tm-clickable');
        el.setAttribute('title', 'Ver detalles: ' + key);
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          openModal(key);
        });
        el.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(key); }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

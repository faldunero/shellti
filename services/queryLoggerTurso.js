const { createClient } = require('@libsql/client');

class QueryLoggerTurso {
  constructor() {
    // Initialize Turso client from environment variables
    this.client = createClient({
      url: process.env.TURSO_CONNECTION_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    });

    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Create table if it doesn't exist
      await this.client.execute(`
        CREATE TABLE IF NOT EXISTS consultas (
          id TEXT PRIMARY KEY,
          usuario_id TEXT NOT NULL,
          nombre_usuario TEXT,
          email TEXT,
          agente TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          tipo_consulta TEXT DEFAULT 'pregunta',
          tema TEXT,
          resumen_pregunta TEXT,
          respuesta_caracteres INTEGER DEFAULT 0,
          tiempo_respuesta_ms INTEGER DEFAULT 0,
          tokens_utilizados INTEGER DEFAULT 0,
          user_agent TEXT,
          ip TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create index for faster queries
      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_usuario_id ON consultas(usuario_id)
      `);

      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_agente ON consultas(agente)
      `);

      await this.client.execute(`
        CREATE INDEX IF NOT EXISTS idx_timestamp ON consultas(timestamp)
      `);

      this.initialized = true;
      console.log('[QueryLoggerTurso] Initialized successfully');
    } catch (err) {
      console.error('[QueryLoggerTurso] Initialization error:', err.message);
      throw err;
    }
  }

  async logQuery(queryData) {
    try {
      await this.initPromise;

      const consultaId = `con_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

      const entry = {
        id: consultaId,
        usuario_id: queryData.usuario_id || 'anonimo',
        nombre_usuario: queryData.nombre_usuario || 'sin_nombre',
        email: queryData.email || '',
        agente: queryData.agente || 'desconocido',
        timestamp: new Date().toISOString(),
        tipo_consulta: queryData.tipo_consulta || 'pregunta',
        tema: queryData.tema || '',
        resumen_pregunta: (queryData.pregunta || '').slice(0, 200),
        respuesta_caracteres: (queryData.respuesta || '').length,
        tiempo_respuesta_ms: queryData.tiempo_ms || 0,
        tokens_utilizados: queryData.tokens || 0,
        user_agent: queryData.user_agent || '',
        ip: queryData.ip || ''
      };

      await this.client.execute({
        sql: `
          INSERT INTO consultas (
            id, usuario_id, nombre_usuario, email, agente, timestamp,
            tipo_consulta, tema, resumen_pregunta, respuesta_caracteres,
            tiempo_respuesta_ms, tokens_utilizados, user_agent, ip
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          entry.id,
          entry.usuario_id,
          entry.nombre_usuario,
          entry.email,
          entry.agente,
          entry.timestamp,
          entry.tipo_consulta,
          entry.tema,
          entry.resumen_pregunta,
          entry.respuesta_caracteres,
          entry.tiempo_respuesta_ms,
          entry.tokens_utilizados,
          entry.user_agent,
          entry.ip
        ]
      });

      return entry.id;
    } catch (err) {
      console.error('[QueryLoggerTurso] Error logging query:', err.message);
      return null;
    }
  }

  async getStats() {
    try {
      await this.initPromise;

      const result = await this.client.execute('SELECT * FROM consultas ORDER BY timestamp DESC');
      const consultas = result.rows || [];

      if (consultas.length === 0) {
        return null;
      }

      const stats = {
        periodo: {
          inicio: consultas.length > 0 ? consultas[consultas.length - 1].timestamp.split('T')[0] : new Date().toISOString().split('T')[0],
          fin: new Date().toISOString().split('T')[0]
        },
        resumen: {
          total_consultas: consultas.length,
          usuarios_activos: new Set(consultas.map(c => c.usuario_id)).size,
          agentes_usados: Array.from(new Set(consultas.map(c => c.agente))),
          promedio_tokens_por_consulta: Math.round(
            consultas.reduce((sum, c) => sum + (c.tokens_utilizados || 0), 0) / (consultas.length || 1)
          ),
          promedio_respuesta_ms: Math.round(
            consultas.reduce((sum, c) => sum + (c.tiempo_respuesta_ms || 0), 0) / (consultas.length || 1)
          )
        },
        por_agente: this.agruparPorAgente(consultas),
        por_usuario: this.agruparPorUsuario(consultas),
        usuarios_inactivos: this.detectarInactivos(consultas)
      };

      return stats;
    } catch (err) {
      console.error('[QueryLoggerTurso] Error getting stats:', err.message);
      return null;
    }
  }

  agruparPorAgente(consultas) {
    const grupos = {};
    consultas.forEach(c => {
      if (!grupos[c.agente]) {
        grupos[c.agente] = { total: 0, usuarios_unicos: 0, tokens: 0, promedio_ms: 0, usuarios: new Set() };
      }
      grupos[c.agente].total++;
      grupos[c.agente].usuarios.add(c.usuario_id);
      grupos[c.agente].tokens += c.tokens_utilizados || 0;
    });

    Object.keys(grupos).forEach(agente => {
      grupos[agente].usuarios_unicos = grupos[agente].usuarios.size;
      grupos[agente].promedio_ms = Math.round(
        consultas
          .filter(c => c.agente === agente)
          .reduce((sum, c) => sum + (c.tiempo_respuesta_ms || 0), 0) / grupos[agente].total
      );
      delete grupos[agente].usuarios;
    });

    return grupos;
  }

  agruparPorUsuario(consultas) {
    const grupos = {};
    consultas.forEach(c => {
      if (!grupos[c.usuario_id]) {
        grupos[c.usuario_id] = {
          nombre: c.nombre_usuario,
          email: c.email,
          total: 0,
          agentes: new Set(),
          ultima_actividad: c.timestamp,
          tokens: 0
        };
      }
      grupos[c.usuario_id].total++;
      grupos[c.usuario_id].agentes.add(c.agente);
      grupos[c.usuario_id].ultima_actividad = c.timestamp;
      grupos[c.usuario_id].tokens += c.tokens_utilizados || 0;
    });

    Object.keys(grupos).forEach(uid => {
      grupos[uid].agentes = Array.from(grupos[uid].agentes);
    });

    return grupos;
  }

  detectarInactivos(consultas) {
    // Usuarios que no han consultado en los últimos 7 días
    const hace7dias = new Date(Date.now() - 7 * 86400000);
    const ultimasConsultas = {};

    consultas.forEach(c => {
      if (!ultimasConsultas[c.usuario_id] ||
          new Date(c.timestamp) > new Date(ultimasConsultas[c.usuario_id])) {
        ultimasConsultas[c.usuario_id] = c.timestamp;
      }
    });

    return Object.entries(ultimasConsultas)
      .filter(([uid, timestamp]) => new Date(timestamp) < hace7dias)
      .map(([uid, timestamp]) => ({
        usuario_id: uid,
        ultima_actividad: timestamp,
        dias_inactivo: Math.floor((Date.now() - new Date(timestamp)) / 86400000)
      }));
  }

  async generateReport(startDate, endDate) {
    try {
      await this.initPromise;

      const result = await this.client.execute(`
        SELECT * FROM consultas
        WHERE timestamp BETWEEN ? AND ?
        ORDER BY timestamp DESC
      `);

      const consultas = result.rows || [];

      const report = {
        generado_en: new Date().toISOString(),
        periodo: {
          inicio: startDate,
          fin: endDate
        },
        resumen_general: {
          total_consultas: consultas.length,
          usuarios_unicos: new Set(consultas.map(c => c.usuario_id)).size,
          promedio_respuesta_ms: Math.round(
            consultas.reduce((sum, c) => sum + (c.tiempo_respuesta_ms || 0), 0) /
            (consultas.length || 1)
          ),
          total_tokens: consultas.reduce((sum, c) => sum + (c.tokens_utilizados || 0), 0)
        },
        por_agente: this.agruparPorAgente(consultas),
        por_usuario: this.agruparPorUsuario(consultas),
        usuarios_inactivos: this.detectarInactivos(consultas)
      };

      return report;
    } catch (err) {
      console.error('[QueryLoggerTurso] Error generating report:', err.message);
      return null;
    }
  }
}

module.exports = QueryLoggerTurso;

const fs = require('fs');
const path = require('path');

class QueryLogger {
  constructor(logsDir = './logs', rotateDays = 7) {
    this.logsDir = logsDir;
    this.rotateDays = rotateDays;
    this.logFilePath = path.join(logsDir, 'queries.json');
    this.statsFilePath = path.join(logsDir, 'stats.json');

    // Crear directorio si no existe
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    this.initializeLog();
  }

  initializeLog() {
    if (!fs.existsSync(this.logFilePath)) {
      this.createNewLog();
    } else {
      this.checkRotation();
    }
  }

  createNewLog() {
    const now = new Date();
    const rotationDate = new Date(now.getTime() + this.rotateDays * 86400000);

    const logData = {
      fecha_inicio: now.toISOString().split('T')[0],
      fecha_rotacion_proxima: rotationDate.toISOString().split('T')[0],
      periodo_dias: this.rotateDays,
      total_consultas: 0,
      usuarios_activos_set: new Set(),
      consultas: []
    };

    fs.writeFileSync(this.logFilePath, JSON.stringify(logData, null, 2));
  }

  checkRotation() {
    try {
      const data = JSON.parse(fs.readFileSync(this.logFilePath, 'utf8'));
      const rotationDate = new Date(data.fecha_rotacion_proxima);

      if (new Date() > rotationDate) {
        // Hacer backup del archivo anterior
        const timestamp = new Date().toISOString().split('T')[0];
        const backupPath = path.join(
          this.logsDir,
          `queries_backup_${timestamp}.json`
        );
        fs.copyFileSync(this.logFilePath, backupPath);

        // Generar reporte antes de rotar
        this.generateReport(data);

        // Crear nuevo log
        this.createNewLog();
      }
    } catch (err) {
      console.error('[Logger] Error en checkRotation:', err.message);
    }
  }

  logQuery(queryData) {
    try {
      const data = JSON.parse(fs.readFileSync(this.logFilePath, 'utf8'));

      const entry = {
        consulta_id: `con_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
        user_agent: queryData.user_agent || ''
      };

      data.consultas.push(entry);
      data.total_consultas = data.consultas.length;

      // Contar usuarios únicos
      const usuariosUnicos = new Set(data.consultas.map(c => c.usuario_id));
      data.usuarios_activos = usuariosUnicos.size;

      fs.writeFileSync(this.logFilePath, JSON.stringify(data, null, 2));

      return entry.consulta_id;
    } catch (err) {
      console.error('[Logger] Error logging query:', err.message);
      return null;
    }
  }

  generateReport(data) {
    try {
      const report = {
        generado_en: new Date().toISOString(),
        periodo: {
          inicio: data.fecha_inicio,
          fin: new Date().toISOString().split('T')[0]
        },
        resumen_general: {
          total_consultas: data.total_consultas,
          usuarios_unicos: new Set(data.consultas.map(c => c.usuario_id)).size,
          promedio_respuesta_ms: Math.round(
            data.consultas.reduce((sum, c) => sum + (c.tiempo_respuesta_ms || 0), 0) /
            (data.consultas.length || 1)
          ),
          total_tokens: data.consultas.reduce((sum, c) => sum + (c.tokens_utilizados || 0), 0)
        },
        por_agente: {},
        por_usuario: {},
        por_tipo_consulta: {}
      };

      // Estadísticas por agente
      data.consultas.forEach(c => {
        if (!report.por_agente[c.agente]) {
          report.por_agente[c.agente] = { total: 0, tokens: 0, promedio_ms: 0 };
        }
        report.por_agente[c.agente].total++;
        report.por_agente[c.agente].tokens += c.tokens_utilizados || 0;
      });

      // Estadísticas por usuario
      data.consultas.forEach(c => {
        if (!report.por_usuario[c.usuario_id]) {
          report.por_usuario[c.usuario_id] = {
            nombre: c.nombre_usuario,
            email: c.email,
            total: 0,
            agentes_usados: new Set(),
            tokens: 0
          };
        }
        report.por_usuario[c.usuario_id].total++;
        report.por_usuario[c.usuario_id].agentes_usados.add(c.agente);
        report.por_usuario[c.usuario_id].tokens += c.tokens_utilizados || 0;
      });

      // Convertir Sets a arrays
      Object.keys(report.por_usuario).forEach(uid => {
        report.por_usuario[uid].agentes_usados = Array.from(
          report.por_usuario[uid].agentes_usados
        );
      });

      // Estadísticas por tipo de consulta
      data.consultas.forEach(c => {
        if (!report.por_tipo_consulta[c.tipo_consulta]) {
          report.por_tipo_consulta[c.tipo_consulta] = 0;
        }
        report.por_tipo_consulta[c.tipo_consulta]++;
      });

      const reportPath = path.join(
        this.logsDir,
        `report_${data.fecha_inicio}_${new Date().toISOString().split('T')[0]}.json`
      );
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      return report;
    } catch (err) {
      console.error('[Logger] Error generating report:', err.message);
      return null;
    }
  }

  getStats() {
    try {
      if (!fs.existsSync(this.logFilePath)) return null;

      const data = JSON.parse(fs.readFileSync(this.logFilePath, 'utf8'));

      const usuariosUnicos = new Set(data.consultas.map(c => c.usuario_id));
      const agentes = new Set(data.consultas.map(c => c.agente));

      return {
        periodo: {
          inicio: data.fecha_inicio,
          fin: data.fecha_rotacion_proxima
        },
        resumen: {
          total_consultas: data.total_consultas,
          usuarios_activos: usuariosUnicos.size,
          agentes_usados: Array.from(agentes),
          promedio_tokens_por_consulta: Math.round(
            data.consultas.reduce((sum, c) => sum + (c.tokens_utilizados || 0), 0) /
            (data.consultas.length || 1)
          )
        },
        por_agente: this.agruparPorAgente(data.consultas),
        por_usuario: this.agruparPorUsuario(data.consultas),
        usuarios_inactivos: this.detectarInactivos(data.consultas)
      };
    } catch (err) {
      console.error('[Logger] Error getting stats:', err.message);
      return null;
    }
  }

  agruparPorAgente(consultas) {
    const grupos = {};
    consultas.forEach(c => {
      if (!grupos[c.agente]) {
        grupos[c.agente] = { total: 0, usuarios: new Set(), tokens: 0 };
      }
      grupos[c.agente].total++;
      grupos[c.agente].usuarios.add(c.usuario_id);
      grupos[c.agente].tokens += c.tokens_utilizados || 0;
    });

    Object.keys(grupos).forEach(agente => {
      grupos[agente].usuarios_unicos = grupos[agente].usuarios.size;
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
}

module.exports = QueryLogger;

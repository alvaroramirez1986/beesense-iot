/**
 * ============================================================================
 * SERVICIO DE COMUNICACIÓN CLOUD CON AWS API GATEWAY, IOT CORE Y DYNAMODB
 * ============================================================================
 * Gestiona:
 * 1. Consumo de telemetría en tiempo real desde AWS API Gateway / Lambda.
 * 2. Obtención de serie temporal histórica en intervalos de 10 minutos.
 * 3. Máquina de estados para detección y persistencia automática en Amazon
 *    DynamoDB de eventos críticos con Fecha/Hora de Inicio y Fecha/Hora de Término:
 *    - TEMPERATURA (>= 36.1 °C o < 15.0 °C)
 *    - ESTADO DE TAPADA (Tapa ABIERTA)
 *    - ALERTA CELULAR (Notificación enviada al celular por apertura de tapa de la colmena)
 *    - ESTADO DE BATERIA (< 10% parpadeo crítico / < 20% batería crítica)
 *    - N/A (Pérdida de conectividad en uno o más sensores)
 */

const AWS_API_BASE_URL = import.meta.env.VITE_AWS_API_BASE_URL || '';
const COLMENAR_ID = import.meta.env.VITE_COLMENAR_ID || 'COLMENAR-PAO-01';
const LOCAL_STORAGE_EVENTS_KEY = 'beesense_dynamodb_events_v1';

/**
 * Formatea una fecha a formato legible dd-mm-aaaa, hh:mm:ss
 */
export function formatDateTimeCL(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return String(dateInput);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hours24 = d.getHours();
  const period = hours24 >= 12 ? 'p. m.' : 'a. m.';
  const hours12 = hours24 % 12 || 12;
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${day}-${month}-${year}, ${hours12}:${minutes}:${seconds} ${period}`;
}

/**
 * Formatea una fecha a YYYY-MM-DD para comparaciones de filtro por fecha
 */
export function toISODateString(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Formatea una fecha a HH:MM (formato 24h) para consultas por rango horario
 */
export function toTimeHHMM24(dateInput = new Date()) {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Extrae la hora en formato 24h (HH:MM) desde un objeto de evento
 */
export function getEventTimeHHMM(ev) {
  if (ev.horaInicio24) return ev.horaInicio24;
  if (ev.fechaInicio) {
    const match = String(ev.fechaInicio).match(/(\d{1,2}):(\d{2}):\d{2}\s*(a\.\s*m\.|p\.\s*m\.)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const period = (match[3] || '').toLowerCase();
      if (period.includes('p') && hours < 12) hours += 12;
      if (period.includes('a') && hours === 12) hours = 0;
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }
  }
  return '00:00';
}

/**
 * Genera la ventana de etiquetas del eje X en intervalos de 10 minutos
 * (ej. últimos 10 puntos separados cada 10 minutos)
 */
export function buildTenMinuteSeries(baseTempInt = 33.8, baseTempExt = 24.6) {
  const now = new Date();
  // Redondear al múltiplo de 10 minutos más cercano
  now.setSeconds(0, 0);
  const rem = now.getMinutes() % 10;
  now.setMinutes(now.getMinutes() - rem);

  const points = [];
  for (let i = 9; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 10 * 60 * 1000);
    const label = `${String(t.getHours()).padStart(2, '0')}:${String(t.getMinutes()).padStart(2, '0')}`;
    const wave = Math.sin(i * 0.65) * 0.4;
    points.push({
      time: label,
      timestamp: t.toISOString(),
      interior: Number((baseTempInt + wave).toFixed(1)),
      exterior: Number((baseTempExt + wave * 0.7).toFixed(1)),
    });
  }
  return points;
}

/**
 * Obtiene los eventos almacenados en DynamoDB (con respaldo local para continuidad offline)
 */
export async function fetchEventsFromDynamoDB() {
  if (AWS_API_BASE_URL) {
    try {
      const response = await fetch(`${AWS_API_BASE_URL}/events?colmenarId=${encodeURIComponent(COLMENAR_ID)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.items)) {
          localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(data.items));
          return data.items;
        }
      }
    } catch (error) {
      console.warn('[BeeSense AWS] Usando caché local de DynamoDB por desconexión temporal del endpoint:', error);
    }
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EVENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[BeeSense] Error leyendo eventos locales:', e);
  }
  return [];
}

/**
 * Registra el inicio de un evento crítico en Amazon DynamoDB
 */
export async function registerEventStartInDynamoDB(newEvent) {
  const existing = await fetchEventsFromDynamoDB();
  const updated = [newEvent, ...existing];
  localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));

  if (AWS_API_BASE_URL) {
    try {
      await fetch(`${AWS_API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colmenarId: COLMENAR_ID,
          ...newEvent,
        }),
      });
    } catch (error) {
      console.warn('[BeeSense AWS] Evento guardado localmente, pendiente de sincronizar con DynamoDB:', error);
    }
  }
  return updated;
}

/**
 * Actualiza la fecha y hora de término de un evento en Amazon DynamoDB cuando el parámetro vuelve a la normalidad
 */
export async function registerEventEndInDynamoDB(eventId, fechaTermino, isoTermino) {
  const existing = await fetchEventsFromDynamoDB();
  const updated = existing.map((ev) =>
    ev.id === eventId
      ? { ...ev, fechaTermino, isoTermino, estadoEvento: 'FINALIZADO' }
      : ev
  );
  localStorage.setItem(LOCAL_STORAGE_EVENTS_KEY, JSON.stringify(updated));

  if (AWS_API_BASE_URL) {
    try {
      await fetch(`${AWS_API_BASE_URL}/events/${encodeURIComponent(eventId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colmenarId: COLMENAR_ID,
          fechaTermino,
          isoTermino,
          estadoEvento: 'FINALIZADO',
        }),
      });
    } catch (error) {
      console.warn('[BeeSense AWS] Cierre de evento registrado localmente:', error);
    }
  }
  return updated;
}

/**
 * Consulta la última lectura telemétrica desde AWS API Gateway / DynamoDB
 */
export async function fetchLatestTelemetryFromAWS() {
  if (!AWS_API_BASE_URL) {
    return null;
  }
  try {
    const response = await fetch(`${AWS_API_BASE_URL}/telemetry?colmenarId=${encodeURIComponent(COLMENAR_ID)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.warn('[BeeSense AWS] No se pudo obtener telemetría remota:', error);
    return null;
  }
}

/**
 * Evaluador de reglas de negocio de telemetría para determinar el estado visual de cada tarjeta
 * y disparar la persistencia automática de eventos en DynamoDB.
 */
export function evaluateTelemetryStatus(telemetry) {
  const { tempInterior, tempExterior, humedadExterior, estadoTapa, bateria } = telemetry;

  // 1. Evaluación Temperatura Interior (DS18B20)
  let tempStatus = 'NORMAL'; // 'NORMAL' | 'HIGH_ALERT' | 'LOW_BLINK_ALERT' | 'NA'
  if (tempInterior === null || tempInterior === undefined || Number.isNaN(Number(tempInterior))) {
    tempStatus = 'NA';
  } else if (Number(tempInterior) >= 36.1) {
    tempStatus = 'HIGH_ALERT'; // >= 36.1 °C cambia a rojo
  } else if (Number(tempInterior) < 15.0) {
    tempStatus = 'LOW_BLINK_ALERT'; // < 15 °C cambia a rojo y parpadea
  }

  // 2. Evaluación Clima Exterior (DHT22)
  const extTempNA = tempExterior === null || tempExterior === undefined || Number.isNaN(Number(tempExterior));
  const extHumNA = humedadExterior === null || humedadExterior === undefined || Number.isNaN(Number(humedadExterior));
  const climaExteriorStatus = extTempNA || extHumNA ? 'NA' : 'NORMAL';

  // 3. Evaluación Estado de Tapa (Reed Switch)
  let tapaStatus = 'NORMAL'; // 'NORMAL' | 'OPEN_BLINK_ALERT' | 'NA'
  if (!estadoTapa || estadoTapa === 'N/A') {
    tapaStatus = 'NA';
  } else if (String(estadoTapa).toUpperCase() === 'ABIERTA') {
    tapaStatus = 'OPEN_BLINK_ALERT';
  }

  // 4. Evaluación Nivel de Batería (ADC)
  let bateriaStatus = 'NORMAL'; // 'NORMAL' | 'LOW_ALERT_20' | 'CRITICAL_BLINK_10' | 'NA'
  if (bateria === null || bateria === undefined || Number.isNaN(Number(bateria))) {
    bateriaStatus = 'NA';
  } else if (Number(bateria) < 10.0) {
    bateriaStatus = 'CRITICAL_BLINK_10'; // < 10% cambia a rojo y parpadea
  } else if (Number(bateria) < 20.0) {
    bateriaStatus = 'LOW_ALERT_20'; // < 20% alerta batería crítica
  }

  const anySensorDisconnected =
    tempStatus === 'NA' ||
    climaExteriorStatus === 'NA' ||
    tapaStatus === 'NA' ||
    bateriaStatus === 'NA';

  return {
    tempStatus,
    climaExteriorStatus,
    tapaStatus,
    bateriaStatus,
    anySensorDisconnected,
  };
}

/**
 * ============================================================================
 * AWS LAMBDA 1: INGESTA DESDE AWS IOT CORE Y PERSISTENCIA EN AMAZON DYNAMODB
 * ============================================================================
 * Nombre de la función sugerido: BeeSense-IoT-Ingest-Handler
 * Runtime: Node.js 20.x
 * Tablas DynamoDB utilizadas:
 *  1. BeeSense_Telemetria (PK: colmenarId, SK: timestamp)
 *  2. BeeSense_Eventos    (PK: colmenarId, SK: id)
 *
 * Evalúa automáticamente las reglas de negocio del documento:
 * - Temperatura Interior >= 36.1 °C o < 15.0 °C  --> Tipo: "TEMPERATURA"
 * - Estado de Tapa === "ABIERTA"                 --> Tipo: "ESTADO DE TAPADA"
 * - Alerta Móvil por apertura de tapa            --> Tipo: "ALERTA CELULAR"
 * - Nivel de Batería < 20% / < 10%               --> Tipo: "ESTADO DE BATERIA"
 * - Desconexión de algún sensor (null / N/A)     --> Tipo: "N/A"
 * Almacenando fecha/hora de inicio y actualizando la fecha/hora de término
 * cuando la variable regresa a su estado normal.
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_TELEMETRIA = process.env.TABLE_TELEMETRIA || "BeeSense_Telemetria";
const TABLE_EVENTOS = process.env.TABLE_EVENTOS || "BeeSense_Eventos";

function formatDateTimeCL(dateObj = new Date()) {
  return dateObj.toLocaleString("es-CL", {
    timeZone: "America/Santiago",
    hour12: true,
  });
}

async function manageAnomalyLifecycle(colmenarId, tipoEvento, isActive, titulo, detalle, nowIso, nowFormatted) {
  // Buscar si existe un evento ACTIVO de este mismo tipoEvento para este colmenar
  const queryRes = await docClient.send(
    new QueryCommand({
      TableName: TABLE_EVENTOS,
      KeyConditionExpression: "colmenarId = :cid",
      FilterExpression: "tipoEvento = :tipo AND estadoEvento = :est",
      ExpressionAttributeValues: {
        ":cid": colmenarId,
        ":tipo": tipoEvento,
        ":est": "ACTIVO",
      },
    })
  );

  const activeItem = queryRes.Items?.[0];

  if (isActive && !activeItem) {
    // Crear nuevo registro de evento con fechaInicio
    const eventId = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    await docClient.send(
      new PutCommand({
        TableName: TABLE_EVENTOS,
        Item: {
          colmenarId,
          id: eventId,
          nombreColmenar: "Colmenar Principal - Sede PAO",
          tipoEvento,
          titulo,
          detalle,
          fechaInicio: nowFormatted,
          fechaTermino: "En curso (Activa)",
          isoDate: nowIso.slice(0, 10),
          estadoEvento: "ACTIVO",
        },
      })
    );
  } else if (!isActive && activeItem) {
    // Cerrar evento existente registrando fechaTermino
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_EVENTOS,
        Key: {
          colmenarId,
          id: activeItem.id,
        },
        UpdateExpression: "SET fechaTermino = :ft, estadoEvento = :est",
        ExpressionAttributeValues: {
          ":ft": nowFormatted,
          ":est": "FINALIZADO",
        },
      })
    );
  }
}

export const handler = async (event) => {
  const colmenarId = event.colmenarId || "COLMENAR-NORTE-01";
  const now = new Date();
  const nowIso = now.toISOString();
  const nowFormatted = formatDateTimeCL(now);

  // 1. Guardar lectura cruda en tabla de series temporales BeeSense_Telemetria
  await docClient.send(
    new PutCommand({
      TableName: TABLE_TELEMETRIA,
      Item: {
        colmenarId,
        timestamp: nowIso,
        tempInterior: event.tempInterior ?? null,
        tempExterior: event.tempExterior ?? null,
        humedadExterior: event.humedadExterior ?? null,
        estadoTapa: event.estadoTapa ?? "N/A",
        bateria: event.bateria ?? null,
      },
    })
  );

  // 2. Evaluar condiciones de alerta para guardar en BeeSense_Eventos
  const tempInt = event.tempInterior;
  const isTempAlert =
    tempInt !== null &&
    tempInt !== undefined &&
    (Number(tempInt) >= 36.1 || Number(tempInt) < 15.0);

  await manageAnomalyLifecycle(
    colmenarId,
    "TEMPERATURA",
    isTempAlert,
    "Alerta Temperatura",
    `Temperatura interior crítica: ${tempInt}°C`,
    nowIso,
    nowFormatted
  );

  const isLidAlert = String(event.estadoTapa).toUpperCase() === "ABIERTA";
  await manageAnomalyLifecycle(
    colmenarId,
    "ESTADO DE TAPADA",
    isLidAlert,
    "Alerta Estado de Tapada",
    "Apertura de tapa detectada en colmenar principal (ABIERTA)",
    nowIso,
    nowFormatted
  );

  // Registro en BD de la alerta enviada al celular por apertura de tapa de la colmena
  await manageAnomalyLifecycle(
    colmenarId,
    "ALERTA CELULAR",
    isLidAlert,
    "Alerta Enviada al Celular",
    "Notificación móvil enviada al celular del apicultor por apertura de tapa de la colmena",
    nowIso,
    nowFormatted
  );

  const bat = event.bateria;
  const isBatteryAlert = bat !== null && bat !== undefined && Number(bat) < 20.0;
  await manageAnomalyLifecycle(
    colmenarId,
    "ESTADO DE BATERIA",
    isBatteryAlert,
    "Alerta Estado de Batería",
    `Batería en nivel crítico: ${bat}%`,
    nowIso,
    nowFormatted
  );

  const isSensorNA =
    tempInt === null ||
    event.tempExterior === null ||
    event.humedadExterior === null ||
    event.estadoTapa === "N/A" ||
    bat === null;

  await manageAnomalyLifecycle(
    colmenarId,
    "N/A",
    isSensorNA,
    "Alerta Sensor Sin Señal (N/A)",
    "Pérdida de conectividad en uno o más sensores del nodo ESP32",
    nowIso,
    nowFormatted
  );

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

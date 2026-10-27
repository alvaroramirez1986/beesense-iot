/**
 * ============================================================================
 * AWS LAMBDA 2: API REST PARA CONSUMO DESDE EL FRONT-END EN AMAZON S3
 * ============================================================================
 * Nombre sugerido: BeeSense-API-Reader-Handler
 * Expone rutas en Amazon API Gateway con cabeceras CORS habilitadas:
 *  - GET   /telemetry -> Última lectura e historial cada 10 minutos
 *  - GET   /events    -> Historial de eventos con fecha de inicio y término
 *  - POST  /events    -> Registro de nuevo evento
 *  - PATCH /events/{id} -> Actualización de fecha y hora de término
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_TELEMETRIA = process.env.TABLE_TELEMETRIA || "BeeSense_Telemetria";
const TABLE_EVENTOS = process.env.TABLE_EVENTOS || "BeeSense_Eventos";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PATCH",
  "Content-Type": "application/json",
};

export const handler = async (event) => {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const path = event.path || event.rawPath || "";

  if (method === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  try {
    const colmenarId =
      event.queryStringParameters?.colmenarId || "COLMENAR-NORTE-01";

    // 1. GET /telemetry
    if (method === "GET" && path.endsWith("/telemetry")) {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_TELEMETRIA,
          KeyConditionExpression: "colmenarId = :cid",
          ExpressionAttributeValues: { ":cid": colmenarId },
          ScanIndexForward: false,
          Limit: 1,
        })
      );

      const latest = result.Items?.[0] || null;
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(latest),
      };
    }

    // 2. GET /events
    if (method === "GET" && path.endsWith("/events")) {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_EVENTOS,
          KeyConditionExpression: "colmenarId = :cid",
          ExpressionAttributeValues: { ":cid": colmenarId },
          ScanIndexForward: false,
          Limit: 100,
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ items: result.Items || [] }),
      };
    }

    // 3. POST /events
    if (method === "POST" && path.endsWith("/events")) {
      const body = JSON.parse(event.body || "{}");
      await docClient.send(
        new PutCommand({
          TableName: TABLE_EVENTOS,
          Item: {
            colmenarId: body.colmenarId || colmenarId,
            id: body.id || `EVT-${Date.now()}`,
            nombreColmenar: body.nombreColmenar || "Colmenar Principal - Sede PAO",
            tipoEvento: body.tipoEvento,
            titulo: body.titulo,
            detalle: body.detalle,
            fechaInicio: body.fechaInicio,
            fechaTermino: body.fechaTermino || "En curso (Activa)",
            isoDate: body.isoDate,
            horaInicio24: body.horaInicio24,
            estadoEvento: body.estadoEvento || "ACTIVO",
          },
        })
      );

      return {
        statusCode: 201,
        headers: CORS_HEADERS,
        body: JSON.stringify({ saved: true }),
      };
    }

    // 4. PATCH /events/{id}
    if (method === "PATCH" && path.includes("/events/")) {
      const eventId = path.split("/events/")[1];
      const body = JSON.parse(event.body || "{}");

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_EVENTOS,
          Key: {
            colmenarId: body.colmenarId || colmenarId,
            id: decodeURIComponent(eventId),
          },
          UpdateExpression: "SET fechaTermino = :ft, estadoEvento = :est",
          ExpressionAttributeValues: {
            ":ft": body.fechaTermino,
            ":est": body.estadoEvento || "FINALIZADO",
          },
        })
      );

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ updated: true }),
      };
    }

    return {
      statusCode: 404,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: "Ruta no encontrada" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

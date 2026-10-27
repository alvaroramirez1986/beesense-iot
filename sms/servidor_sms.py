"""
============================================================================
MICRO-SERVIDOR PUENTE DE ALERTAS SMS PARA LA APLICACIÓN WEB BEESENSE IoT
============================================================================
Ejecución:
  python3 sms/servidor_sms.py

Propósito:
- Permite que la aplicación web (React / Live Preview) dispare el envío real
  del SMS cuando se detecta que la tapa de la colmena está ABIERTA.
- Protege la clave `VD_API_KEY` y el teléfono `VD_TELEFONO` en el servidor
  leyéndolos desde `.env`, sin exponerlos jamás en el navegador ni en GitHub.
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from enviar_sms import cargar_variables_entorno, enviar_alerta_sms, enmascarar_telefono

cargar_variables_entorno()
PORT = int(os.environ.get("VD_PORT", "8765"))


class SmsBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

    def do_OPTIONS(self):
        self._send_cors_headers(200)

    def do_GET(self):
        if self.path.startswith("/api/sms/health"):
            cargar_variables_entorno()
            configured = bool(os.environ.get("VD_API_KEY") and os.environ.get("VD_TELEFONO"))
            telefono_masked = enmascarar_telefono(os.environ.get("VD_TELEFONO", ""))
            self._send_cors_headers(200)
            self.wfile.write(
                json.dumps(
                    {
                        "ok": True,
                        "service": "BeeSense SMS Bridge",
                        "configured": configured,
                        "telefonoMasked": telefono_masked,
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
            )
            return

        self._send_cors_headers(404)
        self.wfile.write(json.dumps({"ok": False, "error": "Ruta no encontrada"}).encode("utf-8"))

    def do_POST(self):
        if self.path.startswith("/api/sms/send"):
            length = int(self.headers.get("Content-Length", "0"))
            raw_body = self.rfile.read(length).decode("utf-8") if length > 0 else "{}"
            try:
                payload = json.loads(raw_body)
            except json.JSONDecodeError:
                payload = {}

            colmenar = payload.get("nombreColmenar", "Colmenar Principal - Sede PAO")
            mensaje_personalizado = payload.get(
                "mensaje",
                f"ALERTA!!! Tapa de colmena abierta ({colmenar})",
            )

            resultado = enviar_alerta_sms(
                mensaje=mensaje_personalizado,
                consultar_estado=False,
            )

            http_code = 200 if resultado.get("ok") else 502
            self._send_cors_headers(http_code)
            self.wfile.write(
                json.dumps(
                    {
                        "ok": resultado.get("ok", False),
                        "status": resultado.get("status"),
                        "messageId": resultado.get("messageId"),
                        "telefonoMasked": resultado.get("telefonoMasked"),
                        "mensaje": resultado.get("mensaje"),
                    },
                    ensure_ascii=False,
                ).encode("utf-8")
            )
            return

        self._send_cors_headers(404)
        self.wfile.write(json.dumps({"ok": False, "error": "Ruta no encontrada"}).encode("utf-8"))


if __name__ == "__main__":
    print(f"[BeeSense SMS] Servidor puente activo en http://localhost:{PORT}")
    print("[BeeSense SMS] Credenciales cargadas de forma segura desde .env (ocultas del navegador).")
    server = HTTPServer(("0.0.0.0", PORT), SmsBridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[BeeSense SMS] Servidor detenido.")
        server.server_close()

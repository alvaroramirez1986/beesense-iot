"""
============================================================================
MÓDULO DE ENVÍO DE ALERTAS SMS - BEESENSE IoT (VozDigital API)
============================================================================
Seguridad:
- La API Key real (VD_API_KEY) y el número de teléfono destino (VD_TELEFONO)
  se cargan exclusivamente desde variables de entorno o desde el archivo
  privado `.env` (ignorado por Git mediante `.gitignore`).
- Ninguna credencial sensible está expuesta en el código fuente.
"""

import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request

BASE_URL = "https://portal.vozdigital.net/api/v1"


def cargar_variables_entorno():
    """Carga variables desde `.env` en el directorio actual o raíz del proyecto."""
    rutas_candidatas = [
        pathlib.Path(__file__).resolve().parent / ".env",
        pathlib.Path(__file__).resolve().parent.parent / ".env",
    ]
    for ruta in rutas_candidatas:
        if ruta.is_file():
            try:
                for linea in ruta.read_text(encoding="utf-8").splitlines():
                    linea = linea.strip()
                    if not linea or linea.startswith("#") or "=" not in linea:
                        continue
                    clave, valor = linea.split("=", 1)
                    clave = clave.strip()
                    valor = valor.strip().strip('"').strip("'")
                    if clave and clave not in os.environ:
                        os.environ[clave] = valor
            except Exception:
                pass


cargar_variables_entorno()

# ============ PARÁMETROS DESDE ENTORNO SEGURO (.env) ============
API_KEY = os.environ.get("VD_API_KEY", "")
TELEFONO = os.environ.get("VD_TELEFONO", "")
MENSAJE = os.environ.get(
    "VD_MENSAJE",
    "ALERTA!!! Tapa de colmena abierta - Colmenar Principal - Sede PAO",
)
CONSULTAR_ESTADO = True  # consulta el estado después de enviar en modo CLI
# ================================================================


def enmascarar_telefono(telefono: str) -> str:
    """Enmascara el número telefónico para mostrarlo de forma segura en logs y UI."""
    limpio = str(telefono or "").strip()
    if len(limpio) <= 4:
        return "****"
    return f"+{limpio[:3]} **** {limpio[-4:]}"


def llamar_api(metodo, ruta, body=None, api_key=None):
    clave = api_key or os.environ.get("VD_API_KEY") or API_KEY
    if not clave:
        return 401, {"success": False, "error": "Falta configurar VD_API_KEY en el archivo .env"}

    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(
        BASE_URL + ruta,
        data=data,
        method=metodo,
        headers={"X-API-Key": clave, "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        texto = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(texto)
        except json.JSONDecodeError:
            return e.code, {"raw": texto}
    except Exception as exc:
        return 500, {"success": False, "error": str(exc)}


def enviar_alerta_sms(telefono=None, mensaje=None, consultar_estado=False):
    """
    Envía un SMS real mediante la API de VozDigital utilizando las credenciales
    protegidas en `.env` y retorna un diccionario con el resultado.
    """
    cargar_variables_entorno()
    destino = telefono or os.environ.get("VD_TELEFONO") or TELEFONO
    texto = mensaje or os.environ.get("VD_MENSAJE") or MENSAJE

    if not destino:
        return {
            "ok": False,
            "status": 400,
            "error": "Falta definir VD_TELEFONO en el archivo .env",
        }

    status, resp = llamar_api(
        "POST",
        "/sms/send",
        {"phone_number": destino, "message": texto},
    )

    exito = status == 200 and bool(resp.get("success"))
    message_id = resp.get("data", {}).get("message_id") if isinstance(resp.get("data"), dict) else None
    estado_entrega = None

    if exito and consultar_estado and message_id:
        time.sleep(5)
        _, estado_entrega = llamar_api("GET", f"/sms/{message_id}")

    return {
        "ok": exito,
        "status": status,
        "messageId": message_id,
        "telefonoMasked": enmascarar_telefono(destino),
        "mensaje": texto,
        "response": resp,
        "deliveryCheck": estado_entrega,
    }


def main():
    telefono = sys.argv[1] if len(sys.argv) > 1 else TELEFONO
    mensaje = sys.argv[2] if len(sys.argv) > 2 else MENSAJE

    if not API_KEY:
        sys.exit("Falta la API key: define la variable VD_API_KEY en el archivo .env (nunca en el código).")

    if not telefono:
        sys.exit("Falta el número de destino: define VD_TELEFONO en el archivo .env o pásalo por argumento.")

    print(f"Enviando SMS a {enmascarar_telefono(telefono)}: {mensaje!r}")
    resultado = enviar_alerta_sms(
        telefono=telefono,
        mensaje=mensaje,
        consultar_estado=CONSULTAR_ESTADO,
    )
    print(f"HTTP {resultado['status']}")
    print(json.dumps(resultado["response"], indent=2, ensure_ascii=False))

    if not resultado["ok"]:
        sys.exit(1)

    if resultado.get("deliveryCheck"):
        print("\nEstado tras 5 s:")
        print(json.dumps(resultado["deliveryCheck"], indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()

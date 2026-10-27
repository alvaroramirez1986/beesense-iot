#!/usr/bin/env bash
# ============================================================================
# SCRIPT SEGURO DE DESPLIEGUE A AMAZON S3 - BEESENSE IoT
# ============================================================================
# Uso:
#   ./deploy-s3.sh nombre-de-tu-bucket-s3
#
# Garantías de Seguridad:
# 1. Jamás sube la raíz del proyecto: solo sube la carpeta pública del Front-end
#    (`dist/` si compilaste con Vite, o `live-preview-deploy/`).
# 2. Escanea la carpeta antes de subirla a AWS S3 y aborta si detecta
#    cualquier clave `vd_...` o archivo `.env`.
# 3. Aplica filtros explícitos `--exclude` en AWS CLI para bloquear archivos
#    de configuración, scripts Python y backend.

set -euo pipefail

BUCKET_NAME="${1:-}"
if [ -z "$BUCKET_NAME" ]; then
  echo "Uso: ./deploy-s3.sh <nombre-de-tu-bucket-s3>"
  echo "Ejemplo: ./deploy-s3.sh beesense-iot-web-2026"
  exit 1
fi

# Seleccionar carpeta de compilación estática segura
if [ -d "dist" ]; then
  SOURCE_DIR="dist"
else
  SOURCE_DIR="live-preview-deploy"
  # Asegurar que los assets estáticos estén sincronizados en live-preview-deploy
  mkdir -p "$SOURCE_DIR/public"
  cp -r public/assets "$SOURCE_DIR/public/" 2>/dev/null || true
fi

echo "🔍 [1/3] Auditando carpeta '$SOURCE_DIR/' antes de subir a S3..."

if grep -rnE "vd_[a-fA-F0-9]{24,}" "$SOURCE_DIR/"; then
  echo "❌ ABORTADO: Se detectó una API Key privada dentro de '$SOURCE_DIR/'."
  exit 1
fi

if find "$SOURCE_DIR" -name ".env*" | grep -q .; then
  echo "❌ ABORTADO: Se encontró un archivo .env dentro de '$SOURCE_DIR/'."
  exit 1
fi

echo "✅ Auditoría superada: Cero credenciales ni archivos .env en '$SOURCE_DIR/'."
echo "🚀 [2/3] Sincronizando únicamente archivos web públicos hacia s3://$BUCKET_NAME ..."

aws s3 sync "$SOURCE_DIR/" "s3://$BUCKET_NAME" \
  --delete \
  --exclude ".env*" \
  --exclude "*.py" \
  --exclude "*.sh" \
  --exclude ".git/*" \
  --exclude "sms/*" \
  --exclude "backend-aws/*" \
  --exclude "firmware-esp32/*"

echo "✅ [3/3] Despliegue seguro finalizado en s3://$BUCKET_NAME"

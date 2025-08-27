#!/bin/bash
set -euo pipefail

# === Configuración ===
DEFAULT_APK_PATH="./android/app/build/outputs/apk/release/app-release.apk"  # Ruta fija por defecto
APK_FILE="${1:-$DEFAULT_APK_PATH}"               # 1er argumento = ruta del APK
PORT="${2:-8080}"                                # 2º argumento = puerto (por defecto 8080)
# Usar variable de entorno o valor por defecto
BASIC_AUTH="${BASIC_AUTH:-admin:utilityapp}"         # export BASIC_AUTH="usuario:clave" para personalizar
QR_CMD=$(command -v qrencode || true)            # Para mostrar QR si está disponible

# === Validaciones ===
if [ ! -f "$APK_FILE" ]; then
  echo "❌ No se encontró el archivo: $APK_FILE"
  exit 1
fi
command -v python3 >/dev/null 2>&1 || { echo "Instala Python3 primero"; exit 1; }
command -v ngrok >/dev/null 2>&1   || { echo "Instala ngrok (https://ngrok.com/download)"; exit 1; }

# === Preparar directorio temporal ===
TMP_DIR="$(mktemp -d)"
APK_BASENAME="$(basename "$APK_FILE")"
cp "$APK_FILE" "$TMP_DIR/$APK_BASENAME"

cleanup() {
  echo -e "\n🧹 Cerrando servidor y ngrok…"
  [[ -n "${SERVER_PID:-}" ]] && kill "$SERVER_PID" 2>/dev/null || true
  [[ -n "${NGROK_PID:-}"  ]] && kill "$NGROK_PID"  2>/dev/null || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

# === Iniciar servidor HTTP ===
cd "$TMP_DIR"
echo "🚀 Servidor HTTP en puerto $PORT …"
python3 -m http.server "$PORT" >/dev/null 2>&1 &
SERVER_PID=$!

# === Iniciar ngrok ===
echo "🌐 Iniciando ngrok con autenticación básica ($BASIC_AUTH)…"
NGROK_ARGS=(http "$PORT")
# Siempre aplicar basic auth (puedes cambiar esta condición si quieres hacerla opcional)
if [ -n "$BASIC_AUTH" ]; then
  NGROK_ARGS+=(--basic-auth "$BASIC_AUTH")
fi

ngrok "${NGROK_ARGS[@]}" >/dev/null 2>&1 &
NGROK_PID=$!

# === Obtener URL pública desde API local de ngrok ===
PUBLIC_URL=""
for i in {1..40}; do
  PUBLIC_URL="$(curl -s http://127.0.0.1:4040/api/tunnels \
    | python3 -c 'import sys,json;
data=json.load(sys.stdin);
print(next((t["public_url"] for t in data.get("tunnels",[]) if t.get("public_url","").startswith("https")), "",))' \
    2>/dev/null || true)"
  [ -n "$PUBLIC_URL" ] && break
  sleep 0.25
done

if [ -z "$PUBLIC_URL" ]; then
  echo "❌ No se pudo obtener la URL pública de ngrok."
  echo "Revisa tu authtoken con: ngrok config add-authtoken <TU_TOKEN>"
  exit 1
fi

# === Mostrar información ===
DOWNLOAD_URL="$PUBLIC_URL/$APK_BASENAME"
echo
echo "✅ APK disponible en:"
echo "$DOWNLOAD_URL"
echo "🔐 Usuario: admin | Contraseña: utilityapp (o personalizada con BASIC_AUTH)"
echo

# === Mostrar QR si está disponible ===
if [ -n "$QR_CMD" ]; then
  echo "📱 Escanea este QR desde tu móvil:"
  qrencode -t ANSIUTF8 "$DOWNLOAD_URL"
else
  echo "ℹ️ Instala 'qrencode' para mostrar un QR (Linux: sudo apt install qrencode)"
fi

echo
echo "ℹ️ Presiona Ctrl+C para cerrar el servidor y eliminar archivos temporales."
wait

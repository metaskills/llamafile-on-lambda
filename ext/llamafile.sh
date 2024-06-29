#!/bin/sh
set -euo pipefail

# Extension name
EXTENSION_NAME="llamafile"

# llamafile path
LLAMAFILE_PATH=$(find "/opt/extensions/${EXTENSION_NAME}" -name "*.llamafile" -type f)

# Function to register the extension
register_extension() {
  curl -sS -X POST "http://${AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension/register" \
    -H "Lambda-Extension-Name: ${EXTENSION_NAME}" \
    -d "{ \"events\": [\"INVOKE\"] }"
}

# Function to start the llamafile process
start_llamafile() {
  HOME=/tmp $LLAMAFILE_PATH \
    --nobrowser \
    --log-disable \
    --host 127.0.0.1 \
    --port 8080 &
  LLAMAFILE_PID=$!
}

# Function to process events
process_events() {
  while true; do
    HEADERS=$(mktemp)
    EVENT_DATA=$(curl -sS -X GET "http://${AWS_LAMBDA_RUNTIME_API}/2020-01-01/extension/event/next" \
      -H "Lambda-Extension-Name: ${EXTENSION_NAME}" \
      -D "${HEADERS}")
    
    EVENT_TYPE=$(grep -Fi Lambda-Extension-Event-Identifier "${HEADERS}" | tr -d '[:space:]' | cut -d: -f2)
    
    if [ "${EVENT_TYPE}" = "INVOKE" ]; then
      # llamafile is already running, no need to do anything for INVOKE
      :
    fi
  done
}

# Main execution
echo "Starting llamafile extension"
register_extension
start_llamafile
process_events

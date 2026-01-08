#!/bin/bash

# Start Treasurer application in Google Chrome with file access enabled
# This script opens Chrome with the necessary flags to allow local file access

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UX_FILE="${SCRIPT_DIR}/ux.html"

# Check if ux.html exists
if [ ! -f "$UX_FILE" ]; then
    echo "Error: ux.html not found at $UX_FILE"
    exit 1
fi

# Open Chrome with file access enabled and load ux.html
open -a "Google Chrome" --args --allow-file-access-from-files "$UX_FILE"

echo "Opening Treasurer application in Chrome..."
echo "File: $UX_FILE"

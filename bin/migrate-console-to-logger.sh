#!/bin/bash

# Frontend Console to Logger Migration Helper
# 
# Usage:
#   ./migrate-console-to-logger.sh [file_path]
#
# This script helps find all console.* usage in the frontend

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"

echo "🔍 Frontend Logger Migration Helper"
echo "===================================="
echo ""

# Check if a file is provided
if [ -n "$1" ]; then
  FILE="$1"
  echo "📄 Checking file: $FILE"
  echo ""
  grep -n "console\." "$FILE" || echo "✅ No console calls found"
  exit 0
fi

# Find all files with console usage
echo "🔎 Finding all console.* usage in frontend..."
echo ""

cd "$FRONTEND_DIR"

# Count total console calls
TOTAL=$(grep -r "console\." src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l || echo 0)
echo "📊 Total console calls found: $TOTAL"
echo ""

# List files with console calls
echo "📁 Files with console calls:"
echo "----------------------------"
grep -r "console\." src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | while read -r file; do
  count=$(grep "console\." "$file" | wc -l)
  echo "  [$count] $file"
done

echo ""
echo "💡 Migration Tips:"
echo "----------------------------"
echo "1. Add import: import { createLogger } from '@/lib/logger'"
echo "2. Create logger: const log = createLogger('ComponentName')"
echo "3. Replace:"
echo "   - console.log → log.debug or log.info"
echo "   - console.error → log.error"
echo "   - console.warn → log.warn"
echo "4. Format data: log.info('message', { data })"
echo ""
echo "📖 See docs/LOGGER_MIGRATION.md for detailed guide"

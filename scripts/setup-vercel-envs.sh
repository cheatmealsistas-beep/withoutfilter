#!/bin/bash
# ===========================================
# Setup Vercel Environment Variables
# ===========================================
# Run: chmod +x scripts/setup-vercel-envs.sh && ./scripts/setup-vercel-envs.sh

echo "🔧 Configurando variables de entorno en Vercel..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI no está instalado."
    echo "   Instálalo con: npm i -g vercel"
    exit 1
fi

# ===========================================
# PREVIEW (DEV) - rama dev y PRs
# ===========================================
echo "📦 Configurando PREVIEW (DEV)..."

vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://klqgdxvwfqtkcdkiangk.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWdkeHZ3ZnF0a2Nka2lhbmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTg3MzQsImV4cCI6MjA4MDg3NDczNH0.XX2M2OY32OYavvSLylqTw8FK3-YEp4Qgw7z3TVpF_68"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtscWdkeHZ3ZnF0a2Nka2lhbmdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI5ODczNCwiZXhwIjoyMDgwODc0NzM0fQ.SnAvW-IByvrHAq-SPUMG9LbbREx54rOyXl02BiAwIcw"

echo ""
echo "✅ Variables de PREVIEW configuradas"
echo ""

# ===========================================
# PRODUCTION - rama main
# ===========================================
echo "📦 Configurando PRODUCTION..."

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://urihxaqiylrawlbvczsy.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyaWh4YXFpeWxyYXdsYnZjenN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTg4MzUsImV4cCI6MjA4MDg3NDgzNX0.z2Zq_UetUN9ZeTR4_CTOzowtpA_QNeNGOrbXaxb3QIk"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyaWh4YXFpeWxyYXdsYnZjenN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI5ODgzNSwiZXhwIjoyMDgwODc0ODM1fQ.Z3FMUzdvLGwXgnzmKXtnNC6_8-Ua7mGxRlaodyhraog"

echo ""
echo "✅ Variables de PRODUCTION configuradas"
echo ""
echo "========================================"
echo "✅ Configuración completada!"
echo ""
echo "Ahora redeploya para aplicar los cambios:"
echo "  vercel --prod     # para production"
echo "  git push origin dev  # para preview"
echo "========================================"

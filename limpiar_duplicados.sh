#!/bin/bash
# Script de limpieza — ShellTI
# Elimina archivos HTML duplicados de la raíz que deben vivir en recursos/
# Ejecutar desde ~/Desktop/Desarrollo/shellti/

cd ~/Desktop/Desarrollo/shellti

echo "=== Verificando estructura ==="
echo ""

# Archivos que DEBEN estar solo en recursos/ (no en raíz)
MOVER_A_RECURSOS=(
  "anci.html"
  "blog.html"
  "cis-controls.html"
  "iso-27001.html"
  "ley-21719.html"
  "news.html"
  "nist-csf-2-0.html"
  "owasp.html"
  "proteccion-datos.html"
)

for f in "${MOVER_A_RECURSOS[@]}"; do
  if [ -f "$f" ] && [ -f "recursos/$f" ]; then
    echo "ELIMINANDO duplicado en raíz: $f"
    rm "$f"
  elif [ -f "$f" ] && [ ! -f "recursos/$f" ]; then
    echo "MOVIENDO a recursos/: $f"
    mv "$f" "recursos/$f"
  else
    echo "OK (solo en recursos/): $f"
  fi
done

echo ""
echo "=== Eliminando archivos temporales de Office ==="
find recursos/ -name "~\$*.xlsx" -o -name "~\$*.docx" | while read f; do
  echo "ELIMINANDO temp: $f"
  rm "$f"
done

echo ""
echo "=== Estructura final raíz ==="
ls *.html 2>/dev/null

echo ""
echo "=== Estructura final recursos/ ==="
ls recursos/*.html 2>/dev/null

echo ""
echo "=== Git status ==="
git status

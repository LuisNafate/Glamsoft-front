# Script para agregar custom-modal.css y custom-modal.js a todos los archivos HTML de admin

$files = @(
    "html\admin\servicios.html",
    "html\admin\estilistas.html",
    "html\admin\confirmaciones.html",
    "html\admin\portafolio.html",
    "html\admin\comentarios.html",
    "html\admin\formularios.html",
    "html\admin\promociones.html",
    "html\admin\calendario.html",
    "html\admin\reportes.html"
)

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file

    if (Test-Path $filePath) {
        Write-Host "Procesando: $file" -ForegroundColor Cyan

        $content = Get-Content $filePath -Raw -Encoding UTF8

        # Agregar CSS si no existe
        if ($content -notmatch 'custom-modal\.css') {
            Write-Host "  - Agregando custom-modal.css" -ForegroundColor Yellow
            $content = $content -replace '(<link rel="stylesheet" href="\.\.\/\.\.\/Css\/admin\/admin-global\.css">)', "`$1`n    <link rel=""stylesheet"" href=""../../Css/modals/custom-modal.css"">"
        } else {
            Write-Host "  - custom-modal.css ya existe" -ForegroundColor Green
        }

        # Agregar JS si no existe
        if ($content -notmatch 'custom-modal\.js') {
            Write-Host "  - Agregando custom-modal.js" -ForegroundColor Yellow
            # Buscar la línea antes del script principal (antes de js/admin/*.js)
            $content = $content -replace '(<script src="\.\.\/\.\.\/js\/admin\/)', "    <script src=""../../utils/custom-modal.js""></script>`n    `$1"
        } else {
            Write-Host "  - custom-modal.js ya existe" -ForegroundColor Green
        }

        # Guardar archivo
        Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Completado" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Archivo no encontrado: $filePath" -ForegroundColor Red
    }
}

Write-Host "`nProceso completado!" -ForegroundColor Green
Write-Host "Archivos actualizados: $($files.Count)" -ForegroundColor Cyan

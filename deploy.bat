@echo off
REM ===========================
REM BAT para Git + Firebase Deploy
REM ===========================

REM Ir a la carpeta del proyecto
cd /d "D:\Projects\NextLuxeInnovations LLC"

REM Confirmar que estás en la carpeta correcta
echo Carpeta actual:
cd

REM ===========================
REM Agregar todos los cambios excepto carpetas o archivos que no quieras subir
REM ===========================
REM Por ejemplo, si quieres ignorar una carpeta llamada "private", usa:
REM git add --all -- :!private
git add .

REM ===========================
REM Preguntar por el mensaje del commit
REM ===========================
set /p COMMIT_MSG=Ingresa el mensaje del commit: 

REM ===========================
REM Hacer commit si hay cambios
REM ===========================
git diff-index --quiet HEAD
if %errorlevel%==1 (
    git commit -m "%COMMIT_MSG%"
) else (
    echo No hay cambios para commitear.
)

REM ===========================
REM Subir a GitHub
REM ===========================
git push origin main

REM ===========================
REM Deploy a Firebase Hosting
REM ===========================
REM Asegúrate que tus archivos estén directamente en la carpeta 'public'
firebase deploy --only hosting --project nextluxe-innovations-llc

echo Deploy finalizado.
pause

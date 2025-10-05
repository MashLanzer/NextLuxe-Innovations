@echo off
REM ==================================================
REM Script para automatizar Git Commit, Push y Firebase Deploy
REM ==================================================

REM Titulo de la ventana de la consola
TITLE Asistente de Despliegue - NextLuxe Innovations LLC

REM Ir a la carpeta del proyecto
cd /d "D:\Projects\NextLuxeInnovations LLC"

REM Confirmar que estas en la carpeta correcta
echo.
echo Estas trabajando en la carpeta:
cd
echo.

REM ==================================================
REM Paso 1: Agregar cambios a Git
REM ==================================================
REM Agrega todos los cambios. Puedes anadir excepciones si es necesario.
REM Ejemplo para ignorar una carpeta: git add --all -- :!carpeta_privada
git add .
echo.
echo -> Archivos preparados para el commit.

REM ==================================================
REM Paso 2: Realizar el Commit
REM ==================================================
REM Preguntar por el mensaje del commit
set /p COMMIT_MSG=Ingresa el mensaje del commit y presiona Enter: 

REM Hacer commit solo si hay cambios pendientes
git diff-index --quiet HEAD
if %errorlevel%==1 (
    git commit -m "%COMMIT_MSG%"
    echo -> Commit realizado con el mensaje: "%COMMIT_MSG%"
) else (
    echo -> No hay cambios para commitear. Todo esta al dia.
)
echo.

REM ==================================================
REM Paso 3: Subir cambios a GitHub
REM ==================================================
echo Subiendo cambios a GitHub (rama main)...
git push origin main
echo -> Cambios subidos a GitHub correctamente.
echo.

REM ==================================================
REM Paso 4: Construir el proyecto para produccion (NUEVO)
REM ==================================================
echo Construyendo la version de produccion...
REM Este comando compila tu codigo fuente (React, Vue, Angular, etc.)
REM y genera los archivos estaticos en la carpeta 'public' o 'dist'.
npm run build
echo -> Proyecto construido exitosamente.
echo.

REM ==================================================
REM Paso 5: Desplegar a Firebase Hosting
REM ==================================================
echo Desplegando la nueva version a Firebase...
REM Asegurate que la carpeta 'public' en firebase.json sea la correcta.
firebase deploy --only hosting --project nextluxe-innovations-llc
echo.

REM ==================================================
REM Finalizacion
REM ==================================================
echo.
echo =================================
echo   PROCESO DE DEPLOY FINALIZADO
echo =================================
echo.
pause

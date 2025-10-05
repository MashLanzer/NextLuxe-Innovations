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
git add .
echo.
echo -^> Archivos preparados para el commit.

REM ==================================================
REM Paso 2: Realizar el Commit
REM ==================================================
set /p COMMIT_MSG=Ingresa el mensaje del commit y presiona Enter: 

REM Comprobacion mejorada que ignora cambios de fin de linea
git diff-index --quiet --ignore-cr-at-eol HEAD
if %errorlevel%==1 (
    git commit -m "%COMMIT_MSG%"
    echo -^> Commit realizado con el mensaje: "%COMMIT_MSG%"
) else (
    echo -^> No hay cambios reales para commitear. Todo esta al dia.
)
echo.

REM ==================================================
REM Paso 3: Subir cambios a GitHub
REM ==================================================
echo Subiendo cambios a GitHub (rama main)...
git push origin main
echo -^> Cambios subidos a GitHub correctamente.
echo.

REM ==================================================
REM Paso 4: Desplegar a Firebase Hosting
REM ==================================================
echo Desplegando la nueva version a Firebase...
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

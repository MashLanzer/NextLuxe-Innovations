@echo off
REM Ir a la carpeta del proyecto
cd /d "D:\Projects\NextLuxeInnovations LLC"

REM Agregar todos los cambios
git add .

REM Preguntar por el mensaje del commit
set /p COMMIT_MSG=Ingresa el mensaje del commit: 

REM Hacer commit con el mensaje ingresado
git commit -m "%COMMIT_MSG%"

REM Subir a GitHub
git push origin main

REM Deploy a Firebase Hosting
firebase deploy --only hosting

pause

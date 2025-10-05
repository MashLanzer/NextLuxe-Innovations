@echo off
:: =================================================================
:: SCRIPT DE DESPLIEGUE INTELIGENTE v2.0
:: Autor: Manus AI
:: Proyecto: NextLuxe Innovations LLC
:: =================================================================

:: --- CONFIGURACION ---
set "PROJECT_PATH=D:\Projects\NextLuxeInnovations LLC"
set "GIT_BRANCH=main"
set "FIREBASE_PROJECT=nextluxe-innovations-llc"

:: --- INICIO DEL PROCESO ---
TITLE Asistente de Despliegue Inteligente - %FIREBASE_PROJECT%
color 0A
cls

echo.
echo  =================================================================
echo    ASISTENTE DE DESPLIEGUE PARA NEXTLUXE INNOVATIONS LLC
echo  =================================================================
echo.
echo  [INFO] Me asegurare de que todo este en orden antes de desplegar.
echo.
pause
cls

:: --- PASO 1: NAVEGACION Y COMPROBACION DE CAMBIOS ---
echo  =================================================================
echo    PASO 1 de 5: Comprobando cambios en el proyecto...
echo  =================================================================
echo.
cd /d "%PROJECT_PATH%"
echo  [ACCION] Me he movido a la carpeta del proyecto: %PROJECT_PATH%
echo.
echo  [ACCION] Voy a anadir todos los archivos nuevos o modificados a Git.
git add .
echo.
echo  [DECISION] Ahora, voy a comprobar si realmente hay cambios para guardar.
echo  (Ignorare diferencias de formato de linea para evitar commits vacios).
echo.

git diff-index --quiet --ignore-cr-at-eol HEAD
if %errorlevel%==1 (
    echo  [RESULTADO] He detectado cambios. Continuare con el proceso de commit.
    goto :COMMIT_CHANGES
) else (
    echo  [RESULTADO] No he encontrado ningun cambio real en los archivos.
    echo  Tu proyecto ya esta sincronizado.
    goto :CHECK_DEPLOY
)
echo.
pause
cls

:: --- PASO 2: COMMIT DE CAMBIOS ---
:COMMIT_CHANGES
echo  =================================================================
echo    PASO 2 de 5: Guardando los cambios (Commit)
echo  =================================================================
echo.
set /p COMMIT_MSG= [PREGUNTA] Por favor, describe los cambios realizados: 
echo.
echo  [ACCION] Realizando commit con el mensaje: "%COMMIT_MSG%"
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] El commit ha fallado. Abortando el proceso.
    color 0C
    goto :END
)
echo  [RESULTADO] Cambios guardados localmente con exito.
echo.
pause
cls

:: --- PASO 3: SUBIDA A GITHUB ---
:PUSH_TO_GITHUB
echo  =================================================================
echo    PASO 3 de 5: Sincronizando con GitHub...
echo  =================================================================
echo.
echo  [ACCION] Voy a subir los nuevos commits a la rama '%GIT_BRANCH%' en GitHub.
git push origin %GIT_BRANCH%
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] La subida a GitHub ha fallado. Comprueba tu conexion o credenciales.
    color 0C
    goto :END
)
echo  [RESULTADO] Repositorio de GitHub actualizado correctamente.
echo.
pause
cls

:: --- PASO 4: CONSTRUCCION DEL PROYECTO ---
:BUILD_PROJECT
echo  =================================================================
echo    PASO 4 de 5: Construyendo la version de produccion...
echo  =================================================================
echo.
echo  [ACCION] Voy a ejecutar 'npm run build' para compilar la version final del sitio.
echo  Este paso es crucial para que tus cambios se puedan ver online.
npm run build
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] El proceso de 'build' ha fallado. Revisa los errores en la consola.
    color 0C
    goto :END
)
echo  [RESULTADO] Proyecto construido con exito. Los archivos finales estan listos.
echo.
pause
cls

:: --- PASO 5: DESPLIEGUE A FIREBASE ---
:CHECK_DEPLOY
echo  =================================================================
echo    PASO 5 de 5: Despliegue a Firebase Hosting
echo  =================================================================
echo.
echo  [ADVERTENCIA] Estas a punto de desplegar una nueva version en el sitio:
echo  %FIREBASE_PROJECT%
echo.
set /p DEPLOY_CONFIRM= [PREGUNTA] ¿Estas seguro de que quieres continuar? (S/N): 
if /i not "%DEPLOY_CONFIRM%"=="S" (
    echo.
    echo  [INFO] Despliegue cancelado por el usuario.
    goto :END
)

echo.
echo  [ACCION] Confirmado. Desplegando a Firebase... ¡Alla vamos!
firebase deploy --only hosting --project %FIREBASE_PROJECT%
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] El despliegue a Firebase ha fallado.
    color 0C
    goto :END
)
echo  [RESULTADO] ¡Despliegue completado con exito!
echo.

:: --- FINALIZACION ---
:END
color 0A
echo.
echo  =================================================================
echo    PROCESO FINALIZADO.
echo  =================================================================
echo.
pause

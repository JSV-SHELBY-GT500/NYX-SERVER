@echo off
set API_KEY=AIzaSyACyR7Mvz9pXKErBD8sQd49aTth9Z83cNo
set NYX_SERVER_URL=https://nyx-server-836530719163.us-west1.run.app

echo.
echo ===========================================
echo  Iniciando conexion con servidor de NyxOS...
echo ===========================================
echo.

:: Inicia el servidor local (simulando la conexión)
:: En un proyecto real, aquí iria la logica para mandar la peticion a la API

echo Conectando a %NYX_SERVER_URL%
echo Usando API Key: %API_KEY%

:: Comando para simular el envio de la peticion
curl -X POST %NYX_SERVER_URL%/api/nyx -H "Content-Type: application/json" -d "{\"api_key\": \"%API_KEY%\", \"prompt\": \"Conexion exitosa.\"}"

echo.
echo ===========================================
echo  NyxOS iniciado correctamente.
echo ===========================================
echo.

pause
# Conectar SAMPLAST a la base privada de Google Sheets

## Antes de empezar

El archivo ya debe existir en tu Drive, con nombre **BASE DE DATOS SAMPLAST**, hojas **Historial** y **Clientes** y los encabezados de la plantilla. No lo compartas públicamente.

La aplicación actual conserva el guardado PDF. La sincronización usa Google Identity Services y Google Picker, con el único permiso `https://www.googleapis.com/auth/drive.file`. El token permanece en memoria de la pestaña y no se guarda en GitHub ni localStorage. La clave de Picker y el ID OAuth son parámetros de cliente; nunca introduzcas secretos OAuth, contraseñas ni tokens. Los datos salen directamente del navegador a Google Sheets.

## 1. Acceso seguro y respaldo

- Si usas HTMLPreview, abre el apartado «Historial y base de datos en Drive», pulsa «Exportar respaldo de clientes» y guarda el JSON en tu PC. Los clientes añadidos en HTMLPreview están asociados a ese origen.
- Usa la aplicación en tu propio GitHub Pages: https://merelok0.github.io/certificados-samplast/ (solo si está publicada), o descarga el repositorio y abre `ABRIR_CERTIFICADO.bat` para usar localhost/127.0.0.1 puerto 8765.
- Si Pages no está habilitado, en GitHub: Settings → Pages → Build and deployment → Source: GitHub Actions. Revisa el resultado del flujo «Publicar SAMPLAST en GitHub Pages».
- No autorices `htmlpreview.github.io` como origen OAuth. La conexión se deshabilita allí porque es un origen compartido.
- En el nuevo origen, importa el JSON de respaldo. No borres el almacenamiento del navegador anterior.

## 2. Configurar Google Cloud una sola vez

1. Abre https://console.cloud.google.com/ e inicia sesión con tu cuenta autorizada. Crea un proyecto dedicado, por ejemplo SAMPLAST Certificados. Anota el **número del proyecto**, no el ID textual.
2. En APIs y servicios → Biblioteca, habilita **Google Sheets API**, **Google Drive API** y **Google Picker API**.
3. En Google Auth Platform (pantalla de consentimiento), configura el nombre SAMPLAST, tu correo de soporte y contacto. Para cuenta personal, usa audiencia Externa en modo de prueba y añade únicamente las cuentas autorizadas como usuarios de prueba. En Data Access, configura únicamente el permiso `https://www.googleapis.com/auth/drive.file`. No solicites scopes completos de Drive ni de hojas.
4. En Clientes, crea un ID de cliente OAuth de tipo **Aplicación web**. En orígenes JavaScript autorizados añade `https://merelok0.github.io`. Si también usas el servidor local, añade `http://localhost`, `http://localhost:8765` y `http://127.0.0.1:8765` según los orígenes que utilices. No hace falta configurar una URI de redirección para este flujo de tokens. Copia el **ID de cliente** (termina en .apps.googleusercontent.com). No uses el secreto de cliente.
5. En APIs y servicios → Credenciales crea una clave de API para Picker. Restringe por sitios web: `https://merelok0.github.io/*`, `https://docs.google.com/*` (necesario para el iframe de Picker) y los orígenes locales que uses con sus puertos, por ejemplo `http://localhost:8765/*`. Limita la clave a Google Picker API y Google Drive API. No habilites facturación ni servicios de pago que no necesites.

## 3. Autorizar el archivo

En SAMPLAST, abre «Historial y base de datos en Drive» → «Configuración inicial de Google Cloud». Pega los tres parámetros (ID OAuth web, clave de API restringida, número del proyecto). Pulsa Conectar con Google. Si aparece «Google preparado», pulsa Conectar otra vez. Autoriza el permiso por archivo y selecciona **BASE DE DATOS SAMPLAST** en el selector de Google. La app comprueba el nombre y los encabezados antes de escribir.

Conserva la misma configuración en los otros equipos y elige la misma hoja. El inicio de sesión debe hacerse con una cuenta autorizada que tenga permiso de edición. Al cerrar la pestaña o expirar el token, vuelve a conectar; no es una autorización permanente. Puedes revocar el acceso desde la seguridad de tu cuenta Google.

## 4. Verificar y usar

- Genera un PDF de un certificado válido; comprueba que aparece una fila en Historial con fecha/hora de Lima. El registro significa PDF generado, no necesariamente archivo guardado en disco. La impresión se registra como solicitada, no confirmada.
- Añade un cliente real y verifica su razón social y nombre corto en Clientes.
- En otra PC conecta a la misma hoja, sincroniza, comprueba ese cliente en el instructivo y recupera un certificado desde el historial.
- Si falla internet o vence la sesión, la cola se conserva en el navegador autorizado. No cierres la página sin comprobar los pendientes si quieres ver los datos inmediatamente en otra PC.
- Los registros repetidos del mismo día y contenido se deduplican al sincronizar; dos sesiones simultáneas que escriban exactamente al mismo tiempo pueden generar duplicados. Evita ordenar manualmente la hoja Clientes mientras se sincroniza. Mantén los encabezados y las columnas de ambas hojas.
- El historial conserva datos para reconstruir certificados, no imágenes adjuntas ni el PDF original; la apariencia dependerá de la plantilla vigente.
- El archivo permanece privado. No uses proyectos OAuth de desconocidos, no compartas el enlace públicamente y protege la cuenta con verificación en dos pasos.

## Referencias oficiales
- https://developers.google.com/workspace/sheets/api/scopes
- https://developers.google.com/workspace/drive/picker/guides/web-picker
- https://developers.google.com/identity/oauth2/web/guides/get-google-api-clientid
- https://developers.google.com/identity/oauth2/web/guides/use-token-model

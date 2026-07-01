# Mejora de fechas, pesos y descripción del problema API

## Objetivo
- Automatizar la fecha de emisión como **fecha de fabricación + 1 día** y permitir que el usuario la edite manualmente.
- Mostrar siempre el **peso con un decimal** (ej. `2 → 2.0`) en el nombre del producto y en la tabla de medidas/valor medido.
- Proveer un texto descriptivo del problema con la API de Gemini para que pueda ser buscado (ej. en Erplxity) o usado manualmente.

## Cambios propuestos

### 1️⃣ Formato de peso
- **`formatPesoLabel(peso)`**: cambiar lógica para devolver siempre `n.toFixed(1)`.
- **`formatPesoTable(peso)`**: devolver `n.toFixed(1)` si `peso` es entero; si no, mantener la precisión original.
- Ajustar `buildProductName` (línea ~104‑119) para usar el nuevo `formatPesoLabel` (ya lo usa).

### 2️⃣ Lógica de fechas
- Implementar **`autoFillDates()`** que se ejecuta cuando cambia `fecha_fabricacion` y la fecha de emisión **no** está marcada como manual.
- Añadir **listener** `form.fecha_emision.addEventListener('input', …)` que marca `dataset.manual = '1'` cuando el usuario escribe una fecha.
- Añadir **listener** `form.fecha_fabricacion.addEventListener('change', autoFillDates)` para rellenar automáticamente la emisión.
- Mantener la capacidad de editar la fecha de emisión (no deshabilitar el input).

### 3️⃣ Texto descriptivo del problema API
Crear una constante o variable en `js/app.js` (o `js/auth.js`) con el siguiente texto (en español) para copiar‑pegar en Erplxity u otras búsquedas:
```
Problemática con la API de Gemini:
- El usuario genera una clave del tipo `AQ.Ab8...` (OAuth token) en lugar de la clave de API requerida (`AIzaSy...`).
- Las peticiones a la API fallan con error 400/403 porque el token no es válido para llamadas REST.
- Necesitamos una clave de API de proyecto de Google Cloud habilitada para el servicio "Vertex AI" (Gemini). La clave debe iniciar con `AIzaSy` y estar habilitada para facturación.
- Alternativas: usar la API de OpenAI (gpt‑4), usar un modelo local (ollama) o generar el PDF sin IA (modo offline).
```
Este texto será accesible desde la consola del navegador (`console.log(API_ISSUE_TEXT)`).

## Preguntas abiertas
> [!IMPORTANT] **Revisión de impacto**: ¿Hay otros lugares donde `formatPesoLabel` / `formatPesoTable` se usan (por ejemplo, en generación de PDF) que puedan verse afectados por el cambio a siempre un decimal?
> 
> [!IMPORTANT] **Validación del evento de edición**: ¿Desea que la marca `manual` se elimine si el usuario vuelve a vaciar el campo de emisión (para volver al cálculo automático)?

## Verificación
- **Pruebas manuales**: abrir la app, cambiar fecha de fabricación → ver que la fecha de emisión se actualiza automáticamente a +1 día.
- Modificar la fecha de emisión → confirmar que deja de actualizarse automáticamente.
- Introducir peso `2` y `2.5` → verificar que el producto muestra `2.0 KG` y `2.5 KG` respectivamente, y que la tabla muestra el mismo formato.
- Revisar que el texto del problema API está disponible en la consola.

## Pasos de implementación
1. Editar `js/app.js` para actualizar `formatPesoLabel` y `formatPesoTable`.
2. Añadir los listeners y la función `autoFillDates` al final del archivo (después de la definición actual).
3. Insertar la constante `API_ISSUE_TEXT` cerca de otras constantes.
4. Ejecutar la app (`npm start` o `python -m http.server`) y validar visualmente.
5. Generar PDF y confirmar que los cambios persisten.

---
*Este plan está listo para ser aprobado. Por favor, confirme o indique ajustes antes de proceder con los cambios.*

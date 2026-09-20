# Contexto Tecnológico: Sistema de SOPs Nazaria (v3)

## 1. Arquitectura del Sistema
- **Infraestructura:** Alojamiento estático en GitHub Pages sobre el repositorio `juanoviedo1987-droid/sops-nazaria` (sin intermediarios ni servidores de compilación)[cite: 2].
- **Estructura del Proyecto:**
  - `/index.html`: Terminal de consulta en sucursales. Consume `/menu.json` dinámicamente con bypass anti-caché (`?t=`) y renderiza los manuales en una tarjeta A4 centrada (`max-w-[820px]`, `padding: 60px`)[cite: 2, 3].
  - `/admin.html`: Consola de control para redacción y maquetado. Incluye panel de IA (`gemini-2.5-flash` vía `v1beta`), hoja de edición interactiva (`contenteditable`) de 820px y panel lateral deslizante (Drawer) con la guía de flujo[cite: 1].
  - `/menu.json`: Manifiesto central que lista el catálogo activo: `[{"id": "p01", "title": "P-01 · Título"}]`[cite: 2, 4].
  - `/sops/`: Directorio físico donde se almacenan los archivos HTML de cada manual (`p01.html`, `p02.html`, etc.)[cite: 2].

## 2. Estándar de Diseño Estricto (P-00)
Existen dos formatos admitidos dentro de `/sops/`:

### Tipo A: Fragmentos HTML Estándar (p01 a p09, p11)
Prohibido incluir etiquetas globales (`<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`) o bloques markdown (` ``` `)[cite: 1]. Se estructuran exclusivamente con clases CSS de la familia **Inter**[cite: 1, 3]:
- **Título Principal (22pt, #000000, Negrita):** `<h1 class="sop-title-1">P-XX · Título</h1>`[cite: 1, 3]
- **Títulos de Fase (13pt, #000000, Negrita, MAYÚSCULAS, Borde 2px):** `<h2 class="sop-title-2">FASE X: NOMBRE</h2>`[cite: 1, 3]
- **Sub-bloques (11pt, #404040, Negrita):** `<h3 class="sop-title-3">X. Nombre</h3>`[cite: 1, 3]
- **Párrafos (11pt, #1A1A1A, Justificado):** `<p class="sop-text">Texto explicativo.</p>`[cite: 1, 3]
- **Listas de Tareas:** `<ul class="sop-list"><li class="sop-list-item">[Emoji] <strong>Paso:</strong> Detalle.</li></ul>`[cite: 1, 3]
- **Citas / Ejemplos:** `<blockquote class="sop-blockquote">Ejemplo: "Texto"</blockquote>`[cite: 1, 3]
- **Separadores:** `<hr class="sop-divider">` tras el Objetivo y al finalizar cada Fase[cite: 1, 3].
- **Tablas Operativas:** `<table>` con encabezados `<th>` en fondo `#F5F5F5` y bordes `#E5E5E5`[cite: 1].
- **Reglas de Oro (Cierre Obligatorio):**
  ```html
  <hr class="sop-divider">
  <h3 class="sop-title-3">⚠ REGLAS DE ORO (Puntos Críticos de Control)</h3>
  <ul class="sop-warning-list">
    <li class="sop-warning-item">⚠ <strong>[Regla]:</strong> Descripción de la falta crítica.</li>
  </ul>
  ```[cite: 1, 3]

### Tipo B: Planillas e Integraciones Embebidas (p10.html)
Documentos HTML completos estructurados con contenedor fijo responsivo:
`.wrapper-promos { position: fixed; top: 110px; left: 345px; right: 20px; bottom: 20px; z-index: 10; overflow: auto; }`

## 3. Biblioteca Operativa de Emojis
Asignación estricta de íconos según la naturaleza de la tarea:
- 🖥️ **Sistemas:** Dux Software, consultas en PC y reportes[cite: 1].
- 📱 **Comunicación:** WhatsApp del local, formularios Google y redes sociales[cite: 1].
- 💳 **Pagos Digitales:** Terminales Payway, Nave, Mercado Pago y tarjetas[cite: 1].
- 💵 **Efectivo:** Caja chica, cambio y arqueos de turno[cite: 1].
- 📦 **Mercadería:** Control de stock, recepción de cajas, Correo Argentino y auditorías[cite: 1].
- ✨ **Atención al Cliente:** Saludo, estética, asesoramiento y fidelización[cite: 1].

## 4. Flujo Operativo Desacoplado
1. **Concepción (Gemini Gem):** Estructuración de borradores y análisis de directivas de negocio[cite: 1].
2. **Maquetación (`admin.html`):** Inyección del texto en la consola $\rightarrow$ Procesamiento con Gemini 2.5 Flash (`v1beta`) $\rightarrow$ Previsualización y edición directa en hoja de 820px[cite: 1].
3. **Persistencia Directa (1 Clic):** Clic en **"🚀 Publicar en GitHub"** en la consola `admin.html`. El sistema guarda automáticamente el archivo en `sops/pXX.html` y actualiza `menu.json` si es un nuevo manual vía API de GitHub. (También se mantiene la opción de copia manual como respaldo).
4. **Consulta (`index.html`):** Las terminales en locales visualizan los cambios inmediatamente sin recargas de servidor ni bloqueos de caché[cite: 1, 3].

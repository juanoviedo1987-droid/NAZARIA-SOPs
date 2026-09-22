# Contexto Tecnológico y Memoria Operativa: Sistema de SOPs Nazaria (v3)

Este documento es la **Fuente Central de Verdad y Memoria** del proyecto. Cualquier asistente de IA o desarrollador que trabaje en este repositorio debe leer este archivo para comprender la arquitectura, el negocio y las reglas de diseño sin necesidad de consultar historiales previos.

---

## 1. Identidad y Alcance del Negocio
* **Empresa:** Nazaria (Franquicia de retail de calzado y accesorios femeninos).
* **Sucursales Activas:**
  * **TOM** (Tortugas Open Mall)
  * **Paseo Champagnat** (Pilar)
  * **Maschwitz Mall** (Ingeniero Maschwitz)
* **Sistemas Operativos Centrales:**
  * **Dux Software:** Sistema ERP/POS central de facturación, control de stock y caja.
  * **Terminales de Cobro:** Payway (usada para 1 pago y promociones bancarias BNA) y Mercado Pago (usada para cuotas y cobro QR).
  * **Logística y Envíos:** Correo Argentino (envío bonificado a partir de 2 pares).

---

## 2. Infraestructura en la Nube (100% Serverless)
* **Repositorio GitHub:** `juanoviedo1987-droid/NAZARIA-SOPs` (rama `main`).
* **Sitio Web Público (Terminales de Sucursales):**  
  `https://juanoviedo1987-droid.github.io/NAZARIA-SOPs/`
* **Consola de Administración y Publicación:**  
  `https://juanoviedo1987-droid.github.io/NAZARIA-SOPs/admin.html`
* **Sin dependencias locales:** No requiere Git local ni servidores propios. Todas las operaciones de lectura y guardado se ejecutan mediante la API REST de GitHub (`/contents/`).

---

## 3. Catálogo Oficial Homologado (12 SOPs)
El catálogo activo se gestiona dinámicamente desde `/menu.json`, organizado en 4 bloques funcionales:
* **Bloque Mostrador, Cobro y Dux:**
  1. `P-01`: **Atención al Cliente y Ventas** (Protocolo de bienvenida, indagación, calzado "vidriera" y cierre con 20% OFF efectivo).
  2. `P-02`: **Operación de Caja y Pagos** (Dux, fidelización por email, cobro Payway/MP, cierre ciego y protocolo de errores).
  3. `P-03`: **Operación de Dux: Facturación, Notas de Crédito, Cambios y Cuenta Corriente** (Triángulo fiscal, cambio mano a mano, cobro de diferencias, saldo a favor en cta. cte., anulación por error y señas de traspasos).
  4. `P-04`: **Posventa y Cambios** (30 días por gusto, 45 días por falla, constancia digital y cruce entre locales).
  5. `P-05`: **Gestión de Gift Cards** (Generador Google Forms, facturación Dux y protocolo de "quemado" obligatorio para evitar doble canje).
* **Bloque Depósito y Stock:**
  6. `P-06`: **Recepción y Stock** (Control de remito, auditoría semanal los jueves, traspasos entre locales, señas y derivación de fallas/remanentes).
* **Bloque Salón y Estética:**
  7. `P-07`: **Orden y Estética del Local** (Checklist de salón y vidriera, política de cero huecos/baches y depósito limpio).
  8. `P-08`: **Musicalización y Experiencia Sensorial** (Ambientación sonora offline Royalty-Free con VLC para blindaje legal ante SADAIC/CAPIF).
* **Bloque Comercial y Redes:**
  9. `P-09`: **Venta Activa y Omnicanalidad** (WhatsApp/Instagram, prospección por turnos, comisión a la vendedora y envíos Correo Argentino).
  10. `P-10`: **Estrategia de Contenido Digital** (Cronograma semanal de publicaciones: Mañana/Mediodía atracción vs Tarde/Noche conversión).
  11. `P-11`: **Promociones Activas** (Matriz vertical compacta: Efectivo 20% OFF, QR 10% OFF, cuotas, recargos y promos bancarias por sucursal).
  12. `P-12`: **Liquidación AW26: Verificación de Artículos por Categoría** (Matriz de bateas fijas: $69.900, $49.900, $34.900 y $24.900).

---

## 4. Estándar de Diseño Estricto (Norma P-00)
Cada archivo dentro de `/sops/pXX.html` es un fragmento HTML puro, sin etiquetas estructurales (`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`) ni bloques de markdown (```` ``` ````).

### Clases y Jerarquía Visual (Familia Tipográfica Inter):
* **Título Principal:** `<h1 class="sop-title-1">P-XX · Título Oficial</h1>` (22pt, negrita, #000000).
* **Objetivo:** `<p class="sop-text"><strong>Objetivo:</strong> Descripción clara del propósito.</p>`
* **Separador:** `<hr class="sop-divider">` (tras el objetivo y al finalizar cada fase).
* **Fases Operativas:** `<h2 class="sop-title-2">FASE X: NOMBRE EN MAYÚSCULAS</h2>`
* **Sub-secciones:** `<h3 class="sop-title-3">X. Nombre de Sección</h3>`
* **Párrafos Explicativos:** `<p class="sop-text">Texto justificado.</p>`
* **Listas de Tareas:** `<ul class="sop-list"><li class="sop-list-item">[Emoji] <strong>Título:</strong> Detalle del paso.</li></ul>`
* **Citas / Ejemplos:** `<blockquote class="sop-blockquote">Ejemplo: "Diálogo o texto de referencia"</blockquote>`
* **Tablas:** `<table>` con encabezados en fondo `#F5F5F5` y bordes `#E5E5E5`.
* **Reglas de Oro (Cierre Obligatorio al final de cada SOP):**
  ```html
  <hr class="sop-divider">
  <h3 class="sop-title-3">⚠ REGLAS DE ORO (Puntos Críticos de Control)</h3>
  <ul class="sop-warning-list">
    <li class="sop-warning-item">⚠ <strong>[Punto Crítico]:</strong> Descripción obligatoria de la falta grave.</li>
  </ul>
  ```

### Biblioteca de Emojis Operativos:
* 🖥️ **Sistemas:** Dux Software, consultas en PC y reportes.
* 📱 **Comunicación:** WhatsApp del local, formularios Google, Drive y redes sociales.
* 💳 **Pagos Digitales:** Terminales Payway, Nave, Mercado Pago y tarjetas de crédito/débito.
* 💵 **Efectivo:** Caja chica, fondo de cambio y arqueos de turno.
* 📦 **Mercadería:** Control de stock, recepción de cajas, Correo Argentino y auditorías.
* ✨ **Atención al Cliente:** Saludo, asesoramiento de imagen, vidriera viviente y fidelización.

---

## 5. Funcionalidades Clave de las Aplicaciones
1. **`index.html` (Terminal de Sucursal):**
   * Hoja A4 centrada (`max-w-[820px]`, `md:p-[60px]`, fondo `#FAF9F6` con detalle Nazaria `#E6D5C3`).
   * Buscador semántico instantáneo que analiza títulos, identificadores y palabras clave del negocio (`caja`, `falla`, `posnet`, `payway`, etc.).
   * Drawer lateral responsive con apertura/cierre táctil optimizado para celulares.
2. **`admin.html` (Consola de Gestión):**
   * Motor de IA Gemini 2.5 Flash integrado para redactar y maquetar cumpliendo P-00.
   * Publicación directa en 1 Clic a la API de GitHub (guarda `sops/pXX.html` y actualiza `menu.json`).
   * Hoja interactiva editable directamente en pantalla (`contenteditable="true"`).
   * Gestor de Menú modal con reordenamiento por flechas, edición de títulos y eliminación con borrado físico automático en GitHub.

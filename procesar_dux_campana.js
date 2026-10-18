/**
 * PIPELINE DE PROCESAMIENTO DUX ERP · PROMO POST DÍA DE LA MADRE
 * Nazaria Zapatos (TOM & Maschwitz Mall)
 * 
 * Uso:
 *   node procesar_dux_campana.js [ruta_al_archivo_dux.xlsx o .csv]
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// 1. Configuración de Rutas
const inputArg = process.argv[2];
let inputFile = inputArg;

if (!inputFile) {
  // Buscar archivo más reciente en carpeta data/ o directorio actual
  const candidates = [
    ...fs.readdirSync('.').filter(f => f.endsWith('.xlsx') || f.endsWith('.csv')),
    ...(fs.existsSync('data') ? fs.readdirSync('data').filter(f => f.endsWith('.xlsx') || f.endsWith('.csv')).map(f => path.join('data', f)) : [])
  ];
  if (candidates.length > 0) {
    inputFile = candidates[0];
    console.log(`[INFO] Usando archivo detectado automáticamente: ${inputFile}`);
  }
}

if (!inputFile || !fs.existsSync(inputFile)) {
  console.log(`
[AYUDA] Colocá el archivo de clientes exportado de Dux ERP (.xlsx o .csv) y ejecutá:
  node procesar_dux_campana.js <nombre_archivo.xlsx>
`);
  process.exit(0);
}

// 2. Crear carpeta de salida
const outputDir = path.join(__dirname, 'campana_salida');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 3. Cargar datos
console.log(`[1/5] Leyendo archivo: ${inputFile}...`);
const workbook = xlsx.readFile(inputFile);
const sheetName = workbook.SheetNames[0];
const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });
console.log(`[INFO] Total filas leídas: ${rawData.length}`);

// 4. Funciones de Limpieza y Normalización
function cleanName(raw) {
  if (!raw || typeof raw !== 'string') return 'Clienta';
  let clean = raw.trim();
  // Si viene "APELLIDO, NOMBRE", tomar el primer nombre
  if (clean.includes(',')) {
    const parts = clean.split(',');
    clean = parts[1].trim();
  }
  // Tomar solo el primer nombre
  const firstName = clean.split(' ')[0].trim();
  if (!firstName) return 'Clienta';
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

function cleanEmail(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? email : null;
}

function cleanPhone(raw) {
  if (!raw) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  // Casos comunes de Argentina
  if (digits.startsWith('549')) return digits;
  if (digits.startsWith('54')) return '549' + digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('15')) digits = '11' + digits.slice(2);
  if (digits.length === 10) return '549' + digits;
  if (digits.length >= 8 && digits.length <= 11) return '549' + digits;
  return digits;
}

function detectBranch(row) {
  const rowStr = JSON.stringify(row).toLowerCase();
  if (rowStr.includes('tortugas') || rowStr.includes('tom')) return 'TOM';
  if (rowStr.includes('maschwitz') || rowStr.includes('masch')) return 'Maschwitz';
  return 'TOM'; // default principal
}

function getVolume(row) {
  for (const key of Object.keys(row)) {
    const k = key.toLowerCase();
    if (k.includes('total') || k.includes('importe') || k.includes('factur') || k.includes('saldo') || k.includes('compras')) {
      const val = parseFloat(String(row[key]).replace(/[^\d.-]/g, ''));
      if (!isNaN(val)) return val;
    }
  }
  return 0;
}

// 5. Procesamiento y Clasificación
console.log(`[2/5] Normalizando y deduplicando contactos...`);
const clientsTom = [];
const clientsMasch = [];
const seenEmails = new Set();
const seenPhones = new Set();

for (const row of rawData) {
  // Buscar columnas dinámicamente
  let nameVal = '';
  let emailVal = '';
  let phoneVal = '';

  for (const [k, v] of Object.entries(row)) {
    const lk = k.toLowerCase();
    if (!nameVal && (lk.includes('nombre') || lk.includes('cliente') || lk.includes('razon'))) nameVal = v;
    if (!emailVal && (lk.includes('mail') || lk.includes('correo'))) emailVal = v;
    if (!phoneVal && (lk.includes('tel') || lk.includes('cel') || lk.includes('movil') || lk.includes('whatsapp'))) phoneVal = v;
  }

  const nombre = cleanName(nameVal);
  const email = cleanEmail(emailVal);
  const telefono = cleanPhone(phoneVal);
  const sucursal = detectBranch(row);
  const volumen = getVolume(row);

  const client = {
    nombre,
    nombreCompleto: nameVal,
    email,
    telefono,
    sucursal,
    volumen
  };

  if (sucursal === 'Maschwitz') {
    clientsMasch.push(client);
  } else {
    clientsTom.push(client);
  }
}

// 6. Generación de Top VIP para WhatsApp 1 a 1
console.log(`[3/5] Seleccionando Top 30 VIP (TOM) y Top 20 VIP (Maschwitz)...`);
clientsTom.sort((a, b) => b.volumen - a.volumen);
clientsMasch.sort((a, b) => b.volumen - a.volumen);

const vipTom = clientsTom.filter(c => c.telefono).slice(0, 30);
const vipMasch = clientsMasch.filter(c => c.telefono).slice(0, 20);

function generateWhatsAppLink(phone, nombre, sucursal) {
  const text = `Hola ${nombre}, ¿cómo estás? Te escribo desde Nazaria ${sucursal} 🌸 Esperamos que hayas tenido un lindo domingo del Día de la Madre. Te queríamos escribir especialmente porque tenés un 5% OFF EXTRA acumulable en toda la Nueva Temporada esta semana (hasta 25% OFF en efectivo o 3 cuotas sin interés + 5% OFF directo). ¡Avisame si querés que te separe talle o modelo! 💕`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

const vipTomCsv = [
  'Nombre,Telefono,Sucursal,Volumen_Historico,WhatsApp_Link_Directo',
  ...vipTom.map(c => `"${c.nombre}","${c.telefono}","TOM",${c.volumen},"${generateWhatsAppLink(c.telefono, c.nombre, 'TOM')}"`)
].join('\n');

const vipMaschCsv = [
  'Nombre,Telefono,Sucursal,Volumen_Historico,WhatsApp_Link_Directo',
  ...vipMasch.map(c => `"${c.nombre}","${c.telefono}","Maschwitz",${c.volumen},"${generateWhatsAppLink(c.telefono, c.nombre, 'Maschwitz Mall')}"`)
].join('\n');

fs.writeFileSync(path.join(outputDir, 'vip_whatsapp_tom_30.csv'), '\uFEFF' + vipTomCsv, 'utf8');
fs.writeFileSync(path.join(outputDir, 'vip_whatsapp_maschwitz_20.csv'), '\uFEFF' + vipMaschCsv, 'utf8');

// 7. Generación de Listas para Email Marketing (Brevo / MailerLite)
console.log(`[4/5] Generando bases de email para Brevo...`);
const emailTom = clientsTom
  .filter(c => c.email && !seenEmails.has(c.email))
  .map(c => {
    seenEmails.add(c.email);
    return `"${c.email}","${c.nombre}","TOM"`;
  });

const emailMasch = clientsMasch
  .filter(c => c.email && !seenEmails.has(c.email))
  .map(c => {
    seenEmails.add(c.email);
    return `"${c.email}","${c.nombre}","Maschwitz Mall"`;
  });

const brevoTomCsv = ['EMAIL,NOMBRE,SUCURSAL', ...emailTom].join('\n');
const brevoMaschCsv = ['EMAIL,NOMBRE,SUCURSAL', ...emailMasch].join('\n');

fs.writeFileSync(path.join(outputDir, 'brevo_email_tom.csv'), '\uFEFF' + brevoTomCsv, 'utf8');
fs.writeFileSync(path.join(outputDir, 'brevo_email_maschwitz.csv'), '\uFEFF' + brevoMaschCsv, 'utf8');

// 8. Resumen Final
console.log(`[5/5] ¡Pipeline finalizado con éxito!`);
console.log(`
===========================================================
  RESUMEN DE GENERACIÓN DE CAMPAÑA · NAZARIA ZAPATOS
===========================================================
  Archivos creados en carpeta: ./campana_salida/
  
  📱 WHATSAPP 1 a 1 VIP (Top Clientes con Link Directo):
    - vip_whatsapp_tom_30.csv         (${vipTom.length} contactos TOM)
    - vip_whatsapp_maschwitz_20.csv   (${vipMasch.length} contactos Maschwitz)
    * Cada fila tiene un link wa.me con el texto ya redactado y personalizado.
  
  📧 EMAIL MARKETING (Listos para importar en Brevo/MailerLite):
    - brevo_email_tom.csv             (${emailTom.length} emails válidos)
    - brevo_email_maschwitz.csv       (${emailMasch.length} emails válidos)
===========================================================
`);

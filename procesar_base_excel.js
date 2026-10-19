const fs = require('fs');
const xlsx = require('xlsx');

// 1. Cargar archivo
const wb = xlsx.readFile('C:/Users/juano/Downloads/clientes_email_telefono.xlsx');
const sheet = wb.Sheets['Contactos Únicos'] || wb.Sheets['Clientes Filtrados'];
const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });

console.log(`Total filas en Contactos Únicos: ${rawData.length}`);

// 2. Limpieza de Nombre
function cleanFirstName(raw) {
  if (!raw || typeof raw !== 'string') return 'Clienta';
  let clean = raw.trim();
  if (clean.includes(',')) {
    const parts = clean.split(',');
    clean = parts[1].trim();
  }
  const firstName = clean.split(' ')[0].trim();
  // Capitalizar primer letra
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
}

// 3. Normalizar teléfono para wa.me (formato internacional sin espacios ni guiones)
function cleanPhoneForWa(waField, telNorm, telOrig) {
  let val = waField || telNorm || telOrig || '';
  val = val.toString().replace(/\D/g, ''); // solo dígitos

  // Si arranca con 549...
  if (val.startsWith('549')) return val;
  if (val.startsWith('54')) return '549' + val.slice(2);
  if (val.startsWith('0')) val = val.slice(1);
  if (val.startsWith('15')) val = val.slice(2);

  // Prefijos típicos
  if (val.startsWith('11') || val.startsWith('348') || val.startsWith('230') || val.startsWith('3489') || val.startsWith('3487') || val.startsWith('2323')) {
    return '549' + val;
  }
  return '549' + val;
}

// 4. Geoclasificación Maschwitz vs TOM
const maschKeywords = ['MASCHWITZ', 'ESCOBAR', 'GARIN', 'SAVIO', 'MATHEU', 'CAMPANA', 'ZARATE', 'BENITO VILLANUEVA'];
const tomKeywords = ['TORTUGAS', 'TORTUGUITAS', 'PILAR', 'DEL VISO', 'ALBERTI', 'NOGUES', 'POLVORINES', 'BECCAR', 'SAN ISIDRO', 'VICENTE LOPEZ', 'TIGRE', 'BENAVIDEZ', 'SAN MARTIN', 'MALVINAS'];

const clientsMasch = [];
const clientsTom = [];

const seenEmails = new Set();
const seenPhones = new Set();

for (const row of rawData) {
  const email = (row['Email Normalizado'] || row['Email Original'] || '').toString().trim().toLowerCase();
  const telNorm = row['Teléfono Normalizado'] || '';
  const waField = row['WhatsApp (+54)'] || '';
  const telOrig = row['Teléfono Original'] || '';
  const fullName = row['Cliente (A-Z)'] || 'Clienta';
  const firstName = cleanFirstName(fullName);
  const waPhone = cleanPhoneForWa(waField, telNorm, telOrig);
  const loc = `${row['Localidad'] || ''} ${row['Domicilio'] || ''} ${row['Provincia'] || ''}`.toUpperCase();
  const tipoLinea = (row['Tipo de Línea'] || '').toString();

  // Deduplicar
  if (seenEmails.has(email) && seenPhones.has(waPhone)) continue;
  if (email) seenEmails.add(email);
  if (waPhone) seenPhones.add(waPhone);

  const clientObj = {
    id: row['ID Cliente'],
    fullName,
    firstName,
    email,
    waPhone,
    displayPhone: telNorm || telOrig,
    tipoLinea,
    localidad: row['Localidad'] || ''
  };

  const isMasch = maschKeywords.some(k => loc.includes(k)) || 
                  displayPhoneStartsWith(clientObj.displayPhone, ['348', '0348']) ||
                  tipoLinea.includes('Escobar');

  if (isMasch) {
    clientsMasch.push(clientObj);
  } else {
    clientsTom.push(clientObj);
  }
}

function displayPhoneStartsWith(phone, prefixes) {
  const p = (phone || '').toString().replace(/\D/g, '');
  return prefixes.some(pre => p.startsWith(pre));
}

console.log(`Clasificados: TOM = ${clientsTom.length}, Maschwitz = ${clientsMasch.length}`);

// Guardar JSON para armar las páginas HTML
fs.writeFileSync('data/contactos_campana_procesados.json', JSON.stringify({ tom: clientsTom, maschwitz: clientsMasch }, null, 2), 'utf8');
console.log('Guardado data/contactos_campana_procesados.json con éxito.');

const fs = require('fs');

const { tom, maschwitz } = JSON.parse(fs.readFileSync('data/contactos_campana_procesados.json', 'utf8'));

// Limpieza de nombre
function getCleanFirstName(fullName, fallbackFirst) {
  if (!fullName) return 'Hola';
  const clean = fullName.trim();
  if (clean.includes(',')) {
    const afterComma = clean.split(',')[1].trim().split(/\s+/)[0];
    if (afterComma) return afterComma.charAt(0).toUpperCase() + afterComma.slice(1).toLowerCase();
  }
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
  const firstWord = parts[0].toLowerCase();
  const commonSurnames = ['aguiar', 'gonzalez', 'rodriguez', 'gomez', 'fernandez', 'lopez', 'diaz', 'perez', 'garcia', 'sanchez', 'romero', 'sosa', 'torres', 'alvarez', 'ruiz', 'ramirez', 'flores', 'benitez', 'acosta', 'medina', 'herrera', 'aguirre', 'gutierrez', 'castro'];
  if (commonSurnames.includes(firstWord) && parts.length > 1) {
    return parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
  }
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
}

function generateWhatsAppLink(phone, firstName, branchName) {
  const text = `Hola ${firstName}, ¿cómo estás? Te escribimos de Nazaria ${branchName} 🌸

Te compartimos la imagen de nuestra promo especial de la semana: ¡Date el gusto vos! ✨

Tenés un 5% OFF EXTRA acumulable en toda la Nueva Temporada SS27:
• 25% OFF abonando en Efectivo (20% habitual + 5% extra).
• 15% OFF abonando con Débito / QR.
• 3 Cuotas sin Interés + 5% OFF directo con Crédito.

Presentando este flyer en caja te lo aplicamos en el momento. Si querías pasar a probarte o querés que te guardemos algún modelo antes de que vuelen los talles, ¡escribinos por acá y te lo separamos! ¿Qué talle calzás? 💕`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function buildHtmlPage(storeKey, storeTitle, branchName, clientList) {
  const total = clientList.length;

  // Días de la semana
  const days = [
    { name: 'Lunes 19 de Octubre', key: 'lun' },
    { name: 'Martes 20 de Octubre', key: 'mar' },
    { name: 'Miércoles 21 de Octubre', key: 'mie' },
    { name: 'Jueves 22 de Octubre', key: 'jue' },
    { name: 'Viernes 23 de Octubre', key: 'vie' }
  ];

  // Configuración de las 4 tandas por día
  const tandasConfig = [
    { label: 'Tanda 1: Apertura / Mañana (11:00 hs)', icon: '☀️', key: 't1' },
    { label: 'Tanda 2: Mediodía (13:30 hs)', icon: '🥪', key: 't2' },
    { label: 'Tanda 3: Tarde / Merienda (16:30 hs)', icon: '☕', key: 't3' },
    { label: 'Tanda 4: Atardecer / Cierre (19:00 hs)', icon: '🌙', key: 't4' }
  ];

  // Dividir clientList en 5 días
  const perDay = Math.ceil(total / 5);
  const dailyGroups = [];
  for (let d = 0; d < 5; d++) {
    const start = d * perDay;
    const end = Math.min(start + perDay, total);
    const dayClients = clientList.slice(start, end);

    // Dividir los contactos del día en 4 tandas
    const tandas = [[], [], [], []];
    dayClients.forEach((c, idx) => {
      tandas[idx % 4].push(c);
    });

    dailyGroups.push({
      day: days[d],
      tandas: tandas
    });
  }

  // 2. Dividir Emails en lotes seguros de MÁXIMO 30 destinatarios para CCO
  const validEmails = clientList.map(c => c.email).filter(e => e && e.includes('@'));
  const EMAIL_BATCH_SIZE = 30;
  const emailBatches = [];
  for (let i = 0; i < validEmails.length; i += EMAIL_BATCH_SIZE) {
    emailBatches.push(validEmails.slice(i, i + EMAIL_BATCH_SIZE));
  }

  function renderClientRow(c, i, batchId) {
    const cleanFirst = getCleanFirstName(c.fullName, c.firstName);
    const waUrl = generateWhatsAppLink(c.waPhone, cleanFirst, branchName);
    const cleanPhone = c.waPhone.replace(/\D/g, '');
    return `
        <div class="flex items-center justify-between p-2 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition gap-2">
          <!-- Datos de la clienta -->
          <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <input type="checkbox" id="chk-${batchId}-${i}" onchange="saveCheckState('${batchId}-${i}')" title="Marcar como contactada" class="w-4 h-4 rounded text-black cursor-pointer shrink-0">
            <span class="font-medium text-neutral-900 text-xs truncate" title="${c.fullName}">${c.fullName}</span>
            <span class="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-semibold shrink-0">Hola ${cleanFirst}</span>
          </div>

          <!-- Acciones: Copiar Número + Abrir Chat -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="copyPhoneNumber('${cleanPhone}', this)" title="Copiar número para agendar" class="px-2 py-1 bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs">
              <span>📋</span> <span class="hidden md:inline">Copiar</span>
            </button>
            <a href="${waUrl}" target="_blank" onclick="markChecked('${batchId}-${i}')" title="Abrir chat en WhatsApp" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shadow-sm flex items-center gap-1 transition">
              <span>💬</span> <span>WhatsApp</span>
            </a>
          </div>
        </div>`;
  }

  function renderTandaBlock(shiftLabel, icon, list, batchId) {
    const rows = list.map((c, i) => renderClientRow(c, i, batchId)).join('\n');
    return `
          <div class="bg-white border border-neutral-200 rounded p-2.5 space-y-1.5">
            <div class="flex items-center justify-between pb-1.5 border-b border-neutral-100 mb-1">
              <span class="font-bold text-[11px] text-neutral-800 flex items-center gap-1">
                <span>${icon}</span> ${shiftLabel}
              </span>
              <span class="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                ${list.length} clientas
              </span>
            </div>
            <div class="space-y-1 max-h-[260px] overflow-y-auto pr-1">
              ${rows}
            </div>
          </div>`;
  }

  const daysHtml = dailyGroups.map((g, idx) => {
    const totalDay = g.tandas.reduce((acc, t) => acc + t.length, 0);
    return `
      <!-- DÍA: ${g.day.name.toUpperCase()} -->
      <div class="border border-neutral-300 rounded-lg overflow-hidden shadow-sm mb-3">
        <div class="bg-neutral-800 text-white px-3.5 py-2 text-xs font-bold flex justify-between items-center">
          <span>📅 ${g.day.name.toUpperCase()}</span>
          <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-semibold">${totalDay} contactos en 4 micro-tandas</span>
        </div>
        <div class="p-2.5 bg-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${renderTandaBlock(tandasConfig[0].label, tandasConfig[0].icon, g.tandas[0], `${g.day.key}-t1`)}
          ${renderTandaBlock(tandasConfig[1].label, tandasConfig[1].icon, g.tandas[1], `${g.day.key}-t2`)}
          ${renderTandaBlock(tandasConfig[2].label, tandasConfig[2].icon, g.tandas[2], `${g.day.key}-t3`)}
          ${renderTandaBlock(tandasConfig[3].label, tandasConfig[3].icon, g.tandas[3], `${g.day.key}-t4`)}
        </div>
      </div>`;
  }).join('\n');

  const emailBatchesHtml = emailBatches.map((batch, idx) => {
    const emailString = batch.join('; ');
    return `
      <div class="bg-white p-3 rounded-lg border border-neutral-200 space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-xs text-neutral-800">Lote ${idx + 1} (${batch.length} destinatarios CCO)</span>
          <button onclick="copyToClipboard('batch-email-${idx}', this)" class="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold rounded flex items-center gap-1 transition shadow-sm">
            <span>📋</span> Copiar Lote ${idx + 1}
          </button>
        </div>
        <textarea id="batch-email-${idx}" readonly class="w-full h-16 p-2 text-[11px] font-mono bg-neutral-50 border border-neutral-300 rounded resize-none select-all focus:outline-none">${emailString}</textarea>
      </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contactos ${storeTitle} · Nazaria</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #FAF9F6; color: #1b1b20; }
    .sop-title-1 { font-family: 'Cinzel', Georgia, serif; font-size: 16pt; font-weight: 700; margin-bottom: 4pt; }
    .sop-divider { border-top: 1px solid #E5E5E5; margin-bottom: 14pt; }
  </style>
</head>
<body class="p-3 sm:p-6 md:p-8 max-w-4xl mx-auto">
  <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-8">

    <h1 class="sop-title-1">P-13 · Contactos VIP &amp; Difusión: ${storeTitle}</h1>
    <p class="text-xs text-neutral-600 mb-3">
      <strong>Base asignada:</strong> ${total} clientas verificadas con Email y WhatsApp para la campaña Post Día de la Madre.
    </p>
    <hr class="sop-divider">

    <!-- Navegación de regreso -->
    <div class="flex items-center justify-between bg-neutral-100 p-2.5 rounded border border-neutral-200 mb-4">
      <span class="font-bold text-neutral-800 text-xs">⬅ Procedimiento Principal:</span>
      <a href="https://juanoviedo1987-droid.github.io/NAZARIA-SOPs/" class="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-800 transition inline-block">
        Volver a SOP P-13
      </a>
    </div>

    <!-- Pestañas de Vista -->
    <div class="flex border-b border-neutral-300 gap-2 mb-4">
      <button onclick="switchTab('wa')" id="tab-wa" class="px-4 py-2 font-bold text-xs border-b-2 border-black text-black bg-white">
        📱 WhatsApp VIP (${total} Clientes · 4 Tandas Diarias)
      </button>
      <button onclick="switchTab('mail')" id="tab-mail" class="px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100">
        ✉️ Envíos de Email por Lotes Seguros (${validEmails.length} Correos)
      </button>
    </div>

    <!-- SECCIÓN WHATSAPP VIP -->
    <div id="section-wa" class="space-y-4">
      
      <!-- PROTOCOLO OBLIGATORIO ANTI-BANEO -->
      <div class="p-3 bg-amber-50 rounded-lg border-2 border-amber-300 text-amber-950 text-xs space-y-2">
        <div class="font-bold flex items-center gap-1.5 text-amber-900 text-xs uppercase tracking-wide">
          <span>🛡️</span> PROTOCOLO OBLIGATORIO ANTI-BANEO (4 TANDAS DIARIAS)
        </div>
        <p class="leading-relaxed">
          Para cuidar la línea de la sucursal y evitar bloqueos automáticos de Meta, <strong>el envío diario se divide en 4 micro-tandas de 15 a 19 clientas</strong>:
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-semibold bg-white p-2 rounded border border-amber-200">
          <div>☀️ <strong>11:00 hs:</strong> Tanda 1</div>
          <div>🥪 <strong>13:30 hs:</strong> Tanda 2</div>
          <div>☕ <strong>16:30 hs:</strong> Tanda 3</div>
          <div>🌙 <strong>19:00 hs:</strong> Tanda 4</div>
        </div>
        <ul class="list-disc pl-4 space-y-1 font-medium">
          <li><strong>Mensaje Personalizado:</strong> El botón verde ya abre el chat saludando con el nombre de la clienta.</li>
          <li><strong>Adjuntar Imagen Obligatoria:</strong> Al abrir el chat, adjuntar siempre el flyer oficial antes de presionar Enviar.</li>
          <li><strong>Ritmo Humano:</strong> Dejar entre 30 y 60 segundos entre cada envío (nunca enviar en ráfaga continua).</li>
        </ul>
      </div>

      <!-- DESCARGA RÁPIDA DE IMAGEN OFICIAL PARA ADJUNTAR -->
      <div class="bg-neutral-50 p-2.5 rounded border border-neutral-200 flex items-center justify-between text-xs">
        <span class="font-semibold text-neutral-800">📸 Flyer oficial para adjuntar:</span>
        <div class="flex gap-2">
          <a href="../flyers/feed_podium.png" download="Flyer_Promo_Nazaria_Feed.png" class="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white font-bold rounded text-[11px] shadow-sm transition">
            📥 Descargar Cuadrada (Feed)
          </a>
          <a href="../flyers/story_podium.png" download="Flyer_Promo_Nazaria_Story.png" class="px-2.5 py-1 bg-[#B89B7E] hover:bg-[#A28263] text-white font-bold rounded text-[11px] shadow-sm transition">
            📥 Descargar Vertical (Story)
          </a>
        </div>
      </div>

      <!-- LISTA DE DÍAS Y TANDAS -->
      ${daysHtml}

    </div>

    <!-- SECCIÓN EMAILS EN LOTES SEGUROS -->
    <div id="section-mail" class="space-y-4 hidden">
      <div class="p-3 bg-blue-50 rounded border border-blue-200 text-blue-900 text-xs space-y-1">
        <div class="font-bold flex items-center gap-1 text-xs">
          <span>✉️</span> INSTRUCCIONES DE ENVÍO DE EMAIL ANTI-SPAM (CCO)
        </div>
        <p>1. Abrir la cuenta de correo de la sucursal en Gmail / Webmail.</p>
        <p>2. Copiar un lote seguro (máximo 30 emails por lote) y pegarlo en el campo <strong>CCO (Copia Oculta)</strong> para no filtrar los datos de las clientas.</p>
        <p>3. En el Asunto colocar: <code class="bg-white px-1.5 py-0.5 rounded border border-blue-300 font-bold">¡Date el gusto vos! 💖 5% OFF Extra en Nazaria ${branchName}</code></p>
        <p>4. Pegar el cuerpo del mensaje y <strong>ADJUNTAR LA IMAGEN OFICIAL</strong> (descargar abajo).</p>
      </div>

      <!-- DESCARGA RÁPIDA DE IMAGEN OFICIAL PARA ADJUNTAR AL CORREO -->
      <div class="bg-neutral-50 p-2.5 rounded border border-neutral-200 flex items-center justify-between text-xs">
        <span class="font-semibold text-neutral-800">📸 Flyer oficial para adjuntar al correo:</span>
        <div class="flex gap-2">
          <a href="../flyers/feed_podium.png" download="Flyer_Promo_Nazaria_Feed.png" class="px-2.5 py-1 bg-neutral-900 hover:bg-black text-white font-bold rounded text-[11px] shadow-sm transition">
            📥 Descargar Cuadrada (Feed)
          </a>
          <a href="../flyers/story_podium.png" download="Flyer_Promo_Nazaria_Story.png" class="px-2.5 py-1 bg-[#B89B7E] hover:bg-[#A28263] text-white font-bold rounded text-[11px] shadow-sm transition">
            📥 Descargar Vertical (Story)
          </a>
        </div>
      </div>

      <div class="space-y-2">
        ${emailBatchesHtml}
      </div>
    </div>

  </div>

  <script>
    function switchTab(type) {
      const waTab = document.getElementById('tab-wa');
      const mailTab = document.getElementById('tab-mail');
      const waSec = document.getElementById('section-wa');
      const mailSec = document.getElementById('section-mail');

      if (type === 'wa') {
        waTab.className = 'px-4 py-2 font-bold text-xs border-b-2 border-black text-black bg-white';
        mailTab.className = 'px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100';
        waSec.classList.remove('hidden');
        mailSec.classList.add('hidden');
      } else {
        mailTab.className = 'px-4 py-2 font-bold text-xs border-b-2 border-black text-black bg-white';
        waTab.className = 'px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100';
        mailSec.classList.remove('hidden');
        waSec.classList.add('hidden');
      }
    }

    function saveCheckState(id) {
      const chk = document.getElementById('chk-' + id);
      if (chk) {
        localStorage.setItem('nazaria_chk_' + id, chk.checked ? '1' : '0');
      }
    }

    function markChecked(id) {
      const chk = document.getElementById('chk-' + id);
      if (chk) {
        chk.checked = true;
        saveCheckState(id);
      }
    }

    function copyPhoneNumber(phone, btn) {
      navigator.clipboard.writeText(phone).then(() => {
        const orig = btn.innerHTML;
        btn.innerHTML = '<span>✅</span> <span class="hidden md:inline">¡Copiado!</span>';
        btn.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove('bg-emerald-50', 'text-emerald-800', 'border-emerald-300');
        }, 1800);
      });
    }

    function copyToClipboard(elementId, btn) {
      const el = document.getElementById(elementId);
      if (el) {
        navigator.clipboard.writeText(el.value || el.innerText).then(() => {
          const orig = btn.innerHTML;
          btn.innerHTML = '<span>✅</span> ¡Lote Copiado!';
          btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
          }, 2000);
        });
      }
    }

    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        const id = chk.id.replace('chk-', '');
        if (localStorage.getItem('nazaria_chk_' + id) === '1') {
          chk.checked = true;
        }
      });
    });
  </script>
</body>
</html>`;
}

// Generar TOM
const tomHtml = buildHtmlPage('tom', 'Tortugas Open Mall (TOM)', 'TOM', tom);
fs.writeFileSync('sops/p13_contactos_tom.html', tomHtml, 'utf8');
console.log('p13_contactos_tom.html actualizado con 4 tandas.');

// Generar Maschwitz
const maschwitzHtml = buildHtmlPage('maschwitz', 'Maschwitz Mall', 'Maschwitz Mall', maschwitz);
fs.writeFileSync('sops/p13_contactos_maschwitz.html', maschwitzHtml, 'utf8');
console.log('p13_contactos_maschwitz.html actualizado con 4 tandas.');

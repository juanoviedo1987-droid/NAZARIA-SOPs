const fs = require('fs');

const { tom, maschwitz } = JSON.parse(fs.readFileSync('data/contactos_campana_procesados.json', 'utf8'));

function generateWhatsAppLink(phone, firstName, branchName) {
  const text = `Hola ${firstName}, ¿cómo estás? Te escribo desde Nazaria ${branchName} 🌸 Esperamos que hayas tenido un lindo domingo del Día de la Madre. Te queríamos escribir especialmente porque tenés un 5% OFF EXTRA acumulable en toda la Nueva Temporada esta semana (hasta 25% OFF en efectivo o 3 cuotas sin interés + 5% OFF directo). ¡Avisame si querés que te separe talle o modelo! 💕`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

function buildHtmlPage(storeKey, storeTitle, branchName, clientList) {
  // 1. Dividir WhatsApp en 3 lotes diarios: Lunes, Martes, Miércoles
  const total = clientList.length;
  const size1 = Math.ceil(total / 3);
  const size2 = Math.ceil((total - size1) / 2);

  const grupo1 = clientList.slice(0, size1);
  const grupo2 = clientList.slice(size1, size1 + size2);
  const grupo3 = clientList.slice(size1 + size2);

  // 2. Dividir Emails en lotes seguros de MÁXIMO 30 destinatarios para CCO
  const validEmails = clientList.map(c => c.email).filter(e => e && e.includes('@'));
  const EMAIL_BATCH_SIZE = 30;
  const emailBatches = [];
  for (let i = 0; i < validEmails.length; i += EMAIL_BATCH_SIZE) {
    emailBatches.push(validEmails.slice(i, i + EMAIL_BATCH_SIZE));
  }

  function renderGroup(title, badge, list, groupId) {
    const rows = list.map((c, i) => {
      const waUrl = generateWhatsAppLink(c.waPhone, c.firstName, branchName);
      const cleanPhone = c.waPhone.replace(/\D/g, '');
      return `
        <div class="flex items-center justify-between p-2 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition gap-2">
          <!-- Datos de la clienta -->
          <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <input type="checkbox" id="chk-${groupId}-${i}" onchange="saveCheckState('${groupId}-${i}')" title="Marcar como contactada" class="w-4 h-4 rounded text-black cursor-pointer shrink-0">
            <span class="font-medium text-neutral-900 text-xs truncate" title="${c.fullName}">${c.fullName}</span>
            <span class="text-[11px] text-neutral-500 font-mono shrink-0 hidden sm:inline">${c.displayPhone}</span>
          </div>

          <!-- Acciones: Copiar Número + Abrir Chat -->
          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="copyPhoneNumber('${cleanPhone}', this)" title="Copiar número para agendar" class="px-2 py-1 bg-white hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs">
              <span>📋</span> <span class="hidden md:inline">Copiar</span>
            </button>
            <a href="${waUrl}" target="_blank" onclick="markChecked('${groupId}-${i}')" title="Abrir chat en WhatsApp" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] shadow-sm flex items-center gap-1 transition">
              <span>💬</span> <span>WhatsApp</span>
            </a>
          </div>
        </div>
      `;
    }).join('\n');

    return `
      <div class="border border-neutral-200 rounded-lg overflow-hidden shadow-sm mb-3">
        <div class="bg-neutral-100 px-3.5 py-2 text-xs font-bold text-neutral-800 flex justify-between items-center border-b border-neutral-200">
          <span>📌 ${title}</span>
          <span class="text-[10px] bg-white px-2 py-0.5 rounded text-neutral-700 font-semibold border border-neutral-200">${list.length} Contactos</span>
        </div>
        <div class="p-2.5 bg-white space-y-1.5 max-h-[440px] overflow-y-auto">
          ${rows}
        </div>
      </div>
    `;
  }

  // Renderizar los lotes de email seguros
  const emailBatchesHtml = emailBatches.map((batch, index) => {
    const batchString = batch.join(', ');
    const batchId = `email-batch-${index + 1}`;
    return `
      <div class="border border-neutral-200 rounded-lg p-3 bg-white space-y-2 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span class="font-bold text-xs text-neutral-900">Lote ${index + 1} (${batch.length} destinatarios seguros)</span>
          </div>
          <button onclick="copyBatch('${batchId}')" class="px-3 py-1 bg-neutral-900 hover:bg-black text-white text-[11px] font-bold rounded shadow-sm transition flex items-center gap-1">
            <span>📋</span> Copiar Lote ${index + 1}
          </button>
        </div>
        <textarea id="${batchId}" readonly class="w-full h-16 bg-neutral-50 border border-neutral-200 rounded p-2 text-[11px] font-mono text-neutral-700 select-all leading-tight">${batchString}</textarea>
      </div>
    `;
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
        📱 WhatsApp VIP (${total} Clientes)
      </button>
      <button onclick="switchTab('mail')" id="tab-mail" class="px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100">
        ✉️ Envíos de Email por Lotes Seguros (${validEmails.length} Correos)
      </button>
    </div>

    <!-- SECCIÓN WHATSAPP VIP -->
    <div id="section-wa" class="space-y-4">
      <div class="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-900 text-xs">
        💡 <strong>Dinámica diaria:</strong> Podés hacer clic en <strong>"WhatsApp"</strong> para abrir el chat con el mensaje ya redactado, o en <strong>"Copiar"</strong> para copiar el número si necesitás agendarlo primero en el celular del local. La casilla de verificación te ayuda a marcar quiénes ya fueron contactadas.
      </div>

      ${renderGroup('LUNES 19 DE OCTUBRE · GRUPO 1', 'Lunes', grupo1, 'g1')}
      ${renderGroup('MARTES 20 DE OCTUBRE · GRUPO 2', 'Martes', grupo2, 'g2')}
      ${renderGroup('MIÉRCOLES 21 DE OCTUBRE · GRUPO 3', 'Miércoles', grupo3, 'g3')}
    </div>

    <!-- SECCIÓN EMAILS POR LOTES SEGUROS (ANTI-SPAM) -->
    <div id="section-mail" class="hidden space-y-4">
      <div class="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs space-y-1">
        <div class="font-bold flex items-center gap-1.5 text-sm">
          <span>🛡️</span> Protocolo Anti-Spam: Lotes de hasta 30 Destinatarios
        </div>
        <p class="text-[11px] leading-relaxed">
          Para evitar bloqueos o que los correos caigan en SPAM/Promociones, <strong>la base está dividida en ${emailBatches.length} lotes pequeños</strong>.
          <br>
          <strong>Instrucciones:</strong> Copiá un lote, pegalo en el campo <strong>CCO (Copia Oculta)</strong> de tu webmail, pegá el asunto y cuerpo oficial, y envialo. Dejá pasar unos minutos entre cada lote.
        </p>
      </div>

      <div class="space-y-3">
        ${emailBatchesHtml}
      </div>
    </div>

  </div>

  <script>
    function switchTab(t) {
      const wa = document.getElementById('section-wa');
      const mail = document.getElementById('section-mail');
      const tabWa = document.getElementById('tab-wa');
      const tabMail = document.getElementById('tab-mail');

      if (t === 'wa') {
        wa.classList.remove('hidden');
        mail.classList.add('hidden');
        tabWa.className = "px-4 py-2 font-bold text-xs border-b-2 border-black text-black bg-white";
        tabMail.className = "px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100";
      } else {
        wa.classList.add('hidden');
        mail.classList.remove('hidden');
        tabMail.className = "px-4 py-2 font-bold text-xs border-b-2 border-black text-black bg-white";
        tabWa.className = "px-4 py-2 font-semibold text-xs text-neutral-500 hover:text-black bg-neutral-100";
      }
    }

    function copyBatch(batchId) {
      const el = document.getElementById(batchId);
      el.select();
      navigator.clipboard.writeText(el.value).then(() => {
        alert('¡Lote de correos copiado con éxito! Pegalo en el campo CCO de tu correo.');
      });
    }

    function copyPhoneNumber(phone, btn) {
      navigator.clipboard.writeText(phone).then(() => {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✅</span> <span class=\"hidden md:inline\">Copiado</span>';
        btn.classList.add('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('bg-emerald-50', 'text-emerald-700', 'border-emerald-300');
        }, 2000);
      });
    }

    function markChecked(key) {
      const chk = document.getElementById('chk-' + key);
      if (chk) {
        chk.checked = true;
        saveCheckState(key);
      }
    }

    function saveCheckState(key) {
      const chk = document.getElementById('chk-' + key);
      if (chk) {
        localStorage.setItem('${storeKey}_chk_' + key, chk.checked ? '1' : '0');
      }
    }

    // Cargar estados guardados
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('input[type="checkbox"]').forEach(chk => {
        const key = chk.id.replace('chk-', '');
        const saved = localStorage.getItem('${storeKey}_chk_' + key);
        if (saved === '1') chk.checked = true;
      });
    });
  </script>
</body>
</html>`;
}

fs.writeFileSync('sops/p13_contactos_tom.html', buildHtmlPage('tom', 'Tortugas Open Mall (TOM)', 'TOM', tom), 'utf8');
fs.writeFileSync('sops/p13_contactos_maschwitz.html', buildHtmlPage('masch', 'Maschwitz Mall', 'Maschwitz Mall', maschwitz), 'utf8');

console.log('Generadas con éxito las páginas de TOM y Maschwitz con botón Copiar Número independiente.');

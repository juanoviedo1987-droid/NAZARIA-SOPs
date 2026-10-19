const fs = require('fs');

function convertToStandalone(file, title) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace internal navigation button with a versatile back button
  content = content.replace(
    /<button onclick="loadSOP\('p13'\)"[^>]*>[\s\S]*?<\/button>/,
    '<a href="https://juanoviedo1987-droid.github.io/NAZARIA-SOPs/" class="px-3 py-1.5 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-800 transition inline-block">⬅ Volver al Portal de SOPs</a>'
  );
  
  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #FAF9F6; color: #1b1b20; }
    .sop-title-1 { font-family: 'Cinzel', Georgia, serif; font-size: 16pt; font-weight: 700; margin-bottom: 6pt; }
    .sop-divider { border-top: 1px solid #E5E5E5; margin-bottom: 16pt; }
  </style>
</head>
<body class="p-3 sm:p-6 md:p-8 max-w-4xl mx-auto">
  <div class="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-8">
    ${content}
  </div>
</body>
</html>`;

  fs.writeFileSync(file, fullHtml, 'utf8');
  console.log('Saved standalone:', file);
}

convertToStandalone('sops/p13_contactos_tom.html', 'Contactos TOM · Nazaria');
convertToStandalone('sops/p13_contactos_maschwitz.html', 'Contactos Maschwitz · Nazaria');
convertToStandalone('sops/p13_mensajes.html', 'Mensajes Oficiales · Nazaria');

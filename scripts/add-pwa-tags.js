const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

const pwaMetaTags = `
    <meta name="description" content="Aprende quiropráctica jugando - Juego de clínica quiropráctica" />
    <meta name="theme-color" content="#1a1a2e" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ChiroHero" />
    
    <!-- PWA Manifest -->
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
`;

const swScript = `
  <!-- Service Worker -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered'))
          .catch(err => console.log('SW failed:', err));
      });
    }
  </script>
</body>
</html>`;

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found in dist folder');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Add PWA meta tags after viewport
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />',
  '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />' +
    pwaMetaTags
);

// Add lang attribute
html = html.replace('<html lang="en">', '<html lang="es">');

// Add service worker before closing body
html = html.replace('</body>', swScript);

fs.writeFileSync(indexPath, html);

console.log('PWA meta tags added successfully!');

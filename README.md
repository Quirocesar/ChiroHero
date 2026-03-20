# ChiroHero - Juego de Clínica Quiropráctica

🎮 Aprende quiropráctica jugando

## Cómo Jugar

### Opción 1: Navegador Web
1. Ve a: **https://tu-usuario.github.io/chirohero**
2. Añade a pantalla de inicio:
   - **Chrome Android**: Menú → "Añadir a pantalla de inicio"
   - **Safari iOS**: Compartir → "Añadir a pantalla de inicio"

### Opción 2: Servidor Local
```bash
npm install
npm run build:web
npx serve dist
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Build para producción
npm run build:pwa
```

## Despliegue

### GitHub Pages (Automático)
1. Sube este proyecto a GitHub
2. Ve a Settings → Pages
3. Selecciona "Deploy from a branch"
4. Elige la rama "gh-pages" y carpeta "/ (root)"
5. Guarda

O usa el workflow automático en `.github/workflows/deploy.yml`

### Netlify
1. Arrastra la carpeta `dist` a netlify.com

## Características

- 🎯 Sistema de logros (28 logros)
- 👨‍⚕️ Simulador de clínica quiropráctica
- 📚 Manual de patologías
- 🏥 Tratamiento de pacientes
- 💰 Sistema de economía
- ⭐ Progresión y reputación
- 🌐 Multidioma (ES, EN, PT, IT, FR, DE)
- 📱 PWA instalable

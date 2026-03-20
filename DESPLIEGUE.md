# Despliegue a GitHub Pages

## Opción 1: Manual (sin GitHub CLI)

1. **Crea un repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `chirohero`
   - Público ✓
   - No inicialices con README

2. **Sube el código:**
   ```bash
   cd "E:\Juego Movil App\ChiroHero"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/chirohero.git
   git push -u origin main
   ```

3. **Activa GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "gh-pages" → "/ (root)"
   - Save

4. **Despliegue manual:**
   ```bash
   npm run build:web
   npx gh-pages -d dist
   ```

## Opción 2: Automático con Actions

1. Sube el código a GitHub (paso 2 de arriba)
2. El workflow ya está configurado en `.github/workflows/deploy.yml`
3. Cada push a `main` desplegará automáticamente

## Después del despliegue

Tu juego estará en: `https://TU_USUARIO.github.io/chirohero`

### Instalar en móvil:
- **Android (Chrome):** Menú → Añadir a pantalla de inicio
- **iOS (Safari):** Compartir → Añadir a pantalla de inicio

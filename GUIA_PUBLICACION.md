# GUÍA DE PUBLICACIÓN - ChiroHero

## 1. PROBAR EN TU ORDENADOR (PC/Mac)

### Opción A: Navegador Web (más rápido)
```bash
cd ChiroHero
npm run web
```
Se abrirá en http://localhost:8081. Funciona exactamente igual que en móvil.

### Opción B: Emulador Android (requiere Android Studio)
1. Instala Android Studio: https://developer.android.com/studio
2. Crea un emulador en AVD Manager
3. Ejecuta:
```bash
npm run android
```

### Opción C: Expo Go en tu móvil (sin publicar)
1. Instala "Expo Go" desde App Store / Play Store
2. Ejecuta:
```bash
npx expo start
```
3. Escanea el QR con tu móvil

---

## 2. PUBLICAR EN ANDROID (Google Play) - GRATIS*

### Paso 1: Crear cuenta de Google Play Developer
- Ve a: https://play.google.com/console
- Pago ÚNICO de $25 USD (es el único coste)
- Rellena datos personales

### Paso 2: Configurar app.json
Edita `app.json` y añade:
```json
{
  "expo": {
    "name": "ChiroHero",
    "slug": "chirohero",
    "version": "1.0.0",
    "android": {
      "package": "com.tuempresa.chirohero",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#1a1a2e"
      }
    }
  }
}
```

### Paso 3: Generar APK/AAB con EAS (gratis)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
npx eas login

# Configurar build
npx eas build:configure

# Generar AAB para Google Play (GRATIS en plan free)
npx eas build --platform android --profile production
```

### Paso 4: Subir a Google Play Console
1. Ve a Google Play Console
2. Crear nueva aplicación
3. Sube el archivo .aab generado
4. Rellena ficha: descripción, capturas, categoría (Juegos > Simulación)
5. Configura precio: GRATIS
6. Enviar a revisión

---

## 3. PUBLICAR EN iOS (App Store) - REQUIERE*

### Requisitos:
- Mac con macOS (necesario para Xcode)
- Cuenta Apple Developer: $99 USD/año
- Xcode instalado

### Paso 1: Cuenta Apple Developer
- Ve a: https://developer.apple.com/programs/
- Inscríbete ($99/año)

### Paso 2: Configurar app.json para iOS
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tuempresa.chirohero",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

### Paso 3: Generar build iOS con EAS
```bash
# Build para iOS (se genera en la nube, NO necesitas Mac para esto)
npx eas build --platform ios --profile production
```

### Paso 4: Subir a App Store Connect
1. Ve a https://appstoreconnect.apple.com
2. Crear nueva app
3. Sube el archivo .ipa con Transporter (app de Mac)
4. Rellena ficha, capturas, categoría
5. Enviar a revisión de Apple

---

## 4. ALTERNATIVA 100% GRATUITA: PWA (Web App)

Si quieres evitar costes, publica como Progressive Web App:

```bash
# Exportar para web
npx expo export --platform web

# La carpeta 'dist' contiene tu app lista
# Súbela a cualquier hosting gratuito:
```

### Hosting gratuitos:
- **Netlify**: https://netlify.com (arrastra la carpeta dist)
- **Vercel**: https://vercel.com
- **GitHub Pages**: gratis con cuenta de GitHub
- **Firebase Hosting**: https://firebase.google.com

Los usuarios pueden "instalar" la PWA desde el navegador como si fuera una app nativa.

---

## 5. RESUMEN DE COSTES

| Plataforma | Coste | Observaciones |
|-----------|-------|---------------|
| Web/PC    | GRATIS| npm run web |
| PWA       | GRATIS| Hosting gratuito |
| Android   | $25 una vez | Google Play Developer |
| iOS       | $99/año | Apple Developer Program |

---

## 6. COMANDOS RÁPIDOS

```bash
# Desarrollo local (web)
npm run web

# Desarrollo local (móvil con Expo Go)
npx expo start

# Build Android
npx eas build --platform android

# Build iOS
npx eas build --platform ios

# Exportar PWA
npx expo export --platform web
```

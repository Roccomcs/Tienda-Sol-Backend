# Guía de despliegue — Tienda Sol

Esta guía explica cómo poner Tienda Sol en producción por primera vez y cómo publicar nuevas versiones. Todo con planes gratuitos.

**Arquitectura de producción**
- **Base de datos** → MongoDB Atlas (nube)
- **Backend** (API REST) → Render
- **Frontend** (Next.js) → Netlify
- **Imágenes de productos** → Cloudinary

> Tu MongoDB local (con `sweet_medical`) es solo para desarrollo. En la nube usamos Atlas, que es una base separada y gratuita. No hay conflicto: Tienda Sol usa su propia base (`tienda-sol`).

---

## 1. MongoDB Atlas (base de datos)

1. Creá una cuenta en https://www.mongodb.com/atlas y un **cluster gratuito (M0)**.
2. En **Database Access**, creá un usuario con contraseña (anotá usuario y contraseña).
3. En **Network Access**, agregá `0.0.0.0/0` (permite conexión desde Render).
4. En **Connect > Drivers**, copiá la cadena de conexión, con este formato:
   ```
   mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/tienda-sol?retryWrites=true&w=majority
   ```
   Fijate de agregar `/tienda-sol` (el nombre de la base) antes del `?`.
5. **Cargar datos de ejemplo** (opcional, recomendado la 1ra vez): desde tu máquina, con el backend, corré el seed apuntando a Atlas:
   ```bash
   # PowerShell
   $env:MONGODB_CONNECTION_STRING="<tu cadena de Atlas>"; npm run seed
   ```

## 2. Cloudinary (imágenes)

1. Creá una cuenta gratis en https://cloudinary.com.
2. En el **Dashboard** anotá tu **Cloud name**.
3. Andá a **Settings > Upload > Upload presets > Add upload preset**:
   - **Signing Mode: Unsigned**.
   - Guardá y anotá el **nombre del preset**.
4. Estos dos valores van como variables del frontend (paso 4): `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` y `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.

> No son datos secretos: el preset "unsigned" está pensado para subir desde el navegador.

## 3. Backend en Render

1. Subí el repo del backend a GitHub.
2. En https://render.com: **New > Blueprint** (usa el `render.yaml` del repo) o **New > Web Service** con:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
3. Cargá las variables de entorno:
   | Variable | Valor |
   |---|---|
   | `MONGODB_CONNECTION_STRING` | la cadena de Atlas (paso 1) |
   | `JWT_SECRET` | un texto largo y secreto |
   | `JWT_EXPIRES_IN` | `1d` |
   | `FRONTEND_URL` | la URL de Netlify (paso 4) — podés cargarla después |
   | `NODE_ENV` | `production` |
4. Deploy. Al terminar tendrás una URL tipo `https://tienda-sol-backend.onrender.com`. Probá `…/health`.

## 4. Frontend en Netlify

1. Subí el repo del frontend a GitHub.
2. En https://netlify.com: **Add new site > Import an existing project**, elegí el repo.
   - Netlify detecta Next.js. El `netlify.toml` ya define el build (`npm run build`).
3. En **Site settings > Environment variables** cargá:
   | Variable | Valor |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | la URL del backend en Render (paso 3) |
   | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | tu cloud name (paso 2) |
   | `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | tu upload preset (paso 2) |
4. Deploy. Tendrás una URL tipo `https://tienda-sol.netlify.app`.
5. **Volvé a Render** y poné esa URL en la variable `FRONTEND_URL` del backend (para el CORS). Redeploy del backend.

## 5. Publicar una nueva versión (cada release)

Como Render y Netlify están conectados a GitHub, el deploy es automático:
1. Trabajá en una rama `feature/...`, abrí PR y mergeá a `main`.
2. Al mergear a `main`, **Render** y **Netlify** despliegan solos la nueva versión.
3. Si cambiaste variables de entorno, actualizalas en cada panel y forzá un redeploy.

## Checklist de verificación post-deploy
- [ ] `GET https://<backend>/health` responde 200.
- [ ] `https://<backend>/api-docs` muestra Swagger.
- [ ] El frontend abre y el catálogo trae productos (integración OK).
- [ ] Login, crear pedido, notificaciones y panel del vendedor funcionan.
- [ ] Subir una imagen desde el panel del vendedor funciona (Cloudinary).

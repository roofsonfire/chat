# GitHub Actions Deployment Setup

Esta guía te ayudará a configurar el deployment automático a Cloud Run usando GitHub Actions.

## 📋 Overview

El workflow de GitHub Actions (`deploy-staging.yml`) se ejecuta automáticamente cuando:

- Haces push a la rama `main`
- Ejecutas manualmente desde la UI de GitHub

El workflow hace:

1. ✅ Builds the Docker image
2. ✅ Pushes to Artifact Registry
3. ✅ Deploys to Cloud Run
4. ✅ Maps custom domain
5. ✅ Verifies deployment
6. ✅ Rollback automático si falla

## 🔐 Paso 1: Crear Service Account en Google Cloud

### Opción A: Usar gcloud CLI (Recomendado)

```bash
# Configurar variables
PROJECT_ID="norse-breaker-474323-n8"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Crear service account
gcloud iam service-accounts create $SA_NAME \
    --description="Service account for GitHub Actions deployments" \
    --display-name="GitHub Actions"

# Dar permisos necesarios
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.admin"

# Crear y descargar la key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# Mostrar el contenido (lo necesitarás para GitHub)
cat github-actions-key.json

# ⚠️ IMPORTANTE: Guarda este archivo de forma segura
# Después de agregarlo a GitHub, elimínalo:
# rm github-actions-key.json
```

### Opción B: Usar Google Cloud Console

1. Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts?project=norse-breaker-474323-n8
2. Click "Create Service Account"
3. Nombre: `github-actions`
4. Description: `Service account for GitHub Actions deployments`
5. Click "Create and Continue"
6. Agregar roles:
   - Cloud Run Admin
   - Storage Admin
   - Service Account User
   - Artifact Registry Administrator
7. Click "Continue" → "Done"
8. Click en el service account creado
9. Tab "Keys" → "Add Key" → "Create new key"
10. Tipo: JSON
11. Click "Create" (descargará el archivo)

## 🔑 Paso 2: Agregar Secret a GitHub

### Opción A: Usando GitHub CLI

```bash
# Instalar GitHub CLI si no lo tienes
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh

# Autenticarte
gh auth login

# Agregar el secret (usa el contenido del JSON)
gh secret set GCP_SA_KEY < github-actions-key.json

# Verificar
gh secret list
```

### Opción B: Usando GitHub UI

1. Ve a tu repositorio: https://github.com/roofsonfire/chat
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `GCP_SA_KEY`
5. Value: Pega el contenido del archivo `github-actions-key.json`
6. Click "Add secret"

## ✅ Paso 3: Verificar el Workflow

### Verificar que existe el workflow

```bash
cat .github/workflows/deploy-staging.yml
```

### Trigger manual (primera vez)

1. Ve a: https://github.com/roofsonfire/chat/actions
2. Click en "Deploy to Cloud Run (Staging)"
3. Click "Run workflow" → "Run workflow"
4. Espera y monitorea el progreso

### Push automático

```bash
# Cualquier push a main triggereará el deployment
git add .
git commit -m "feat: enable GitHub Actions deployment"
git push origin main

# Monitorea en:
# https://github.com/roofsonfire/chat/actions
```

## 📊 Paso 4: Monitorear el Deployment

### En GitHub

1. Ve a: https://github.com/roofsonfire/chat/actions
2. Click en el workflow que se está ejecutando
3. Click en el job "Deploy to Cloud Run"
4. Ve los logs en tiempo real

### En Google Cloud Console

```bash
# Ver logs del servicio
gcloud run logs tail chat-staging --region=us-central1

# Ver detalles del servicio
gcloud run services describe chat-staging --region=us-central1

# Ver revisiones (deployments)
gcloud run revisions list --service=chat-staging --region=us-central1
```

## 🔧 Configuración del Workflow

El workflow está en `.github/workflows/deploy-staging.yml` y tiene esta configuración:

```yaml
env:
  PROJECT_ID: norse-breaker-474323-n8
  REGION: us-central1
  SERVICE_NAME: chat-staging
  DOMAIN: staging.chat.daza.ar
```

### Modificar recursos del servicio

Edita estas líneas en el workflow:

```yaml
flags: |
  --memory=1Gi        # Cambiar memoria
  --cpu=1             # Cambiar CPU
  --max-instances=10  # Máximo de instancias
  --min-instances=0   # Mínimo de instancias
```

### Agregar variables de entorno

```yaml
env_vars: |
  NODE_ENV=production
  TU_NUEVA_VAR=valor
```

## 🎯 Testing del Setup

### Test 1: Verificar Service Account

```bash
# Listar service accounts
gcloud iam service-accounts list

# Verificar permisos
gcloud projects get-iam-policy norse-breaker-474323-n8 \
    --flatten="bindings[].members" \
    --format="table(bindings.role)" \
    --filter="bindings.members:github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com"
```

### Test 2: Verificar Secret en GitHub

```bash
# Usando GitHub CLI
gh secret list
# Deberías ver: GCP_SA_KEY
```

### Test 3: Dry Run del Workflow

Haz un commit pequeño para probar:

```bash
# Crear un cambio pequeño
echo "# GitHub Actions Enabled" >> README.md
git add README.md
git commit -m "test: verify GitHub Actions deployment"
git push origin main

# Monitorea en:
# https://github.com/roofsonfire/chat/actions
```

## 🚨 Troubleshooting

### Error: "Permission denied" o "403 Forbidden"

**Problema**: Service account no tiene permisos suficientes

**Solución**:

```bash
PROJECT_ID="norse-breaker-474323-n8"
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"


gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/cloudbuild.builds.builder"
```

### Error: "Secret GCP_SA_KEY not found"

**Problema**: Secret no está configurado en GitHub

**Solución**:

1. Ve a: https://github.com/roofsonfire/chat/settings/secrets/actions
2. Verifica que existe `GCP_SA_KEY`
3. Si no existe, créalo con el contenido del JSON

### Error: "Failed to push image"

**Problema**: Artifact Registry no está habilitado o no existe el repository

**Solución**:

```bash
# Habilitar API
gcloud services enable artifactregistry.googleapis.com

# Crear repository si no existe
gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker images for Cloud Run deployments"
```

### Workflow no se ejecuta automáticamente

**Problema**: El workflow no se triggerea en push a main

**Solución**:

1. Verifica que el archivo existe: `.github/workflows/deploy-staging.yml`
2. Verifica que la sintaxis YAML es correcta
3. Ve a GitHub Actions y verifica si hay errores
4. Asegúrate de hacer push a `main` (no otra rama)

## 🔐 Seguridad

### Mejores Prácticas

1. ✅ **Service Account con permisos mínimos**: Solo dar los roles necesarios
2. ✅ **Rotar keys regularmente**: Crear nueva key cada 90 días
3. ✅ **No commitear el JSON key**: Está en `.gitignore`
4. ✅ **Usar Workload Identity** (alternativa más segura):

```yaml
# En deploy-staging.yml, reemplazar:
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: "projects/123456789/locations/global/workloadIdentityPools/github/providers/github"
    service_account: "github-actions@norse-breaker-474323-n8.iam.gserviceaccount.com"
```

### Eliminar Service Account (si necesitas reset)

```bash
PROJECT_ID="norse-breaker-474323-n8"
SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Eliminar service account
gcloud iam service-accounts delete $SA_EMAIL
```

## 📈 Mejoras Futuras

### 1. Agregar Environment en GitHub

Ve a: https://github.com/roofsonfire/chat/settings/environments

1. Crear environment "staging"
2. Agregar "Required reviewers" si quieres aprobación manual
3. Agregar "Wait timer" para delays antes de deployment

Luego en el workflow:

```yaml
jobs:
  deploy:
    environment: staging # Requiere configuración en GitHub
```

### 2. Agregar Notificaciones

Agregar step para notificar en Slack/Discord:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Deployment Preview para PRs

Crear staging temporal por cada PR (más avanzado)

## 📚 Recursos

- [GitHub Actions - Google Cloud](https://github.com/google-github-actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Service Account Best Practices](https://cloud.google.com/iam/docs/best-practices-service-accounts)

---

## ✅ Checklist Completo

- [ ] Service account creado en Google Cloud
- [ ] Permisos agregados al service account
- [ ] JSON key descargado
- [ ] Secret `GCP_SA_KEY` agregado en GitHub
- [ ] Workflow file existe: `.github/workflows/deploy-staging.yml`
- [ ] Test deployment ejecutado
- [ ] Deployment exitoso verificado
- [ ] Service accesible en: https://staging.chat.daza.ar
- [ ] JSON key eliminado localmente (seguridad)

**¿Listo para empezar?** Ejecuta los comandos del Paso 1! 🚀

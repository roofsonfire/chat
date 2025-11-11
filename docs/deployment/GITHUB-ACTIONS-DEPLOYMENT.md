# GitHub Actions Deployment Setup

This guide will help you set up automated deployment to Cloud Run using GitHub Actions.

## 📋 Overview

The GitHub Actions workflow (`deploy-production.yml`) runs automatically when:

- The `main` branch passes the CI workflow successfully (`workflow_run`)
- You run it manually from the GitHub UI

The workflow does:

1. ✅ Builds the Docker image
2. ✅ Pushes to Artifact Registry
3. ✅ Deploys to Cloud Run
4. ✅ Maps custom domain
5. ✅ Verifies deployment
6. ✅ Automatic rollback if it fails

> **Important (Nov 2025)**: workflow authentication no longer uses JSON keys. It's now required to configure [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation) and expose **two secrets** in GitHub:
>
> - `GCP_WORKLOAD_IDENTITY_PROVIDER`: provider resource (`projects/<project-number>/locations/global/workloadIdentityPools/<pool>/providers/<provider>`)
> - `GCP_SERVICE_ACCOUNT_EMAIL`: service account that the workflow will assume (`github-actions@<project-id>.iam.gserviceaccount.com`)
>
> The `GCP_SA_KEY` secret is legacy and should be removed once migrated.

## 🔐 Step 1: Create Workload Identity Federation + Service Account

### 1. Create the Workload Identity Pool and Provider (CLI)

```bash
PROJECT_ID="norse-breaker-474323-n8"
POOL_ID="github-actions"
PROVIDER_ID="github-oidc"

gcloud iam workload-identity-pools create "$POOL_ID" \
    --project="$PROJECT_ID" \
    --location="global" \
    --display-name="GitHub Actions"

gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --project="$PROJECT_ID" \
    --location="global" \
    --workload-identity-pool="$POOL_ID" \
    --display-name="GitHub OIDC" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.ref=assertion.ref"

gcloud iam service-accounts create github-actions \
    --project="$PROJECT_ID" \
    --description="Service account for GitHub deployments" \
    --display-name="GitHub Actions"

gcloud iam service-accounts add-iam-policy-binding \
    github-actions@$PROJECT_ID.iam.gserviceaccount.com \
    --project="$PROJECT_ID" \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/projects/$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')/locations/global/workloadIdentityPools/$POOL_ID/attribute.repository/roofsonfire/chat"
```

### 2. Assign Permissions to the Service Account

Use the same bindings described in the previous section (`roles/run.admin`, `roles/storage.admin`, etc.) on `github-actions@$PROJECT_ID.iam.gserviceaccount.com`.

### 3. Get the Values to Upload as Secrets

```bash
PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
echo "Provider: projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_ID/providers/$PROVIDER_ID"
echo "Service Account: github-actions@$PROJECT_ID.iam.gserviceaccount.com"
```

Save both values; we'll use them in Step 2.

> ⚠️ **Still need JSON keys?**
> Only keep them temporarily during migration. The new workflow will fail if `GCP_WORKLOAD_IDENTITY_PROVIDER` or `GCP_SERVICE_ACCOUNT_EMAIL` are not configured.

---

### (Legacy) Create Service Account with JSON Keys

### Option A: Use gcloud CLI (Recommended)

```bash
# Configurar variables
PROJECT_ID="norse-breaker-474323-n8"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create $SA_NAME \
    --description="Service account for GitHub Actions deployments" \
    --display-name="GitHub Actions"

# Give necessary permissions
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

# Create and download the key
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# Display the content (you'll need this for GitHub)
cat github-actions-key.json

# ⚠️ IMPORTANT: Save this file securely
# After adding it to GitHub, delete it:
# rm github-actions-key.json
```

### Option B: Use Google Cloud Console

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

### Secrets requeridos (Workload Identity Federation)

```bash
gh secret set GCP_WORKLOAD_IDENTITY_PROVIDER --body "projects/<project-number>/locations/global/workloadIdentityPools/<pool>/providers/<provider>"
gh secret set GCP_SERVICE_ACCOUNT_EMAIL --body "github-actions@<project-id>.iam.gserviceaccount.com"
```

> 💡 Recomendado: mantener `PROJECT_ID`, `REGION` y otros parámetros estáticos como **Repository Variables** (`Settings → Environments → Variables`).

### Opción Legacy (solo mientras migras): usar GitHub CLI

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

### Opción Legacy B: Usando GitHub UI

1. Ve a tu repositorio: https://github.com/roofsonfire/chat
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `GCP_SA_KEY`
5. Value: Pega el contenido del archivo `github-actions-key.json`
6. Click "Add secret"

## ✅ Paso 3: Verificar el Workflow

### Verificar que existe el workflow

```bash
cat .github/workflows/deploy-production.yml
```

### Trigger manual (primera vez)

1. Ve a: https://github.com/roofsonfire/chat/actions
2. Click en "Deploy to Cloud Run (Production)"
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
gcloud run logs tail chat-production --region=us-central1

# Ver detalles del servicio
gcloud run services describe chat-production --region=us-central1

# Ver revisiones (deployments)
gcloud run revisions list --service=chat-production --region=us-central1
```

## 🔧 Configuración del Workflow

El workflow está en `.github/workflows/deploy-production.yml` y tiene esta configuración:

```yaml
env:
  PROJECT_ID: norse-breaker-474323-n8
  REGION: us-central1
    SERVICE_NAME: chat-production
    DOMAIN: chat.daza.ar
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
# Deberías ver: GCP_WORKLOAD_IDENTITY_PROVIDER, GCP_SERVICE_ACCOUNT_EMAIL
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

### Error: "Secret GCP_WORKLOAD_IDENTITY_PROVIDER not found"

**Problema**: Falta el secreto requerido para Workload Identity Federation.

**Solución**:

1. Ve a: https://github.com/roofsonfire/chat/settings/secrets/actions
2. Confirma que existen `GCP_WORKLOAD_IDENTITY_PROVIDER` y `GCP_SERVICE_ACCOUNT_EMAIL`
3. Copia los valores con los comandos del Paso 1 y vuelve a crear los secretos si están vacíos

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

1. Verifica que el archivo existe: `.github/workflows/deploy-production.yml`
2. Verifica que la sintaxis YAML es correcta
3. Ve a GitHub Actions y verifica si hay errores
4. Asegúrate de hacer push a `main` (no otra rama)

## 🔐 Seguridad

### Mejores Prácticas

1. ✅ **Service Account con permisos mínimos**: Solo dar los roles necesarios
2. ✅ **Sin llaves permanentes**: Usa Workload Identity Federation y elimina `GCP_SA_KEY`
3. ✅ **No commitear credenciales**: Mantén las configuraciones en Secrets/Variables
4. ✅ **Workload Identity Federation habilitada**:

```yaml
# En deploy-production.yml, reemplazar:
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

1. Crear environment "production" (o el que prefieras proteger)
2. Agregar "Required reviewers" si quieres aprobación manual
3. Agregar "Wait timer" para delays antes de deployment

Luego en el workflow:

```yaml
jobs:
  deploy:
    environment: production # Requiere configuración en GitHub
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

Crear entornos temporales por cada PR (más avanzado)

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
- [ ] Secretos `GCP_WORKLOAD_IDENTITY_PROVIDER` y `GCP_SERVICE_ACCOUNT_EMAIL` agregados en GitHub
- [ ] (Legacy) Secret `GCP_SA_KEY` eliminado una vez terminada la migración
- [ ] Workflow file existe: `.github/workflows/deploy-production.yml`
- [ ] Test deployment ejecutado
- [ ] Deployment exitoso verificado
- [ ] Service accesible en: https://chat.daza.ar
- [ ] JSON key eliminado localmente (seguridad)

**¿Listo para empezar?** Ejecuta los comandos del Paso 1! 🚀

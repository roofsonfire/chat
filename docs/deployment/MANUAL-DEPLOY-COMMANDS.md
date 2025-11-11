# Manual Deployment Commands (gcloud CLI)

Si prefieres ejecutar los comandos manualmente sin usar el script automatizado.

## 📋 Prerequisites

```bash
# Autenticarse
gcloud auth login

# Configurar proyecto
gcloud config set project norse-breaker-474323-n8

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

## 🔑 Paso 1: Crear Secrets

### Crear secret para email

```bash
echo -n "tu-email@ejemplo.com" | gcloud secrets create auth-email --data-file=-
```

### Crear secret para password (primero genera el hash)

```bash
# Generar hash bcrypt
node scripts/hash-password.js "tu-password"
# Copia el hash resultante

# Crear secret con el hash
echo -n "PEGA_EL_HASH_AQUI" | gcloud secrets create auth-password-hash --data-file=-
```

### Crear secret para NextAuth

```bash
openssl rand -base64 32 | gcloud secrets create nextauth-secret --data-file=-
```

### Configurar permisos IAM

```bash
# Obtener número de proyecto
PROJECT_NUMBER=$(gcloud projects describe norse-breaker-474323-n8 --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Dar acceso a los secrets
gcloud secrets add-iam-policy-binding auth-email \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding auth-password-hash \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding nextauth-secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
```

## 🚀 Paso 2: Deploy a Cloud Run

```bash
gcloud run deploy chat-staging \
    --source . \
    --platform managed \
    --region us-central1 \
    --project norse-breaker-474323-n8 \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 80 \
    --port 3000 \
    --set-env-vars "NODE_ENV=production" \
    --set-env-vars "GOOGLE_PROJECT_ID=norse-breaker-474323-n8" \
    --set-env-vars "GOOGLE_LOCATION=us-central1" \
    --set-env-vars "GOOGLE_VERTEX_AI_MODEL_ID=gemini-2.5-flash-image" \
    --set-env-vars "NEXTAUTH_URL=https://staging.chat.daza.ar" \
    --update-secrets "NEXTAUTH_SECRET=nextauth-secret:latest" \
    --update-secrets "AUTH_USER_EMAIL=auth-email:latest" \
    --update-secrets "AUTH_USER_PASSWORD_HASH=auth-password-hash:latest"
```

**Nota**: El comando `--source .` hace que Cloud Run:

1. Construya la imagen automáticamente usando Cloud Build
2. Detecte que es una app Next.js
3. Use el Dockerfile si existe, o cree uno automáticamente
4. Publique la imagen en Artifact Registry
5. Despliegue el servicio

## 🌐 Paso 3: Mapear Dominio Personalizado

```bash
gcloud run domain-mappings create \
    --service chat-staging \
    --domain staging.chat.daza.ar \
    --region us-central1
```

**Importante**: Antes de ejecutar este comando, debes:

1. Verificar propiedad del dominio en Google Search Console
2. Agregar el registro CNAME en tu DNS

## 📊 Paso 4: Verificar Deployment

### Ver detalles del servicio

```bash
gcloud run services describe chat-staging --region us-central1
```

### Obtener URL del servicio

```bash
gcloud run services describe chat-staging \
    --region us-central1 \
    --format 'value(status.url)'
```

### Ver estado del domain mapping

```bash
gcloud run domain-mappings describe \
    --domain staging.chat.daza.ar \
    --region us-central1
```

### Ver logs en tiempo real

```bash
gcloud run logs tail chat-staging --region us-central1
```

## 🔄 Actualizar Deployment Existente

### Redesplegar con cambios de código

```bash
gcloud run deploy chat-staging \
    --source . \
    --region us-central1
```

### Actualizar solo variables de entorno

```bash
gcloud run services update chat-staging \
    --region us-central1 \
    --set-env-vars "NEW_VAR=value"
```

### Actualizar secrets

```bash
# Actualizar versión del secret
echo -n "nuevo-valor" | gcloud secrets versions add auth-email --data-file=-

# El servicio usa `:latest` así que usará la nueva versión automáticamente
# O fuerza un nuevo deployment:
gcloud run deploy chat-staging --source . --region us-central1
```

## 🗑️ Eliminar Deployment

```bash
# Eliminar domain mapping
gcloud run domain-mappings delete \
    --domain staging.chat.daza.ar \
    --region us-central1

# Eliminar servicio
gcloud run services delete chat-staging --region us-central1

# Eliminar secrets (opcional)
gcloud secrets delete auth-email
gcloud secrets delete auth-password-hash
gcloud secrets delete nextauth-secret
```

## 📝 Comandos Útiles

### Listar los servicios

```bash
gcloud run services list --region us-central1
```

### Listar domain mappings

```bash
gcloud run domain-mappings list --region us-central1
```

### Listar secrets

```bash
gcloud secrets list
```

### Ver versiones de un secret

```bash
gcloud secrets versions list auth-email
```

### Ver configuración actual del proyecto

```bash
gcloud config list
```

### Ver logs recientes con filtros

```bash
# Solo errores
gcloud run logs read chat-staging \
    --region us-central1 \
    --log-filter='severity>=ERROR' \
    --limit=50

# Buscar texto específico
gcloud run logs read chat-staging \
    --region us-central1 \
    --log-filter='textPayload:"error"' \
    --limit=50
```

## � Errores Comunes de gcloud y Soluciones

### Error: Permisos insuficientes

**Síntoma:**

```bash
ERROR: (gcloud.run.deploy) PERMISSION_DENIED: Permission 'run.services.create' denied
```

**Diagnóstico:**

```bash
# Verificar usuario actual
gcloud auth list

# Ver permisos
gcloud projects get-iam-policy norse-breaker-474323-n8 \
  --flatten="bindings[].members" \
  --filter="bindings.members:user:$(gcloud config get-value account)"
```

**Solución:**

```bash
# Agregar rol necesario
gcloud projects add-iam-policy-binding norse-breaker-474323-n8 \
  --member="user:TU_EMAIL@ejemplo.com" \
  --role="roles/run.admin"
```

### Error: API no habilitada

**Síntoma:**

```bash
ERROR: (gcloud.run.deploy) FAILED_PRECONDITION: Cloud Run API has not been used before
```

**Solución:**

```bash
# Habilitar todas las APIs necesarias
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com \
  secretmanager.googleapis.com

# Verificar
gcloud services list --enabled | grep -E "run|build|artifact"
```

### Error: Secret no encontrado

**Síntoma:**

```bash
ERROR: (gcloud.run.deploy) INVALID_ARGUMENT: Secret 'auth-email' not found
```

**Diagnóstico:**

```bash
# Listar secrets existentes
gcloud secrets list

# Verificar secret específico
gcloud secrets describe auth-email
```

**Solución:**

```bash
# Crear secret faltante
echo -n "tu-email@ejemplo.com" | gcloud secrets create auth-email --data-file=-

# Verificar permisos
gcloud secrets get-iam-policy auth-email
```

### Error: Cuota excedida

**Síntoma:**

```bash
ERROR: (gcloud.run.deploy) RESOURCE_EXHAUSTED: Quota exceeded
```

**Diagnóstico:**

```bash
# Ver cuotas actuales
gcloud compute project-info describe --project=norse-breaker-474323-n8
```

**Solución:**

```bash
# Reducir límites temporalmente
gcloud run services update chat-staging \
  --region=us-central1 \
  --memory=512Mi \
  --max-instances=5

# Solicitar aumento de cuota en:
# https://console.cloud.google.com/iam-admin/quotas
```

### Error: Build de Docker falla

**Síntoma:**

```bash
ERROR: (gcloud.run.deploy) Cloud Build failed with status: FAILURE
```

**Diagnóstico:**

```bash
# Ver logs recientes
gcloud builds list --limit=5

# Ver log específico
BUILD_ID=$(gcloud builds list --limit=1 --format="value(id)")
gcloud builds log $BUILD_ID
```

**Solución:**

```bash
# Verificar .gcloudignore
cat .gcloudignore

# Probar build localmente
docker build -t test-image .

# Aumentar timeout si es necesario
gcloud run deploy chat-staging \
  --source . \
  --timeout=600 \
  --region=us-central1
```

## �🔧 Troubleshooting

### Ver por qué falló un deployment

```bash
gcloud run services describe chat-staging \
    --region us-central1 \
    --format yaml
```

### Ver revisiones (versiones) del servicio

```bash
gcloud run revisions list \
    --service chat-staging \
    --region us-central1
```

### Rollback a revisión anterior

```bash
# Listar revisiones
gcloud run revisions list --service chat-staging --region us-central1

# Cambiar tráfico a revisión específica
gcloud run services update-traffic chat-staging \
    --region us-central1 \
    --to-revisions REVISION_NAME=100
```

### Ver cuotas y límites

```bash
gcloud run services describe chat-staging \
    --region us-central1 \
    --format='value(spec.template.spec.containers[0].resources)'
```

---

## 🎯 Comparación: Script vs Manual

| Aspecto              | Script (`./deploy-staging.sh`) | Manual                        |
| -------------------- | ------------------------------ | ----------------------------- |
| **Velocidad**        | ⚡ Rápido (1 comando)          | 🐢 Lento (múltiples comandos) |
| **Validaciones**     | ✅ Automáticas                 | ⚠️ Manuales                   |
| **Errores**          | 🛡️ Manejo integrado            | ❌ Debes manejar tú           |
| **Reproducibilidad** | ✅ Consistente                 | ⚠️ Puede variar               |
| **Control**          | 📦 Completo pero empaquetado   | 🎮 Control total              |
| **Aprendizaje**      | 📚 Menos visible               | 👨‍🎓 Más educativo              |

## 💡 Recomendación

- **Para deployment regular**: Usa `./deploy-staging.sh` ⚡
- **Para debugging**: Usa comandos manuales 🔍
- **Para CI/CD**: Adapta el script o usa comandos manuales 🤖
- **Para aprender**: Ejecuta comandos manuales una vez 👨‍🎓

---

**Next Steps**:

1. Verifica que tengas gcloud CLI instalado: `gcloud --version`
2. Autentica: `gcloud auth login`
3. Elige tu método preferido y despliega! 🚀

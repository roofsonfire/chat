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

## 🔧 Troubleshooting

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

# OAuth Redirect URI Configuration

**Last Updated**: November 2025  
**Status**: Active - Production issue resolved

## Problem

When deploying to a custom domain or production environment, you may encounter OAuth callback errors:

### Error Type 1: `redirect_uri_mismatch`

```
Error 400: redirect_uri_mismatch
```

### Error Type 2: `OAuthCallback` (Production Issue - Nov 2025)

```
https://chat.daza.ar/login?callbackUrl=https%3A%2F%2Fchat.daza.ar%2Flogin%3Ffrom%3D%252F&error=OAuthCallback
```

**Symptoms**:

- User can authenticate with Google successfully
- After authentication, redirected back to login page
- URL shows `error=OAuthCallback` parameter
- Session is not established

**Root Cause**: The OAuth credentials don't include the production domain's callback URL in the authorized redirect URIs list.

## Solution

### 🚨 Production Quick Fix (November 2025)

**Current Production Issue**: OAuth Client ID `1025958277405-dd54mmjpgq4ilopkt8h6d123e54npd3o`

1. **Go directly to credentials**:
   - https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8

2. **Click on the OAuth 2.0 Client ID**:
   - Client ID: `1025958277405-dd54mmjpgq4ilopkt8h6d123e54npd3o.apps.googleusercontent.com`

3. **Under "Authorized redirect URIs", ADD**:

   ```
   https://chat.daza.ar/api/auth/callback/google
   ```

4. **Click SAVE**

5. **Wait 1-2 minutes** for Google to propagate the changes

6. **Clear browser cookies** for `chat.daza.ar` (optional but recommended)

7. **Test login** at https://chat.daza.ar

---

### Automated Helper Script

For future deployments, run:

```bash
./scripts/deployment/update-oauth-redirect-uris.sh
```

### Manual Steps (Complete Configuration)

1. **Open Google Cloud Console**:
   - Navigate to: https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8
   - Or: APIs & Services → Credentials

2. **Find Your OAuth 2.0 Client ID**:
   - Look for the OAuth 2.0 Client with type "Web client"
   - Client ID: `1025958277405-dd54mmjpgq4ilopkt8h6d123e54npd3o`

3. **Add Authorized Redirect URIs**:

   ```
   ✓ https://chat.daza.ar/api/auth/callback/google
   ✓ https://chat-production-v2xv6gugxa-uc.a.run.app/api/auth/callback/google
   ✓ http://localhost:3000/api/auth/callback/google
   ```

4. **Add Authorized JavaScript Origins**:

   ```
   ✓ https://chat.daza.ar
   ✓ https://chat-production-v2xv6gugxa-uc.a.run.app
   ✓ http://localhost:3000
   ```

5. **Click 'SAVE'**

6. **Wait 5-10 minutes** for changes to propagate

## Verification

After updating, test the login flow:

```bash
# Once SSL certificate is provisioned
curl -I https://chat.daza.ar

# Should see HTTP 200 or 307 (redirect to login)
# No more OAuth errors
```

## Common Issues

### Issue: Changes not taking effect immediately

**Solution**: OAuth configuration changes can take 5-10 minutes to propagate. Wait and try again.

### Issue: Still seeing certificate errors

**Solution**: This is separate from OAuth - wait for SSL certificate provisioning:

```bash
gcloud beta run domain-mappings describe --domain=chat.daza.ar --region=us-central1
```

### Issue: Wrong redirect URI in error message

**Solution**: Clear browser cache/cookies and try again. Old sessions may be cached.

## Reference

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors-redirect-uri-mismatch)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)

## Related Files

- Environment config: `src/lib/env.ts`
- Auth config: `src/lib/auth/config.ts`
- Allowlist: `src/lib/auth/allowlist.ts`

---

**Last Updated**: November 7, 2025  
**Status**: Documented for production deployment

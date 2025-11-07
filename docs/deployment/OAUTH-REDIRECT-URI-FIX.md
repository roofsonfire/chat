# OAuth Redirect URI Configuration

## Problem

When deploying to a custom domain, you may encounter this error:

```
Error 400: redirect_uri_mismatch
```

This occurs because the OAuth credentials don't include the new domain's callback URL.

## Solution

### Quick Fix

Run the automated helper script:

```bash
./scripts/deployment/update-oauth-redirect-uris.sh
```

### Manual Steps

1. **Open Google Cloud Console**:
   - Navigate to: https://console.cloud.google.com/apis/credentials?project=norse-breaker-474323-n8
   - Or: APIs & Services → Credentials

2. **Find Your OAuth 2.0 Client ID**:
   - Look for the OAuth 2.0 Client with type "Web client"
   - Click on it to edit

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

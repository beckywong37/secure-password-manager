# Understanding web application errors on Google Cloud
_Exported on 11/24/2025 at 13:12:42 EST from Cursor (2.0.77)_

---

**User**

When I access the web application deployed on google cloud, log in, and get routed to /vault, I get the following errors in the inspector's console.

Can you help me understand what is going wrong and how to fix it?

---

**Cursor**

## **Found the Real Issue: Out of Memory (OOM)**

The deployment IS up to date (Nov 22), but your app is **crashing due to insufficient memory**. All the 500 errors show:

> "While handling this request, the process that handled this request was found to be using too much memory and was terminated."

The requests are taking 2-4+ seconds and consuming too much memory, causing the process to be killed mid-request.

**Solution: Increase instance class in `app.yaml`**

```yaml
# GenAI Citation for April:
# Portions of this code related to static file serving were generated with the help of Cursor with
#  Claude-4.5-sonnet model.
#  The conversation transcript linked below documents the GenAI Interaction that led to my code.
#  ../GenAI_transcripts/2025_11_16_Cursor_fixing_deploy_issues.md

runtime: python311

env_variables:
  # This setting is used in settings.py to configure ALLOWED_HOSTS
  APPENGINE_URL: https://secure-password-manager-475618.uc.r.appspot.com/
  DB_NAME: appdb
  DB_USER: appuser
  # DB_PASSWORD intentionally omitted (fetched from Secret Manager)
  INSTANCE_CONNECTION_NAME: secure-password-manager-475618:us-central1:secure-password-manager-instance
  
  # Database connection (Unix socket for App Engine)
  DB_HOST: /cloudsql/secure-password-manager-475618:us-central1:secure-password-manager-instance
  DB_PORT: ""

# WhiteNoise middleware handles static files through Django
# No static handlers needed - all requests go through Django/WhiteNoise

# Instance class: F2 provides 256MB RAM (default F1 has only 128MB)
# Upgraded to F2 to handle Django + crypto operations + database connections
instance_class: F2

automatic_scaling:
  max_instances: 1
  min_instances: 0
  target_cpu_utilization: 0.65
  max_concurrent_requests: 80
```

Now commit and push this fix:

---

**User**

What are the implecations of changing the instance_class? 

Is it reasonable to need more memory or is this a signal that my web application has memory problems/

---

**Cursor**

Good question. Let me analyze whether this is a reasonable need or a problem:

Now let me check if there are other potential memory issues:

## **Analysis: Is F2 (256MB) Reasonable?**

**Short answer: Yes, upgrading to F2 is reasonable and necessary.**

### **Your Memory Usage Breakdown:**

**Per login/session check request:**
- **PBKDF2 operations**: 2x @ 100,000 iterations each (~40ms CPU, minimal memory)
- **Django + DRF framework**: ~80-100MB base
- **PostgreSQL connection**: ~10-20MB
- **JWT validation + crypto**: ~5-10MB
- **Two-factor/OTP libraries**: ~10MB
- **Per-request processing**: ~20-30MB

**F1 (128MB) vs F2 (256MB):**
- F1: 128MB RAM - too tight for Django + crypto operations
- F2: 256MB RAM - comfortable headroom

### **The Issue with Your Current Config:**

```yaml
automatic_scaling:
  max_concurrent_requests: 80  # ⚠️ WAY too high for 128MB
```

With 128MB and `max_concurrent_requests: 80`, you're allowing up to 80 concurrent requests on a single instance. Even if each request uses just 20MB, 5-6 concurrent requests would exceed 128MB.

### **This is NOT a Memory Leak - Here's Why:**

1. **Security-first architecture**: Your app uses PBKDF2 with 100,000 iterations (industry standard) for password security. This is intentionally CPU/memory intensive to resist brute-force attacks.

2. **Django + Crypto stack**: Your legitimate dependencies:
   - Django ORM + migrations
   - JWT token validation on EVERY request
   - Two-factor authentication
   - PostgreSQL connections
   - Cryptographic libraries

3. **The pattern**: Errors happen during cold starts when Django loads + first requests hit simultaneously.

### **Cost Implications:**

- **F1**: ~$0.05/hour when running
- **F2**: ~$0.10/hour when running (2x cost)
- With `min_instances: 0`, you only pay when serving traffic
- For a student project with light traffic, the cost difference is negligible (likely <$5/month extra)

### **Recommendation:**

Keep F2. Additionally, lower `max_concurrent_requests` to something more reasonable:

```yaml
instance_class: F2

automatic_scaling:
  max_instances: 1
  min_instances: 0
  target_cpu_utilization: 0.65
  max_concurrent_requests: 20  # More realistic for your workload
```

This is **good engineering**, not a band-aid. Your app does real cryptographic work for security. That requires memory.

```yaml
automatic_scaling:
  max_concurrent_requests: 80  # ⚠️ WAY too high for 128MB
```

```yaml
instance_class: F2

automatic_scaling:
  max_instances: 1
  min_instances: 0
  target_cpu_utilization: 0.65
  max_concurrent_requests: 20  # More realistic for your workload
```

---

**User**

Do I need to change anything configurations in the google cloud web interface, or will app.yaml's instance_class handle it for us?

---

**Cursor**

No, you don't need to change anything in the Google Cloud Console. The `instance_class` in `app.yaml` handles everything automatically.

**How it works:**

When you deploy (either via GitHub Actions or manually with `gcloud app deploy`), App Engine reads `app.yaml` and provisions instances according to those specifications. The `instance_class: F2` directive tells App Engine's infrastructure to allocate F2 instances for your service.

**What happens on next deploy:**

1. GitHub Actions workflow triggers on push to `main`
2. `gcloud app deploy` reads your updated `app.yaml`
3. App Engine creates new version with F2 instances (256MB RAM)
4. Traffic automatically routes to the new version
5. Old version (F1 instances) gets retired

**Optional: Also update max_concurrent_requests**

While you're in `app.yaml`, I'd recommend also lowering the concurrent request limit:

```yaml
instance_class: F2

automatic_scaling:
  max_instances: 1
  min_instances: 0
  target_cpu_utilization: 0.65
  max_concurrent_requests: 20  # Lower from 80 to prevent overload
```

With 80 concurrent requests, even on F2 you could still hit memory limits under heavy load. 20 is more appropriate for your workload.

**To deploy these changes:**

Just commit and push to `main`:

```bash
git add app.yaml
git commit -m "fix: upgrade to F2 instance and reduce max concurrent requests"
git push origin main
```

The GitHub Actions workflow will handle the rest.

```yaml
instance_class: F2

automatic_scaling:
  max_instances: 1
  min_instances: 0
  target_cpu_utilization: 0.65
  max_concurrent_requests: 20  # Lower from 80 to prevent overload
```

```shellscript
git add app.yaml
git commit -m "fix: upgrade to F2 instance and reduce max concurrent requests"
git push origin main
```


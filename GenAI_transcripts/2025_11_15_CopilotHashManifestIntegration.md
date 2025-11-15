**User**

I need to integrate a React frontend build system with Django so that:
- The frontend build generates hashed static asset filenames (JS, CSS, images, etc.).
- Django can correctly reference those hashed assets at runtime.
- A manifest file from the frontend build can be used to map asset names to their hashed output.
- A Django template tag can read that manifest and dynamically insert the correct asset URLs.
- The built frontend files are placed into Django’s static directory.
- Django renders an HTML entry template that loads the compiled frontend application.

**Copilot**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // or whatever plugin you use
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    // generate manifest.json with mappings like "index.js": "index-<hash>.js"
    manifest: true,
    // change this to point at your Django static output directory
    outDir: path.resolve(__dirname, "../../backend/static/"), 
    rollupOptions: {
      input: path.resolve(__dirname, "index.html"),
    },
  },
  // ensure base is correct for Django served files (optional)
  base: "/static/", 
});
```

```python
from django import template
from django.conf import settings
from django.templatetags.static import static
import json
import os
from functools import lru_cache

register = template.Library()

@lru_cache(maxsize=1)
def _load_manifest():
    # Try STATIC_ROOT first (deployment), then STATICFILES_DIRS (dev), then project static dir
    candidates = []
    if getattr(settings, "STATIC_ROOT", None):
        candidates.append(os.path.join(settings.STATIC_ROOT, "manifest.json"))
    if getattr(settings, "STATICFILES_DIRS", None):
        for d in settings.STATICFILES_DIRS:
            candidates.append(os.path.join(d, "manifest.json"))
    # fallback: look in a "static" sibling folder to backend project
    candidates.append(os.path.join(settings.BASE_DIR, "static", "manifest.json"))
    for path in candidates:
        try:
            with open(path, "r", encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            continue
    return {}

@register.simple_tag
def asset_url(logical_name: str):
    """
    Returns a full static URL for the built asset (uses manifest.json to map logical_name ->
    hashed filename). Usage in template:
      {% load asset_manifest %}
      <script src="{% asset_url 'index.js' %}"></script>
    If manifest.json is missing or doesn't contain the key, falls back to static(logical_name).
    """
    manifest = _load_manifest()
    resolved = manifest.get(logical_name)
    if isinstance(resolved, dict) and "file" in resolved:
        resolved = resolved["file"]
    if not resolved:
        resolved = logical_name
    return static(resolved)
```

```html
{% load static %}
{% load asset_manifest %}

<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>App</title>
    <!-- example: Vite normally outputs index.css and index.js; use the logical names used by your build -->
    <link rel="stylesheet" href="{% asset_url 'index.css' %}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="{% asset_url 'index.js' %}"></script>
  </body>
</html>
```
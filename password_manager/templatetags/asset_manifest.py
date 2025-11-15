"""
GenAI Citation:
Code generated with the help of GitHub Copilot.
See reference document: `2025_11_15_CopilotHashManifestIntegration.md`
"""

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
def asset_url(logical_name: str, kind: str = "file"):
    """
    Returns a URL for a built asset from Vite's manifest.json.
    Example usage:
      {% asset_url 'index.html' 'file' %}  → JS file
      {% asset_url 'index.html' 'css' %}   → first CSS file
    """
    manifest = _load_manifest()
    entry = manifest.get(logical_name)

    if not entry:
        return static(logical_name)

    # JS file
    if kind == "file":
        return static(entry["file"])

    # CSS files (array)
    if kind == "css":
        css_files = entry.get("css", [])
        if css_files:
            return static(css_files[0])

    # fallback
    return static(logical_name)

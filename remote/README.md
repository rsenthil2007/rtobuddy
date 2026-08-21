# Serve ads-config.json from InterServer

## Important

| Path | Purpose |
|------|---------|
| `sftp://root@157.250.205.140/opt/rtobuddy/ads-config.json` | **Upload/edit** the file (you / admin) |
| `https://157.250.205.140/rtobuddy/ads-config.json` | **What the app downloads** on every launch |

The Android app cannot use SFTP. Nginx must expose `/opt/rtobuddy/` over HTTP(S).

## 1. Put the JSON on the server (SFTP)

Upload this content to `/opt/rtobuddy/ads-config.json`:

```json
{
  "ads": "Disabled",
  "bannerEnabled": true,
  "bannerPosition": "bottom",
  "interstitialBetweenQuests": true,
  "interstitialCooldownSec": 5,
  "message": "Controlled from InterServer /opt/rtobuddy/ads-config.json"
}
```

To turn ads on later, change only:

```json
"ads": "Enabled"
```

## 2. Nginx — expose the folder

Create `/etc/nginx/sites-available/rtobuddy-ads` (or add to your existing site):

```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name 157.250.205.140;

    # Keep your existing SSL certs here if already configured.

    location /rtobuddy/ {
        alias /opt/rtobuddy/;
        default_type application/json;
        add_header Cache-Control "no-store";
        add_header Access-Control-Allow-Origin *;
    }
}
```

Then:

```bash
sudo mkdir -p /opt/rtobuddy
sudo chmod -R a+rX /opt/rtobuddy
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Verify from any PC

```bash
curl -k https://157.250.205.140/rtobuddy/ads-config.json
# or
curl http://157.250.205.140/rtobuddy/ads-config.json
```

You should see the JSON (not 404 HTML).

## 4. App behaviour

On every launch (and Tools → Refresh remote ads config):

1. App GETs `https://157.250.205.140/rtobuddy/ads-config.json`
2. If that fails, tries `http://…` fallback
3. If both fail → **ads stay Disabled** (safe default)
4. If `"ads": "Enabled"` → banner + quest interstitial turn on

No app rebuild is needed to flip Enabled/Disabled — only edit the server JSON.

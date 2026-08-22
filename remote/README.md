# Remote ads config (simple: use myChat HTTPS root)

Temporarily host the file **next to myChat `index.html`**. No nginx changes.

## Public URL the app uses

`https://157.250.205.140/ads-config.json`

## Sequence

1. SFTP into the **same folder** that already serves myChat (`https://157.250.205.140/` — that folder contains `index.html`).
2. Upload `ads-config.json` there (copy from this repo’s `remote/ads-config.json`).
3. In a browser or terminal, open:
   `https://157.250.205.140/ads-config.json`  
   You should see JSON, not 404.
4. Install the new APK (1.8.2+). On launch it reads that URL.
5. To turn ads on later, edit the server file only:
   `"ads": "Enabled"`

If you don’t know the disk folder, on the VPS:

```bash
sudo nginx -T 2>/dev/null | grep -A2 "root "
# or
find /var/www /opt /home -name 'index.html' 2>/dev/null | head
```

Put `ads-config.json` beside that `index.html`.

# Remote ads config

Host `ads-config.json` on InterServer (static HTTPS URL) or keep the GitHub raw URL used in `BuildConfig.REMOTE_ADS_CONFIG_URL`.

## Format

```json
{
  "ads": "Disabled",
  "bannerEnabled": true,
  "bannerPosition": "bottom",
  "interstitialBetweenQuests": true,
  "interstitialCooldownSec": 5,
  "message": "Optional note shown in Tools"
}
```

- `ads`: `"Enabled"` or `"Disabled"` (default / fail-closed = Disabled)
- `bannerPosition`: `"top"` or `"bottom"`
- `interstitialCooldownSec`: minimum seconds between quest interstitials (default 5)

## Closed-group tip

Leave `"ads": "Disabled"` until you are ready. Flip to `"Enabled"` on the server — apps pick it up on next launch (or Tools → Refresh remote ads config).

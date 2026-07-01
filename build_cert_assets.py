import base64
from pathlib import Path

root = Path(__file__).resolve().parent
assets = root / "assets"
items = {
    "logo": ("logo.jpeg", "image/jpeg"),
    "stamp": ("aprobado.jpg", "image/jpeg"),
    "signature": ("signature.png", "image/png"),
}
lines = ["window.CERT_ASSETS = window.CERT_ASSETS || {};"]
for key, (fname, mime) in items.items():
    data = base64.b64encode((assets / fname).read_bytes()).decode("ascii")
    lines.append(f"window.CERT_ASSETS['{key}'] = 'data:{mime};base64,{data}';")
out = root / "js" / "cert-assets.js"
out.write_text("\n".join(lines), encoding="utf-8")
print(out, out.stat().st_size)
#!/usr/bin/env python3
"""Server statis untuk pengembangan lokal.

Sama seperti `python3 -m http.server`, tapi mengirim header no-store supaya
browser tidak menyajikan versi lama HTML/CSS/JS setiap kali file diubah.
Hanya untuk lokal — produksi memakai Vercel (lihat vercel.json).
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
ROOT = Path(__file__).resolve().parent.parent


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"Psikologia.id berjalan di http://localhost:{PORT} (tanpa cache)")
        httpd.serve_forever()

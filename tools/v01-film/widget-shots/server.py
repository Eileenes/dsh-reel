#!/usr/bin/env python3
"""Mock DSH page + /dsh-whale/* host API, so a widget-type plugin can be captured headlessly.

Usage:  WHALE_PKG=/tmp/whale-pkg/package python3 tools/v01-film/widget-shots/server.py 8767
Then:   node tools/v01-film/widget-shots/capture.cjs

Adapt the DATA dict for another plugin: point each endpoint at plausible sample data,
serve the plugin's client bundle and image/audio assets, and keep the page a real DSH
chat view (light background screenshot + an element with data-composer-input) so the
widget's mount detection passes.
"""
import http.server, socketserver, json, os, sys, urllib.parse

PKG = os.environ.get('WHALE_PKG', '/tmp/whale-pkg/package')
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SHOTS = os.path.join(REPO, 'studio/public/shots')
ROOT = os.path.dirname(os.path.abspath(__file__))

MAP = {
    '/bg.png': (os.path.join(SHOTS, 'dsh-main-clean.png'), 'image/png'),
    '/widget.js': (os.path.join(PKG, 'assets/whale-widget.js'), 'text/javascript'),
    '/dsh-whale/image.png': (os.path.join(PKG, 'assets/DSniang1.png'), 'image/png'),
    '/dsh-whale/rua.gif': (os.path.join(PKG, 'assets/rua.gif'), 'image/gif'),
    '/dsh-whale/bubble-img.png': (os.path.join(PKG, 'assets/bubble-petpet.gif'), 'image/gif'),
    '/dsh-whale/role-image.png': (os.path.join(PKG, 'assets/DSniang1.png'), 'image/png'),
    '/dsh-whale/sound/minecraft-exp-orb.wav': (os.path.join(PKG, 'assets/minecraft-exp-orb.wav'), 'audio/wav'),
}

DATA = {
    '/dsh-whale/balance.json': {
        'ok': True, 'totalBalance': 86.42, 'currency': 'CNY',
        'todayUsage': 12.36, 'todayUsageCurrency': 'CNY',
        'bonusBalance': 20.0, 'rechargeBalance': 66.42,
        'usageLabel': 'DeepSeek 账户口径', 'isPeak': True,
        'versionLabel': 'v0.4.2', 'peakNextChangeAt': 0, 'peakHolidays': [],
    },
    '/dsh-whale/size.json': {
        'ok': True, 'scale': 1.6, 'pressOn': True, 'vol': 0.6, 'sound': True,
        'bubbleOn': True, 'turnCostOn': True, 'turnCostCloseMs': 0,
        'scrollGapOn': False, 'scrollGapPx': 12, 'menuBtnHide': False,
        'codexStatsOn': False, 'versionLabel': 'v0.4.2',
    },
    '/dsh-whale/bubble.json': {'ok': True},
    '/dsh-whale/roles.json': {'ok': True, 'roles': []},
    '/dsh-whale/bubble-imgs.json': {'ok': True, 'images': []},
    '/dsh-whale/audio.json': {'ok': True},
    '/dsh-whale/usage-settings.json': {'ok': True, 'settings': {'taskEnd': {'on': True, 'sel': ''}}},
    '/dsh-whale/usage-records.json': {'ok': True, 'today': {'total': 12.36, 'currency': 'CNY', 'label': 'DeepSeek 账户口径'}},
    '/dsh-whale/last-turn.json': {'ok': True, 'seq': 0},
    '/dsh-whale/about.json': {'ok': True},
    '/dsh-whale/update-check.json': {'ok': True, 'hasUpdate': False},
    '/dsh-whale/api-models.json': {'ok': True, 'models': []},
    '/dsh-whale/wait.json': {'ok': True},
    '/dsh-whale/balance-adjustments.json': {'ok': True, 'adjustments': []},
}


class H(http.server.BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def _serve(self, path, ctype, body):
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        p = urllib.parse.urlparse(self.path).path
        if p in MAP:
            f, c = MAP[p]
            return self._serve(p, c, open(f, 'rb').read())
        if p in DATA:
            return self._serve(p, 'application/json', json.dumps(DATA[p]).encode())
        if p == '/':
            return self._serve(p, 'text/html', open(os.path.join(ROOT, 'index.html'), 'rb').read())
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0)
        self.rfile.read(n)
        self._serve(urllib.parse.urlparse(self.path).path, 'application/json', json.dumps({'ok': True}).encode())

    def do_PUT(self):
        self.do_POST()


class S(socketserver.ThreadingTCPServer):
    allow_reuse_address = True


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8767
    S(('127.0.0.1', port), H).serve_forever()

---
name: verify-app
description: Launch the Hono + R2 file-upload app locally with wrangler dev and prove upload → list → download end to end.
---

# verify-app

## Launch
```sh
rm -rf .wrangler/verify-state && mkdir -p .wrangler
setsid npx wrangler dev --port 8787 --persist-to .wrangler/verify-state > .wrangler/verify-dev.log 2>&1 &
echo $! > .wrangler/verify.pid   # own process group: npx + wrangler + workerd
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8787/)" = 200 ]; do sleep 1; done
```
Ready = `GET /` returns 200. R2 is local (Miniflare), backed by the empty state dir.

## Doctor (read-only)
`curl -s -o /dev/null -w '%{http_code}\n' http://localhost:8787/` → expect `200`.

## Drive
```sh
head -c 4096 /dev/urandom > /tmp/probe.bin
curl -s -o /dev/null -w '%{http_code}\n' -F file=@/tmp/probe.bin http://localhost:8787/upload   # 302
curl -s http://localhost:8787/ | grep -o 'href="/files/[^"]*"'                                   # listed
curl -s -o /tmp/probe.out -w '%{http_code}\n' http://localhost:8787/files/probe.bin             # 200
```

## Evidence
Record: upload status (302), `GET /` status (200) and listed names, download status (200),
`cmp /tmp/probe.bin /tmp/probe.out` exits 0 (bytes match). `GET /files/missing` → 404.

## Cleanup
`kill -- -"$(cat .wrangler/verify.pid)"` — kills only the process group this skill started (npx, wrangler,
workerd). Never `pkill wrangler`; leave other wrangler processes alone.

## Feature map
- [features/upload.md](features/upload.md)
- [features/list.md](features/list.md)
- [features/download.md](features/download.md)

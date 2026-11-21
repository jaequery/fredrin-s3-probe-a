# Upload
`POST /upload` (`src/index.ts`), multipart field `file`. Stores in `FILES` under `file.name` with
`httpMetadata.contentType`, then redirects (302) to `/`. Missing file → 400.

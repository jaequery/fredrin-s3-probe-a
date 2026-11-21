# Download
`GET /files/:name` (`src/index.ts`) streams the object with its stored `Content-Type` and
`Content-Disposition: attachment`. Missing key → 404.

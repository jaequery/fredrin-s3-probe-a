# List
`GET /` (`src/index.ts`) renders the upload form and every key from `FILES.list()` (paginated) as
`<a href="/files/<urlencoded key>"><html-escaped key></a>`.

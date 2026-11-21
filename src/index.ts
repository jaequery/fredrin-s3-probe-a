import { Hono } from "hono";

type Bindings = { FILES: R2Bucket };

const app = new Hono<{ Bindings: Bindings }>();

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

app.get("/", async (c) => {
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await c.env.FILES.list({ cursor });
    keys.push(...page.objects.map((o) => o.key));
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  const items = keys
    .map(
      (k) =>
        `<li><a href="/files/${encodeURIComponent(k)}">${escapeHtml(k)}</a></li>`,
    )
    .join("");

  return c.html(`<!doctype html>
<html>
<head><meta charset="utf-8"><title>Files</title></head>
<body>
<h1>Files</h1>
<form method="post" action="/upload" enctype="multipart/form-data">
<input type="file" name="file" required>
<button type="submit">Upload</button>
</form>
<ul>${items}</ul>
</body>
</html>`);
});

app.post("/upload", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  if (!(file instanceof File) || !file.name) {
    return c.text("No file uploaded", 400);
  }
  await c.env.FILES.put(file.name, file, {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });
  return c.redirect("/");
});

app.get("/files/:name{.+}", async (c) => {
  const name = c.req.param("name");
  const obj = await c.env.FILES.get(name);
  if (!obj) return c.text("Not found", 404);
  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
    },
  });
});

export default app;

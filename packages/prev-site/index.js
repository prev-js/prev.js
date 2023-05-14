import fs from "node:fs";
import * as shiki from "shiki";
import markdown from "markdown-it";

shiki
  .getHighlighter({
    theme: "nord",
  })
  .then((highlighter) => {
    const md = markdown({
      html: true,
      highlight: (code, lang) => {
        return highlighter.codeToHtml(code, { lang });
      },
    });

    const html = md.render(fs.readFileSync("readme.md", "utf-8"));
    const out = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Previous.js</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>${html}</body>
</html>`;

    if (!fs.existsSync("dist")) {
      fs.mkdirSync("dist");
    }
    fs.writeFileSync("dist/index.html", out);
    fs.copyFileSync("style.css", "dist/style.css");
    console.log("done");
  });

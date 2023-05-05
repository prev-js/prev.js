import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { build as viteBuild } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";
import { INDEX_HTML } from "./middleware";

const ENTRY_NAME = "index.html";

export async function build(root = process.cwd()) {
  const entry = path.resolve(root, "public/index.html");
  const entryExist = fs.existsSync(entry);

  await viteBuild({
    configFile: false,
    root,
    mode: "production",
    appType: "custom",
    build: {
      rollupOptions: {
        input: ENTRY_NAME,
        plugins: [
          {
            name: "custom-index-html-entry",
            resolveId(id) {
              console.log("resolveId id: ", id);
              if (id === ENTRY_NAME) {
                return id;
              }
              return null;
            },
            load(id) {
              console.log("load id: ", id);
              if (id === ENTRY_NAME) {
                return entryExist ? fs.readFileSync(entry, "utf-8") : INDEX_HTML;
              }

              return null;
            },
          },
        ],
      },
    },
    plugins: [withRouter({ root }), withReact()],
  });
}

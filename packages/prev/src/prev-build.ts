import process from "node:process";
import { build as viteBuild } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";
import { INDEX_HTML } from "./middleware";

const INPUT = "index.html";

export async function build(root = process.cwd()) {
  await viteBuild({
    configFile: false,
    root,
    mode: "production",
    appType: "custom",
    build: {
      rollupOptions: {
        input: INPUT,
        plugins: [
          {
            name: "custom-index-html-entry",
            resolveId(id) {
              if (id === INPUT) {
                return id;
              }
              return null;
            },
            load(id) {
              if (id === INPUT) {
                return INDEX_HTML;
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

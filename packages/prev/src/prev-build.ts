import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { InlineConfig, loadConfigFromFile, mergeConfig, build as viteBuild } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";
import { INDEX_HTML } from "./middleware";

const ENTRY_NAME = "index.html";

export async function build(root = process.cwd()) {
  const entry = path.resolve(root, "public/index.html");
  const entryExist = fs.existsSync(entry);

  let config: InlineConfig = {
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
              if (id === ENTRY_NAME) {
                return id;
              }
              return null;
            },
            load(id) {
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
  };

  const loadedConfig = await loadConfigFromFile(
    {
      mode: config.mode!,
      command: "serve",
      ssrBuild: false,
    },
    undefined,
    root
  );

  if (loadedConfig) {
    config = mergeConfig(loadedConfig.config, config);
  }

  await viteBuild(config);
}

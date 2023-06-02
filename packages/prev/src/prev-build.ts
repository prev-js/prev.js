import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { InlineConfig, loadConfigFromFile, mergeConfig, build as viteBuild } from "vite";
import withReact from "@vitejs/plugin-react";
import { withRouter } from "./plugin-router";
import { INDEX_HTML } from "./middleware";
import { loadConfig } from "./utils";

const ENTRY_NAME = "index.html";

interface BuildCommandOption {
  config?: string;
}

export async function build(root = process.cwd(), options: BuildCommandOption) {
  const entry = path.resolve(root, "public/index.html");
  const entryExist = fs.existsSync(entry);
  const { data: config } = await loadConfig(root, options.config);

  let viteConfig: InlineConfig = {
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
    plugins: [withRouter({ root, splitting: config?.splitting }), withReact()],
  };

  const loadedViteConfig = await loadConfigFromFile(
    {
      mode: viteConfig.mode!,
      command: "build",
      ssrBuild: false,
    },
    undefined,
    root
  );

  if (loadedViteConfig) {
    viteConfig = mergeConfig(loadedViteConfig.config, viteConfig);
  }

  await viteBuild(viteConfig);
}

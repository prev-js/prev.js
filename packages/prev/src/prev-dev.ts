import process from "node:process";
import { createServer, loadConfigFromFile, mergeConfig, InlineConfig } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";
import { createCustomIndexHtmlMiddleware } from "./middleware";
import { loadConfig } from "./utils";

interface DevCommandOption {
  port: number;
  host: string;
  config?: string;
}

export async function dev(root = process.cwd(), options: DevCommandOption) {
  const { data: config } = await loadConfig(root, options.config);

  let viteConfig: InlineConfig = {
    configFile: false,
    root,
    mode: "development",
    server: {
      port: options?.port,
      host: options?.host,
    },
    appType: "custom",
    plugins: [withRouter({ root, splitting: config?.splitting }), withReact()],
  };

  const loadedConfig = await loadConfigFromFile(
    {
      mode: viteConfig.mode!,
      command: "serve",
      ssrBuild: false,
    },
    options.config,
    root
  );

  if (loadedConfig) {
    viteConfig = mergeConfig(loadedConfig.config, viteConfig);
  }

  const server = await createServer(viteConfig);

  server.middlewares.use(createCustomIndexHtmlMiddleware(server));

  await server.listen();
  server.printUrls();
}

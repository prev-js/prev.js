import process from "node:process";
import { createServer, loadConfigFromFile, mergeConfig, InlineConfig } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";
import { createCustomIndexHtmlMiddleware } from "./middleware";

interface DevCommandOption {
  port: number;
  host: string;
  config: string;
}

export async function dev(root = process.cwd(), options: DevCommandOption) {
  let config: InlineConfig = {
    configFile: false,
    root,
    mode: "development",
    server: {
      port: options?.port,
      host: options?.host,
    },
    appType: "custom",
    plugins: [withRouter({ root }), withReact()],
  };

  const loadedConfig = await loadConfigFromFile(
    {
      mode: config.mode!,
      command: "serve",
      ssrBuild: false,
    },
    options.config,
    root
  );

  if (loadedConfig) {
    config = mergeConfig(loadedConfig.config, config);
  }

  const server = await createServer(config);

  server.middlewares.use(createCustomIndexHtmlMiddleware(server));

  await server.listen();
  server.printUrls();
}

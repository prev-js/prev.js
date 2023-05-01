import process from "node:process";
import { createServer } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";

interface DevCommandOption {
  port: number;
}

const defaultOptions: DevCommandOption = {
  port: 4567,
};

export async function dev(root = process.cwd(), options: DevCommandOption) {
  options = {
    ...defaultOptions,
    ...options,
  };

  const server = await createServer({
    configFile: false,
    root,
    mode: "development",
    server: {
      port: options.port,
    },
    plugins: [withRouter({ root }), withReact()],
  });

  await server.listen();
  server.printUrls();
}

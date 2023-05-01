import process from "node:process";
// import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";

interface DevCommandOption {
  port: number;
}

const defaultOptions: DevCommandOption = {
  port: 4567,
};

export async function dev(options: DevCommandOption) {
  options = {
    ...defaultOptions,
    ...options,
  };

  const root = process.cwd();
  const server = await createServer({
    configFile: false,
    root,
    mode: "development",
    server: {
      port: options.port,
    },
    plugins: [withRouter(), withReact()],
  });

  await server.listen();
  server.printUrls();
}

import process from "node:process";
import { createServer } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";

interface DevCommandOption {
  port: number;
  host: string;
}

export async function dev(root = process.cwd(), options: DevCommandOption) {
  const server = await createServer({
    configFile: false,
    root,
    mode: "development",
    server: {
      port: options?.port,
      host: options.host,
    },
    plugins: [withRouter({ root }), withReact()],
  });

  await server.listen();
  server.printUrls();
}

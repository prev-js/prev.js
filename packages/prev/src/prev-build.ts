import process from "node:process";
import { build as viteBuild } from "vite";
import withReact from "@vitejs/plugin-react";
import withRouter from "@prevjs/vite-plugin-router";

export async function build(root = process.cwd()) {
  await viteBuild({
    configFile: false,
    root,
    mode: "production",
    plugins: [withRouter({ root }), withReact()],
  });
}

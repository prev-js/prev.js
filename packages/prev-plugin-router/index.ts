import type { Plugin } from "vite";
import { transformWithEsbuild } from "vite";

import { Context, UserOptions } from "./context";

const MODULE_ID_VIRTUAL = "virtual:router";

export default function withRouter(options: UserOptions): Plugin {
  const ctx: Context = new Context(options);

  return {
    name: "@prevjs/vite-plugin-router",
    enforce: "pre",
    configureServer(server) {
      ctx.configureServer(server);
    },
    async configResolved({ root }) {
      ctx.root = root;
      ctx.search();
    },
    resolveId(id) {
      if (id === "/" + MODULE_ID_VIRTUAL) {
        return MODULE_ID_VIRTUAL;
      }
    },
    async load(id) {
      if (id === MODULE_ID_VIRTUAL) {
        const result = await transformWithEsbuild(ctx.codegen(), "router.jsx", {
          jsx: "transform",
          loader: "jsx",
        });

        return result;
      }
    },
    transformIndexHtml: {
      enforce: "pre",
      transform: () => {
        return [
          {
            tag: "script",
            attrs: { type: "module" },
            children: `import "/${MODULE_ID_VIRTUAL}"`,
            injectTo: "body",
          },
        ];
      },
    },
  };
}

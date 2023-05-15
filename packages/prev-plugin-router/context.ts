import fs from "node:fs";
import path from "node:path";
import fg from "fast-glob";
import { ViteDevServer } from "vite";
import capitalize from "just-capitalize";
import camelCase from "just-camel-case";

interface Options {
  extensions: string[];
  root: string;
  pageDir: string;
  splitting: boolean;
  reserved: {
    ducoment: string;
    layout: string;
    error: string;
    loader: string;
  };
}

export type UserOptions = Partial<Options> | undefined;

const MATCH_ALL_ROUTE = "*";

function isErrorPage(filename: string, options: Options) {
  return filename === options.reserved.error;
}

function isLayoutPage(filename: string, options: Options) {
  return filename === options.reserved.layout;
}

function isLoaderPage(filename: string, options: Options) {
  return filename === options.reserved.loader;
}

export class Context {
  private _pages = new Map();
  private _loader = "";
  private _layout = "";

  public options: Options = {
    root: ".",
    extensions: ["js", "jsx", "ts", "tsx"],
    pageDir: "pages",
    splitting: true,
    reserved: {
      // not supported
      ducoment: "",
      layout: "_app",
      error: "_error",
      loader: "_loader",
    },
  };

  constructor(options?: UserOptions) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  public search() {
    const { extensions, root, pageDir } = this.options;
    const files = fg.sync(
      [`**/*.{${extensions.join()}}`, `!**/${reservedFiles(this.options)}`, `!**/_*`],
      {
        onlyFiles: true,
        cwd: path.resolve(root, pageDir),
      }
    );

    const map = new Map<string, string>();
    files.forEach((file) => {
      const route = normalizePathToRoute(file, this.options);
      map.set(route, file);
    });

    const reserveds = fg.sync([`${reservedFiles(this.options)}`], {
      onlyFiles: true,
      cwd: path.resolve(root, pageDir),
    });

    reserveds.forEach((v) => {
      const full = path.resolve(root, pageDir, v);
      const { name } = path.parse(v);
      if (!fs.existsSync(full)) return;

      if (isErrorPage(name, this.options)) {
        map.set("*", v);
      } else if (isLoaderPage(name, this.options)) {
        this._loader = full;
      } else if (isLayoutPage(name, this.options)) {
        this._layout = full;
      }
    });

    this._pages = map;
  }

  public configureServer(server: ViteDevServer) {
    server.watcher.on("unlink", (filaPath) => this.invalidateAndRegenerateRoutes(filaPath));
    server.watcher.on("add", (filaPath) => this.invalidateAndRegenerateRoutes(filaPath));
  }

  public invalidateAndRegenerateRoutes(filaPath: string) {
    if (!isInsidePageDirectory(filaPath, this.options)) {
      return;
    }

    this._pages.clear();
    this.search();
  }

  public codegen() {
    if (this._pages.size === 0) {
      return "";
    }

    const map = this._pages;

    const sortedRoutes = sortRoutes([...map.keys()]);
    const routes = sortedRoutes.map((route) => {
      const filePath = map.get(route)!;
      const absolutePath = path.resolve(this.options.pageDir, filePath);

      const routeObj = {
        route: route,
        path: absolutePath,
        name: getComponentName(filePath),
        index: false,
      };

      if (path.basename(filePath, path.extname(filePath)) === "index") {
        routeObj.index = true;
      }

      return routeObj;
    });

    const codes = [
      'import React from "react";',
      'import { createRoot } from "react-dom/client";',
      'import { Route, Switch } from "previous.js/router";',
    ];

    if (this._loader) {
      codes.push(`import Loader from "${this._loader}";`);
    }
    if (this._layout) {
      codes.push(`import Layout from "${this._layout}";`);
    }

    const { splitting } = this.options;
    if (splitting) {
      codes.push(...routes.map((i) => `const ${i.name} = React.lazy(() => import("${i.path}"));`));
    } else {
      codes.push(...routes.map((i) => `import ${i.name} from "${i.path}"`));
    }

    codes.push(
      ...[
        "function App() {",
        "  return (",
        "    <Switch>",
        ...routes
          .map((i) =>
            [
              `<Route path="${i.route === MATCH_ALL_ROUTE ? `/:all*` : i.route}">`,
              // prettier-ignore
              splitting ? `  <React.Suspense fallback={${this._loader ? `<Loader />` : `null`}}>` : "",
              `    ${this._layout ? `<Layout>${`<${i.name} />`}</Layout>` : `<${i.name} />`}`,
              splitting ? `  </React.Suspense>` : "",
              `</Route>`,
            ].filter(Boolean)
          )
          .flat(),
        "    </Switch>",
        "  )",
        "}",
        `createRoot(document.getElementById("root")).render(<App />);`,
      ]
    );

    return codes.join("\n");
  }
}

function isInsidePageDirectory(p: string, options: Options) {
  return (
    p.startsWith(path.resolve(options.pageDir)) && options.extensions.some((ext) => p.endsWith(ext))
  );
}

function reservedFiles(options: Options) {
  return `{${Object.values(options.reserved)
    .filter(Boolean)
    .join()}}.{${options.extensions.join()}}`;
}

function normalizePathToRoute(p: string, o: Options) {
  const { dir, name } = path.parse(p);
  let route = "";
  if (isErrorPage(name, o)) {
    route = MATCH_ALL_ROUTE;
  } else if (isIndexPage(name)) {
    route = "/";
  } else if (isDynamic(name)) {
    route = parameterizeDynamicRoute(name);
  } else {
    route = name;
  }

  if (route === MATCH_ALL_ROUTE) {
    return route;
  }

  return path.resolve(path.join("/", normalizeDirPathToRoute(dir), route));
}

function isDynamic(filename: string) {
  return /^\[(.+)\]$/.test(filename);
}

function isIndexPage(filename: string) {
  return filename === "index";
}

function normalizeDirPathToRoute(dirPath: string) {
  return dirPath
    .split("/")
    .map((s) => (isDynamic(s) ? parameterizeDynamicRoute(s) : s))
    .join("/");
}

function parameterizeDynamicRoute(s: string) {
  return s.replace(/^\[(.+)\]$/, (_, p) => `:${p}`);
}

function countRouteLength(p: string) {
  return path.resolve(p).split("/").filter(Boolean).length;
}

function sortRoutes(routes: string[]) {
  return [...routes].sort((a, b) => {
    const len = countRouteLength(a) - countRouteLength(b);
    if (len !== 0) {
      return len;
    }
    return a.localeCompare(b);
  });
}

function getComponentName(filePath: string) {
  const segments = filePath.split(path.sep);
  const extname = path.extname(filePath);
  const fileName = path.basename(filePath, extname);

  segments[segments.length - 1] = fileName;

  const name = segments.reduce((acc, segment) => {
    if (isDynamic(segment)) {
      return acc + capitalize(camelCase(segment.replace(/^\[(.+)\]$/, "$1")));
    }

    return acc + capitalize(camelCase(segment));
  }, "");

  return name;
}

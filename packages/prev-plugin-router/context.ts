import path from "node:path";
import fg from "fast-glob";
import { ViteDevServer } from "vite";
import capitalize from "just-capitalize";
import camelCase from "just-camel-case";

interface Options {
  extensions: string[];
  layout: string;
  document: string;
  root: string;
  pageDir: string;
}

export type UserOptions = Partial<Options> | undefined;

export class Context {
  private _pages = new Map();
  public root: string = ".";
  public options: Options = {
    root: ".",
    extensions: ["js", "jsx", "ts", "tsx"],
    layout: "_app",
    document: "_document",
    pageDir: "pages",
  };

  constructor(options?: UserOptions) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  public search() {
    const { extensions, root, pageDir } = this.options;
    const files = fg.sync([`**/*.{${extensions.join()}}`, `!${reservedFiles(this.options)}`], {
      onlyFiles: true,
      cwd: path.resolve(root, pageDir),
    });
    const map = new Map<string, string>();
    files.forEach((file) => {
      const route = normalizePathToRoute(file);
      map.set(route, file);
    });
    this._pages = map;
  }

  public configureServer(server: ViteDevServer) {
    server.watcher.on("unlink", (filaPath) => this.invalidateAndRegenerateRoutes(filaPath));
    server.watcher.on("add", (filaPath) => this.invalidateAndRegenerateRoutes(filaPath));
  }

  public invalidateAndRegenerateRoutes(filaPath: string) {
    if (!isTarget(filaPath, this.options)) {
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

    const code = `
    import React from "react";
    import { createRoot } from 'react-dom/client';
    import { Route, Switch } from "prev.js";
    ${routes.map((i) => `const ${i.name} = React.lazy(() => import("${i.path}"));`).join("\n")}

    function App() {
      return (
        <Switch>
          ${routes.map(
            (i) => `(
              <Route path="${i.route}">
                <React.Suspense fallback={null}>
                  <${i.name} />
                </React.Suspense>
              </Route>
            )`
          )}
        </Switch>
      )
    }

    createRoot(document.getElementById("root")).render(<App />);
    `;
    return code;
  }
}

function isTarget(p: string, options: Options) {
  return (
    p.startsWith(path.resolve(options.pageDir)) && options.extensions.some((ext) => p.endsWith(ext))
  );
}

function reservedFiles(options: Options) {
  const { extensions, document, layout } = options;
  return `{${[layout, document].join()}}.{${extensions.join()}}`;
}

function normalizePathToRoute(p: string) {
  const { dir, name } = path.parse(p);
  const route = normalizeFilenameToRoute(name);
  if (route === MATCH_ALL_ROUTE) {
    return route;
  }

  return path.resolve(path.join("/", normalizeDirPathToRoute(dir), route));
}

const MATCH_ALL_ROUTE = "*";

function normalizeFilenameToRoute(filename: string) {
  if (isCatchAll(filename)) {
    return MATCH_ALL_ROUTE;
  }

  if (isIndexPage(filename)) {
    return "/";
  }

  return isDynamic(filename) ? parameterizeDynamicRoute(filename) : filename;
}

function isCatchAll(filename: string) {
  return /^\[\.{3}/.test(filename);
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

function sorter(a: string, b: string) {
  const len = countRouteLength(a) - countRouteLength(b);

  if (len !== 0) {
    return len;
  }

  return a.localeCompare(b);
}

function sortRoutes(routes: string[]) {
  return [...routes].sort(sorter);
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

/// <reference types="node" />
import * as http from "node:http";
import type { ViteDevServer } from "vite";
import getEtag from "etag";

export namespace Connect {
  export class IncomingMessage extends http.IncomingMessage {
    originalUrl?: http.IncomingMessage["url"] | undefined;
  }

  export type NextFunction = (err?: any) => void;

  export type NextHandleFunction = (
    req: IncomingMessage,
    res: http.ServerResponse,
    next: NextFunction
  ) => void;
}

const postfixRE = /[?#].*$/s;
export function cleanUrl(url: string): string {
  return url.replace(postfixRE, "");
}
export const INDEX_HTML = "<!DOCTYPE html><html><head></head><body></body></html>";

export function createCustomIndexHtmlMiddleware(server: ViteDevServer): Connect.NextHandleFunction {
  return async function indexHtmlMiddleware(req, res, next) {
    if (res.writableEnded) {
      return next();
    }

    const url = req.url && cleanUrl(req.url);
    if (url && req.headers["sec-fetch-dest"] === "document") {
      let html = INDEX_HTML;
      html = await server.transformIndexHtml(url, html, req.originalUrl);
      return send(req, res, html, "html", {
        headers: server.config.server.headers,
      });
    } else {
      next();
    }
  };
}

export interface SendOptions {
  etag?: string;
  cacheControl?: string;
  headers?: http.OutgoingHttpHeaders;
}

export function send(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  content: string | Buffer,
  type: string,
  options: SendOptions
): void {
  const { etag = getEtag(content, { weak: true }), cacheControl = "no-cache", headers } = options;

  if (res.writableEnded) {
    return;
  }

  if (req.headers["if-none-match"] === etag) {
    res.statusCode = 304;
    res.end();
    return;
  }

  const alias: Record<string, string | undefined> = {
    js: "application/javascript",
    css: "text/css",
    html: "text/html",
    json: "application/json",
  };

  res.setHeader("Content-Type", alias[type] || type);
  res.setHeader("Cache-Control", cacheControl);
  res.setHeader("Etag", etag);

  if (headers) {
    for (const name in headers) {
      res.setHeader(name, headers[name]!);
    }
  }

  res.statusCode = 200;
  res.end(content);
  return;
}

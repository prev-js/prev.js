# Previous.js

### _A client only React framework, SPAs never die, long live SPAs!_

Previous.js is a lightweight and flexible React framework for minimalists that simplifies the process of building modern web applications with client-side rendering (CSR).It provides Next.js-like routing support and uses Vite as the build tool for a great development experience.

With Previous.js, you can easily create a good old single page application without worrying about the complexity of SSR/SSG/RSC. It's a great choice for developers who doesn't need server-rendered html like when building prototypes, or web apps for internal usage, or in electron/tauri.

## Getting Started

### Installation

You can use previous.js by using our template when starting a new project or manually install it from npm as a dev dependency in an existing one.

#### Scaffolding a new project

```sh
npm create prev@latest
```

#### Manually Install

```sh
npm install previous.js -D
```

#### Available Commands

```json
{
  "scripts": {
    "dev": "prev dev", // start dev server
    "build": "prev build", // build for production
    "start": "prev start", // locally preview production build
    "lint": "prev lint" // run eslint
  }
}
```

## Development

### Routing

Previous.js has a file-system based router similar to the Page Router in Next.js. All files in the `pages` directory are automatically available as a route.

#### Index routes

- pages/index.js → /
- pages/blog/index.js → /blog

#### \_app

Under the `pages` directory, you can create a `_app.jsx` file as a global layout component.

Unlike Next.js, it uses **`children`** as the placeholder for your page component.

```js
// insert any global stuff here like css or state
export default function App({ children }) {
  return <div>{children}</div>;
}
```

#### \_error

You can create a `_error.jsx` file for 404 page, but since this is a client-side rendering app, an index.html and all related javascript will always be downloaded the show this page according to the route matching result.

#### \_loader

By default we split every page component into different chunk so it will need a loading indicator during route change when trying to render that page for the first time. By default this is `null`, so users will see a blank screen.

It is highly recommended to write your own one by creating a `_loader.jsx` under the `pages` directory.

```js
export default function Loader() {
  return <div>Loading...</div>;
}
```

Or your turn it off in the config with `splitting: false`, then you won't need this anymore.

### Configuring

You can customize configurations via:

- prev.config.ts
- prev.config.js
- prev.config.cjs
- prev.config.json
- `prev` property in your package.json

Or specify a custom filename using the --config flag, for example: `prev dev --config custom.config.ts`.

For typescript support in your config file, you can use the `defineConfig` function:

```ts
import { defineConfig } from "previous.js";

export default defineConfig({
  splitting: false,
});
```

## Building Your App

<center>
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">someone should build a client-only framework (even no SSG) that integrates routing, fetching, and bundling just for the sake of it. would let us skip all the conversations about “but what if i don’t want SSG/SSR” and at least squeeze the best client perf by default.</p>&mdash; дэн (@dan_abramov) <a href="https://twitter.com/dan_abramov/status/1648733537741176852?ref_src=twsrc%5Etfw">April 19, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>

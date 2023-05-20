# Previous.js

### _A client only React framework, SPAs never die, long live SPAs!_

[Previous.js](https://github.com/prev-js/prev.js) is a lightweight and flexible React framework for minimalist that simplifies the process of building modern web applications with client-side rendering (CSR).It provides Next.js-like routing support and uses Vite as the build tool for better development experience.

With Previous.js, you can easily create a good old single page application without worrying about the complexity of SSR/SSG/RSC/`use client`/`use server`. It's a great choice for developers who doesn't need server-rendered html like when building quick prototypes, web apps for internal usage or running in Electron/Tauri or any other webviews.

## Getting Started

### Installation

You can use previous.js by using our templates when starting a new project or manually install it from npm as a dev dependency in an existing one.

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
    "dev": "prev dev",
    "build": "prev build",
    "start": "prev start"
  }
}
```

- `prev dev`: start dev server
- `prev build`: build for production
- `prev start`: run a server for locally preview the production build

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

You can create a `_error.jsx` file for the 404 page, but since this is a client-side rendering app, the index.html and all related javascript will always be downloaded before calculating the route matching and showing this page.

```ts
export default function Error() {
  return <div>Not found...</div>;
}
```

#### \_loader

By default we split every page component into different chunk, so for better user experience, it will need a loading indicator during route change when trying to render that page for the first time. By default this is `null`.

It is highly recommended to write your own one by creating a `_loader.jsx` under the `pages` directory.

```js
export default function Loader() {
  return <div>Loading...</div>;
}
```

Or your can turn this behavior off in the config with `splitting: false`, then you won't need this anymore, but this will also bundle all your javascript into one big file.

### Configuring

You can customize configurations with a config file in your root directory via:

- prev.config.ts
- prev.config.js
- prev.config.cjs
- prev.config.json

or:

- `prev` property in your package.json
- a custom filename using the `--config` flag, for example: `prev dev --config custom.config.ts`.

For better typescript support in your config file, you can use the `defineConfig` function:

```ts
import { defineConfig } from "previous.js";

export default defineConfig({
  splitting: false,
});
```

If you want to customize the behavior of Vite or Eslint, you can create your own `vite.config.js` and `eslint.confg.js`.

## Deployment

Run `prev build` to create a production build for you app in the `build` direcory, they are all static files so you can use whatever platform you like for the hosting.

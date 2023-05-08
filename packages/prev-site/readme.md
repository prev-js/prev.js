# Previous.js

Previous.js is a lightweight and flexible React framework for minimalists that simplifies the process of building modern web applications with client-side rendering (CSR). It provides Next.js-like routing support and uses Vite as the build tool for a great development experience. With Previous.js, you can easily create a good old single page applications without worrying about the complexity of SSR/SSG/RSC. It's a great choice for developers who doesn't need server-rendered html like when building prototypes, or web apps for internal usage, or electron/tauri apps.

_SPAs never die, long live SPAs!_

## Getting Started

### Installation

You can use previous.js by using our project template when starting a new project or manually install it from npm as a dev dependency in an existing one.

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

#### \_error

#### \_loader

#### \_og

### Styling

### Configuring

## Building Your App

<center>
<blockquote class="twitter-tweet"><p lang="en" dir="ltr">someone should build a client-only framework (even no SSG) that integrates routing, fetching, and bundling just for the sake of it. would let us skip all the conversations about “but what if i don’t want SSG/SSR” and at least squeeze the best client perf by default.</p>&mdash; дэн (@dan_abramov) <a href="https://twitter.com/dan_abramov/status/1648733537741176852?ref_src=twsrc%5Etfw">April 19, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
</center>

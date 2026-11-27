# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

## Code blocks

Always give a fenced code block a language so it gets syntax highlighting. Common ones: `bash`, `sql`, `yaml`, `python`, `json`, `jinja2` (dbt Jinja), `ini` (`.env` files) and `kusto`. The aliases `jinja`, `env`, `dotenv` and `kql` also work.

A language that isn't loaded renders as plain text. To add one, put its [Prism](https://prismjs.com/#supported-languages) name in `prism.additionalLanguages` in `docusaurus.config.js`. Jinja and the aliases are defined in `src/theme/prism-include-languages.js`.

## Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

## Deployment

Using SSH:

```bash
USE_SSH=true npm run deploy
```

Not using SSH:

```bash
GIT_USER=<Your GitHub username> npm run deploy
```


If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## So you're a Datacoves employee updating this documentation...

It is now all per-version, in versioned_docs/version-x.xx.  If you're adding a new version, there are additional steps:
1. Copy the docs from the previous version to the new one (e.g. `cp -r versioned_docs/version-4.1 versioned_docs/version-5.0`).
2. Copy the previous sidebar to the new one (e.g. `cp versioned_sidebars/version-4.1-sidebars.json versioned_sidebars/version-5.0-sidebars.json`).
3. Update versions.json to include all the version numbers now available.
4. Update the `docs:` section in docusaurus.config.js:
 - `lastVersion` should be the present version.
 - `onlyIncludeVersions` is the list of versions the customer can see.
 - The `versions` list contains one object per version:
```
'5.0': {
  label: '5.0 (Unreleased)',
  path: '5.0',
  banner: 'unreleased',
}
```

`label` is what the customer sees, and `banner` may be one of `none`, `unmaintained`, or `unreleased`.  If it's not `none`, there will be a warning shown at the top of each page.


## Installation

```bash
npm install
```

## Local Development

```bash
npm run start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

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

### Alpine JS starter template
Nothing fancy
1. Alpine
1. Jest
1. Laravel Mix with LiveReload

Be sure to do a site wide search/replace for the following:
```
{author-name} - Example: Kevin Batdorf
{github-name} - Example: kevinbatdorf
{current-year} - Example: 2020
{package-title} - Example: The title of the package
{package-description} - Example: The summary
{package-slug} - Example: The full slug, like kevinbatdorf/alpine-plugin-template
{package-slug-short} - Example: alpine-plugin-template
```
TODO: Automate with an npm script like npm run setup or something

# {package-title}
{package-description}

![GitHub file size in bytes](https://img.shields.io/github/size/{package-slug}/dist/index.js?label=minified&style=flat-square)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/{package-slug}?label=version&style=flat-square)

## About

When to use?

```html
<div x-data="{}">
</div>
```
```js
function functionName() {
  return {
    foo: 'bar'
  }
}
```
[Demo](url)

## Installation

Include the following `<script>` tag in the `<head>` of your document (before Alpine):

```html
<script src="https://cdn.jsdelivr.net/gh/{package-slug}@0.x.x/dist/index.js"></script>
```

### Manual

If you wish to create your own bundle:

```bash
npm install {package-slug} --save
```

Then add the following to your script:

```javascript
import '{package-slug-short}'
import 'alpinejs'
```

## License

Copyright (c) {current-year} {author-name}

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

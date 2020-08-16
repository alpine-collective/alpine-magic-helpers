# Alpine Magic Helpers
A set of magic helpers to use with AlpineJS

![GitHub file size in bytes](https://img.shields.io/github/size/kevinbatdorf/alpine-magic-helpers/dist/index.js?label=minified&style=flat-square)
![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/kevinbatdorf/alpine-magic-helpers?label=version&style=flat-square)

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
<script src="https://cdn.jsdelivr.net/gh/kevinbatdorf/alpine-magic-helpers@0.x.x/dist/index.js"></script>
```

### Manual

If you wish to create your own bundle:

```bash
npm install kevinbatdorf/alpine-magic-helpers --save
```

Then add the following to your script:

```javascript
import 'alpine-magic-helpers'
import 'alpinejs'
```

## License

Copyright (c) 2020 Kevin Batdorf

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

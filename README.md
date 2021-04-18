# Magic Helpers

A collection of magic properties and helper functions for use with [Alpine.js](https://github.com/alpinejs/alpine)

[![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/alpine-collective/alpine-magic-helpers?label=version&style=flat-square)](https://www.npmjs.com/package/alpine-magic-helpers)
[![](https://data.jsdelivr.com/v1/package/gh/alpine-collective/alpine-magic-helpers/badge)](https://www.jsdelivr.com/package/gh/alpine-collective/alpine-magic-helpers)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/alpine-magic-helpers?color=#0F0)](https://bundlephobia.com/result?p=alpine-magic-helpers)

## About

Adds the following magic helpers to use with Alpine JS.
| Magic Helpers | Description |
| --- | --- |
| [`$component/$parent`](#component) | Natively access and update data from other components or the parent component. |
| [`$fetch/$get/$post`](#fetch) | Using Axios, fetch JSON from an external source.  |
| [`$interval`](#interval) | Run a function every n milliseconds. Optionally start and stop the timer. |
| [`$range`](#range) | Iterate over a range of values. |
| [`$refresh`](#refresh) | Manually refresh a component. |
| [`$screen`](#screen) | Detect if the current browser width is equal or greater than a given breakpoint. |
| [`$scroll`](#scroll) | Scroll the page vertically to a specific position. |
| [`$truncate`](#truncate) |  Limit a text string to a specific number of characters or words. |
| [`$undo`](#undo) |  Track and undo state changes inside your component. |

Adds the following custom directives to use with Alpine JS.
| Custom Directives | Description |
| --- | --- |
| [`x-unsafe-html`](#x-unsafe-html) | like x-html but allowing new javascript scripts to run. |

 ***More to come!***

🚀 If you have ideas for more magic helpers or custom directives, please open a [discussion](https://github.com/alpine-collective/alpine-magic-helpers/discussions) or join us on the [AlpineJS Discord](https://discord.gg/snmCYk3)

**Known issues**
* [Using `$component`/`$parent` in `x-init`](#warning-using-componentparent-in-x-init)
* [Using Magic Helpers with Livewire](#warning-using-magic-helpers-with-livewire)

## Installation

Include the following `<script>` tag in the `<head>` of your document before Alpine:

```html
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/index.min.js" defer></script>
```

Or you can use the specific magic helpers you need:

```html
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/component.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/fetch.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/interval.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/range.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/refresh.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/screen.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/scroll.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/truncate.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/undo.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/gh/alpine-collective/alpine-magic-helpers@1.2.x/dist/unsafeHTML.min.js" defer></script>
```

---

### Manual

If you wish to create your own bundle:

```bash
npm install alpine-magic-helpers --save
```

Then add the following to your script:

```javascript
import 'alpine-magic-helpers'
import 'alpinejs'
```

Or you can import the specific magic helpers you need like so:

```javascript
import 'alpine-magic-helpers/dist/component'
import 'alpine-magic-helpers/dist/fetch'
import 'alpinejs'
```

---

### :warning: **Using Magic Helpers with Livewire**
When using magic helpers along with Laravel Livewire, you need to make sure that the library is registered after Livewire to prevent Livewire from overriding the magic helper startup callbacks. This can be done either using the defer attribute on the magic helper script or including the magic helper script at the bottom of your body after `@livewireScripts` **without** the `defer` attribute.

---

### `$component`
**Example:**

Arguably more useful, this also adds a `$parent` magic helper to access parent data
```html
<div x-data="{ color: 'blue' }">
    <p x-data x-text="$parent.color"></p>
    <!-- The text will say blue -->
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/XWdjWrr)

You may watch other components, but you must give them each an id using the 'id' attribute or `x-id` if you need more flexibility:
```html
<div x-data="{ color: 'blue' }">
    <p
        x-data
        x-text="$component('yellowSquare').color"
        :class="`text-${$parent.color}-700`">
        <!-- This text will have blue background color and the text will say yellow -->
    </p>
</div>

<div x-id="yellowSquare" x-data="{ color: 'yellow' }"></div>
```

#### :warning: **Using `$component`/`$parent` in `x-init`**
```html
 <!-- This won't populate baz correctly -->
 <div x-data="{ foo: 'bar' }">
   <div x-data="{ baz: null }" x-init="() => baz = $parent.foo">
     <span x-text='baz'></span>
   </div>
 </div>
 <!-- use this instead -->
 <div x-data="{ foo: 'bar' }">
   <div x-data="{ baz: null }" x-init="$nextTick(() => baz = $parent.foo)">
     <span x-text='baz'></span>
   </div>
 </div>
 <!-- or -->
 <div x-data="{ foo: 'bar' }">
   <div x-data="{ baz: null }" x-init="setTimeout(() => baz = $parent.foo)">
     <span x-text='baz'></span>
   </div>
 </div>
```
When a component is initialised, the observed component may not be ready yet due to the way Alpine starts up. This is always true for `$parent` and it occurs for `$component` when the observer is placed before the observed component in the page structure.
Previous versions were using a hack to evaluate the missing x-data on the fly but that strategy wasn't allowing to use nested magic properties and it was not syncronising properly in some edge cases.
The magic helper since version 1.0 defers the resolution of those properties (resolving temporary to empty strings/noop functions) until the observed component is ready and then refreshes the component: this happens in a few milliseconds and it's not noticable by the final users but refreshing a component won't rerun `x-init` with the correct values.
**If developers need to use the magic property inside x-init, they'll need to manually postpone the execution of x-init for one tick either using the Alpine native `$nextTick` or a setTimeout with no duration (See examples above).**

---

### `$fetch`
**Example:**
```html
<div x-data="{ url: 'https://jsonplaceholder.typicode.com/todos/1' }"
    x-init="$fetch(url).then(data => console.log(data))">
    <!-- After init, data will be logged to the console -->
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/poyyXKj)

> As a shortcut, you can optionally use `$get(url, params)` or `$post(url, data)` to conveniently send a GET or POST request with params or data as the second argument.

**Optionally pass in an Axios options object**

If you need more control, you may pass in an object to customize the request [See all options](https://github.com/axios/axios).

**Example:**

```html
<div x-data="{ url: 'https://jsonplaceholder.typicode.com/todos/1' }"
    x-init="$fetch({ url: url, method: 'post' }).then(({ data }) => console.log(data))">
</div>
```
> Note that this will return the entire response object, whereas by default `$fetch` will only return the data

---

### `$interval`
**Example:**
```html
<div
    x-data="{
        timer: 500,
        functionToRun: function() {
            console.log('Hello console')
        }
    }"
    x-init="$interval(functionToRun, timer)">
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/xxVVoaX?editors=1010)

**Optionally pass in options**

By default, `$interval ` will run your function every `nth` millisecond when browser provides an animation frame (via `requestAnimationFrame`). This means that the function will not run if the browser tab is not visible. Optionally, you may pass in the following options as the second parameter:
| Property | Description |
| --- | --- |
| `timer` | Timer in milliseconds.  |
| `delay` | Delay the first run. N.B. The first run is also delayed by the timer time. |
| `forceInterval` |  Ignore the browser animation request mechanism. Default is false |

> ⚠️ We also add a hidden property `autoIntervalTest` that will clear/stop the timer if set to false, and start the timer if then set to true.

**Example:**

```html
<div
    x-data="{
        timer: 500,
        autoIntervalTest: true, // optional to start/stop the timer
        funtionToRun: function() {
            console.log('Hi again!')
        }
    }"
    x-init="$interval(funtionToRun, { timer: 1000, delay: 5000, forceInterval: true })">
    <button
        @click="autoIntervalTest = !autoIntervalTest"
        x-text="autoIntervalTest ? 'pause' : 'play'"></button>
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/poyyXQy?editors=1010)

---

### `$range`
**Example:**

The `$range` helper mostly mimics implementations found in other languages `$range(start, stop, step = 1)`
```html
<div x-data>
    <template x-for="item in $range(1, 5)">
        ...
    </template>
</div>
<!-- This will output 5 iterations [1, 2, 3, 4, 5], modelled after PHP's implimentation of range() -->
```
[Demo](https://codepen.io/KevinBatdorf/pen/vYKbPBd)

> N.B: You may use `$range(10)` which will compute to `[1...10]`

---


### `$refresh`
**Example:**
```html
<div x-data>
    <button @click="$refresh()">Refresh <code>Date.now()</code></button>
    <span x-text="Date.now()"></span>
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/PobZjrz?editors=1000)

---
### `$screen`
**Example:**

The `$screen` helper detects if the current browser width is equal or greater than a given breakpoint and returns `true` or `false` based on the result.

```html
<div x-data>
    <span x-show="$screen('lg')">This will be visible if the window width is equal or greater than 1024px.</span>
</div>
```

*By default the `$screen` helper uses the following endpoint borrowed by **Tailwind CSS**:*
- `xs`: 0px
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

> ⚠️ **NOTE**: A single breakpoint is only going to tell you if the browser width is equal or greater than the given breakpoint. If you want to restrict the check to a specific range, you will need to negate the next endpoint as:

```html
<div x-data>
    <span x-show="$screen('md') && !$screen('lg')">This will be visible if screen width is equal or greater than 768px but smaller then 1024px.</span>
</div>
```

**Custom breakpoints**

You can pass a numeric value to use an ad-hoc breakpoint.
```html
<div x-data>
    <span x-show="$screen(999)">This will be visible if screen width is equal or greater than 999px.</span>
</div>
```

You can also override the default breakpoints including the following `<script>` tag in the `<head>` of your document

```html
<!-- this example uses Bulma's breakpoints. -->
<script>
    window.AlpineMagicHelpersConfig = {
        breakpoints: {
            mobile: 0,
            tablet: 769,
            desktop: 1024,
            widescreen: 1216,
            fullhd: 1408
        }
    }
</script>
```
And using those breakpoints in your page.
```html
<div x-data>
    <span x-show="$screen('tablet')">This will be visible if screen width is equal or greater than 769px.</span>
</div>
```

[Demo](https://codepen.io/KevinBatdorf/pen/OJXKRXE?editors=1000)

---

### `$scroll`
**Example:**
```html
<div x-data>
    <div x-ref="foo">
        ...
    </div>
    <button x-on:click="$scroll($refs.foo)">Scroll to foo</scroll>
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/PozVLPy?editors=1000)

Alternatively, you can pass a css selector to scroll to an element at any position.
```html
<div id="foo">
</div>
<div x-data>
    <button x-on:click="$scroll('#foo')">Scroll to #foo</scroll>
</div>
```

`$scroll` also supports integers to scroll to a specific point of the page.
```html
<button x-data x-on:click="$scroll(0)">Scroll to top</scroll>
```
[Demo](https://codepen.io/KevinBatdorf/pen/PozVLPy?editors=1000) (same as above)

`$scroll` optionally supports a second parameter where it's possible to define the behavior mode, `auto|smooth` (default smooth):
```html
<div x-data>
    <div x-ref="foo">
        ...
    </div>
    <button x-on:click="$scroll($refs.foo, {behavior: auto})">Jump to foo</scroll>
</div>
...
<div id="foo">
</div>
<div x-data>
    <button x-on:click="$scroll('#foo', {behavior: auto})">Jump to #foo</scroll>
</div>
...
<button x-data x-on:click="$scroll(0, {behavior: auto}">Jump to top</scroll>
```
With offset:
```html
<div x-data>
    <div x-ref="foo">
        ...
    </div>
    <button x-on:click="$scroll($refs.foo, {offset: 50})">Scroll to 50px before foo</scroll>
</div>
...
<div id="foo">
</div>
<div x-data>
    <button x-on:click="$scroll('#foo', {offset: 50})">Scroll to 50px before #foo</scroll>
</div>
...
<button x-data x-on:click="$scroll(0, {offset: 50}">Jump to 50px before top (a bit daft but supported)</scroll>
```
With both:
```html
<div x-data>
    <div x-ref="foo">
        ...
    </div>
    <button x-on:click="$scroll($refs.foo, {behavior: auto, offset: 50})">Jump to 50px before foo</scroll>
</div>
...
<div id="foo">
</div>
<div x-data>
    <button x-on:click="$scroll('#foo', {behavior: auto, offset: 50})">Jump to 50px before #foo</scroll>
</div>
...
<button x-data x-on:click="$scroll(0, {behavior: auto, offset: 50}">Jump to 50px before top</scroll>
```
[Demo](https://codepen.io/KevinBatdorf/pen/PozVLPy?editors=1000) (same as above)

---

### `$truncate`
**Example:**
```html
<div
    x-data="{ characters: 50, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}"
    x-text="$truncate(string, characters)"
    @click="characters = undefined">
    <!-- Text will show 'Lorem ipsum dolor sit amet, consectetur adipiscing…' and will reveal all when clicked-->
</div>
```
You may also pass a third argument to change the string that will be appended to the end:
```html
<div
    x-data="{ characters: 50, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}"
    x-text="$truncate(string, characters, ' (...)')">
    <!-- Text will show 'Lorem ipsum dolor sit amet, consectetur adipiscing (...)' -->
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/BaKKgGg?editors=1000)

**Optionally pass in options**

By default, `$truncate` will return take characters as a parameter. Instead you can pass in an object and trim by words. You may also update the ellipsis.

**Example:**

```html
<div
    x-data="{ count: 5, string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}"
    x-text="$truncate(string, { words: words, ellipsis: ' ...read more' })"
    @click="count = 0">
    <!-- Will start with 5 words, then increase to unlimited when clicked -->
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/BaKKgGg?editors=1000) (same as above)
> Behind the scenes, for words, this uses `sentence.split(" ").splice(0, words).join(" ")` which does not define a word in all languages.

---
### `$undo`
**Example:**
```html
<div x-data="{ number: 0 }" x-init="$track()">
    <button @click="number = Math.floor(Math.random() * 10)" x-text="number"></button>
    <button x-show="$history.length" @click="$undo()">undo</button>
</div>
```
[Demo](https://codepen.io/KevinBatdorf/pen/jOrVzOg?editors=1000)

The `$undo` helper actually involves three helpers in one. First, add the `$track()` helper to the `x-init` directive to start tracking the component state. Next, add a button to `$undo()` changes as needed. And finally, you can access whether changes have occurred by using `$history.length`.

**Optionally pass in options**

By default, `$undo` will track all properties. Optionally you may limit the properties by passing in a string with the property name, or an array of property names.

**Example:**

```html
<div x-data="{ number: 0; another: 0 }" x-init="$track('number')">
    <button @click="number = number + 1" x-text="number"></button>
    <button @click="another = another + 1" x-text="another"></button>
    <button x-show="$history.length" @click="$undo()">undo number only</button>
</div>
```
> Use `$track(['prop1', 'prop2'])` to track multiple properties

[Demo](https://codepen.io/KevinBatdorf/pen/VwjmXLy?editors=1000)

---
### `x-unsafe-html`
**Example:**
```html
<div x-data="{ foo: bar }">
    <div x-unsafe-html="foo"></div>
    <button @click="foo = '<p>bar</p><script>alert(1)</script>'">test</button>
</div>
```

> :warning: **Only use on trusted content.** :warning:
>
> Dynamically rendering HTML from third parties can easily lead to [XSS](https://developer.mozilla.org/en-US/docs/Glossary/Cross-site_scripting) vulnerabilities.

[Demo](https://codepen.io/KevinBatdorf/pen/poNYpZb)

---

## License

Copyright (c) 2020 Alpine Collective

Licensed under the MIT license, see [LICENSE.md](LICENSE.md) for details.

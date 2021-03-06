# template-render [![NPM version](https://badge.fury.io/js/template-render.svg)](http://badge.fury.io/js/template-render)

> Plugin for Template for rendering vinyl files in an assemble, verb, or gulp pipeline.

## Install with [npm](npmjs.org)

```bash
npm i template-render --save
```

## Usage

Create a stream that will render files using [Template](https://github.com/jonschlinkert/template). Works with [gulp](https://github.com/gulpjs/gulp/), [verb](https://github.com/jonschlinkert/verb)and [assemble](https://github.com/assemble/assemble).

**Example:**

```js
var renderer = require('template-render');
var render = renderer(assemble);
assemble.task('build-posts', function () {
  assemble.src('*.hbs')
    .pipe(render());
});
```

## Related projects

* [assemble](http://assemble.io): Static site generator for Grunt.js, Yeoman and Node.js. Used by Zurb Foundation, Zurb Ink, H5BP/Effeckt,… [more](http://assemble.io)
* [template](https://github.com/jonschlinkert/template): Render templates using any engine. Supports, layouts, pages, partials and custom template types. Use template… [more](https://github.com/jonschlinkert/template)
* [template-render](https://github.com/assemble/template-render): Plugin for Template for rendering vinyl files in an assemble, verb, or gulp pipeline.
* [verb](https://github.com/assemble/verb): Documentation generator for GitHub projects. Extremely powerful, easy to use, can generate anything from API… [more](https://github.com/assemble/verb)

## Running tests

Install dev dependencies:

```bash
npm i -d && npm test
```

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/assemble/template-render/issues)

## Author

**Brian Woodward**

+ [github/doowb](https://github.com/doowb)
+ [twitter/doowb](http://twitter.com/doowb)

## License

Copyright (c) 2015 Brian Woodward
Released under the MIT license.

***

_This file was generated by [verb-cli](https://github.com/assemble/verb-cli) on April 29, 2015._

<!-- reflinks generated by verb-reflinks plugin -->

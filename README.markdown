# PouchDB Image Uploads

A little sample application for "uploading" image files to a [PouchDB][pouchdb.com].

## Building Blocks

- HTML5
- [jQuery][jquery.com] (v1.9.1)
- [jQuery SDK][jquerysdk.com] (v1.4)
- [Underscore.js][underscorejs.org] (v.1.4.4)
- [PouchDB][pouchdb.com]
- [IndexedDB Polyfill][indexeddbshim] - polyfill to enable IndexedDB (using WebSql) on browsers where IndexedBD is not supported, e.g. (Mobile) Safari.
- [mustache.js][mustache.js]

## Credits

- Prime free font - unique sans serif techy fonts by [Fontfabric™][fontfabric.com].
- [Barebones Patterns][barebones] - Common snippets of markup used throughout this site.


## Development Environment

Use foreman with `.env` file for setting for `PORT` (default `3000`) to start [node.js][nodejs.org] based web server, serving static files from `./public` directory and a echo server to echo `POST` requests.

    foreman start

Point your favourite HTML5-capable browser (mine being [Firefox][firefox]) to: [http://localhost:3000/](http://localhost:3000/).

Tested also on iOS/ Mobile Safari.

## Todo

- Refactor simple [jQuery][jquery.com]-only `app.js` using MVC framework, e.g. using [Backbone.js][backbonejs.org] or [Ember.js][emberjs.com].
- Add responsive design features (or CSS framework?) to improve mobile UX, targeting iOS/ Mobile Safari (iPhone).

[pouchdb.com]: http://pouchdb.com
[fontfabric.com]: http://fontfabric.com/prime-free-font/
[barebones]: http://barebones.paulrobertlloyd.com
[jquery.com]: http://jquery.com
[jquerysdk.com]: http://www.jquerysdk.com/
[mustache.js]: https://github.com/janl/mustache.js
[underscorejs.org]: http://underscorejs.org/
[nodejs.org]: http://nodejs.org
[indexeddbshim]: https://github.com/axemclion/IndexedDBShim
[backbonejs.org]: http://backbonejs.org
[emberjs.com]: http://emberjs.com
[firefox]: https://www.mozilla.org/firefox

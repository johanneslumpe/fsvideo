FSVideo.js
======
FSVideo.js is a small library with only a single purpose: to add a background video, or as alternative a poster image, to your page. It supports the ability to continuously loop the video or to just play it once. While resizing the browser window the video will always cover the whole background and will be resized and repositioned accordingly.

FSVideo.js has zero dependencies and only weights 1.25KB minified and gzipped.

If you feel that there is a feature missing, open up an issue and I will consider it.

You can install FSVideo.js by cloning this repo directly or via the following command:

`npm install fsvideo.js`

When using browserify you can just `require('FSVideo.js')`. When using AMD the library defines itself as anonymous module. If you happen to use neither, FSVideo.js will attach itself to the global object using the property `FSVideo.js`.

Browser support: IE9+, Chrome, Firefox, Opera, Safari.

For a basic demo, check `demo.html`.

Usage
------
Using FSVideo.js is straight forward:

```javascript
// assuming that we're in a browserify context
var FSVideo = require('fsvideo');
var video = new FSVideo();
fsVideo.init(['somefile.mp4']);

```

The above example will create an instance of FSVideo and attach the video to the `body`, since no element was provided.

**Remember to include the css styles into your page.**

API
------
###FSVideo(container)
Can be called as constructor or as function (it will then call itself again as constructor). `container` can be either a valid selector, which will be resolved using `querySelector` or an already resolved element.

###init(sources, options)
`sources` is expected to be an array of sources, which can be either video or image files. If you pass in a file with an extension of `jpg`, `png` or `gif`, FSVideo.js will assume that you want to display a poster image and will only take the first item from the sources. All other files will be treated as video files. For each file a `source` element will be created, allowing you to pass in multiple sources to target multiple browsers (i.e. pass in .mp4 and .ogg files). The files' extensions will be used as part of the `type` attribute of the `source` elements, so make sure that you're using the correct file extensions.

###destroy()
Removes all added event listeners and created elements.

Tests
------
To run the tests execute `npm install` and then `npm test` or open up `test/testrunner.html` in your browser of choice. On windows, if you haven't added phantomjs to your `PATH`, you will have to specify the path to the executable file using the `-p PATH` switch.

*Please note that a single test will fail on phantomjs at the moment due to the fact that `getAttribute` returns `null`. The test will pass on all supported browsers though.*

License
------
Copyright (c) 2014, Johannes Lumpe

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
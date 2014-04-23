// fsvideo.js 0.0.1
// ---------------

// (c) 2014 Johannes Lumpe, ISC license

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.FSVideo = factory();
  }
}(this, function () {
  var id = 0;
  // Taken from http://davidwalsh.name/javascript-debounce-function
  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  var debounce = function (func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      }, wait);
      if (immediate && !timeout) func.apply(context, args);
    };
  };

  var FSVideo = function FSVideo(selector) {
    // called as a function
    if (!this instanceof FSVideo) {
      return new FSVideo(selector);
    }

    this._initialized = false;
    this._events = {};

    // conveniently default to the document's body, so we can call this without any
    // arguments and still get our video
    this._container = this._getElement(selector) || document.querySelector('body');
  };

  FSVideo.prototype._off = function (element, event, handler) {
    // bail if not fsvideoId is found, we didn't add any events to this element
    if (!element.fsvideoId) {
      return;
    }

    var localId = element.fsvideoId;
    var events = this._events[localId];

    // loop through the list until the matching event/handler pair
    // is found and then remove it
    for (var i = events.length - 1; i >= 0; i--) {
      var item = events[i];

      // 0 is the event, 1 the handler, 2 the wrapper function
      if (item[0] === event || event === undefined) {
        var handlerMatches = handler && item[1] === handler;
        if (handlerMatches || !handler) {
          events.splice(i, 1);
          element.removeEventListener(item[0], item[2], false);
        }

        // if we passed in a handler we only want to remove a single handler
        if (handlerMatches) {
          break;
        }
      }
    }
  };

  FSVideo.prototype._on = function (element, event, handler, once) {
    var self = this;

    // we need an id to track events for the element
    // so assign one, if none is present
    if (!element.fsvideoId) {
      id++;
      element.fsvideoId = id;
    }

    var localId = element.fsvideoId;
    this._events[localId] = this._events[localId] || [];

    // wrap the call to the handler, so that we always call it
    // in the context of our FSVideo instance
    var wrapper = function wrapper(e) {
      handler.call(self, e);
      if (once) {
        self._off(element, event, handler);
      }
    };

    this._events[localId].push([event, handler, wrapper]);
    element.addEventListener(event, wrapper, false);
  };

  FSVideo.prototype.init = function (sources, options) {
    if (this._initialized) {
      return;
    }

    // The suffixes which are allowed for poster images
    var imageTypes = ['jpg', 'png', 'gif'];

    // TODO: fix object detection
    options = options || {};
    var fileType = this._getFileExt(sources[0]);

    // if the first source is an image type,
    // assume that we want to display an image instead of a video
    var displayPoster = this._displayPoster = (imageTypes.indexOf(fileType) !== -1);
    var el = this._element = displayPoster ?
      this._preparePoster(sources) :
      this._prepareVideo(sources, options);

    this._container.appendChild(el);

    // in case the image is cached and the event might not fire, we call the poster handler directly
    if (displayPoster) {
      this._onLoadImgHandler();
    }

    // debounce the resize function to save some performance
    this._on(window, 'resize', debounce(this._resizeHandler, 100));

    this._initialized = true;
  };

  FSVideo.prototype._onLoadedMetaDataHandler = function (e) {
    // when this handler is called we have enough information
    // about the video to resize it properly
    var windowWidth   = this._getWindowWidth();
    var windowHeight  = this._getWindowHeight();
    var el            = this._element;
    var width         = el.videoWidth;
    var height        = el.videoHeight;

    this._fitToScreen(width, height, windowWidth, windowHeight);
    el.play();
  };

  FSVideo.prototype._onLoadImgHandler = function (e) {
    var el = this._element;
    if (el.complete) {
      this._fitToScreen(el.naturalWidth, el.naturalHeight, this._getWindowWidth(), this._getWindowHeight());
    }
  };

  FSVideo.prototype._onEndHandler = function (e) {
    this._element.play();
  };

  FSVideo.prototype._resizeHandler = function (e) {
    var el = this._element;
    var displayPoster = this._displayPoster;

    var w = displayPoster ?
            el.naturalWidth :
            el.videoWidth;

    var h = displayPoster ?
            el.naturalHeight :
            el.videoHeight;

    this._fitToScreen(w, h, this._getWindowWidth(), this._getWindowHeight());
  };

  FSVideo.prototype._preparePoster = function (sources) {
    var self  = this;
    var el    = document.createElement('img');

    el.className = 'fsvideo-placeholder';
    el.src = sources[0];
    this._on(el, 'load', this._onLoadImgHandler, true);
    return el;
  };

  FSVideo.prototype._prepareVideo = function (sources, options) {
    var self  = this;
    var el    = document.createElement('video');

    el.className = 'fsvideo-video';
    this._on(el, 'loadedmetadata', this._onLoadedMetaDataHandler, true);

    // each file is assumed to have the correct file extension,
    // so it can be used as the type
    sources.forEach(function (item) {
      var src = document.createElement('source');
      src.src = item;
      src.type = 'video/' + self._getFileExt(item);
      el.appendChild(src);
    });

    if (!options || options.loop !== false) {
      this._on(el, 'ended', this._onEndHandler);
    }

    return el;
  };

  FSVideo.prototype._getWindowWidth =function () {
    return window.innerWidth;
  };

  FSVideo.prototype._getWindowHeight = function () {
    return window.innerHeight;
  };

  FSVideo.prototype._getElement = function (elementOrSelector) {
    var el = typeof HTMLElement !== 'undefined' ?
             HTMLElement :
             Element;

    return elementOrSelector instanceof el ?
           elementOrSelector :
           document.querySelector(elementOrSelector);
  };

  FSVideo.prototype._getFileExt = function (fileName) {
    var parts = fileName.split('.');
    return parts[parts.length-1];
  };

  FSVideo.prototype._fitToScreen = function (width, height, windowWidth, windowHeight) {
    var element       = this._element;
    var s             = element.style;
    var factorWidth   = windowWidth / width;
    var factorHeight  = windowHeight / height;
    var factor        = 1;
    var newWidth      = windowWidth;
    var newHeight;
    var offsetX;
    var offsetY;

    factor = factorWidth > factorHeight ?
             factorWidth :
             factorHeight;

    newWidth = width * factor;
    newHeight = height * factor;

    offsetX = newWidth > windowWidth ? Math.floor((windowWidth - newWidth) / 2) : 0;
    offsetY = newHeight > windowHeight ? Math.floor((windowHeight - newHeight) / 2) : 0;

    s.width = newWidth + 'px';
    s.height = newHeight + 'px';
    s.marginTop = offsetY + 'px';
    s.marginLeft = offsetX + 'px';
  };

  FSVideo.prototype.destroy = function () {
    var c = this._container;
    var children = c.children;
    for (var i = children.length - 1; i >= 0; i--) {
      c.removeChild(children[i]);
    }

    this._off(window);
    this._off(this._element);
    this._container = null;
    this._element = null;
  };

  return FSVideo;
}));
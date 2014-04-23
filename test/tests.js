describe('FSVideo', function () {
  "use strict";

  var containerSelector = '#testContainer';
  var imgPath = 'dummy.jpg';

  var dispatchEvent = function (element, event) {
    // use createEvent because phantomjs doesn't know `Event` or `CustomEvent`
    var e = document.createEvent('HTMLEvents');
    e.initEvent(event, true, true);
    element.dispatchEvent(e);
  };

  describe('constructor', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should exist', function () {
      expect(FSVideo).to.be.ok;
    });

    it('should start uninitialized', function () {
      expect(fsvideo._initialized).to.be.false;
    });

    it('should set `_events` to an empty object', function () {
      expect(fsvideo._events).to.eql({});
    });

    it('should default to the body-element as container', function () {
      expect(fsvideo._container).to.equal(document.querySelector('body'));
    });

    it('it should accept a selector to determine its container element', function () {
      var fsvideo   = new FSVideo(containerSelector);
      expect(fsvideo._container).to.equal(document.querySelector(containerSelector));
    });

    it('it should accept a DOM element as container', function () {
      var node      = document.querySelector(containerSelector);
      var fsvideo   = new FSVideo(node);
      expect(fsvideo._container).to.equal(node);
    });

  });

  describe('#_on', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should add the passed in handler to the passed in element for the specified event', function (done) {
      var e = document.createElement('button');
      fsvideo._on(e, 'testEvent', function () {
        done();
      });

      dispatchEvent(e, 'testEvent');
    });

    it('should add an `fsvideoId` to the element', function () {
      var e = document.createElement('button');
      fsvideo._on(e, 'testEvent', function () {});

      expect(e.fsvideoId).to.be.ok;
    });

    it('should not modify the `fsvideoId` if an element already has one', function () {
      var e = document.createElement('button');
      fsvideo._on(e, 'testEvent', function () {});
      var id = e.fsvideoId;
      fsvideo._on(e, 'testEvent', function () {});

      expect(e.fsvideoId).to.equal(id);
    });

    it('should add a reference to the handler to the `_event` property', function () {
      var e = document.createElement('button');
      var handler = function () {};
      fsvideo._on(e, 'testEvent', handler);
      var id = e.fsvideoId;

      expect(fsvideo._events[id].length).to.equal(1);
      expect(fsvideo._events[id][0][1]).to.equal(handler);
    });

    it('should call `_off` after the event is triggered when `once` is set to true', function (done) {
      var e = document.createElement('button');
      var handler = function () {};
      fsvideo._off = function () {done();};
      fsvideo._on(e, 'testEvent', handler, true);
      dispatchEvent(e, 'testEvent');
    });

  });

  describe('#_off', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should remove a handler for an event from an element', function () {
      var e = document.createElement('button');
      var handler = function () {
        throw new Error('should not be called');
      };

      fsvideo._on(e, 'testEvent', handler);
      fsvideo._off(e, 'testEvent', handler);

      expect(fsvideo._events[e.fsvideoId].length).to.equal(0);
      dispatchEvent(e, 'testEvent');
    });

    it('should remove all added handlers for an element if no specific handler is passed in', function () {
      var e = document.createElement('button');
      var handler = function () {
        throw new Error('should not be called');
      };

      fsvideo._on(e, 'testEvent', handler);
      fsvideo._off(e, 'testEvent');

      expect(fsvideo._events[e.fsvideoId].length).to.equal(0);
      dispatchEvent(e, 'testEvent');
    });

  });

  describe('#_getFileExt', function () {

    it('should get the file extension of a provided filename', function () {
      var filename = 'testfile.ext';
      expect(FSVideo.prototype._getFileExt(filename)).to.equal('ext');
    });

  });

  describe('#_getElement', function () {

    it('should resolve an element from a selector', function () {
      var el = FSVideo.prototype._getElement(containerSelector);
      expect(el).to.equal(document.querySelector(containerSelector));
    });

    it('should return the same element if an element is passed in', function () {
      var el = document.querySelector(containerSelector);
      el.testElement = true;

      var returnEl = FSVideo.prototype._getElement(el);
      expect(returnEl.testElement).to.be.true;
    });

  });

  describe('#_preparePoster', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should return an image element', function (){
      fsvideo._onLoadImgHandler = function () {};
      var el = fsvideo._preparePoster([imgPath]);
      expect(el.tagName).to.equal('IMG');
    });

    it('should assign a class of `fsvideo-placeholder` to the element', function () {
      fsvideo._onLoadImgHandler = function () {};
      var el = fsvideo._preparePoster([imgPath]);
      expect(el.className).to.equal('fsvideo-placeholder');
    });

    it('should call `_onLoadImgHandler` when the `load` event is fired on the element', function (done) {
      fsvideo._onLoadImgHandler = function () {
        done();
      };

      var el = fsvideo._preparePoster([imgPath]);
      dispatchEvent(el, 'load');

    });

    it('should remove the eventlistener for `load` after the first execution', function () {
      var callCount = 0;
      fsvideo._onLoadImgHandler = function () {
        callCount++;
      };

      var el = fsvideo._preparePoster([imgPath]);
      dispatchEvent(el, 'load');
      dispatchEvent(el, 'load');
      expect(callCount).to.equal(1);
    });

  });

  describe('#_prepareVideo', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should return a video element', function (){
      var el = fsvideo._prepareVideo([]);
      expect(el.tagName).to.equal('VIDEO');
    });

    it('should assign a class of `fsvideo-video` to the element', function () {
      var el = fsvideo._prepareVideo([]);
      expect(el.className).to.equal('fsvideo-video');
    });

    it('should call `_onLoadedMetaDataHandler` when the `loadedmetadata` is fired', function (done) {
      fsvideo._onLoadedMetaDataHandler = function () {
        done();
      };

      var el = fsvideo._prepareVideo([]);
      dispatchEvent(el, 'loadedmetadata');
    });

    it('should remove the eventlistener for `loadedmetadata` after the first execution', function () {
      var callCount = 0;
      fsvideo._onLoadedMetaDataHandler = function () {
        callCount++;
      };

      var el = fsvideo._prepareVideo([]);
      dispatchEvent(el, 'loadedmetadata');
      dispatchEvent(el, 'loadedmetadata');
      expect(callCount).to.equal(1);
    });

    it('should add all source elements as children to the video element', function () {
      var files = ['a.mp4', 'b.mp4'];
      var el = fsvideo._prepareVideo(files);
      expect(el.childElementCount).to.equal(2);

      for (var i = 0; i < files.length; i++) {
        var type = fsvideo._getFileExt(files[i]);
        // this test will fail in phantomjs but passes in all browsers.
        // somehow phantomjs returns null for the getAttribute call
        expect(el.children[i].getAttribute('type')).to.equal('video/' + type);
        expect(el.children[i].getAttribute('src')).to.equal(files[i]);
      }

    });

    it('should add an event listener for the `ended` event, if looping is not disabled through the passed-in the options', function (done) {
      fsvideo._onEndHandler = function () {
        done();
      };

      var el = fsvideo._prepareVideo([]);
      dispatchEvent(el, 'ended');
    });

    it('should not add an event listener for the `ended` event, if looping is disabled through the passed-in options', function () {
      fsvideo._onEndHandler = function () {
        throw new Error('should not be called');
      };

      var el = fsvideo._prepareVideo([], {loop: false});
      dispatchEvent(el, 'ended');
    });

  });

  describe('#_onLoadedMetaDataHandler', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should call `play` on the video element', function (done) {
      fsvideo._fitToScreen = function () {};
      fsvideo._element = {
        play: function () {
          done();
        }
      };

      fsvideo._onLoadedMetaDataHandler();

    });

    it('should call `_fitToScreen` with the correct arguments', function (done) {
      fsvideo._getWindowWidth = function () { return 100; };
      fsvideo._getWindowHeight = function () { return 300; };
      fsvideo._element = {
        play: function () {},
        videoWidth: 200,
        videoHeight: 250
      };

      fsvideo._fitToScreen = function (width, height, ww, wh) {
        expect(width).to.equal(200);
        expect(height).to.equal(250);
        expect(ww).to.equal(100);
        expect(wh).to.equal(300);
        done();
      };

      fsvideo._onLoadedMetaDataHandler();
    });

  });

  describe('#_onLoadImgHandler', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should call `_fitToScreen` with the correct arguments', function (done) {
      fsvideo._getWindowWidth = function () { return 100; };
      fsvideo._getWindowHeight = function () { return 300; };
      fsvideo._element = {
        complete: true,
        naturalWidth: 200,
        naturalHeight: 250
      };

      fsvideo._fitToScreen = function (width, height, ww, wh) {
        expect(width).to.equal(200);
        expect(height).to.equal(250);
        expect(ww).to.equal(100);
        expect(wh).to.equal(300);
        done();
      };

      fsvideo._onLoadImgHandler();
    });

    it('should call `_fitToScreen` only when the `complete` property of the element is `true`', function () {
      var callCount = 0;
      fsvideo._element = {
        complete: false,
      };

      fsvideo._fitToScreen = function (width, height, ww, wh) {
        callCount++;
      };

      fsvideo._onLoadImgHandler();
      expect(callCount).to.equal(0);
    });
  });

  describe('#_onEndHandler', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should call `play` on the video element', function (done) {
      fsvideo._element = {
        play: function () {done();}
      };

      fsvideo._onEndHandler();

    });

  });

  describe('#_resizeHandler', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should call `_fitToScreen` with the video size, if `displayPoster` is false', function (done) {
      fsvideo._displayPoster = false;
      fsvideo._getWindowWidth = function () { return 100; };
      fsvideo._getWindowHeight = function () { return 300; };
      fsvideo._element = {
        videoWidth: 200,
        videoHeight: 250
      };

      fsvideo._fitToScreen = function (width, height, ww, wh) {
        expect(width).to.equal(200);
        expect(height).to.equal(250);
        expect(ww).to.equal(100);
        expect(wh).to.equal(300);
        done();
      };

      fsvideo._resizeHandler();

    });

    it('should call `_fitToScreen` with the image size, if `displayPoster` is true', function (done) {
      fsvideo._displayPoster = true;
      fsvideo._getWindowWidth = function () { return 100; };
      fsvideo._getWindowHeight = function () { return 300; };
      fsvideo._element = {
        naturalWidth: 200,
        naturalHeight: 250
      };

      fsvideo._fitToScreen = function (width, height, ww, wh) {
        expect(width).to.equal(200);
        expect(height).to.equal(250);
        expect(ww).to.equal(100);
        expect(wh).to.equal(300);
        done();
      };

      fsvideo._resizeHandler();

    });

  });

  describe('#_fitToScreen', function () {
    var fsvideo;

    beforeEach(function () {
      fsvideo = new FSVideo();
    });

    it('should calculate the proper width/height and offset for the element', function () {
      fsvideo._element = document.createElement('video');
      var elementWidth = 16;
      var elementHeight = 9;
      var windowWidth = 32;
      var windowHeight = 18;

      fsvideo._fitToScreen(elementWidth, elementHeight, windowWidth, windowHeight);

      var s = fsvideo._element.style;
      expect(s.marginTop).to.equal('0px');
      expect(s.marginLeft).to.equal('0px');
      expect(s.width).to.equal('32px');
      expect(s.height).to.equal('18px');

      windowWidth = 18;
      windowHeight = 36;

      fsvideo._fitToScreen(elementWidth, elementHeight, windowWidth, windowHeight);

      expect(s.marginTop).to.equal('0px');
      expect(s.marginLeft).to.equal(-1 * (64-18)/2 + 'px');
      expect(s.width).to.equal('64px');
      expect(s.height).to.equal('36px');

    });
  });

  describe('#_getWindowWidth', function () {
    it('should get width of the window', function () {
      expect(FSVideo.prototype._getWindowWidth()).to.equal(window.innerWidth);
    });
  });

  describe('#_getWindowHeight', function () {

    it('should get height of the window', function () {
      expect(FSVideo.prototype._getWindowHeight()).to.equal(window.innerHeight);
    });

  });

  describe('#init', function () {
    var fsvideo;

    beforeEach(function () {
      // create a container so the elements aren't really appended to the dom during testing
      var c = document.createElement('div');
      fsvideo = new FSVideo(c);
    });

    it('should set `element` to an image element, if a file with an extension of jpg, png or gif is passed in', function () {
      fsvideo.init(['dummy.jpg']);
      expect(fsvideo._element.tagName).to.equal('IMG');
      expect(fsvideo._displayPoster).to.be.true;
    });

    it('should set `element` to a video element, if a file with a different extension than png, jpg of gif is passed in', function () {
      fsvideo.init(['dummy.mp4']);
      expect(fsvideo._element.tagName).to.equal('VIDEO');
      expect(fsvideo._displayPoster).to.be.false;
    });

    it('should append the created element to the passed in container', function () {
      fsvideo.init(['dummy.mp4']);
      expect(fsvideo._container.childElementCount).to.equal(1);
    });

    it('should add an eventlistener for the `resize` event to the `window` object', function (done) {
      fsvideo._resizeHandler = function () {done();};
      fsvideo.init(['dummy.mp4']);

      dispatchEvent(window, 'resize');
    });

    it('should not initialize twice', function () {
      var callCount = 0;
      fsvideo._resizeHandler = function () {callCount++;};
      fsvideo.init(['dummy.mp4']);
      fsvideo.init(['dummy.mp4']);

      expect(fsvideo._container.childElementCount).to.equal(1);
    });

  });

  describe('#destroy', function () {
    var fsvideo;
    var c;

    beforeEach(function () {
      // create a container so the elements aren't really appended to the dom during testing
      c = document.createElement('div');
      fsvideo = new FSVideo(c);
    });

    it('should remove all elements from the container', function  () {
      fsvideo.init(['dummy.mp4']);
      fsvideo.destroy();
      expect(c.childElementCount).to.equal(0);
    });

    it('should remove all attached events', function () {
      var f = function () {throw new Error('this should not happen');};
      var handlers = ['_resizeHandler', '_onLoadImgHandler', '_onLoadedMetaDataHandler', '_onEndHandler'];
      for (var i = handlers.length - 1; i >= 0; i--) {
        fsvideo[handlers[i]] = f;
      }
      fsvideo.init(['dummy.mp4']);
      var el = fsvideo._element;
      fsvideo.destroy();
      dispatchEvent(window, 'resize');
      dispatchEvent(el, 'load');
      dispatchEvent(el, 'loadedmetadata');
      dispatchEvent(el, 'ended');
    });

  });

});
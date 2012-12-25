(function (window) {
  var me = Canvas = RV.Canvas = {},

      VIEWPORT_PADDING = 100,

      _canvas,
      _ctx,
      _animating = false,

      _paintTime = 0,
      _viewportFrame = {
        left: 0, top: 0, right: 0, bottom: 0
      };

  me.viewport = [
    0, 0, 0, 0, 0, 0
  ];

  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (func) {
      setTimeout(func, 20);
    };


  function _resize() {
    _.extend(_canvas, {
      height: document.height,
      width: document.width
    });

    me.viewport = [
      me.viewport[0], me.viewport[1], document.width, document.height
    ];

    me.viewport[4] = document.width / 2 + me.viewport[0];
    me.viewport[5] = document.height / 2 + me.viewport[1];

  }

  var _hudWrite = _.throttle(RV.Hud.write, 200);

  function _draw() {
    var blocks = RV.Map.getBlocksInViewport(me.viewport),
        block,
        now = _.now(),
        delta = now - _paintTime,
        fps = 1000 / delta;

    delta = delta / 1000;

    _paintTime = now;

    _ctx.clearRect(0, 0, me.viewport[2], me.viewport[3]);

    for (var i = 0, l = blocks.length; i < l; i++) {
      block = blocks[i];
      _drawWarped(block.image, block.location.x - me.viewport[0], block.location.y - me.viewport[1], block.size.w, block.size.h);
      block.tick(delta);
    }

    me.adjustViewport();

    if (_animating) {
      requestAnimationFrame(_draw, _canvas);
    }

    if (RV.DEBUG) {
      // record fps
      _hudWrite(fps.toFixed(3) + ' fps<br />' + delta.toFixed(6) + ' ms');
    }
  }

  function _drawWarped(image, x, y, w, h) {
    var warp = RV.Map.warp;

    if (false && warp) {
      dimensions = warp.warp(x, y, w, h);
    }

    _ctx.drawImage(image, dimensions.x, dimensions.y, dimensions.w, dimensions.h);
  }

  me.adjustViewport = function () {
    var heroDeltaX,
        heroDeltaY;

    _viewportFrame = {
      left: me.viewport[0] + VIEWPORT_PADDING,
      top: me.viewport[1] + VIEWPORT_PADDING,
      right: me.viewport[0] + me.viewport[2] - VIEWPORT_PADDING,
      bottom: me.viewport[1] + me.viewport[3] - VIEWPORT_PADDING
    };

    heroDeltaX = RV.Hero.location.x - _viewportFrame.right;
    if (heroDeltaX > 0) {
      me.viewport[0] += heroDeltaX;
    }
    else {
      heroDeltaX = RV.Hero.location.x - _viewportFrame.left;
      if (heroDeltaX < 0) {
        me.viewport[0] += heroDeltaX;
      }
    }

    heroDeltaY = RV.Hero.location.y - _viewportFrame.bottom;
    if (heroDeltaY > 0) {
      me.viewport[1] += heroDeltaY;
    }
    else {
      heroDeltaY = RV.Hero.location.y - _viewportFrame.top;
      if (heroDeltaY < 0) {
        me.viewport[1] += heroDeltaY;
      }
    }
  };

  me.init = function (canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');

    if (RV.DEBUG) {
      // give global access to the canvas
      window.canvas = _canvas;
      window.ctx = _ctx;
    }

    _resize();
    window.addEventListener('resize', _.debounce(_resize, 100));

    me.start();
  };

  me.start = function () {
    _animating = true;
    _draw();
  };

  me.stop = function () {
    _animating = false;
  };

}(window));


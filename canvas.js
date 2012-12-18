(function (window) {
  var me = Canvas = RV.Canvas = {},

      _canvas,
      _ctx,
      _animating = false,

      // debug stuff
      _paintTime = 0;

  me.viewport = [
    0, 0, 0, 0
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
  }

  var _hudWrite = _.throttle(RV.Hud.write, 200);

  function _draw() {
    var blocks = RV.Map.getBlocksInViewport(me.viewport),
        block;

    // also paint OUR HERO
    blocks.push(RV.Hero);

    _ctx.clearRect(0, 0, me.viewport[2], me.viewport[3]);

    for (var i = 0, l = blocks.length; i < l; i++) {
      block = blocks[i];
      _ctx.drawImage(block.image, block.location.x, block.location.y, block.size.w, block.size.h);
    }

    if (_animating) {
      requestAnimationFrame(_draw, _canvas);
    }

    if (RV.DEBUG) {
      // record fps
      _hudWrite((1000 / (_.now() - _paintTime)).toFixed(3) + ' fps');
      _paintTime = _.now();
    }
  }

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


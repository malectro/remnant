(function (window) {
  var me = Canvas = RV.Canvas = {},

      _canvas,
      _ctx,
      _animating = false,

      // debug stuff
      _paintTime = 0;


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
  }

  var _hudWrite = _.throttle(RV.Hud.write, 200);

  function _draw() {
    //_ctx.clearRect(0, 0, )

    //test
    _ctx.setFillColor('blue');
    _ctx.fillRect(10, 10, 10, 10);

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


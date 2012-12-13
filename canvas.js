(function (window) {
  var me = Canvas = RV.Canvas = {},

      _canvas,
      _ctx,
      _animating = false;


  var requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (func) {
      setTimeout(func, 20);
    };


  function _draw() {
    //_ctx.clearRect(0, 0, )

    if (_animating) {
      requestAnimationFrame(_draw, _canvas);
    }
  }

  me.init = function (canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');

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


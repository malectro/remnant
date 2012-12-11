(function () {
  var me = Canvas = RV.Canvas = {},

      _canvas,
      _ctx;

  me.init = function (canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('2d');
  };
}());

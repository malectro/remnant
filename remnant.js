;
var RV = (function () {
  var me = {},

      _,

      ALL_THE_THINGS = [
        'Util',
        'canvas'
      ];

  require(ALL_THE_THINGS);

  /**
   * initialize the html centric stuff
   */
  me.init = function () {
    // set up the globals
    _ = RV.Util;

    // fix browser css shit
    _.extend(document.body.style, {
      margin: 0,
      padding: 0,
      backgroundColor: '#000'
    });

    // insert the canvas
    var canvas = document.createElement('canvas');

    _.extend(canvas.style, {
      position: 'absolute',
      height: '100%',
      width: '100%',
      background: 'black'
    });

    document.body.innerHTML = '';
    document.body.appendChild(canvas);

    // init the important classes
    me.Canvas.init(canvas);
  };

  return me;
}());

window.onload = RV.init;


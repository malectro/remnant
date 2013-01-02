;
var RV = (function () {
  var me = {},

      ALL_THE_THINGS = [
        'hero',
        'map',
        'block',
        'canvas',
        'controller',
        'hud',
        'Util'
      ];

  // debug status
  me.DEBUG = true;

  require(ALL_THE_THINGS);

  /**
   * initialize the html centric stuff
   */
  me.init = function () {
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
    me.Controller.init();
    me.Map.load();
    me.Hero.init();

    if (me.DEBUG) {
      me.Hud.init();
    }
  };

  return me;
}());

window.addEventListener('load', RV.init);


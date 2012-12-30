(function (window) {
  var me = Canvas = RV.Canvas = {},

      VIEWPORT_PADDING = 100,
      SHADERS = ['2d.frag', '2d.vert'],

      _canvas,
      _ctx,
      _animating = false,

      _shaders = {},

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

  function _loadShader(name, params) {
    var key = JSON.stringify(params),
        shader = _shaders[name],
        program = shader.programs[key];

    if (!program) {
      program = _ctx.createShader(shader.type);
      
    }
  }

  function _loadShaders() {
    var shaderTypes = {
      'x-fragment': _ctx.FRAGMENT_SHADER,
      'x-vertex': _ctx.VERTEX_SHADER
    };

    _.each(document.getElementsByTagName('script'), function (script) {
      if (script.type.split('/')[0] === 'x-shader') {
        var name = script.id.split('-')[1],
            type = script.type.split('/')[1];

        if (type = shaderTypes[type]) {
          _shaders[name] = {
            raw: _.text(script),
            type: type,
            programs: {}
          };
        }
      }
    });
  }


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
    else {
      dimensions = {x: x, y: y, w: w, h: h};
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
    _ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    _loadShaders();

    if (RV.DEBUG) {
      // give global access to the canvas
      window.canvas = _canvas;
      window.ctx = _ctx;
    }

    _resize();
    window.addEventListener('resize', _.debounce(_resize, 100));

    //testing stuff
    var buffer = _ctx.createBuffer(),
        vertices = [
          1.0, 1.0, 0.0,
          -1.0, 1.0, 0.0,
          1.0, -1.0, 0.0,
          -1.0, -1.0, 0.0
        ];

    _ctx.bindBuffer(_ctx.ARRAY_BUFFER, buffer);
    _ctx.bufferData(_ctx.ARRAY_BUFFER, new Float32Array(vertices), _ctx.STATIC_DRAW);


    _ctx.vertexAttribPointer(vertexPositionAttribute, 3, _ctx.FLOAT, false, 0, 0);
    _ctx.drawArrays(_ctx.TRIANGLE_STRIP, 0, 4);

    //me.start();
  };

  me.start = function () {
    _animating = true;
    _draw();
  };

  me.stop = function () {
    _animating = false;
  };

}(window));


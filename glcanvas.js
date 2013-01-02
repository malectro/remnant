(function (window) {
  var me = Canvas = RV.Canvas = {},

      VIEWPORT_PADDING = 100,
      SHADERS = ['2d.frag', '2d.vert'],

      mat3 = RV.Matrix.mat3,
      vec3 = RV.Matrix.vec3,

      _canvas,
      _ctx,
      _animating = false,

      _shaders = {},
      _shaderProgram,

      _textures = {},

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

  (function () {
    var me = Canvas.Transform = {},

        MAX_DEPTH = 16;

    me.clear = function () {
      me.stack = [];
      me.cache = [];
      me.count = 0;
      me.valid = 0;
      me.result = null;

      for (var i = 0; i < MAX_DEPTH; i++) {
        me.stack[i] = mat3.identity;
      }

      me.setIdentity();
    };

    me.setIdentity = function () {
      me.stack[me.count] = mat3.identity;
      if (me.valid === me.count && me.count) {
        me.valid--;
      }
    };

    me.getResult = function () {
      if (!me.count) {
        return me.stack[0];
      }
    };

    me.push = function () {
      me.count++;
      me.stack[me.count] = mat3.identity;
    };

    me.pop = function () {
      if (me.count) {
        me.count--;
      }
    }

  }());

  function _shaderStamp(raw, params) {
    var ob = {};

    for (var i in params) {
      ob['\\$' + i] = params[i];
    }

    return _.stamp(raw, ob);
  }

  function _loadShader(name, params) {
    var key = JSON.stringify(params),
        shaderInfo = _shaders[name],
        shader = shaderInfo.programs[key];

    if (!shader) {
      shader = _ctx.createShader(shaderInfo.type);

      _ctx.shaderSource(shader, _shaderStamp(shaderInfo.raw, params));
      _ctx.compileShader(shader);

      if (!_ctx.getShaderParameter(shader, _ctx.COMPILE_STATUS)) {
        throw "shader '" + name + "' compilation error: " + _ctx.getShaderInfoLog(shader);
      }

      shaderInfo.programs[key] = shader;
    }

    return shader;
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

  function _loadDefaultShaders() {
    var program = _shaderProgram = _ctx.createProgram();

    _ctx.attachShader(program, _loadShader('main_frag', {hasTexture: '0', hasCrop: '0'}));
    _ctx.attachShader(program, _loadShader('main_vert', {hasTexture: '0', depth: 1, w: me.viewport[2], h: me.viewport[3]}));

    _ctx.linkProgram(program);

    if (!_ctx.getProgramParameter(program, _ctx.LINK_STATUS)) {
      throw "could not initialize shader program.";
    }

    _ctx.useProgram(program);

    _shaderProgram.vertexPositionAttribute = _ctx.getAttribLocation(program, 'aVertexPosition');
    _ctx.enableVertexAttribArray(program.vertexPositionAttribute);

    program.uColor = _ctx.getUniformLocation(program, 'uColor');
    program.uSampler = _ctx.getUniformLocation(program, 'uSampler');
    program.uCropSource = _ctx.getUniformLocation(program, 'uCropSource');

    //TODO: figure transform stack out laterz
    program.uTransforms = [];

    return program;
  }

  function _textureize(block) {
    var texture = block.texture;

    if (!texture) {
      texture = _ctx.createTexture();

      _ctx.bindTexture(_ctx.TEXTURE_2D, texture);
      _ctx.texImage2D(_ctx.TEXTURE_2D, 0, _ctx.RGBA, _ctx.RGBA, _ctx.UNSIGNED_BYTE, block.image);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_S, _ctx.CLAMP_TO_EDGE);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_T, _ctx.CLAMP_TO_EDGE);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MAG_FILTER, _ctx.LINEAR);

      if (_.powerOf2(block.image.width) && _.powerOf2(block.image.height)) {
        _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR_MIPMAP_LINEAR);
        _ctx.generateMipmap(_ctx.TEXTURE_2D);
      }
      else {
        _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR);
      }

      _ctx.bindTexture(_ctx.TEXTURE_2D, null);
    }

    return texture;
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

  function _drawBlock(block) {
    var buffer = _ctx.createBuffer(),
        vertices = [
          1.0, 1.0, 0.0,
          -1.0, 1.0, 0.0,
          1.0, -1.0, 0.0,
          -1.0, -1.0, 0.0
        ];

    _ctx.bindBuffer(_ctx.ARRAY_BUFFER, buffer);
    _ctx.bufferData(_ctx.ARRAY_BUFFER, new Float32Array(vertices), _ctx.STATIC_DRAW);

    _ctx.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, 3, _ctx.FLOAT, false, 0, 0);

    if (false && block.image) {
      _ctx.bindTexture(_ctx.TEXTURE_2D, _textureize(block));
      _ctx.activeTexture(_ctx.TEXTURE0);
      _ctx.uniform1i(_shaderProgram.uSampler, 0);

      _ctx.drawArrays(_ctx.TRIANGLE_STRIP, 0, 4);
    }
    else {
      _ctx.uniform4f(_shaderProgram.uColor, 1, 1, 1, 1);
      _ctx.drawArrays(_ctx.LINE_LOOP, 0, 4);
    }
  }

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

    if (RV.DEBUG) {
      // give global access to the canvas
      window.canvas = _canvas;
      window.ctx = _ctx;
    }

    _resize();
    window.addEventListener('resize', _.debounce(_resize, 100));

    _loadShaders();
    _loadDefaultShaders();

    //testing stuff
    _drawBlock(RV.Hero);
    //me.start();
  };

  me.start = function () {
    _animating = true;
    _draw();
  };

  me.stop = function () {
    _animating = false;
  };

  shaders = _shaders;

}(window));


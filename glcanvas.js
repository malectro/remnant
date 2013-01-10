(function (window) {
  var me = Canvas = RV.Canvas = {},

      VIEWPORT_PADDING = 100,
      SHADERS = ['2d.frag', '2d.vert'],
      RESOLUTION_X = 512,
      RESOLUTION_Y = 512,

      mat3 = RV.Matrix.mat3,
      vec3 = RV.Matrix.vec3,

      _canvas,
      _ctx,
      _animating = false,

      _shaders = {},
      _shaderProgram,
      _shaderPrograms = {},

      _textures = {},
      _rectBuffer,

      _preFrameBuffer,
      _preScreenTexture,
      _renderBuffer,

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
    var me = RV.Canvas.Transform = {},

        MAX_DEPTH = 16,

        _translator = mat3.copy(mat3.identity),
        _rotator = mat3.copy(mat3.identity),
        _scalor = mat3.copy(mat3.identity);

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

      var m = mat3.identity;

      if (me.valid > me.count - 1) {
        me.valid = me.count - 1;
      }

      for (var i = me.valid; i < me.count + 1; i++) {
        m = mat3.mult(me.stack[i], m);
        me.cache[i] = m;
      }

      me.valid = me.count - 1;

      me.result = me.cache[me.count];

      return me.result;
    };

    me.push = function () {
      me.count++;
      me.stack[me.count] = mat3.identity;
    };

    me.pop = function () {
      if (me.count) {
        me.count--;
      }
    };

    me.translate = function (x, y) {
      _translator[6] = x;
      _translator[7] = y;
      me.mult(_translator);
    };

    me.scale = function (x, y) {
      _scalor[0] = x;
      _scalor[4] = y;
      me.mult(_scalor);
    };

    me.rotate = function (rads) {
      var sin = Math.sin(-rads),
          cos = Math.cos(-rads);

      _rotator[0] = cos;
      _rotator[3] = sin;
      _rotator[1] = -sin;
      _rotator[4] = cos;

      me.mult(_rotator);
    };

    me.mult = function (m) {
      me.stack[me.count] = mat3.mult(m, me.stack[me.count]);
    };

    me.clear();
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

  function _loadDefaultShaders(texture, depth, ripple) {
    depth = depth || 1;
    ripple = ripple || 0;

    var key = Array.prototype.join.call(arguments, ':'),
        program = _shaderPrograms[key];

    if (program) {
      _ctx.useProgram(program);
      _shaderProgram = program;
    }
    else {
      program = _shaderProgram = _ctx.createProgram();

      _ctx.attachShader(program, _loadShader('main_frag', {hasTexture: texture, hasCrop: '0', ripple: ripple}));
      _ctx.attachShader(program, _loadShader('main_vert', {hasTexture: texture, depth: 1, w: 2 / me.viewport[2], h: -2 / me.viewport[3]}));

      _ctx.linkProgram(program);

      if (!_ctx.getProgramParameter(program, _ctx.LINK_STATUS)) {
        throw "could not initialize shader program.";
      }

      _ctx.useProgram(program);

      program.vertexPositionAttribute = _ctx.getAttribLocation(program, 'aVertexPosition');
      _ctx.enableVertexAttribArray(program.vertexPositionAttribute);

      program.uColor = _ctx.getUniformLocation(program, 'uColor');
      program.uSampler = _ctx.getUniformLocation(program, 'uSampler');
      program.uCropSource = _ctx.getUniformLocation(program, 'uCropSource');

      // warp uniforms
      program.uBendRadius = _ctx.getUniformLocation(program, 'uBendRadius');
      program.uBendCenter = _ctx.getUniformLocation(program, 'uBendCenter');
      program.uSqueezeRadius = _ctx.getUniformLocation(program, 'uSqueezeRadius');

      program.uTransforms = [];
      for (var i = 0; i < depth; i++) {
        program.uTransforms[i] = _ctx.getUniformLocation(program, 'uTransforms[' + i + ']')
      }

      _shaderPrograms[key] = program;
    }

    return program;
  }

  function _sendTrans() {
    for (var i = 0, l = me.Transform.count + 1; i < l; i++) {
      _ctx.uniformMatrix3fv(_shaderProgram.uTransforms[i], false, me.Transform.stack[l - 1 - i]);
    }
  }

  function _texture(powerOfTwo) {
      var texture = _ctx.createTexture();

      _ctx.bindTexture(_ctx.TEXTURE_2D, texture);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_S, _ctx.CLAMP_TO_EDGE);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_T, _ctx.CLAMP_TO_EDGE);
      _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MAG_FILTER, _ctx.LINEAR);

      if (powerOfTwo) {
        _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR_MIPMAP_LINEAR);
        _ctx.generateMipmap(_ctx.TEXTURE_2D);
      }
      else {
        _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR);
      }

      return texture;
  }

  function _textureize(block) {
    var texture = block.texture;

    if (!texture) {
      texture = _texture(_.powerOf2(block.image.width) && _.powerOf2(block.image.height));

      _ctx.texImage2D(_ctx.TEXTURE_2D, 0, _ctx.RGBA, _ctx.RGBA, _ctx.UNSIGNED_BYTE, block.image);
      block.texture = texture;

      _ctx.bindTexture(_ctx.TEXTURE_2D, null);
    }

    return texture;
  }

  function _setUpRenderBuffer() {
    _preScreenTexture = _ctx.createTexture();
    _ctx.bindTexture(_ctx.TEXTURE_2D, _preScreenTexture);
    _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_S, _ctx.CLAMP_TO_EDGE);
    _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_WRAP_T, _ctx.CLAMP_TO_EDGE);
    //_ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MAG_FILTER, _ctx.LINEAR);
    //_ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR_MIPMAP_NEAREST);
    //_ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.LINEAR);
    _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MAG_FILTER, _ctx.NEAREST);
    _ctx.texParameteri(_ctx.TEXTURE_2D, _ctx.TEXTURE_MIN_FILTER, _ctx.NEAREST);
    //_ctx.generateMipmap(_ctx.TEXTURE_2D);
    _ctx.texImage2D(_ctx.TEXTURE_2D, 0, _ctx.RGBA, me.viewport[2], me.viewport[3], 0, _ctx.RGBA, _ctx.UNSIGNED_BYTE, null);
    //_ctx.generateMipmap(_ctx.TEXTURE_2D);

    _renderBuffer = _ctx.createRenderbuffer();
    _ctx.bindRenderbuffer(_ctx.RENDERBUFFER, _renderBuffer);
    _ctx.renderbufferStorage(_ctx.RENDERBUFFER, _ctx.DEPTH_COMPONENT16, me.viewport[2], me.viewport[3]);

    _preFrameBuffer = _ctx.createFramebuffer();
    _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, _preFrameBuffer);
    _ctx.framebufferTexture2D(_ctx.FRAMEBUFFER, _ctx.COLOR_ATTACHMENT0, _ctx.TEXTURE_2D, _preScreenTexture, 0);
    _ctx.framebufferRenderbuffer(_ctx.FRAMEBUFFER, _ctx.DEPTH_ATTACHMENT, _ctx.RENDERBUFFER, _renderBuffer);

    _ctx.bindTexture(_ctx.TEXTURE_2D, null);
    _ctx.bindRenderbuffer(_ctx.RENDERBUFFER, null);
    _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);
  }

  function _setUpVertexBuffer() {
    _rectBuffer = _ctx.createBuffer();
    var vertices = [
          0, 0, 0, 0,
          0, 1.0, 0, 1.0,
          1.0, 1.0, 1.0, 1.0,
          1.0, 0, 1.0, 0
        ];
    _ctx.bindBuffer(_ctx.ARRAY_BUFFER, _rectBuffer);
    _ctx.bufferData(_ctx.ARRAY_BUFFER, new Float32Array(vertices), _ctx.STATIC_DRAW);
  }

  function _setUpGlDefaults() {
    _ctx.clearColor(0, 0, 0, 1);
    _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);
    _ctx.colorMask(1, 1, 1, 0);

    //_ctx.enable(_ctx.BLEND);
    //_ctx.blendFunc(_ctx.SRC_ALPHA, _ctx.ONE_MINUS_SRC_ALPHA);

    //_ctx.enable(_ctx.DEPTH_TEST);
  }

  function _resize() {
    _.extend(_canvas, {
      height: RESOLUTION_Y,
      width: RESOLUTION_X
    });

    me.viewport = [
      me.viewport[0], me.viewport[1], RESOLUTION_X, RESOLUTION_Y
    ];

    me.viewport[4] = document.width / 2 + me.viewport[0];
    me.viewport[5] = document.height / 2 + me.viewport[1];

    _ctx.viewport(0, 0, me.viewport[2], me.viewport[3]);
  }

  var _hudWrite = _.throttle(RV.Hud.write, 200);

  function _drawTexture(texture, x, y, w, h, warped) {
    me.Transform.push();

    warped = (warped && RV.Map.currentWarp) ? 1 : 0;

    _loadDefaultShaders(1, me.Transform.count + 1, warped);

    // so far this is the only vertex buffer we ever bind
    //_ctx.bindBuffer(_ctx.ARRAY_BUFFER, _rectBuffer);

    _ctx.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, 4, _ctx.FLOAT, false, 0, 0);


    me.Transform.translate(x, y);
    me.Transform.scale(w, h);

    if (warped) {
      _ctx.uniform1f(_shaderProgram.uBendRadius, RV.Map.currentWarp.bend / me.viewport[2]);
      _ctx.uniform1f(_shaderProgram.uBendCenter, (RV.Map.currentWarp.x - me.viewport[0]) / me.viewport[2]);
      _ctx.uniform1f(_shaderProgram.uSqueezeRadius, RV.Map.currentWarp.squeeze / me.viewport[2]);
    }

    _sendTrans();

    _ctx.bindTexture(_ctx.TEXTURE_2D, texture);
    _ctx.activeTexture(_ctx.TEXTURE0);
    _ctx.uniform1i(_shaderProgram.uSampler, 0);
    _ctx.drawArrays(_ctx.TRIANGLE_FAN, 0, 4);

    // non-texture code
    //_ctx.uniform4f(_shaderProgram.uColor, 1, 1, 1, 1);
    //_ctx.drawArrays(_ctx.TRIANGLE_FAN, 0, 4);

    me.Transform.pop();
  }

  function _drawBlock(block) {
    var textureBit = (block.image) ? '1' : '0',
        location = block.warpLocation();


    if (block.image) {
      _drawTexture(_textureize(block), location.x - me.viewport[0], location.y - me.viewport[1], block.size.w, block.size.h);
    }
  }

  function _drawBlocks(blocks, delta) {
    var block;

    for (var i = 0, l = blocks.length; i < l; i++) {
      block = blocks[i];
      _drawBlock(block);
      block.tick(delta);
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

    //_ctx.clear(_ctx.COLOR_BUFFER_BIT);

    // draw environment to a texture
    _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, _preFrameBuffer);

    _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);
    _ctx.viewport(0, 0, me.viewport[2], me.viewport[3]);

    _drawBlocks(blocks, delta);

    //_ctx.bindTexture(_ctx.TEXTURE_2D, _preScreenTexture);
    //_ctx.generateMipmap(_ctx.TEXTURE_2D);
    //_ctx.bindTexture(_ctx.TEXTURE_2D, null);

    _ctx.bindFramebuffer(_ctx.FRAMEBUFFER, null);

    _ctx.clear(_ctx.COLOR_BUFFER_BIT | _ctx.DEPTH_BUFFER_BIT);

    //draw textured environment and hero
    _drawTexture(_preScreenTexture, 0, me.viewport[3], me.viewport[2], -me.viewport[3], true);
    _drawBlocks(RV.Map.heroBlocks, delta);

    me.adjustViewport();
    RV.Map.tick(delta, now);

    if (_animating) {
      requestAnimationFrame(_draw, _canvas);
    }

    if (RV.DEBUG) {
      // record fps
      _hudWrite(fps.toFixed(3) + ' fps<br />' + delta.toFixed(6) + ' ms');
    }
  }

  me.adjustViewport = function () {
    var location = RV.Hero.warpLocation();
    me.viewport[0] = location.x - (me.viewport[2] - RV.Hero.size.w) / 2;
    me.viewport[1] = location.y - (me.viewport[3] - RV.Hero.size.h) / 2;
  };

  me.init = function (canvas) {
    _canvas = canvas;
    _ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: true});

    if (RV.DEBUG) {
      // give global access to the canvas
      //window.gldebug = WebGLDebugUtils.makeDebugContext(_ctx, undefined, validateNoneOfTheArgsAreUndefined);
      window.canvas = _canvas;
      window.ctx = _ctx;
    }

    //resize window and set up window resize detector
    _resize();
    window.addEventListener('resize', _.debounce(_resize, 100));

    // run setup up functions
    _loadShaders();
    _setUpGlDefaults();
    _setUpVertexBuffer();
    _setUpRenderBuffer();

    // start render loop
    me.start();
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

function testShader(x) {
  var diff,
      ret;

  if (x < 0.5) {
    ret = x;
  }
  else if (x < 0.55) {
    diff = x - 0.5;
    ret = 0.525 - Math.cos(diff * Math.PI / 0.1) * 0.025;
  }
  else if (x < 0.6) {
    diff = x - 0.55;
    ret = 0.525 + Math.sin(diff * Math.PI / 0.1) * 0.025;
  }
  else {
    ret = x - 0.05;
  }

  return ret;
}


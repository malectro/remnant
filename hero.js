(function () {
  var me = RV.Hero = _.create(RV.Block),

      RUN_FRICTION = 0.9,
      RUN_SPEED = 300,
      STOP_FRICTION = 0,
      JUMP_SPEED = -4000,
      FLOAT_SPEED = -100;

  me.location = {
    x: 0,
    y: 10
  };

  me.size = {
    h: 30,
    w: 20
  };

  me.velocity = {
    x: 0,
    y: 0
  };

  me.isStatic = false;

  me.setSrc('http://raveghost.com/discoghost.gif');

  me.resolveInputs = function (delta) {
    if (me.jumping) {
      if (me.velocity.y === 0) {
        me.accel([0, JUMP_SPEED * delta]);
      }
      else {
        me.accel([0, FLOAT_SPEED * delta]);
      }
    }

    if (me.moving) {
      if (me.velocity.y === 0) {
        me.accel([me.moving * delta, 0]);
      }
      else {
        me.accel([me.moving * delta, 0]);
      }
    }
  };

  me.init = function () {
    RV.Controller.listen('left', 'down', function () {
      me.moving = -RUN_SPEED;
      me.friction = RUN_FRICTION;
    });
    RV.Controller.listen('left', 'up', function () {
      if (me.moving === -RUN_SPEED) {
        me.moving = 0;
        me.friction = STOP_FRICTION;
      }
    });

    RV.Controller.listen('right', 'down', function () {
      me.moving = RUN_SPEED;
      me.friction = RUN_FRICTION;
    });
    RV.Controller.listen('right', 'up', function () {
      if (me.moving === RUN_SPEED) {
        me.moving = 0;
        me.friction = STOP_FRICTION;
      }
    });

    RV.Controller.listen('jump', 'down', function () {
      if (me.velocity.y === 0) {
        me.jumping = true;
      }
    });
    RV.Controller.listen('jump', 'up', function () {
      me.jumping = false;
    });

    RV.Map.addBlock(me);
  };

}());


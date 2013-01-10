(function () {
  var me = RV.Hero = _.create(RV.Block),

      RUN_FRICTION = 0.9,
      RUN_SPEED = 300,
      STOP_FRICTION = 0,
      JUMP_SPEED = -10000,
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

  me.setSrc('discoghost.gif');

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
      me.dir = -1;
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
      me.dir = 1;
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

    RV.Controller.listen('warp', 'down', function () {
      RV.Map.warp(me.dir * 100 + me.location.x);
    });

    // hero will be in his own framebuffer
    RV.Map.addBlock(me);
  };

  me.warped = function () {
    return false;
  };

  me.intersects = function (block) {
    if (block.warped()) {
      return false;
    }
    return RV.Block.intersects.call(this, block);
  };

  me.warpLocation = function () {
    var warp = RV.Map.currentWarp,
        location;

    if (warp && this.location.x > warp.x) {
      location = {
        x: this.location.x - warp.bend,
        y: this.location.y
      };
    }
    else {
      location = this.location;
    }

    return location;
  };

  me.tick = function (delta) {
    var warp = RV.Map.currentWarp,
        before = this.location.x;

    RV.Block.tick.call(this, delta);

    if (warp && before < warp.x && this.location.x > warp.x) {
      this.location.x += warp.bend;
    }
    else if (warp && before > warp.x && this.location.x < warp.x) {
      this.location.x -= warp.bend;
    }
  };

}());


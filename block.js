(function () {
  var me = RV.Block = {},

      GRAVITY = 200,
      FRICTION = 0.0001,
      MIN_VELOCITY = 5,
      TERMINAL_VELOCITY = 400,
      TERMINAL_VELOCITY_X = 100;

  me.location = {
    x: 0,
    y: 0
  };

  me.size = {
    h: 50,
    w: 20
  };

  me.velocity = {
    x: 0,
    y: 0
  };

  me.friction = FRICTION;
  me.moving = 0;

  // is the block affected by physics?
  me.isStatic = true;

  // can blocks move through this block moving in
  // the -y direction? useful for platforms.
  me.isYPositive = true;

  // is the block animated?
  me.isSprite = false;

  // the block's texture
  me.image = new Image;
  me.image.src = 'test.png';

  // the block's animated images
  me.images = [];

  // constructor
  me.build = function () {
    return _.create(me);
  };

  // extendable methods
  me.setSrc = function (src) {
    this.image = new Image;
    this.image.src = src;
  };

  me.move = function (vector) {
    //TODO efficient?
    this.location = {
      x: this.location.x + vector[0],
      y: this.location.y + vector[1]
    };
  };

  me.accel = function (vector) {
    this.velocity = {
      x: this.velocity.x + vector[0],
      y: this.velocity.y + vector[1]
    };
  };

  me.resolveInputs = function () {

  };

  me.tick = function (delta) {
    if (this.isStatic) {
      return;
    }

    var blocks = RV.Map.allBlocks,
        tempBlocks = [],
        block,
        wasBlocked = false;

    // resolve user action
    this.resolveInputs(delta);

    if (this.velocity.x !== 0) {
      this.location.x += this.velocity.x * delta;

      for (var i = 0, l = blocks.length; i < l; i++) {
        block = blocks[i];
        if (this.intersects(block)) {
          if (!block.isYPositive) {
            if (this.velocity.x > 0) {
              this.location.x = block.location.x - this.size.w;
            }
            else {
              this.location.x = block.location.x + block.size.w;
            }
            wasBlocked = true;
            tempBlocks.push(block);
          }
        }
        else {
          tempBlocks.push(block);
        }
      }

      if (wasBlocked) {
        this.velocity.x = 0;
        wasBlocked = false;
      }
    }
    else {
      for (var i = 0, l = blocks.length; i < l; i++) {
        block = blocks[i];
        if (!this.intersects(block)) {
          tempBlocks.push(block);
        }
      }
    }

    blocks = tempBlocks;

    this.velocity.y += GRAVITY * delta;

    if (this.velocity.y !== 0) {
      this.location.y += this.velocity.y * delta;

      for (var i = 0, l = blocks.length; i < l; i++) {
        block = blocks[i];
        if (this.intersects(block)) {
          if (this.velocity.y > 0) {
            this.location.y = block.location.y - this.size.h;
            wasBlocked = true;
          }
          else if (!block.isYPositive) {
            this.location.y = block.location.y + block.size.h;
            wasBlocked = true;
          }
        }
      }

      if (wasBlocked) {
        this.velocity.y = 0;
        wasBlocked = false;
      }
    }

    if (this.velocity.y === 0) {
      this.velocity.x = this.velocity.x * Math.pow(this.friction + FRICTION, delta);
    }

    if (this.velocity.x < MIN_VELOCITY && this.velocity.x > -MIN_VELOCITY) {
      this.velocity.x = 0;
    }

    this.capVelocity();
  };

  me.capVelocity = function () {
    if (this.velocity.y > TERMINAL_VELOCITY) {
      this.velocity.y = TERMINAL_VELOCITY;
    }
    else if (this.velocity.y < -TERMINAL_VELOCITY) {
      this.velocity.y = -TERMINAL_VELOCITY;
    }
    if (this.velocity.x > TERMINAL_VELOCITY_X) {
      this.velocity.x = TERMINAL_VELOCITY_X;
    }
    else if (this.velocity.x < -TERMINAL_VELOCITY_X) {
      this.velocity.x = -TERMINAL_VELOCITY_X;
    }
  };

  me.intersects = function (block) {
    if (this !== block
        && block.location.y < this.location.y + this.size.h
        && block.location.y + block.size.h > this.location.y
        && block.location.x < this.location.x + this.size.w
        && block.location.x + block.size.w > this.location.x) {
      return true;
    }
    return false;
  };

}());


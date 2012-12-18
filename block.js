(function () {
  var me = RV.Block = {},

      GRAVITY = 40,
      FRICTION = 0.1,
      MIN_VELOCITY = 2;

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

  // is the block affected by physics?
  me.isStatic = true;

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

  me.tick = function (delta) {
    if (this.isStatic) {
      return;
    }

    var blocks = RV.Map.blocks;

    this.location.x += this.velocity.x * delta;

    for (var i = 0, l = blocks.length; i < l; i++) {
      if (this.intersects(blocks[i])) {
        this.location.x = blocks[i].location.x - this.size.w;
        this.velocity.x = 0;
      }
    }

    this.location.y += this.velocity.y * delta;

    for (var i = 0, l = blocks.length; i < l; i++) {
      if (this.intersects(blocks[i])) {
        this.location.y = blocks[i].location.y - this.size.h;
        this.velocity.y = 0;
      }
    }

    if (this.velocity.y === 0) {
      this.velocity.x = this.velocity.x * Math.pow(FRICTION, delta);
    }
    this.velocity.y += GRAVITY * delta;

    if (this.velocity.x < MIN_VELOCITY && this.velocity.x > -MIN_VELOCITY) {
      this.velocity.x = 0;
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


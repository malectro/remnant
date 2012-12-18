(function () {
  var me = RV.Block = {},

      GRAVITY = 0.3,
      FRICTION = 0.2,
      MIN_FLOAT_LENGTH = 3;

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
  me.image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAKElEQVQ4T2NkoDJgpLJ5DKMGUh6io2E4GoZkhMBosiEj0NC0jMAwBABIxgAVO+SUsAAAAABJRU5ErkJggg==';

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

  me.tick = function () {
    if (this.velocity.y !== 0) {

    }
    else if (this.velocity.x !== 0) {
      this.velocity.x = this.velocity.x * FRICTION;
    }

    this.velocity.x = this.velocity.x.toFixed(MIN_FLOAT_LENGTH);
    this.velocity.y = this.velocity.y.toFixed(MIN_FLOAT_LENGTH);
  };

}());


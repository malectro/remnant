(function () {
  var me = RV.Warp = {};

  me.x = 100;
  me.y = 0; // not currently used
  me.bend = 0;
  me.squeeze = 0;
  me.createdAt = 0;
  me.factor = 0;
  me.bendTo = 50;
  me.squeezeTo = 25;
  me.attack = 500;
  me.sustain = 5000;
  me.healthyLife = 11000;
  me.life = 12000;
  me.alive = true;

  me.init = function () {
    this.createdAt = _.now();
    this.healthyLife = this.sustain + this.attack;
    this.life = this.healthyLife + this.attack;
  };

  me.warp = function (x, y, w, h) {
    var diff1, diff2, newX;

    if (x < me.left) {
    }

    return {
      x: x,
      y: y,
      w: w,
      h: h
    };
  };

  me.tick = function (time) {
    var diff = time - this.createdAt;

    if (diff < this.attack) {
      this.factor = diff / this.attack;
    }
    else if (diff < this.healthyLife) {
      this.factor = 1.0;
    }
    else if (diff < this.life) {
      this.factor = 1 - (diff - this.attack - this.sustain) / this.attack;
    }
    else {
      this.alive = false;
    }

    this.bend = this.bendTo * this.factor;
    this.squeeze = this.squeezeTo * this.factor;
  };

}());

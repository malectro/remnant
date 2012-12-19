(function () {
  var me = RV.Hero = _.create(RV.Block);

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

  me.init = function () {
    RV.Controller.listen('left', function () {
      if (me.velocity.y === 0) {
        me.accel([-10, 0]);
      }
    });

    RV.Controller.listen('right', function () {
      if (me.velocity.y === 0) {
        me.accel([10, 0]);
      }
    });

    RV.Controller.listen('jump', function () {
      if (me.velocity.y === 0) {
        me.accel([0, -40]);
      }
    });

    RV.Map.addBlock(me);
  };

}());


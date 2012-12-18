(function () {
  var me = RV.Hero = _.create(RV.Block);

  me.location = {
    x: 0,
    y: 0
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
      me.accel([-10, 0]);
    });

    RV.Controller.listen('right', function () {
      me.accel([10, 0]);
    });

    RV.Controller.listen('jump', function () {
      me.accel([0, -40]);
    });

    RV.Map.addBlock(me);
  };

}());


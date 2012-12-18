(function () {
  var me = RV.Hero = _.create(RV.Block);

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

  me.static = false;

  me.setSrc('http://raveghost.com/discoghost.gif');

  me.init = function () {
    RV.Controller.listen('left', function () {
      me.move([-10, 0]);
      console.log(me.location.x);
    });

    RV.Controller.listen('right', function () {
      me.move([10, 0]);
      console.log(me.location.x);
    });
  };

}());

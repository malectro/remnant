(function () {
  var me = RV.Map = {};

  me.blocks = [];
  me.allBlocks = [];
  me.heroBlocks = [];
  me.currentWarp = null;

  var _testBlocks = [
    [0, 100, 400, 30, true],
    [100, 25, 10, 75, false],
    [200, 70, 50, 10, true],
    [500, 0, 10, 400, false],
    [300, 500, 600, 10, false],
    [600, 480, 20, 10, true],
    [630, 460, 20, 10, true],
    [600, 430, 20, 10, true]
  ];

  me.load = function () {
    _testBlocks.forEach(function (block) {
      var block2 = RV.Block.build();
      block2.location = {
        x: block[0],
        y: block[1]
      };
      block2.size = {
        w: block[2],
        h: block[3]
      };
      block2.isYPositive = block[4];
      me.addBlock(block2);
    });
  };

  me.getBlocksInViewport = function (viewport) {
    return me.blocks;
  };

  me.addBlock = function (block) {
    if (block === RV.Hero) {
      me.heroBlocks.push(block);
    }
    else {
      me.blocks.push(block);
    }
    me.allBlocks.push(block);
  };

  me.warp = function (x) {
    if (!me.currentWarp) {
      me.currentWarp = _.create(RV.Warp, {
        x: x
      });
      me.currentWarp.init();
    }
  };

  me.tick = function (delta, time) {
    if (me.currentWarp) {
      if (me.currentWarp.alive) {
        me.currentWarp.tick(time);
      }
      else {
        me.currentWarp = null;
      }
    }
  };

}());


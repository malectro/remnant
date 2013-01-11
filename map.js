(function () {
  var me = RV.Map = {};

  me.blocks = [];
  me.allBlocks = [];
  me.heroBlocks = [];
  me.currentWarp = null;

  var _testBlocks = [
    [0, 400, 1000, 30, true],
    [410, 0, 170, 170, false]
  ];

  me.fg_objects = [
    {
      src: 'assets/wall.png',
      w: 1024,
      h: 1536,
      x: 200,
      y: 0
    }
  ];

  me.fg = {
    src: 'assets/fg-grave.png',
    w: 2048,
    h: 1536,
    x: -300,
    y: 0
  };

  me.bg = {
    src: 'assets/bg-forest.png',
    w: 2048,
    h: 1536,
    x: 0,
    y: 0
  };

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

  me.addImageToGround = function (ground) {
    ground.image = new Image;
    ground.image.src = ground.src;
    ground.w = ground.w / 2;
    ground.h = ground.h / 2;
  };
  me.addImageToGround(me.bg);
  me.addImageToGround(me.fg);
  me.fg_objects.forEach(function (object) {
    me.addImageToGround(object);
  });

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


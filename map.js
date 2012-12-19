(function () {
  var me = RV.Map = {};

  me.blocks = [
  ];

  var _testBlocks = [
    [0, 100, 400, 30, true],
    [100, 60, 10, 10, false],
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
    me.blocks.push(block);
  };

}());


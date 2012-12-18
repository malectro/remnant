(function () {
  var me = RV.Map = {};

  me.blocks = [
  ];

  var _testBlocks = [
    [0, 40, 200, 10],
    [100, 30, 10, 10]
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


(function () {
  var me = Util = RV.Util = {};

  /**
   * create
   * create a new object that inherits from the parent
   */
  me.create = function (parent) {
    function f() {};
    f.prototype = parent;
    return new f;
  }

  /**
   * extend
   * add any number of properties to an object
   */
  me.extend = function (target) {
    for (var i = 1, l = arguments.length; i < l; i++) {
      for (var j in arguments[i]) {
        target[j] = arguments[i][j];
      }
    }

    return target;
  };

}());


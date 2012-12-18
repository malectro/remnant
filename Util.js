(function () {
  var me = window._ = Util = RV.Util = {};


  /**
   * OBJECT METHODS
   */

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


  /**
   * FUNCTION METHODS
   */

  /**
   * debounce
   */
  me.debounce = function (func, wait) {
    var timeout = 0,
        context;

    function apply(args) {
      func.apply(context, args);
    }

    return function () {
      if (timeout) {
        clearTimeout(timeout);
      }
      context = this;
      timeout = setTimeout(apply, wait, arguments);
    }
  };

  /**
   * throttle
   */
  me.throttle = function (func, interval) {
    var time = 0,
        timeout,
        result,
        args,
        context;

    function delay() {
      time = me.now();
      timeout = 0;
      result = func.apply(context, args);
    }

    return function () {
      var currentTime = me.now(),
          leftover = interval - currentTime + time;

      args = arguments;
      context = this;

      if (leftover < 1) {
        clearTimeout(timeout);
        timeout = 0;
        time = currentTime;
        result = func.apply(context, args);
      }
      else if (!timeout) {
        timeout = setTimeout(delay, leftover);
      }

      return result;
    };
  };


  /**
   * UTILILTY METHODS
   */
  me.now = function () {
    return new Date - 0;
  };


  /**
   * ARRAY METHODS
   */

}());


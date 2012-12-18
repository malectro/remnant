(function (document) {
  var me = RV.Controller = {},

      _events = [
        'left', 'up', 'down', 'right', 'jump'
      ],

      _eventFuncs = {},

      // PC controller events
      _pcKeys = {
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down',
        '32': 'jump'
      };

  function _keydown(e) {
    if (me.fire(_pcKeys[e.which])) {
      e.preventDefault();
    }
  }

  me.fire = function (event) {
    var funcs = _eventFuncs[event];
    if (funcs) {
      for (var i = 0, l = funcs.length; i < l; i++) {
        funcs[i]();
      }
      return true;
    }
  };

  me.listen = function (event, func) {
    if (_eventFuncs[event].indexOf(func) < 0) {
      _eventFuncs[event].push(func);
    }
  };

  me.forget = function (event, func) {
    var index = _eventFuncs[event].indexOf(func);
    if (index >= 0) {
      _eventFuncs[event].splice(index, 1);
    }
  };

  me.init = function () {
    _events.forEach(function (event) {
      _eventFuncs[event] = [];
    });

    document.body.addEventListener('keydown', _keydown);
  };

}(document));


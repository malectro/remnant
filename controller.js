(function (document) {
  var me = RV.Controller = {},

      EVENT_INTERVAL = 20,

      _events = [
        'left', 'up', 'down', 'right', 'jump'
      ],

      _eventHash = {},

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

  function _keyup(e) {
    if (me.cancel(_pcKeys[e.which])) {
      e.preventDefault();
    }
  }

  me.fire = function (event) {
    var funcs = _eventHash[event].down;
    if (funcs) {
      for (var i = 0, l = funcs.length; i < l; i++) {
        funcs[i]();
      }
      return true;
    }
  };

  me.cancel = function () {
    var funcs = _eventHash[event].up;
    if (funcs) {
      for (var i = 0, l = funcs.length; i < l; i++) {
        funcs[i]();
      }
      return true;
    }
  };

  me.listen = function (event, type, func) {
    if (_eventHash[event][type].indexOf(func) < 0) {
      _eventHash[event][type].push(func);
    }
  };

  me.forget = function (event, type, func) {
    var index = _eventHash[event][type].indexOf(func);
    if (index >= 0) {
      _eventHash[event][type].splice(index, 1);
    }
  };

  me.init = function () {
    _events.forEach(function (event) {
      _eventHash[event] = {
        down: [],
        up: []
      };
    });

    document.body.addEventListener('keydown', _keydown);
    document.body.addEventListener('keyup', _keyup);
  };

}(document));


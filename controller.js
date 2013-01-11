(function (document) {
  var me = RV.Controller = {},

      EVENT_INTERVAL = 20,

      _events = [
        'left', 'up', 'down', 'right', 'jump', 'warp'
      ],

      _eventHash = {},

      // PC controller events
      _pcKeys = {
        '37': 'left',
        '38': 'up',
        '39': 'right',
        '40': 'down',
        '32': 'jump',
        '16': 'warp'
      };

  function _keydown(e) {
    if (me.fire(_pcKeys[e.which], 'down')) {
      e.preventDefault();
    }
  }

  function _keyup(e) {
    if (me.fire(_pcKeys[e.which], 'up')) {
      e.preventDefault();
    }
  }

  me.fire = function (eventName, state) {
    var event = _eventHash[eventName];
    if (event) {
      var funcs = event[state];
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


(function (doc) {
  var me = RV.Hud = {},

      _div = {};

  me.write = function (string) {
    _div.innerHTML = string;
  };

  me.init = function () {
    _div = doc.createElement('div');

    _.extend(_div, {
      position: 'absolute',
      top: 10,
      right: 10,
      textAlign: 'right',
      color: 'white'
    });

    doc.body.appendChild(_div);
  };

}(document));

(function (doc) {
  var me = RV.Hud = {},

      _div = {};

  me.write = function (string) {
    _div.innerHTML = string;
  };

  me.init = function () {
    _div = doc.createElement('div');

    _.extend(_div.style, {
      position: 'absolute',
      top: '5px',
      right: '10px',
      textAlign: 'right',
      color: 'white',
      fontFamily: 'courier'
    });

    doc.body.appendChild(_div);
  };

}(document));

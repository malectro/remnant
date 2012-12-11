;

/**
 * require
 * basic require script
 * by malectro
 */

if (typeof require !== 'function') {
  var require = (function () {

    var required = {};

    return function require(paths) {
      if (typeof paths === 'string') {
        paths = [paths];
      }

      for (var i = paths.length - 1; i >= 0; i--) {
        var path = paths[i],
            script = document.createElement('script'),
            firstScript = document.getElementsByTagName('script')[0];

        script.src = path + '.js';
        firstScript.parentNode.insertBefore(script, firstScript);
      }
    };

  }());
}


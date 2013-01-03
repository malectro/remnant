(function (Math) {
  var me = RV.Matrix = {},

      vec3 = me.vec3 = {},
      mat3 = me.mat3 = {};

  vec3.length = function (v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  };

  vec3.normalize = function (v) {
    var length = vec3.length(v);

    if (length === 0) {
      return [0, 0, 0];
    }

    return [v[0] / length, v[1] / length, v[2] / length];
  };

  vec3.dot = function (v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  };

  vec3.cross = function (v1, v2) {
    return [v1[1] * v2[2] - v1[2] * v2[1],
           v1[2] * v2[0] - v1[0] * v2[2],
           v1[0] * v2[1] - v1[1] * v2[0]];
  };

  vec3.mult = function (v, scale) {
    return [v[0] * scale, v[1] * scale, v[2] * scale];
  };


  mat3.identity = [
    1.0, 0.0, 0.0,
    0.0, 1.0, 0.0,
    0.0, 0.0, 1.0
  ];

  mat3.mult = function (ma, mb) {
    return [
      ma[0] * mb[0] + ma[1] * mb[3] + ma[2] * mb[6],
      ma[0] * mb[1] + ma[1] * mb[4] + ma[2] * mb[7],
      ma[0] * mb[2] + ma[1] * mb[5] + ma[2] * mb[8],
      ma[3] * mb[0] + ma[4] * mb[3] + ma[5] * mb[6],
      ma[3] * mb[1] + ma[4] * mb[4] + ma[5] * mb[7],
      ma[3] * mb[2] + ma[4] * mb[5] + ma[5] * mb[8],
      ma[6] * mb[0] + ma[7] * mb[3] + ma[8] * mb[6],
      ma[6] * mb[1] + ma[7] * mb[4] + ma[8] * mb[7],
      ma[6] * mb[2] + ma[7] * mb[5] + ma[8] * mb[8]
    ];
  };

  mat3.transpose = function (m) {
    return [
      m[0], m[3], m[6],
      m[1], m[4], m[7],
      m[2], m[5], m[8]
    ];
  };

  mat3.copy = function (m) {
    return [
      m[0], m[1], m[2],
      m[3], m[4], m[5],
      m[6], m[7], m[8]
    ];
  };

}(Math));


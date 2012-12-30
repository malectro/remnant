#define hasTexture $hasTexture

attribute vec4 aVertexPosition;

#if hasTexture
  varying vec2 vTextureCoord;
#endif

uniform vec4 uColor;
uniform mat3 uTransforms[0];

varying vec4 vColor;

const mat4 pMatrix = mat4($w, 0, 0, 0, 0, $h, 0, 0, 0, 0, 1.0, 1.0, -1.0, 1.0, 0, 0);

mat3 crunchStack(void) {

}

void main(void) {
  vec3 position = vec3(aVertexPosition.x, aVertextPosition.y, 1.0);
  gl_position = pMatrix * vec4(position, 1.0);
  vColor = uColor;
  #if hasTexture
    vTextureCoord = aVertexPosition.zw;
  #endif
}


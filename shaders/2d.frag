#ifdef GL_ES
  precision highp float;
#endif

#define hasTexture $hasTexture
#define hasCrop $hasCrop

varying vec4 vColor

#if hasTexture
  varying vec2 vTextureCoord;
  uniform sampler2D uSampler;
  #if hasCrop
    uniform vec4 uCropSource;
  #endif
#endif

void main(void) {
  #if hasTexture
    #if hasCrop
      gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x * uCropSource.z, vTextureCoord.y * uCropSource.w) + uCropSource.xy);
    #else
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    #endif
  #else
    gl_FragColor = vColor;
  #endif
}


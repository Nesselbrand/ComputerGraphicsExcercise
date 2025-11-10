precision mediump float;

// TODO 3.3)	Define a constant variable (uniform) to 
//              "send" the canvas size to all fragments.
uniform vec2 canvasSize;

void main(void)
{ 
    float smoothMargin = 0.01;  
    float r = 0.8;         
     
    // Map gl_FragCoord.xy into [-1,1]^2
    vec2 uv = (gl_FragCoord.xy / canvasSize) * 2.0 - 1.0;

    // distance from center
    float d = length(uv);

    // Discard fragments outside the circle
    if (d > r) {
        discard;
    }

    // interpolate alpha inside [r - smoothMargin, r]
    float alpha = clamp((r - d) / smoothMargin, 0.0, 1.0);

    // orange color with computed alpha
    gl_FragColor = vec4(1.0, 85.0/255.0, 0.0, alpha);
}

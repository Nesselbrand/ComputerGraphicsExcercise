attribute vec2 vVertex;
attribute vec3 vColor;     // color attribute used as barycentrics

varying vec3 fColor;       // pass barycentric (interpolated) to fragment shader

void main(void)
{
    gl_Position = vec4(vVertex, 0.0, 1.0);
    fColor = vColor;
}


--vertex


layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

layout (location = 3) uniform vec3 lightDir;
layout (location = 4) uniform vec3 pointOnPlane;
layout (location = 5) uniform vec3 planeNormal;

#include "projection.glsl"

void main() {
    vec4 vertexWorldSpace = model * vec4(in_position, 1);
    vec3 projectedPoint = projectVertexToPlane(vec3(vertexWorldSpace), lightDir, pointOnPlane, planeNormal);
    gl_Position = projView * vec4(projectedPoint, 1);
}

--fragment

layout (location = 0) out vec4 out_color;

void main() {
    // render the shadow in black
    out_color = vec4(0);
}

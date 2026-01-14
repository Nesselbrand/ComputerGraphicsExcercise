
--vertex
layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;
layout(location = 2) in vec2 in_tc;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

out vec3 normal;
out vec2 tc;
out vec3 pos;

void main() {
    pos = vec3(model * vec4(in_position, 1));
    gl_Position = projView * model * vec4(in_position, 1);
    normal = vec3(model * vec4(in_normal,0));
    tc = in_tc;
}


--fragment
layout (location = 2) uniform vec4 color;
layout (location = 3) uniform vec3 lightDir;
layout (location = 4) uniform float sunIntensity;

layout (location = 0) out vec4 out_color;

in vec3 normal;
in vec2 tc;
in vec3 pos;

#include "rt.h"
#include "sky_floor_color.glsl"

void main() {
    vec3 n = normalize(normal);
    vec3 l = -lightDir;

    out_color = vec4(floorColor(vec3(1),pos) * max(0.0, dot(n, l)),1);
}

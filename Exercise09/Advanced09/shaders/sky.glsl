
--vertex
layout(location = 0) in vec3 in_position;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform vec3 cameraPos;

out vec3 position;
out vec3 viewDir;

void main() {
    vec4 pos = vec4(in_position.x, in_position.z, 1, 1);
    position = vec3(pos);
    gl_Position =  vec4(position, 1);
    gl_Position.z = 0.999999; //draw quad behind everything (almost) on the far plane

    vec4 worldPos = inverse(projView) * pos;
    worldPos /= worldPos.w;

    viewDir = vec3( vec3(worldPos)-cameraPos);
}


--fragment
layout (location = 0) out vec4 out_color;

layout (location = 1) uniform vec3 cameraPos;
layout (location = 2) uniform vec3 lightDir;
layout (location = 3) uniform float sunIntensity;

#include "rt.h"
#include "sky_floor_color.glsl"

in vec3 viewDir;

void main() {
    Ray r = Ray(cameraPos, normalize(viewDir));
    out_color = vec4(skyColor(r),1);
}

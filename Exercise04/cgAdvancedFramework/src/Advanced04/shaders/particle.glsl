
--vertex
layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;
layout(location = 2) in vec2 in_tc;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

out vec3 normal;
out vec2 tc;

void main() {
    gl_Position = projView * model * vec4(in_position, 1);
    normal = vec3(model * vec4(in_normal, 0));
    tc = in_tc;
}

--fragment

#include "noise3D.glsl"

layout (location = 2) uniform vec4 color;
layout (location = 3) uniform vec3 lightDir;
layout (location = 4) uniform float time;

layout (location = 0) out vec4 out_color;

in vec3 normal;
in vec2 tc;

void main() {
    float noiseScale = 3;
    float timeScale = 1;
    float noise = snoise(vec3(tc.x * noiseScale, tc.y * noiseScale, timeScale * time)) * 0.5f + 0.5f;
    noise = noise * 0.7f + 0.3;
    float alpha = 0.1f * noise * smoothstep(0.5f, 0.2f, distance(vec2(0.5), tc));
    out_color = vec4(1, 1, 1, alpha);
}

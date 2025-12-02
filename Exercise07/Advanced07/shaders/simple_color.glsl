
--vertex
layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

out vec3 normal;
out vec3 positionWorldSpace;

void main() {
    positionWorldSpace = vec3(model * vec4(in_position, 1));
        gl_Position = projView * vec4(positionWorldSpace,1);
        normal = vec3(model * vec4(in_normal,0));
}

--fragment

layout (location = 2) uniform vec4 color;
layout (location = 3) uniform vec3 lightDir;
layout (location = 4) uniform vec3 cameraPosition;

layout (location = 0) out vec4 out_color;

in vec3 normal;
in vec3 positionWorldSpace;


void main() {
    vec3 n = normalize(normal);
     vec3 l = -lightDir;
     vec3 v = normalize(cameraPosition - positionWorldSpace);
       vec3 r = normalize(2.0 * dot(n, l) * n - l);

    out_color = color * max(0.0, dot(n, l)) + pow(max(0.0, dot(v, r)), 20) + color * 0.1;
}

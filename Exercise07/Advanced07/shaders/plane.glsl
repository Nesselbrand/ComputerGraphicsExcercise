
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
        normal = vec3(model * vec4(in_normal,0));
        tc = in_tc;
}

--fragment

layout (location = 2) uniform vec4 color;
layout (location = 3) uniform vec3 lightDir;

layout (location = 0) out vec4 out_color;

in vec3 normal;
in vec2 tc;

void main() {

    vec4 c1 = vec4(211,211,211,255) / 255.0;
    vec4 c2 = vec4(128,128,128,255) / 255.0;

    int steps = 30;

    vec2 tc2 = tc * steps;
    tc2 = floor(tc2);
    ivec2 itc = ivec2(tc2.x,tc2.y);


    vec4 surfaceColor;

    if((itc.x % 2 ^ itc.y % 2)==0)
        surfaceColor = c1;
    else
        surfaceColor = c2;


    out_color = surfaceColor;
}

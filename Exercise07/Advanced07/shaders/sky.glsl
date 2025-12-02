
--vertex
layout(location = 0) in vec3 in_position;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform vec3 cameraPos;

out vec3 position;
out vec3 viewDir;

void main() {
    vec4 pos = vec4(in_position.x,in_position.z,1,1);
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

//in vec3 position;
in vec3 viewDir;

vec4 skyColor(vec3 viewDir2, vec3 cameraPos2)
{
    float horizonHeight = -0;
    float skyboxDistance = 300;

    vec4 darkBlueSky = vec4(43,99,192,255) / 255.0;
    vec4 blueSky = vec4(97,161,248,255) / 255.0;
    vec4 lightBlueSky = vec4(177,212,254,255) / 255.0;


    //direction of current viewing ray
    vec3 dir = normalize(viewDir2);

    //intersection point of viewing ray with cylinder around viewer with radius=skyboxDistance
    vec3 skyboxPos = vec3(cameraPos2) + dir * (skyboxDistance / length(vec2(dir.x,dir.z))) - horizonHeight;

    //this gives the tangens of the viewing ray towards the ground
    float h = skyboxPos.y/skyboxDistance;

    //exponential gradient
    float a = -exp(-h*3)+1;

    vec4 col = mix(blueSky,darkBlueSky,a);

    //fade out bottom border to black
    if(h<0) col = mix(blueSky,vec4(0),-h*100.0);
    return col;
}

void main() {
    out_color = skyColor(normalize(viewDir),cameraPos);
}

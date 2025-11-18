
--vertex
layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;
layout(location = 2) in vec2 in_tc;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

out vec3 normal;
out vec3 positionWorldSpace;
out vec2 tc;

void main() {
    gl_Position = projView * model * vec4(in_position, 1);
    normal = vec3(model * vec4(in_normal,0));
    positionWorldSpace = vec3(model * vec4(in_position,1));
    tc = in_tc;
}

--fragment

#include "noise3D.glsl"

in vec2 tc;

layout (location = 2) uniform float time;
layout (location = 3) uniform bool cellShading = false;

layout (location = 0) out vec4 out_color;


float OctavePerlin(float x, float y, float z, int octaves, float persistence) {
    float total = 0;
    float frequency = 1;
    float amplitude = 1;
    float maxValue = 0;  // Used for normalizing result to 0.0 - 1.0
    for(int i=0;i<octaves;i++) {
        total += snoise( vec3(x * frequency, y * frequency, z * frequency) ) * amplitude;

        maxValue += amplitude;

        amplitude *= persistence;
        frequency *= 2;
    }

    return total/maxValue;
}

void main()
{
    float x = tc.x * 2.0 - 1.0;
    float y = tc.y;


    float alphaShape  =  smoothstep(-1.0,-0.0,x) * smoothstep(1.0,0.0,x);
    alphaShape *= smoothstep(0.0,1.0,y);

    

    vec2 tc2 = tc * 0.5;
    vec2 offset = vec2(OctavePerlin(tc2.x,tc2.y,time,3,0.2),
                       OctavePerlin(tc2.x,tc2.y,time+2,3,0.2));
    offset *= 0.2;
    offset.y += time * 3;


	vec2 fc = vec2(tc.x,tc.y)*3;
    fc += offset * 1;
    float fireNoise = OctavePerlin(fc.x,fc.y,time*2,4,0.4);
    fireNoise = clamp(fireNoise,-1,1) * 1.5 + 1.5;


    float finalAlpha = fireNoise;
    finalAlpha *= alphaShape;


    float exponent = 2;

    finalAlpha = (-exp(-finalAlpha*exponent)+1) / (-exp(-1.0*exponent)+1);

    finalAlpha = clamp(finalAlpha,0,1);


    vec3 fireColor1 = vec3(255,230,100) / 255.0;
    vec3 fireColor2 = vec3(250,60,30) / 255.0;


    vec3 fireColor = mix(fireColor1,fireColor2,1-finalAlpha);

    if(cellShading)
    {
	    fireColor = mix(fireColor1,fireColor2,step(0.2,1-finalAlpha));
	    //fireColor = vec3(finalAlpha);
        //fireColor = vec3(fireNoise);
        finalAlpha = step(0.6,finalAlpha);
    }

    out_color = vec4(fireColor,finalAlpha );
}

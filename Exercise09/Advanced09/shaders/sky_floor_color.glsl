
vec3 skyColor(Ray ray)
{
    vec3 viewDir2 = ray.direction;
    vec3 cameraPos2 = ray.origin;
    float horizonHeight = -0;
    float skyboxDistance = 500;

    vec3 darkBlueSky = vec3(43,99,192) / 255.0;
    vec3 blueSky = vec3(97,161,248) / 255.0;

    //direction of current viewing ray
    vec3 dir = normalize(viewDir2);

    if(length(vec2(dir.x,dir.z)) < 0.001)
        return vec3(1,0,0);

    //intersection point of viewing ray with cylinder around viewer with radius=skyboxDistance
    vec3 skyboxPos = vec3(cameraPos2) + dir * (skyboxDistance / length(vec2(dir.x,dir.z))) - horizonHeight;

    //this gives the tangens of the viewing ray towards the ground
    float h = skyboxPos.y/skyboxDistance;

    //exponential gradient
    float a = -exp(-h*3)+1;

    vec3 col = mix(blueSky,darkBlueSky,a);

    //fade out bottom border to black
    //    col = mix(col,vec4(0),smoothstep(0.0,-0.2,h));
    col = mix(col,vec3(0),step(0,-h));

    //fake sun
    vec3 ray_dir = viewDir2;
    float middayperc = 0.015;

    float costheta = max(dot(ray_dir, normalize(-lightDir)),0);


    float sunperc;

    {
        float x = costheta;
        float t = 0.999;
        float b = 500;
        float ae = 1.0 / exp(t*b);
        sunperc = exp( b * x - (t*b));
    }

    {
        float x = costheta;
        float t = 1;
        float b = 100;
        float ae = 1.0 / exp(t*b);
        sunperc += exp( b * x - (t*b));
    }
    sunperc= max(sunperc,0);

    vec3 suncolor = (1.0 - max(0.0, middayperc)) * vec3(1.5, 1.2, middayperc + 0.5) + max(0.0, middayperc) * vec3(1.0, 1.0, 1.0) * 2.0;
    vec3 color = suncolor * sunperc;
    return sunIntensity * (col*1.0 + 0.8*color);
}

vec3 floorColor(vec3 color, vec3 position)
{
    vec3 c1 = color;
    vec3 c2 = color * 0.5;
    float steps = 0.1;
    vec2 tc = position.xz ;
    vec2 tc2 = tc * steps;
    vec2 cp = fract(tc2);
    float d= length(tc);
    float s = 0.01 + d / 1000;
    vec2 pp = smoothstep(vec2(0.5),vec2(0.5+s),cp) + (1-smoothstep(vec2(0),vec2(s),cp));
    vec3 surfaceColor = mix(c1, c2, pp.x * pp.y + (1 - pp.y) * (1 - pp.x));
    float a = smoothstep(30,100,d);
    return mix(surfaceColor, (c1 + c2) * 0.5,a);
}

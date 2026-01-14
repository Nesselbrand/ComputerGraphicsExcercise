
// A very bad noise function
float pn(vec3 p) {
    //return snoise(p);
    vec4 a=dot(floor(p),vec3(1,57,21))+vec4(0,57,21,78);
    p=smoothstep(0,1,fract(p));
    a=mix(cos(a*a),cos((a+1)*(a+1)),p.x);
    a.xy=mix(a.xz,a.yw,p.y);
    return mix(a.x,a.y,p.z);
}

// SDF for spikeball like object (it's magic)
float f(vec4 data, vec3 p){
    p -= vec3(data);
#define R(p, a) p=cos((a))*p+sin((a))*vec2(p.y, -p.x)
    R(p.yz, .2 * uTime);
    R(p.xz, .2 * uTime  + sin(0.1 * uTime) * p.x * 0.01);
    vec3 q = p;
    p = abs(p);
    if (p.x <= max(p.z, p.y)) p = p.yzx;
    if (p.x <= max(p.z, p.y)) p = p.yzx;

    float b = max(max(max(
                          dot(p, vec3(.577)),
                          dot(p.xz, vec2(.934,.357))),
                      dot(p.yx, vec2(.526,.851))),
                  dot(p.xz, vec2(.526,.851))
                  );
    float l = length(p);

    float d = l - (data.w*0.8) - (data.w*0.1*0.05)*(25/2)* cos(min(sqrt(1.01-b/l)*(3.1415/0.25), 3.1415));
    //float d = l - 25- 0.2*(25/2)* cos(min(sqrt(1.01-b/l)*(3.1415/0.25), 3.1415));
    return (d + pn(q*4.)*0.00)*0.75;
}

// Computes the normal of the SDF defined by f() at the position p
// using central differences
vec3 g(vec4 data, vec3 p) {
    float d = 0.01f;
    return normalize(
                vec3(
                    f(data,vec3(d,0,0)+p),
                    f(data,vec3(0,d,0)+p),
                    f(data,vec3(0,0,d)+p)
                    )

                -

                vec3(
                    f(data,vec3(-d,0,0)+p),
                    f(data,vec3(0,-d,0)+p),
                    f(data,vec3(0,0,-d)+p)
                    )
                );
}

#define POSITION_EPSILON_MINIMUM 0.004
// A robust sphere tracing implementation
// See: http://lgdv.cs.fau.de/publications/publication/Pub.2014.tech.IMMD.IMMD9.enhanc/
int stepsTraced = 0;
vec2 sphereTrace(vec4 data, vec3 o, vec3 d, float tmin, float tmax, float tanPhi, int numIterations, bool forceHit) {
    float t = tmin, stepLength = 0;
    float functionSign = f(data,o) < 0 ? -1 : +1;
    vec2 intersection = vec2( 0, INFINITY );

    int i;
    for (i = 0; i < numIterations; ++i) {
        float signedRadius = functionSign * f(data,d*t + o);
        float radius = abs(signedRadius);
        float screenSpaceError = radius / t;

        if (screenSpaceError < intersection.y)
            intersection = vec2(t, screenSpaceError);
        if (screenSpaceError < tanPhi || t > tmax)
            break;

        t += signedRadius;
    }
    stepsTraced = i;

    return vec2((t > tmax || intersection.y > tanPhi) && !forceHit ? INFINITY : intersection.x,
                functionSign * max(intersection.x * intersection.y, POSITION_EPSILON_MINIMUM));
}

IntersectionResult intersectRaySpikeball(Ray ray, vec4 data) {
    IntersectionResult result = intersectRaySphere(ray, data);
    // Early exit
    if (!result.isIntersection)
        return noIntersection;

    vec3 p = ray.origin;
    vec3 d = normalize(ray.direction);
    float s = sign(f(data,p));



    if (dot(result.normal,result.hitPosition-p) < 0)
        p += d * result.tHit;


    vec2 h =  sphereTrace(data,p, d, 0.001, 60.0, 0.001, 256, false);
    float t = h.x;
    vec3 q = d*t + p;
    if (t == INFINITY)
        return noIntersection;

    float tray = length(ray.origin - q);
    vec3 pos = ray.origin+tray*ray.direction;
    vec3 n = normalize(g(data,pos));
    return IntersectionResult(true,tray,n,pos , abs(h.y)*2.0);
}

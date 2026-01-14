#ifndef RAY_H
#define RAY_H

struct Ray {
    vec3 origin;
    vec3 direction; // must be normalized!!!
};

struct IntersectionResult {
    bool isIntersection;
    float tHit; //distance to ray origin
    vec3 normal;
    vec3 hitPosition;
    float epsilon; //some objects have different epsilons
};

struct Material {
    vec3 color;
    float refractionN; //index of refraction
    float glass;
};

#endif

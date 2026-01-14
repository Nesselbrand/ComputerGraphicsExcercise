
--vertex
layout(location = 0) in vec3 in_position;

out vec3 position;

void main() {
    position = vec3(in_position.x,in_position.z,0);
    gl_Position =  vec4(position, 1);
}


--fragment
#define NUM_PLANES 1
#define NUM_SPHERES 4
#define NUM_SPIKE_BALLS 1

#define NUM_OBJECTS (NUM_PLANES + NUM_SPHERES + NUM_SPIKE_BALLS)


// Object IDs
#define SPHERE_1 0
#define SPHERE_2 1
#define SPHERE_3 2
#define SPHERE_4 3
#define PLANE NUM_SPHERES
#define SPIKEBALL (NUM_SPHERES+NUM_PLANES)


#include "noise3D.glsl"
#include "rt.h"

#define EPSILON 0.002
#define INFINITY 500
const IntersectionResult noIntersection = IntersectionResult(false, 0,vec3(0),vec3(0),EPSILON);


in vec3 position;

layout (location = 0) uniform vec3 cameraPos = vec3(0,0,0);
layout (location = 1) uniform mat4 projView;
layout (location = 2) uniform vec3 lightDir = normalize(-vec3(-1,5,4));

layout (location = 4) uniform float shadowFactor = 1;
layout (location = 7) uniform float sunIntensity = 1;
layout (location = 8) uniform float uTime = 0;

// XYZ - center of the sphere
// W - radius of the sphere
layout (location = 10) uniform vec4 objectData[NUM_OBJECTS];
layout (location = 40) uniform Material materials[NUM_OBJECTS];

layout (location = 0) out vec4 out_color;

#include "sky_floor_color.glsl"
#include "intersection_plane_sphere.glsl"
#include "intersection_spikeball.glsl"


int intersectRayScene(Ray ray, out IntersectionResult result)
{
    // TODO 9.2 d)
    // Ray-Scene Intersection

    int objectId = -1;
    float tMin = INFINITY;
    IntersectionResult tmp;

    //Intersect ray with all 4 spheres
    for (int i = 0; i < NUM_SPHERES; ++i)
    {
        tmp = intersectRaySphere(ray, objectData[i]);
        // TODO:
        // Keep track of the closest intersection
    }

    tmp = intersectRayPlane(ray, objectData[PLANE]);
    // TODO:
    // Keep track of the closest intersection


    tmp = intersectRaySpikeball(ray,objectData[SPIKEBALL]);
    // TODO:
    // Keep track of the closest intersection


    //return object id of closest intersection (object ids defined at the beginning of the fragment shader)
    return objectId;
}




vec3 trace(Ray ray)
{
    IntersectionResult inter;
    int objectId = intersectRayScene(ray,inter);

    if(objectId == -1)
    {
        // The ray has hit the sky!
        return skyColor(ray);
    }
    
    // The ray has hit an object!
    Material m = materials[objectId];

    // Some special handling for the plane to create the checkerboard pattern
    if(objectId == PLANE) m.color = floorColor(m.color,inter.hitPosition);


    vec3 color = vec3(0.0);

    // TODO 9.2 e)
    // Compute the illumination with Phong shading.
    // Use the uniform "lightDir".
    // Note: The normal and the position of the hitpoint are stored in IntersectionResult.
	// Use 0.1 as ambient, 0.7 as specular and 1.0 as diffuse coefficient. 
	// The shininess exponent should be 40.
	// Take the variable "sunIntensity" into account.
	// Replace the following dummy line.
	color = m.color;

    // TODO 9.2 f)
    // Compute shadowing coefficient of the current point.
    // Shoot a ray from the hitpoint towards the sun.
    // Use the uniform shadowFactor.

    return color;
}


void main() {

    // TODO 9.2 a)
    // Primary ray setup
	// Have a look at the definition of struct "Ray" in rt.h.
	// Use "position" which is passed from the vertex shader.
    Ray primaryRay;
    // Trace Primary Ray
    out_color = vec4(trace(primaryRay),1);
    return;

}


--vertex
layout(location = 0) in vec3 in_position;
layout(location = 1) in vec3 in_normal;

layout (location = 0) uniform mat4 projView;
layout (location = 1) uniform mat4 model;

out vec3 normal;
out vec3 positionWorldSpace;

void main() {
    gl_Position = projView * model * vec4(in_position, 1);

    //NOTE:
    //We use the model matrix here instead of the 'correct' normal matrix,
    //because we didn't use non-uniform scaling or shearing transformations.
    //-> The model matrix is of the form [aR | t] with 'a' being a scalar, R a rotation matrix and
    //t the translation vector.
    //
    //If we apply this to a vector (x,y,z,0) only the upper left 3x3 part of the matrix is used.
    //The inverse transpose of this part is  [aR]^-1^T = 1/a [R]^T^T = 1/a [R]
    //We can see that this is the same as the orignal model matrix, because the factor '1/a' is
    //canceled out by normalization.

    normal = normalize(vec3(model * vec4(in_normal,0)));
    positionWorldSpace = vec3(model * vec4(in_position,1));
}

--fragment


struct Light
{
    int type;
    bool enable;
    vec3 color;
    float diffuseIntensity;

    float specularIntensity;
    float shiny;

    float ambientIntensity;

    //only for spot and point light
    vec3 position;

    //only for spot and directional light
    vec3 direction;

    //only for point and spot light
    vec3 attenuation;

    //for spot light
    float angle;
    float sharpness;
};


layout (location = 2) uniform vec3 objectColor;
layout (location = 3) uniform vec3 cameraPosition;
layout (location = 4) uniform bool cellShading = false;

layout (location = 5) uniform Light directionalLight;
layout (location = 17) uniform Light spotLight;
layout (location = 29) uniform Light pointLight;


layout (location = 0) out vec3 out_color;

in vec3 normal;
in vec3 positionWorldSpace;


vec3 phong(
        Light light,
        vec3 surfaceColor,
        vec3 n, vec3 l, vec3 v)
{

    //TODO 5.4 a)
    //Compute the diffuse, specular and ambient term of the phong lighting model.
    //Use the following parameters of the light object:
    //  light.color
    //  light.diffuseIntensity
    //  light.specularIntensity
    //  light.shiny
    //  light.ambientIntensity
	//as well as the other function parameters.

    vec3 color_ambient  = vec3(0);
	vec3 color_diffuse  = vec3(0);
    vec3 color_specular = vec3(0);
    return color_ambient + color_diffuse + color_specular;
}




vec3 rgb2hsv(vec3 c)
{
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}




void main()
{
    //Is the same for every light type!
    vec3 n = normalize(normal);
    vec3 v = normalize(cameraPosition - positionWorldSpace);

    vec3 colorDirectional = vec3(0);
    vec3 colorSpot = vec3(0);
    vec3 colorPoint = vec3(0);

    if(directionalLight.enable)
    {
        // TODO 5.4 b)
        // Use the uniforms "directionalLight" and "objectColor" to compute "colorDirectional". 
        colorDirectional = vec3(0); //<- change this line
    }

    if(pointLight.enable)
    {
        //TODO 5.4 c)
        //Use the uniforms "pointLight" and "objectColor" to compute "colorPoint".
        colorPoint = vec3(0); //<- change this line
    }

    if(spotLight.enable)
    {
        //TODO 5.4 d)
        //Use the uniforms "spotLight" and "objectColor" to compute "colorSpot".
        colorSpot = vec3(0); //<- change this line
    }



    if(cellShading)
    {
        //TODO 5.4 e)

    }else
    {
        out_color = colorDirectional + colorSpot + colorPoint;
    }
}

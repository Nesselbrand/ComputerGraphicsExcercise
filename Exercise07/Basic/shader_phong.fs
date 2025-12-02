precision mediump float;

uniform vec3 cameraPosition;
uniform vec3 color;
uniform vec3 lightDirection;
uniform float shiny;

uniform bool ambient;
uniform bool diffuse;
uniform bool specular;

varying vec3 normal;
varying vec3 position;

void main(void)
{

	// I_in and I_amb are white, so you can ignore them!
	vec3 k_amb = 0.4 * color;
	vec3 k_diff = 0.7 * color;
	vec3 k_spec = 0.4 * vec3(1, 1, 1);
	
	vec3 color_ambient, color_diffuse, color_specular;
	

	////////////////////////////////
    ////////  ambient term  ////////
    ////////////////////////////////
	color_ambient = k_amb;

    ////////////////////////////////
    ////////  diffuse term  ////////
    ////////////////////////////////

    vec3 n = normalize(normal);
    vec3 l = normalize(lightDirection);
    color_diffuse = k_diff * max(0.0, dot(n, l));

    /////////////////////////////////
    ////////  specular term  ////////
    /////////////////////////////////

    vec3 v = normalize(cameraPosition - position);
    vec3 r = normalize(2.0 * dot(n, l) * n - l);
    color_specular = k_spec * pow(max(0.0, dot(v, r)), shiny);

	///////////////////////////////////
    ////////  resulting color  ////////
    ///////////////////////////////////
	vec3 color_result = vec3(0);
    if(ambient) color_result += color_ambient;
    if(diffuse) color_result += color_diffuse;
    if(specular) color_result += color_specular;
	gl_FragColor = vec4(color_result, 1.0);
}


////////////////////////////////////////////////////////
/////////////////////   HELPER   ///////////////////////
////////////////////////////////////////////////////////

/**
 * Converts a color given in float range [0,1] to the integer range [0,255]
 * @param {number[]} rgb_float - three float color values [r,g,b] in the range [0,1]
 * @returns {number[]} - three integer color values [r,g,b] in the range [0,255]
 */
function floatToColor(rgb_float) {
    return [Math.max(Math.min(Math.floor(rgb_float[0] * 255.0), 255), 0),
    Math.max(Math.min(Math.floor(rgb_float[1] * 255.0), 255), 0),
    Math.max(Math.min(Math.floor(rgb_float[2] * 255.0), 255), 0)];
}

/**
 * Set current stroke color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setStrokeStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.strokeStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

/**
 * Set current fill color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setFillStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

/**
 * Returns a rotation matrix from a given angle
 * @param {object} context - angle in radians
 * @returns {number[]} the 2d rotation matrix
 */
function rotationMatrix(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    return new Mat([c,s],[-s,c]);
}

/**
 * Determines if two given 2D-vectors are parallel
 * @param {number[]} dir0 - vec
 * @param {number[]} dir1 - vec 
 * @returns true if dir0 is parallel to dir1, false otherwise
 */
function isVecParallel(dir0, dir1) {
    if (dir0[0] == 0.0 && dir1[0] == 0.0) return true;
    if (dir0[1] == 0.0 && dir1[1] == 0.0) return true;
    if (dir0[0] / dir1[0] == dir0[1] / dir1[1]) return true;
    return false;
}



/////////////////////////////////////////////////
////////////////   Basic 9.1   //////////////////
/////////////////////////////////////////////////


function Basic1(canvas, pSceneID, pIntersectObjects, pIndirectLight, pMaxRecursionDepth, pNPixels, pNBRDFSamples, pShowRays) {

    ////////////////////////////////////////////////////////
    ////////////////////   MATERIAL   //////////////////////
    ////////////////////////////////////////////////////////

    const MaterialType = {
        lightSource: 0,
        perfectMirror: 1,
        perfectDiffuse: 2
    };
    class Material {
        /**
         * Material description. Parameters color, type, and args are stored unchanged as properties of the object.
         * @param {number[]} color - color triple [r,g,b] each in float range [0, ...] (1 is bright, but >1 is possible)
         * @param {number} type - 1: perfect mirror, 2: perfect diffuse (see MaterialType)
         * @param {*} args - any additional data (stored in this.args)
         */
        constructor(color, type, args) {
            this.color = color;
            this.type = type; // 1: perfect mirror, 2: perfect diffuse
            this.args = args;
        }
    }


    ////////////////////////////////////////////////////////
    //////////////   INTERSECTION POINT   //////////////////
    ////////////////////////////////////////////////////////

    class Intersection {
        /**
         * @param {number} t_ray - ray t-value  (point = ray.p0 + t_ray * ray.dir)
         * @param {Material} material - material of intersected surface
         * @param {vec2} normal - surface normal at intersection point
         * @param {vec2} point - intersection point
         */
        constructor(t_ray, material, normal, point) {
            this.t_ray = t_ray;
            this.material = material;
            this.normal = normal.copy();
            this.point = point.copy();
        }

        log() {
            console.log("intersection");
            console.log("t: " + this.t_ray);
            console.log("material: " + this.material.type);
            console.log("normal: " + this.normal[0] + ", " + this.normal[1]);
            console.log("point: " + this.point[0] + ", " + this.point[1]);
        }
    }


    ////////////////////////////////////////////////////////
    /////////////////////   RAY   //////////////////////////
    ////////////////////////////////////////////////////////

    class Ray {
        /**
         * @param {vec2} p0 - ray start position
         * @param {vec2} dir - ray direction (stored normalized)
         * @param {number} [generation=0] - recursion depth (integer), primary rays:0, secondary rays: [1,2,...], shadow rays:-1
         * @param {number} [t_min=0.0001] - minimal t-value, where intersections are valid
         * @param {number} [t_max=10000.0] - maximal t-value, where intersections are valid
         */
        constructor(p0, dir, generation, t_min, t_max) {
            if (!generation) generation = 0;
            if (!t_min) t_min = 0.0001;
            if (!t_max) t_max = 10000.0;
            this.p0 = p0.copy();
            this.dir = dir.normalized();
            this.generation = generation;
            this.t_min = t_min;
            this.t_max = t_max;
        }

        /**
         * Ray content is cloned to this
         * @param {Ray} ray - ray to be cloned
         */
        clone(ray) {
            this.p0 = ray.p0.copy();
            this.dir = ray.dir.copy();
            this.generation = ray.generation;
            this.t_min = ray.t_min;
            this.t_max = ray.t_max;
        }

        /**
         * Get a Point on the ray
         * @param {number} t 
         * @returns {vec2} point at ray.p0 + t * ray.dir;
         */
        eval(t) {
            return this.p0.add(this.dir.sca(t));
        }

        /**
         * Create a reflected ray from this ray, depending on the type of the intersection.
         * @param {Intersection} intersection 
         * @returns {Ray|null} reflected ray (if exists)
         */
        reflect(intersection) {

            // TODO 9.1c)   Implement the reflection function for perfect diffuse and perfect reflecting material.
            //              Make use of the attributes of the intersection (see definition above).

            switch (intersection.material.type) {
                case MaterialType.perfectMirror:
                    {
                        // TODO: Reflect the ray perfectly!
                        // ...
                        // return new Ray(intersection.point, reflectedDir, this.generation + 1);

                    }
                    break;
                case MaterialType.perfectDiffuse:
                    {
                        // TODO: Reflect the ray to a random direction in the hemisphere around the intersection normal!
                        // Hint: - Use deterministicRandom() to generate a seeded random number in [0, 1].
                        //       - To sample a direction in the hemisphere around the normal,
                        //         you can rotate the normal with a random angle between [-PI/2, +PI/2].
                        //         To do so you can use the helper function rotationMatrix()!
                        //         (the result of which you can apply to the normal by using Mat.mul(vec) from num.js)
                        // ...
                        // return new Ray(intersection.point, reflectedDir, this.generation + 1);


                    }
                    break;
            }


            return null;
        }

        /**
         * Draw a dashed line representing the ray (bound by t_min and t_max) to the context. (shadow rays in yellow (generation==-1), others gray)
         * @param {object} context - 2d canvas context
        */
        draw(context, color = new Vec(0.8, 0.8, 0.8)) {
            let col = [Math.floor(255 * color[0]), Math.floor(255 * color[1]), Math.floor(255 * color[2])];
            if (color[0] >= 1 && color[1] >= 1 && color[2] >= 1) {
                col = [150,150,150];
            }
            context.lineWidth = (this.generation == -1) ? 1 : 2;
            context.strokeStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            context.setLineDash([(this.generation == -1) ? 2 : 4, 2]);

            let p0 = this.eval(this.t_min);
            let p1 = this.eval(this.t_max);
            context.beginPath();
            context.moveTo(p0[0], p0[1]);
            context.lineTo(p1[0], p1[1]);
            context.stroke();
            context.lineWidth = 1;
        }
    }


    ////////////////////////////////////////////////////////
    /////////////   Line - 2D Primitive   //////////////////
    ////////////////////////////////////////////////////////

    class Line {
        /**
         * 2D Primitive Line
         * @param {vec2} p0 - line start point 
         * @param {vec2} p1 - line end point
         * @param {Material} material - line material
         */
        constructor(p0, p1, material) {
            this.p0 = p0.copy();
            this.p1 = p1.copy();
            this.material = material;
        }

        /**
         * Draw the line to the context (using its material color)
         * @param {object} context - 2d canvas context
         */
        draw(context) {
            context.setLineDash([1, 0]);
            context.strokeStyle = 'rgb(' + Math.floor(255 * this.material.color[0]) + ',' + Math.floor(255 * this.material.color[1]) + ',' + Math.floor(255 * this.material.color[2]) + ')';
            context.beginPath();
            context.moveTo(this.p0[0], this.p0[1]);
            context.lineTo(this.p1[0], this.p1[1]);
            context.stroke();
        }

        /**
         * @returns {vec2} direction from p0 to p1 (not normalized)
         */
        direction() {
            let lineDir = this.p1.sub(this.p0);
            return lineDir;
        }

        /**
         * @returns {vec2} - normal of the line (normalized)
         */
        normal() {
            let lineDir = this.direction().normalized();
            return new Vec(-lineDir[1], lineDir[0]);
        }

        /**
         * Compute the intersection of the line with a ray
         * @param {Ray} ray -
         * @returns {Intersection|null} - depending on if intersection btw. line and ray exists (in the specified ray bounds t_min t_max)
         */
        intersect(ray) {
            let result = null;

            let lineDir = this.direction();
            if (!isVecParallel(lineDir, ray.dir)) {

                // TODO 9.1b)   Intersect the ray with the line.
                //              If there is an intersection, return an Intersection "object",
                //              e.g. result = new Intersection(t_intersect, this.material, this.normal(), intersectionPoint);!
                //              Only handle the case where you have a single intersection or no intersection (ray is not parallel to line).
                //              (HINT: Use the isVecParallel() helper function)
                //              You want to use num.js to perform matrix-vector mulitplication and matrix inversion.
                //              (Mat.mul(vec) and Mat.inv() respectively)
                //              Also be sure to check whether the distance of the intersection lies between t_min and t_max.



            }

            return result;
        }
    }


    ////////////////////////////////////////////////////////
    /////////////   Circle - 2D Primitive   ////////////////
    ////////////////////////////////////////////////////////

    class Circle {
        /**
         * Circle Primitive
         * @param {vec2} mid - circle center
         * @param {number} radius 
         * @param {Material} material 
         */
        constructor(mid, radius, material) {
            this.mid = mid.copy();
            this.radius = radius;
            this.material = material;
        }

        /**
         * Draw the circle to the context (in color of the material)
         * @param {object} context - 2d canvas context
         */
        draw(context) {
            context.setLineDash([1, 0]);
            let col = [Math.floor(255 * this.material.color[0]), Math.floor(255 * this.material.color[1]), Math.floor(255 * this.material.color[2])];
            if (col[0] > 0 && col[1] > 0 && col[2] > 0) {
                col = [150,150,150];
            }
            context.strokeStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            context.fillStyle = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
            context.beginPath();
            context.arc(this.mid[0], this.mid[1], this.radius, 0, 2 * Math.PI);
            context.stroke();
            context.fill();
        }

        /**
         * Compute intersection of the ray with the circle
         * @param {Ray} ray 
         * @returns {Intersection|null} - intersection object (if an intersection of ray and circle exist in the ray bounds)
         */
        intersect(ray) {
            let result = null;

            if (ray.generation == -1) return null;

            let b_vec = ray.p0.sub(this.mid);

            let a = ray.dir.dot(ray.dir);
            let b = 2.0 * ray.dir.dot(b_vec);
            let c = b_vec.dot(b_vec) - this.radius * this.radius;

            let t;
            if (a == 0.0) {
                t = -c / b;
            } else {
                let d = b * b / (4 * a * a) - c / a;
                if (d > 0.0) t = -b / (2.0 * a) - Math.sqrt(d);
            }

            if (t) {
                if (t > 0) {
                    let p = ray.p0.add(ray.dir.sca(t));
                    let normal = p.sub(this.mid).normalized();
                    result = new Intersection(t, this.material, normal, p);
                }
            }

            return result;
        }
    }


    ////////////////////////////////////////////////////////
    //////////////////   2D Object   ///////////////////////
    ////////////////////////////////////////////////////////

    class Object2D {
        /**
         * 2D Object (collection of primitives (lines))
         * @param {Line[]} primitives - lines the object consists of
         */
        constructor(primitives) {
            this.primitives = primitives;
        }

        /**
         * Compute an intersection with the object (i.e. the closest intersection of all its primitives)
         * @param {Ray} ray 
         * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
         */
        intersect(ray) {
            let result = null;

            for (let i = 0; i < this.primitives.length; ++i) {
                let intersection = this.primitives[i].intersect(ray);
                if (intersection) {
                    if (!result) result = intersection;
                    else if (result.t_ray > intersection.t_ray) result = intersection;
                }
            }

            return result;
        }

        /**
         * Draw the object to the context (i.e. draw all its primitives)
         * @param {object} context - 2d canvas context
         */
        draw(context) {
            for (let i = 0; i < this.primitives.length; ++i) {
                this.primitives[i].draw(context);
            }
        }
    }


    ////////////////////////////////////////////////////////
    /////////////////   Light Source   /////////////////////
    ////////////////////////////////////////////////////////

    class LightSource {
        /**
         * @param {object[]} primitives - Lines or Circles, the light-geometry consists of
         * @param {number} type - integer type of the light source, point light: 0
         * @param {*[]} args array of any additional data stored in this.args
         */
        constructor(primitives, type, args) {
            this.primitives = primitives;
            this.type = type; // 0 : point light source
            this.args = args;
        }

        /**
         * Compute an intersection with the light source (i.e. closest intersection of all its primitives)
         * @param {Ray} ray 
         * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
         */
        intersect(ray) {
            let result = null;
            for (let i = 0; i < this.primitives.length; ++i) {
                let intersection = this.primitives[i].intersect(ray);
                if (intersection) {
                    if (!result) result = intersection;
                    else if (result.t_ray > intersection.t_ray) result = intersection;
                }
            }
            return result;
        }

        /**
         * Draw the light to the context (i.e. draw all its primitives)
         * @param {object} context - 2d canvas context
         */
        draw(context) {
            for (let i = 0; i < this.primitives.length; ++i) {
                this.primitives[i].draw(context);
            }
        }

        /**
         * Sample one point on the light source.
         * i.e. always the light-center for point-light-sources
         * @returns {vec2} sample point
         */
        sample() {
            switch (this.type) {
                case 0: return new Vec(this.args[0], this.args[1]); // point light source
                default: return new Vec(this.args[0], this.args[1]);
            }
        }
    }


    ////////////////////////////////////////////////////////
    ///////////////////   2D Scene   ///////////////////////
    ////////////////////////////////////////////////////////

    class Scene {
        /**
         * Scene description (i.e. list of objects and light sources) (parameters stored directly in object)
         * @param {Object2D[]} objects 
         * @param {LightSource[]} lightSources 
         */
        constructor(objects, lightSources) {
            this.objects = objects;
            this.lightSources = lightSources;
        }

        /**
         * Compute an intersection with the Scene (i.e. closest intersection of all its Objects and LightSources)
         * @param {Ray} ray 
         * @returns {Intersection|null} - closest (smallest t_ray) intersection if it exists
         */
        intersect(ray) {
            let result = null;

            // intersect objects
            for (let i = 0; i < this.objects.length; ++i) {
                let intersection = this.objects[i].intersect(ray);
                if (intersection) {
                    if (!result) result = intersection;
                    else if (result.t_ray > intersection.t_ray) result = intersection;
                }
            }

            // intersect light sources
            for (let i = 0; i < this.lightSources.length; ++i) {
                let intersection = this.lightSources[i].intersect(ray);
                if (intersection) {
                    if (!result) result = intersection;
                    else if (result.t_ray > intersection.t_ray) result = intersection;
                }
            }

            return result;
        }

        /**
         * Draw the Scene (i.e. draw all its Objects and LightSources) to the context
         * @param {object} context - 2d canvas context
         */
        draw(context) {
            // draw objects
            for (let i = 0; i < this.objects.length; ++i) {
                this.objects[i].draw(context);
            }
            // draw lightSources
            for (let i = 0; i < this.lightSources.length; ++i) {
                this.lightSources[i].draw(context);
            }
        }
    }

    // random state
    let deterministicRandomState = -17;
    function deterministicRandomResetState() { deterministicRandomState = -17; }
    /**
     * Deterministic random Function
     * @returns {number} pseudo random number in [0,1]
     */
    function deterministicRandom() {
        let x = Math.sin(deterministicRandomState++) * 10000;
        return x - Math.floor(x);
    }


    // Basic 1

    let context = canvas.getContext("2d");
    let scene = initScene(pSceneID);

    // ray tracing parameters
    let maxRecursionDepth = pMaxRecursionDepth;
    let nPixels = pNPixels;
    let nBRDFSamples = pNBRDFSamples;
    let showRays = pShowRays;

    // Interaction
    if (canvas.id == "canvasBasic1") {
        let depth = document.getElementById("nDepth")
        depth.addEventListener("change",function(){
            maxRecursionDepth = this.value;
            Render();
        });
        depth.value = maxRecursionDepth;

        let pixels = document.getElementById("nPixels")
        pixels.addEventListener("change",function(){
            nPixels = this.value;
            Render();
        },)
        pixels.value = nPixels;

        let samples = document.getElementById("nSamples")
        samples.addEventListener("change",function(){
            nBRDFSamples = this.value;
            Render();
        });
        samples.value = nBRDFSamples;

        let rays = document.getElementById("showRays")
        rays.addEventListener("change",()=>{
            showRays=!showRays;
            Render();
        });
        rays.checked = showRays
    }

    Render();


    // init 2d scene
    function initScene(scene_id) {
        let scene;
        switch(scene_id) {
            case 0: // big canvas scene
            {
                let material_grayMirror = new Material(new Vec(0.8, 0.8, 0.8), MaterialType.perfectMirror, []);
                let box_grayMirror = new Object2D([
                    new Line(new Vec(200.0, 270.0), new Vec(100.0, 290.0), material_grayMirror),
                    new Line(new Vec(100.0, 290.0), new Vec(250.0, 290.0), material_grayMirror),
                    new Line(new Vec(250.0, 290.0), new Vec(250.0, 270.0), material_grayMirror),
                    new Line(new Vec(250.0, 270.0), new Vec(200.0, 270.0), material_grayMirror),
                ]);

                let material_greenDiffuse = new Material(new Vec(0.0, 1.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_greenDiffuse = new Object2D([
                    new Line(new Vec(280.0, 10.0), new Vec(280.0, 60.0), material_greenDiffuse),
                    new Line(new Vec(280.0, 60.0), new Vec(330.0, 60.0), material_greenDiffuse),
                    new Line(new Vec(330.0, 60.0), new Vec(330.0, 10.0), material_greenDiffuse),
                    new Line(new Vec(330.0, 10.0), new Vec(280.0, 10.0), material_greenDiffuse)
                ]);
                
                let material_redDiffuse = new Material(new Vec(1.0, 0.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_redDiffuse = new Object2D([
                    new Line(new Vec(100.0, 10.0), new Vec(100.0, 100.0), material_redDiffuse),
                    new Line(new Vec(100.0, 100.0), new Vec(190.0, 100.0), material_redDiffuse),
                    new Line(new Vec(190.0, 100.0), new Vec(190.0, 10.0), material_redDiffuse),
                    new Line(new Vec(190.0, 10.0), new Vec(100.0, 10.0), material_redDiffuse)
                ]);


                let material_darkDiffuse = new Material(new Vec(0.5, 0.5, 0.5), MaterialType.perfectDiffuse, []);
                let box_sceneBounds = new Object2D([
                    new Line(new Vec(0.0, 300.0), new Vec(0.0, 0.0), material_darkDiffuse),
                    new Line(new Vec(600.0, 300.0), new Vec(0.0, 300.0), material_darkDiffuse),
                    new Line(new Vec(600.0, 0.0), new Vec(600.0, 300.0), material_darkDiffuse),
                    new Line(new Vec(0.0, 0.0), new Vec(600.0, 0.0), material_darkDiffuse)
                ]);


                let material_yellowLight = new Material(new Vec(3.0, 3.0, 0.0), MaterialType.lightSource, []);
                let light = new LightSource([new Circle(new Vec(500.0, 200.0), 5.0, material_yellowLight)], 0, [500.0, 200.0]);
                scene = new Scene(
                    [   box_grayMirror,
                        box_redDiffuse,
                        box_greenDiffuse,
                        box_sceneBounds],
                    [   light]
                );
                break;
            }
            
            case 1 : // minified case 0
            {
                let material_grayMirror = new Material(new Vec(0.8, 0.8, 0.8), MaterialType.perfectMirror, []);
                let box_grayMirror = new Object2D([
                    new Line(new Vec(50.0, 190.0), new Vec(150.0, 190.0), material_grayMirror),
                    new Line(new Vec(150.0, 190.0), new Vec(150.0, 170.0), material_grayMirror),
                    new Line(new Vec(150.0, 170.0), new Vec(140.0, 170.0), material_grayMirror),
                    new Line(new Vec(140.0, 170.0), new Vec(50.0, 190.0), material_grayMirror),
                ]);
                let material_redDiffuse = new Material(new Vec(1.0, 0.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_redDiffuse = new Object2D([
                    new Line(new Vec(120.0, 20.0), new Vec(120.0, 80.0), material_redDiffuse),
                    new Line(new Vec(120.0, 80.0), new Vec(180.0, 80.0), material_redDiffuse),
                    new Line(new Vec(180.0, 80.0), new Vec(180.0, 20.0), material_redDiffuse),
                    new Line(new Vec(180.0, 20.0), new Vec(120.0, 20.0), material_redDiffuse)
                ]);
                let material_darkDiffuse = new Material(new Vec(0.5, 0.5, 0.5), MaterialType.perfectDiffuse, []);
                let box_sceneBounds = new Object2D([
                    new Line(new Vec(0.0, 200.0), new Vec(0.0, 0.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 200.0), new Vec(0.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 0.0), new Vec(200.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(0.0, 0.0), new Vec(200.0, 0.0), material_darkDiffuse)
                ]);
                let material_yellowLight = new Material(new Vec(3.0, 3.0, 0.0), MaterialType.lightSource, []);
                let light = new LightSource([new Circle(new Vec(150.0, 150.0), 5.0, material_yellowLight)], 0, new Vec(150.0, 150.0));
            
                scene = new Scene(
                    [   box_redDiffuse,
                        box_grayMirror,
                        box_sceneBounds],
                    [   light]
                );
                break;
            }
            case 2 : // minified without mirror
            {
                let material_greenDiffuse = new Material(new Vec(0.0, 1.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_greenDiffuse = new Object2D([
                    new Line(new Vec(50.0, 190.0), new Vec(150.0, 190.0), material_greenDiffuse),
                    new Line(new Vec(150.0, 190.0), new Vec(150.0, 170.0), material_greenDiffuse),
                    new Line(new Vec(150.0, 170.0), new Vec(50.0, 170.0), material_greenDiffuse),
                    new Line(new Vec(50.0, 170.0), new Vec(50.0, 190.0), material_greenDiffuse),
                ]);
                let material_redDiffuse = new Material(new Vec(1.0, 0.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_redDiffuse = new Object2D([
                    new Line(new Vec(120.0, 20.0), new Vec(120.0, 80.0), material_redDiffuse),
                    new Line(new Vec(120.0, 80.0), new Vec(180.0, 80.0), material_redDiffuse),
                    new Line(new Vec(180.0, 80.0), new Vec(180.0, 20.0), material_redDiffuse),
                    new Line(new Vec(180.0, 20.0), new Vec(120.0, 20.0), material_redDiffuse)
                ]);
                let material_darkDiffuse = new Material(new Vec(0.5, 0.5, 0.5), MaterialType.perfectDiffuse, []);
                let box_sceneBounds = new Object2D([
                    new Line(new Vec(0.0, 200.0), new Vec(0.0, 0.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 200.0), new Vec(0.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 0.0), new Vec(200.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(0.0, 0.0), new Vec(200.0, 0.0), material_darkDiffuse)
                ]);
                let material_yellowLight = new Material(new Vec(3.0, 3.0, 0.0), MaterialType.lightSource, []);
                let light = new LightSource([new Circle(new Vec(150.0, 150.0), 5.0, material_yellowLight)], 0, new Vec(150.0, 150.0));
            
                scene = new Scene(
                    [   box_redDiffuse,
                        box_greenDiffuse,
                        box_sceneBounds],
                    [   light]
                );
                break;
            }
            case 3 : // mirror funnel
            {
                let material_redDiffuse = new Material(new Vec(1.0, 0.0, 0.0), MaterialType.perfectDiffuse, []);
                let box_redDiffuse = new Object2D([
                    new Line(new Vec(190.0, 10.0), new Vec(180.0, 10.0), material_redDiffuse),
                    new Line(new Vec(180.0, 10.0), new Vec(180.0, 190.0), material_redDiffuse),
                    new Line(new Vec(180.0, 190.0), new Vec(190.0, 190.0), material_redDiffuse),
                    new Line(new Vec(190.0, 190.0), new Vec(190.0, 10.0), material_redDiffuse)
                ]);
                let material_darkDiffuse = new Material(new Vec(0.5, 0.5, 0.5), MaterialType.perfectDiffuse, []);
                let box_sceneBounds = new Object2D([
                    new Line(new Vec(0.0, 200.0), new Vec(0.0, 0.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 200.0), new Vec(0.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(200.0, 0.0), new Vec(200.0, 200.0), material_darkDiffuse),
                    new Line(new Vec(0.0, 0.0), new Vec(200.0, 0.0), material_darkDiffuse)
                ]);
                let material_grayMirror = new Material(new Vec(0.8, 0.8, 0.8), MaterialType.perfectMirror, []);
                let border_offset = 20.0;
                let box_grayMirror_upper = new Object2D([
                    new Line(new Vec(50.0, border_offset), new Vec(160.0, border_offset + 20.0), material_grayMirror),
                    new Line(new Vec(160.0, border_offset + 20.0), new Vec(170.0, border_offset + 20.0), material_grayMirror),
                    new Line(new Vec(170.0, border_offset + 20.0), new Vec(170.0, border_offset), material_grayMirror),
                    new Line(new Vec(170.0, border_offset), new Vec(50.0, border_offset), material_grayMirror),
                ]);
                let box_grayMirror_lower = new Object2D([
                    new Line(new Vec(50.0, 200.0 - border_offset), new Vec(170.0, 200.0 - border_offset), material_grayMirror),
                    new Line(new Vec(170.0, 200.0 - border_offset), new Vec(170.0, 200.0 - border_offset - 20.0), material_grayMirror),
                    new Line(new Vec(170.0, 200.0 - border_offset - 20.0), new Vec(160.0, 200.0 - border_offset - 20.0), material_grayMirror),
                    new Line(new Vec(160.0, 200.0 - border_offset - 20.0), new Vec(50.0, 200.0 - border_offset), material_grayMirror),
                ]);
                let material_yellowLight = new Material(new Vec(3.0, 3.0, 0.0), MaterialType.lightSource, []);
                let light = new LightSource([new Circle(new Vec(160.0, 100.0), 5.0, material_yellowLight)], 0, new Vec(160.0, 100.0));
            
                scene = new Scene(
                    [   box_redDiffuse,
                        box_grayMirror_upper,
                        box_grayMirror_lower,
                        box_sceneBounds],
                    [   light]
                );
                break;
            }
        }

        return scene;
    }

    /**
     * Recursive ray tracing
     * @param {Ray} ray -
     * @param {number} iter - recursive call depth (primary rays: 0 )
     * @param {number} weightRay - contribution of the current ray light to the final result
     * @returns {number[]} - color triple [r,g,b] of estimated light coming from the ray direction
     */
    function traceRay(ray, iter, weightRay) {
        if (iter >= maxRecursionDepth) return; // max recursion depth
        if (weightRay < 0.01) return; // result does not contribute much to the final color -> break to save performance

        // intersect ray with geometry
        let intersection = scene.intersect(ray);
        if (!intersection || !pIntersectObjects) {
            if (showRays) ray.draw(context);
            return null;
        } else {
            ray.t_max = intersection.t_ray;

            // draw ray
            if (showRays) ray.draw(context);

            if (intersection.material.type == MaterialType.lightSource) {
                return intersection.material.color;
            }

            // compute indirect light
            let L_indirect = new Vec(0.0, 0.0, 0.0);
            let nSamples = nBRDFSamples;
            if (intersection.material.type == MaterialType.perfectMirror) nSamples = 1;
            if (pIndirectLight) {
                for (let s = 0; s < nSamples; ++s) {
                    let secondary_ray = ray.reflect(intersection);
                    if (secondary_ray) {
                        let weight = intersection.normal.dot(secondary_ray.dir);

                        // recursive call
                        let L_indirect_sample = traceRay(secondary_ray, iter + 1, weightRay * weight);
                        if (L_indirect_sample) L_indirect = L_indirect.add(L_indirect_sample.sca(weight));
                    }
                }
            }
            L_indirect = L_indirect.sca(1.0 / nSamples);

            // compute direct light
            let L_direct = new Vec(0.0, 0.0, 0.0);
            if (intersection.material.type != MaterialType.perfectMirror) {
                for (let i = 0; i < scene.lightSources.length; ++i) {
                    let nSamplesLight = 1;
                    let light = scene.lightSources[i];
                    for (let s = 0; s < nSamplesLight; ++s) {
                        // sample point light source
                        let sample = light.sample();

                        let dir = sample.sub(intersection.point);
                        let dist = dir.norm();
                        if (dir.dot(intersection.normal) > 0.0) {
                            let light_ray = new Ray(intersection.point, dir, -1, 0.001, dist - 0.001);
                            let light_intersect = scene.intersect(light_ray);
                            if (!light_intersect) {
                                let weight = intersection.normal.dot(light_ray.dir);
                                L_direct = L_direct.add(light.primitives[0].material.color.sca(weight));
                                // draw rays to light source
                                light_ray.t_max = dist;
                                if (showRays)
                                    light_ray.draw(context, light.primitives[0].material.color);
                            }
                        }
                    }
                }
            }

            let L = L_direct.add(L_indirect);

            let result = new Vec(intersection.material.color[0] * L[0],
            intersection.material.color[1] * L[1],
            intersection.material.color[2] * L[2])

            // draw intersection point with light information
            {
                setFillStyle(context, result);
                context.beginPath();
                context.arc(intersection.point[0], intersection.point[1], 4 * weightRay, 0, 2 * Math.PI);
                context.fill();
            }

            return result;
        }
    }

    /**
     * Draw the scene,
     * start ray trace recursion with primary rays for each sensor pixel 
     * and draw the tracing result-colors
     */
    function Render() {
        clearCanvas2d(canvas);
        context.font = "bold 12px Georgia";

        // draw scene
        scene.draw(context);

        // draw text
        context.fillStyle = 'rgb(0,0,0)';
        if (canvas.id == "canvasBasic1") {
            context.fillText("diffuse", 125, 60);
            context.fillText("diffuse", 283, 40);
            context.fillText("mirror", 200, 285);
            context.fillText("sensor", 2, 190);
            context.fillText("point light", 510, 210);
        }

        // camera parameters
        let nearPlane = 20; // in world space units
        let sensorHeight = 50.0; // in world space units
        let eye = new Vec(0.0, (canvas.id == "canvasBasic1") ? 150.0 : 100.0); // camera origin
        let viewDir = new Vec(1.0, 0.0); // has to be normalized
        let pixelSize = sensorHeight / nPixels;
        let sensorSpan = new Vec(-viewDir[1], viewDir[0]);
        let backgroundColor = new Vec(0.0, 0.0, 0.0);
        let pixelColors = [];

        // iterate over all pixels of the virtual sensor
        // iterate over all pixels of the virtual sensor
        for (let pixelIdx = 0; pixelIdx < nPixels; ++pixelIdx) {
            // compute pixel position in world space
            let y = pixelSize * (pixelIdx - nPixels / 2.0 + 0.5);
            let pixelPos = eye.add(viewDir.sca(nearPlane)).add(sensorSpan.sca(y));

            // TODO 9.1a) Set up primary ray
            let dir = pixelPos.sub(eye);          // direction from eye through pixel
            let ray = new Ray(eye, dir, 0);       // primary ray, generation = 0

            // TODO 9.1a) Start ray tracing
            let pixelColor = traceRay(ray, 0, 1.0);

            if (pixelColor) pixelColors.push(pixelColor);
            else pixelColors.push(backgroundColor);
        }


        // draw pixels
        for (let pixelIdx = 0; pixelIdx < nPixels; ++pixelIdx) {
            // compute pixel position in world space
            let y = pixelSize * (pixelIdx - nPixels / 2.0);
            let pixelPos = eye.add(viewDir.sca(nearPlane)).add(sensorSpan.sca(y));
            // draw pixel
            context.setLineDash([1, 0]);
            setFillStyle(context, pixelColors[pixelIdx]);
            context.beginPath();
            context.rect(pixelPos[0], pixelPos[1], 3, pixelSize);
            context.fill();
        }
    }

}

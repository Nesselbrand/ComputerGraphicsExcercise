// Render the contents of a scene graph into the parent canvas. Example:
/* 
<camvas id="scenegraph">
    <sceneinfo>
        <background skycolor="0.8 0.8 0.2"></background>
        <camera position="0 5 0" lookat="0 0 0"></camera>
    </sceneinfo>
    <scene>
        <shape>
            <cube></cube>
            <material color="1 0 0">
        </shape>
        <transform scale="0.5 0.5 0.5" translation="0 1.5 0">
            <shape>
                <cube></cube>
                <material color="0 1 0">
            </shape>
            <transform scale="0.5 0.5 0.5" translation="0 1.5 0">
                <shape>
                    <cube></cube>
                    <material color="0 0 1">
                </shape>
            </transform>
        </transform>
    </scene>
</canvas>
*/

function showScene(canvas, interactive) {
    class SceneGraph {
        // the html <scenegraph> tag to parse as SceneGraph
        constructor(canvas) {
            this.canvas = canvas;
            if (interactive) {
                this.dragging = false;
                canvas.addEventListener('mousedown', (e) => {
                    this.dragging = true;
                    this.lastMousePos = new Vec(e.clientX, e.clientY);
                });
                canvas.addEventListener('mouseup', () => this.dragging = false);
                canvas.addEventListener('mousemove', (e) => {
                    if (!this.dragging) return;
                    let newMousePos = new Vec(e.clientX, e.clientY);
                    let dPos = newMousePos.sub(this.lastMousePos);

                    this.camera.orbit(dPos);

                    this.drawScene();

                    this.lastMousePos = newMousePos;
                });
                canvas.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    this.camera.zoom(e.deltaY);

                    this.drawScene();
                })
            }

            // scene setup
            const info = canvas.querySelector("sceneinfo");

            const background = info.querySelector("background");
            const skycolor = background.getAttribute("skycolor");
            this.skycolor = skycolor ? this.paramToVec(skycolor) : new Vec(255.0, 255.0, 255.0);

            const camera = info.querySelector("camera");
            const camera_pos = camera.getAttribute("position");
            const camera_lookat = camera.getAttribute("lookat");
            let cam = new Camera3D();
            cam.setAspect(canvas.width / canvas.height);
            cam.lookAt(this.paramToVec(camera_lookat));
            cam.setEye(this.paramToVec(camera_pos));
            this.camera = cam;
            
            const scene = canvas.querySelector("scene");
            const scene_objects = this.extractObjects(scene);
            this.scene_objects = scene_objects;

            this.initGL();

            this.drawScene();
        }

        extractObjects(elem, current_scale=new Vec(1,1,1), current_tranlate=new Vec(0,0,0)) {
            // get direct children
            const children = Array.from(elem.children);
            const transforms = children.filter(el => el.tagName.toLowerCase() === "transform");
            const shapes = children.filter(el => el.tagName.toLowerCase() === "shape");

            const objects = [];
            shapes.forEach(shape => {
                const shape_children = Array.from(shape.children);
                const geometry = shape_children.filter(el => el.tagName.toLowerCase() === "cube");
                const material = shape_children.filter(el => el.tagName.toLowerCase() === "material");

                if (geometry.length == 0 || material.length == 0) return;
                
                const color = material[0].hasAttribute("color") ? this.paramToVec(material[0].getAttribute("color")) : new Vec(0.0, 0.0, 0.0);
                const transform = new Mat([current_scale.x, 0.0, 0.0, 0.0], [0.0, current_scale.y, 0.0, 0.0], [0.0, 0.0, current_scale.z, 0.0], [...current_tranlate, 1.0]);
                objects.push({"transform": transform, "color": color, "geometry": geometry[0].tagName.toLowerCase()});
            })

            transforms.forEach(transform => {
                const translate = transform.hasAttribute("translation") ? this.paramToVec(transform.getAttribute("translation")) : new Vec(0.0, 0.0, 0.0);
                const scale = transform.hasAttribute("scale") ? this.paramToVec(transform.getAttribute("scale")) : new Vec(1.0, 1.0, 1.0);
                
                // apply translation with old scale
                const new_translate = current_tranlate.add(new Vec(current_scale.x * translate.x, current_scale.y * translate.y, current_scale.z * translate.z));
                const new_scale = new Vec(scale.x * current_scale.x, scale.y * current_scale.y, scale.z * current_scale.z);
                objects.push(...this.extractObjects(transform, new_scale, new_translate));
            })

            return objects;
        }

        initGL() {
            //////////////////////////////////
            ////////  shader loading  ////////
            //////////////////////////////////

            // shader from java script block
            function getShader(id) {
                let shaderScript = document.getElementById(id);
                if (!shaderScript) {
                    return null;
                }

                let str = "";
                let k = shaderScript.firstChild;
                while (k) {
                    if (k.nodeType == 3) {
                        str += k.textContent;
                    }
                    k = k.nextSibling;
                }

                let shader;
                if (shaderScript.type == "--fragment") {
                    shader = gl.createShader(gl.FRAGMENT_SHADER);
                }
                else if (shaderScript.type == "--vertex") {
                    shader = gl.createShader(gl.VERTEX_SHADER);
                }
                else return null;

                gl.shaderSource(shader, str);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    throw new Error(gl.getShaderInfoLog(shader));
                }

                return shader;
            }
            function shaderProgram(vertexShaderSourceID, fragmentShaderSourceID) {
                let vertexShader = getShader(vertexShaderSourceID);
                let fragmentShader = getShader(fragmentShaderSourceID);

                // create shader program
                let shaderProgram = gl.createProgram();

                // attach shaders
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);

                // link program
                gl.linkProgram(shaderProgram);
                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
                    throw new Error("Could not initialise shaders");
                }        
                return shaderProgram;
            }


            // initialize webGL canvas
            let gl = this.canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true , antialias: interactive});
            if(!gl) throw new Error("Could not initialise WebGL, sorry :-(");

            const cube_vertices = [
                // Front face
                -1.0, -1.0, 1.0,
                1.0, -1.0, 1.0,
                1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,

                // Back face
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, -1.0, -1.0,

                // Top face
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
                1.0, 1.0, 1.0,
                1.0, 1.0, -1.0,

                // Bottom face
                -1.0, -1.0, -1.0,
                1.0, -1.0, -1.0,
                1.0, -1.0, 1.0,
                -1.0, -1.0, 1.0,

                // Right face
                1.0, -1.0, -1.0,
                1.0, 1.0, -1.0,
                1.0, 1.0, 1.0,
                1.0, -1.0, 1.0,

                // Left face
                -1.0, -1.0, -1.0,
                -1.0, -1.0, 1.0,
                -1.0, 1.0, 1.0,
                -1.0, 1.0, -1.0,
            ];
            const cube_normals = [
                // Front
                0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
                // Back
                0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
                // Top
                0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
                // Bottom
                0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
                // Right
                1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
                // Left
                -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
            ];
            const cube_vbo = [];
            for (let i = 0; i < cube_vertices.length; i+=3) {
                cube_vbo.push(cube_vertices[i + 0]);
                cube_vbo.push(cube_vertices[i + 1]);
                cube_vbo.push(cube_vertices[i + 2]);
                cube_vbo.push(cube_normals[i + 0]);
                cube_vbo.push(cube_normals[i + 1]);
                cube_vbo.push(cube_normals[i + 2]);
            }

            const cube_indices = [
                0, 1, 2, 0, 2, 3,       // front
                4, 5, 6, 4, 6, 7,       // back
                8, 9, 10, 8, 10, 11,    // top
                12, 13, 14, 12, 14, 15, // bottom
                16, 17, 18, 16, 18, 19, // right
                20, 21, 22, 20, 22, 23  // left
            ];

            // create vertex buffer on the gpu
            this.vboCube = gl.createBuffer();
            // bind buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vboCube);
            // copy data from cpu to gpu memory
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube_vbo), gl.STATIC_DRAW);

            // create index buffer on the gpu
            this.iboCube = gl.createBuffer();
            // bind buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iboCube);
            // copy data from cpu to gpu memory
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube_indices), gl.STATIC_DRAW);
            this.iboNCube = cube_indices.length;

            this.shaderProgramCube = shaderProgram("shader-vs-phong", "shader-fs-phong");

            gl.clearColor(...this.skycolor, 1.0);
            gl.enable(gl.DEPTH_TEST);
            this.gl = gl;
        }

        drawScene() {
            let gl = this.gl;
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.clear(gl.DEPTH_BUFFER_BIT);

            // draw scene
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            
            gl.useProgram(this.shaderProgramCube);

            // bind buffers
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vboCube);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iboCube);

            // enable vertex attributes
            let attrVertexCube = gl.getAttribLocation(this.shaderProgramCube, "vVertex");
            gl.vertexAttribPointer(attrVertexCube, 3, gl.FLOAT, false, 24, 0);
            gl.enableVertexAttribArray(attrVertexCube);
            let attrNormalCube = gl.getAttribLocation(this.shaderProgramCube, "vNormal");
            gl.vertexAttribPointer(attrNormalCube, 3, gl.FLOAT, false, 24, 12);
            gl.enableVertexAttribArray(attrNormalCube);

            // set shader uniforms
            
            let uniformLocCameraMatrix = gl.getUniformLocation(this.shaderProgramCube, "cameraMatrix");
            gl.uniformMatrix4fv(uniformLocCameraMatrix, false, this.camera.cameraMatrix.flatten());
            let uniformLocProjectionMatrix = gl.getUniformLocation(this.shaderProgramCube, "projectionMatrix");
            gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, this.camera.projectionMatrix.flatten());
            let uniformLocLightDirection = gl.getUniformLocation(this.shaderProgramCube, "lightDirection");
            gl.uniform3fv(uniformLocLightDirection, new Vec(1,5,1).add(this.camera.getEye()));
            let uniformLocCameraPosition = gl.getUniformLocation(this.shaderProgramCube, "cameraPosition");
            gl.uniform3fv(uniformLocCameraPosition, this.camera.getEye());

            const ambient = true;
            const diffuse = true;
            const specular = false;
            const shiny = 20.0;
            let uniformLocAmbient = gl.getUniformLocation(this.shaderProgramCube, "ambient");
            gl.uniform1i(uniformLocAmbient, ambient);
            let uniformLocDiffuse = gl.getUniformLocation(this.shaderProgramCube, "diffuse");
            gl.uniform1i(uniformLocDiffuse, diffuse);
            let uniformLocSpecular = gl.getUniformLocation(this.shaderProgramCube, "specular");
            gl.uniform1i(uniformLocSpecular, specular);
            let uniformLocShiny = gl.getUniformLocation(this.shaderProgramCube, "shiny");
            gl.uniform1f(uniformLocShiny, shiny);


            for (const shape of this.scene_objects) {
                //const geometry = shape["geometry"];
                const modelMatrix = shape["transform"];
                let uniformLocModelMatrix = gl.getUniformLocation(this.shaderProgramCube, "modelMatrix");
                gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
                const normalMatrix = modelMatrix.matNormal();
                let uniformLocNormalMatrix = gl.getUniformLocation(this.shaderProgramCube, "normalMatrix");
                gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix.flatten());
                const color = shape["color"];
                let uniformLocColor = gl.getUniformLocation(this.shaderProgramCube, "color");
                gl.uniform3fv(uniformLocColor, color);

                gl.drawElements(gl.TRIANGLES, this.iboNCube, gl.UNSIGNED_SHORT, 0);
            }
        }

        onKeyPress(e) {
            if (e.charCode == 119) { // W
                this.camera.move(0);
            } else if (e.charCode == 97) { // A
                this.camera.move(1);
            } else if (e.charCode == 115) { // S
                this.camera.move(2);
            } else if (e.charCode == 100) { // D
                this.camera.move(3);
            } else {
                return;
            }
            this.drawScene();
        }

        paramToVec(param) {
            const elems = param.split(" ");
            const vec = [];
            elems.forEach(element => {
                vec.push(parseFloat(element));
            });
            return new Vec(...vec);
        }
    }

    new SceneGraph(canvas);
}


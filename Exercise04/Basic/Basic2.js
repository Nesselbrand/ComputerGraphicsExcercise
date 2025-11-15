
/////////////////////////
////////   4.2   ////////
/////////////////////////

function Basic2(canvas, eye) {

    /**
     * a camera rendering a 3D scene to a 2D plane
     */
    class Camera3D {
        constructor(eye){
            this.eye = new Vec(...eye);
            this.fovy = 30.0 / 180.0 * Math.PI;
            this.near = 5;
            this.far = 30;
            this.lookAtPoint = new Vec(0, 0, 0);
            this.upVector = new Vec(0, 1, 0);

            this.u = new Vec(1,0,0);
            this.v = new Vec(0,1,0);
            this.w = new Vec(0,0,1);

            // the cameraMatrix transforms from world space to camera space
            this.cameraMatrix = id4();
            // projection matrix
            this.projectionMatrix = id4();

            // setup matrices
            this.update();
        }

        setMatrices(cameraMatrix, projectionMatrix) {
            this.cameraMatrix = cameraMatrix;
            this.projectionMatrix = projectionMatrix;
        }

        lookAt(point3D) {
            this.lookAtPoint = new Vec(...point3D);
            this.update();
        }

        setEye(eye3D) {
            this.eye[0] = new Vec(...eye3D);
            this.update();
        }

        setFar(far) {
            this.far = far;
            this.update();
        }

        setFovy(fovy) {
            this.fovy = fovy;
            this.update();
        }
        /**
         * compute a perspective transformation
         * that perspectively maps the 3D space onto a 2D plane
         * @param {number} fovy
         * @param {number} near 
         * @param {number} far 
         * @returns {Mat} resulting 4x4 Matrix, column-major, 
         */
        perspective = function (fovy, near, far) {
            // TODO 4.2     Implement the creation of the projection
            //              matrix for 3D. Orientate yourselves by the 2D case
            //              implemented in Basic1.js.

            // out[0] = ?
            // out[1] = ?
            // ...

            let out = new Mat(  [0,0,0,0],
                                [0,0,0,0],
                                [0,0,0,0],
                                [0,0,0,0]
            )

            return out;
        };

        move(dir) {
            if (dir == 0) {
                this.eye.msub(this.w);
            } else if (dir == 1) {
                this.eye = rotateY(5).transformPoint(this.eye);
            } else if (dir == 2) {
                this.eye.madd(this.w);
            } else if (dir == 3) {
                this.eye = rotateY(-5).transformPoint(this.eye);
            } 
            this.update();
        }

        /**
         * setup matrices
         */
        update() {
            // TODO 4.2     Implement the creation of the camera matrix
            //              (this.cameraMatrix), also setting the three 
            //              vectors this.u, this.v and this.w which form
            //              the camera coordinate system. Use the  
            //              notation from the lecture.
            //              Again, be careful to use column-major notation.

            // this.w = ?
            // this.u = ?
            // this.v = ? 




            // this.cameraMatrix = ?




            // use (and implement) this.perspective to set up the projection matrix
            this.projectionMatrix = this.perspective(this.fovy, this.near, this.far);
        }
    } // end of Camera3D

    // shader programs
    let shaderProgramCube;
    let shaderProgramLine;

    // clear color
    let clearColor = new Vec(0.5, 0.5, 0.5);

    // gl buffer data
    let vboCube;
    let iboCube;
    let iboNCube;

    // cameras
    var camera = new Camera3D(eye);
    var cameraDebug = new Camera3D(eye);
    
    let gl; // webGL context
    let time = 0; // time counter

    //////////////////////////////////
    //////////   setup webGl   ///////
    //////////////////////////////////
    // reset the slider
    let slider = document.getElementById('slider_fovy');
    slider.addEventListener("change", onChangeFovySlider, false);
    
    slider.value = 30;

    // add event listener
    document.addEventListener('keypress', onKeyPress, false);

    // initialize webGL canvas
    gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, antialias: false});
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(");

    // init scene and shaders
    initScene();

    // set clear color and enable depth test
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // start render loop
    renderLoop();

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onChangeFovySlider() {
        camera.setFovy(this.value * Math.PI / 180.0);
    }

    function onKeyPress(e) {
        if (canvas.id != "canvasProjection3D") {
            return;
        }
        if (e.charCode == 119) { // W
            camera.move(0);
        } else if (e.charCode == 97) { // A
            camera.move(1);
        } else if (e.charCode == 115) { // S
            camera.move(2);
        } else if (e.charCode == 100) { // D
            camera.move(3);
        } 
    }

    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////
    
    function renderLoop() {
        let interactive = canvas.id == "canvasProjection3D";

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // draw scene from camera on left side
        gl.viewport(0, 0, interactive ? gl.drawingBufferWidth / 2 : gl.drawingBufferWidth, gl.drawingBufferHeight);
        drawScene(false);

        if (interactive) {
            // draw scene from debug view on right side
            gl.viewport(gl.drawingBufferWidth / 2, 0, gl.drawingBufferWidth / 2, gl.drawingBufferHeight);
            drawScene(true);

            // wait
            window.setTimeout(renderLoop, 1000 / 60);

            // update time
            time += 1000 / 60;
        }
    }

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

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene() {

        //////////////////////////////////////
        ////////  setup geometry - cube //////
        //////////////////////////////////////

        // buffer on the cpu
        let v = [
            // front
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // back
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,
        ];

        let i = [
            // front
            0, 1, 2,
            2, 3, 0,
            // top
            1, 5, 6,
            6, 2, 1,
            // back
            7, 6, 5,
            5, 4, 7,
            // bottom
            4, 0, 3,
            3, 7, 4,
            // left
            4, 5, 1,
            1, 0, 4,
            // right
            3, 2, 6,
            6, 7, 3,
        ];

        // create vertex buffer on the gpu
        vboCube = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboCube);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboCube = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboCube);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);

        iboNCube = i.length;

        //////////////////////////////////////
        ////////  setup geometry - line //////
        //////////////////////////////////////

        // buffer on the cpu
        v = [   0, 0, 0,
                0, 0, 1];
        i = [0, 1];


        if (canvas.id == "canvasProjection3D") {
            // create vertex buffer on the gpu
            vboLine = gl.createBuffer();
            // bind buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
            // copy data from cpu to gpu memory
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

            // create index buffer on the gpu
            iboLine = gl.createBuffer();
            // bind buffer
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLine);
            // copy data from cpu to gpu memory
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i), gl.STATIC_DRAW);
        }

        iboNLine = i.length;


        ///////////////////////////////
        ////////  setup shaders  //////
        ///////////////////////////////
        shaderProgramCube = shaderProgram("shader-vs-cube", "shader-fs-cube");
        gl.useProgram(shaderProgramCube);
        attrVertex = gl.getAttribLocation(shaderProgramCube, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        shaderProgramLine = shaderProgram("shader-vs-line", "shader-fs-line");
        gl.useProgram(shaderProgramLine);
        attrVertex = gl.getAttribLocation(shaderProgramLine, "vVertex");
        gl.enableVertexAttribArray(attrVertex);

        ////////////////////////////////////
        ////////  setup debug camera  //////
        ////////////////////////////////////

        let debugCameraMatrix = new Mat(        [0.2873478829860687, -0.1802094429731369, 0.9407208561897278, 0],
                                                [0, 0.9821414351463318, 0.18814417719841003, 0],
                                                [-0.9578263163566589, -0.05406283214688301, 0.28221625089645386, 0],
                                                [5.960464477539062e-7, 2.7939677238464355e-7, -53.15073013305664, 1]);
        let debugProjectionMatrix = new Mat(    [3.732, 0, 0, 0],
                                                [0, 3.732, 0, 0],
                                                [0, 0, -1.01, -1],
                                                [0, 0, -10.05, 0]);
        cameraDebug.setMatrices(debugCameraMatrix, debugProjectionMatrix);
    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene(debug) {

        let modelMatrixCube = id4();

        let cam = debug ? cameraDebug : camera;

        // draw the cube
        drawCube(modelMatrixCube, cam);

        if (debug) {
            // draw camera frustum

            let halfSideFar = camera.far * Math.tan(camera.fovy);
            let halfSideNear = camera.near * Math.tan(camera.fovy);
            let from = camera.eye.copy();

            for (let i = 0; i < 4; i++) {
                let from_corner = new Vec(-1, -1);
                let to_corner = new Vec(-1, 1);
                if (i == 1) {
                    from_corner = new Vec(-1, 1);
                    to_corner = new Vec(1, 1);
                } else if (i == 2) {
                    from_corner = new Vec(1, 1);
                    to_corner = new Vec(1, -1);
                } else if(i == 3) {
                    from_corner = new Vec(1, -1);
                    to_corner = new Vec(-1, -1);
                }
                let modelMatrix;
                
                // draw near plane
                let fromNear = sub(camera.eye, camera.w.sca(camera.near)).add(camera.u.sca(from_corner.x * halfSideNear)).add(camera.v.sca(from_corner.y * halfSideNear));
                                            
                let toNear = sub(camera.eye, camera.w.sca(camera.near)).add(camera.u.sca(to_corner.x * halfSideNear)).add(camera.v.sca(to_corner.y * halfSideNear))
                modelMatrix = new Mat(  [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                        [...sub(toNear, fromNear), 0],
                                        [...fromNear, 1]);
                drawLine(modelMatrix);

                // draw far plane
                let fromFar = sub(camera.eye, camera.w.sca(camera.far)).add(camera.u.sca(from_corner.x * halfSideFar)).add(camera.v.sca(from_corner.y * halfSideFar));
                let toFar = sub(camera.eye, camera.w.sca(camera.far)).add(camera.u.sca(to_corner.x * halfSideFar)).add(camera.v.sca(to_corner.y * halfSideFar));
                modelMatrix = new Mat(  [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                        [...sub(toFar, fromFar), 0],
                                        [...fromFar, 1]);
                drawLine(modelMatrix);

                // draw sides
                modelMatrix = new Mat(  [0, 0, 0, 0],
                                        [0, 0, 0, 0],
                                        [...sub(toFar, from), 0],
                                        [...from, 1]);
                drawLine(modelMatrix);
            }
        }
    }

    function drawCube(modelMatrix, cam) {
        gl.useProgram(shaderProgramCube);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramCube, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramCube, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, cam.cameraMatrix.flatten());
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramCube, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, cam.projectionMatrix.flatten());
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboCube);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboCube);
        let attrVertex = gl.getAttribLocation(shaderProgramCube, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 12, 0);
        // draw
        gl.drawElements(gl.TRIANGLES, iboNCube, gl.UNSIGNED_SHORT, 0);
    }

    function drawLine(modelMatrix) {
        gl.useProgram(shaderProgramLine);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramLine, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramLine, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, cameraDebug.cameraMatrix.flatten());
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramLine, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, cameraDebug.projectionMatrix.flatten());
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLine);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLine);
        let attrVertex = gl.getAttribLocation(shaderProgramLine, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 12, 0);
        // draw
        gl.drawElements(gl.LINES, iboNLine, gl.UNSIGNED_SHORT, 0);
    }
}

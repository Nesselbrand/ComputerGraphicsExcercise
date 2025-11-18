/////////////////////////
////////   5.2   ////////
/////////////////////////

function Basic2(canvas, start_time, do_ambient, do_diffuse, do_specular, n_specular) {

    // shader programs
    let shaderProgramTerrain;
    let shaderProgramLight;

    // clear color
    let clearColor = new Vec(0.1, 0.1, 0.1);

    // gl buffer data
    let vboTerrain;
    let iboTerrain;
    let iboNTerrain;
    let vboLight;
    let iboLight;
    let iboNLight;

    // camera
    let camera = new Camera3D();

    // global variables for interaction
    let shiny = n_specular;
    let lightRotation = false;
    let ambient = do_ambient;
    let diffuse = do_diffuse;
    let specular = do_specular;

    let time = start_time; // time counter

    ///////////////////////////////////
    //////////   setup web gl   ///////
    ///////////////////////////////////

    if (canvas.id == "canvasShading3D") {
        lightRotation = true
        // reset the slider and the checkboxes
        let slider = document.getElementById('shiny');
        slider.addEventListener('change',onChangeShiny);
        slider.value = shiny;
        let b_lightRotation = document.getElementsByName('lightRotation');
        b_lightRotation[0].addEventListener('change',()=>{ lightRotation =! lightRotation; } );
        b_lightRotation[0].checked = lightRotation;
        let phongTerms = document.getElementsByName('phongTerm');
        phongTerms[0].addEventListener('change',()=>{ambient =! ambient;});
        phongTerms[0].checked = ambient;
        phongTerms[1].addEventListener('change',()=>{diffuse =! diffuse;});
        phongTerms[1].checked = diffuse;
        phongTerms[2].addEventListener('change',()=>{specular =! specular;});
        phongTerms[2].checked = specular;

        // add event listener
        document.addEventListener('keypress', onKeyPress, false);
    }

    // initialize webGL canvas
    let gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true , antialias: false});
    if(!gl) throw new Error("Could not initialise WebGL, sorry :-(");

    // init scene and shaders
    initScene(gl);

    // set clear color and enable depth test
    gl.clearColor(clearColor.r, clearColor.g, clearColor.b, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // start render loop
    renderLoop();
        
    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onChangeShiny() {
        shiny = this.value;
    }

    function onKeyPress(e) {
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

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // draw scene
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        drawScene();

        // wait
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        if (lightRotation) {
            time += 1000 / 60;
        }
    }

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene() {

        /////////////////////////////////////////
        ////////  setup geometry - terrain //////
        /////////////////////////////////////////
        
        let img = document.getElementById('height_field');
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        let width = canvas.width;
        let height = canvas.height;

        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        let raw_data = canvas.getContext('2d').getImageData(0, 0, width, height).data;

        let sigmaD = 4.0;
        let kernelRadius = Math.ceil(2.0 * sigmaD);
        let data = new Array(width * height * 4);
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let sumWeight = 0.0;
                let sum = 0.0;
                for (let m_poss = i - kernelRadius; m_poss <= i + kernelRadius; m_poss++) {
                    for (let n_poss = j - kernelRadius; n_poss <= j + kernelRadius; n_poss++) {
                        let m = Math.min(Math.max(0, m_poss), width - 1);
                        let n = Math.min(Math.max(0, n_poss), height - 1);
                        if (m >= 0 && n >= 0 && m < width && n < height) {
                            let weight = Math.exp(-(((m - i) * (m - i) + (n - j) * (n - j)) / (2.0 * sigmaD * sigmaD)));
                            sumWeight += weight;
                            sum += weight * raw_data[(m + n * width) * 4];
                        } 
                    }
                }
                data[(i + j * width) * 4] = sum / sumWeight;
            }
        }


        let x_scale = 0.4;
        let y_scale = 0.1;
        let z_scale = 0.4;

        let v = [];

        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                let center = [j, i];
                let neighbours = [[j, i - 1],
                                  [j + 1, i - 1],
                                  [j + 1, i],
                                  [j, i + 1],
                                  [j - 1, i + 1],
                                  [j - 1, i]];
                let A = new Vec(x_scale * (center[1] - width * 0.5),
                                y_scale * data[(center[1] + center[0] * width) * 4],
                                z_scale * (center[0] - height * 0.5));
                let normal = new Vec(0, 0, 0);
                for (let k = 0; k < 6; k++) {
                    let neighbourB = neighbours[k];
                    let B = new Vec(x_scale * (neighbourB[1] - width * 0.5),
                                    y_scale * data[(neighbourB[1] + neighbourB[0] * width) * 4],
                                    z_scale * (neighbourB[0] - height * 0.5));
                    let neighbourC = neighbours[(k + 1) % 6];
                    let C = new Vec(x_scale * (neighbourC[1] - width * 0.5),
                                    y_scale * data[(neighbourC[1] + neighbourC[0] * width) * 4],
                                    z_scale * (neighbourC[0] - height * 0.5));

                    let normalABC = cross(B,C);

                    normal = normal.add(normalABC)
                }

                v.push(A[0]);
                v.push(A[1]);
                v.push(A[2]);
                v.push(normal[0]);
                v.push(normal[1]);
                v.push(normal[2]);
            }
        }

        let index = [];

        for (let j = 1; j < height - 2; j++) {
            for (let i = 1; i < width - 2; i++) {
                index.push(j * width + i);
                index.push((j + 1) * width + i);
                index.push(j * width + i + 1);
                index.push(j * width + i + 1);
                index.push((j + 1) * width + i);
                index.push((j + 1) * width + i + 1);
            }
        }

        // create vertex buffer on the gpu
        vboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboTerrain = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);

        iboNTerrain = index.length;

        //////////////////////////////////////////////
        ////////  setup geometry - light source //////
        //////////////////////////////////////////////

        let vLight = new Vec(0.0, 0.0, 0.0);

        let iLight = [0];

        // create vertex buffer on the gpu
        vboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vLight), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboLight = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iLight), gl.STATIC_DRAW);

        iboNLight = iLight.length;

        ///////////////////////////////
        ////////  setup shaders  //////
        ///////////////////////////////
        shaderProgramTerrain = shaderProgram("shader-vs-phong", "shader-fs-phong");

        shaderProgramLight = shaderProgram("shader-vs-light", "shader-fs-light");
    }


    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene() {

        let modelMatrixTerrain = new Mat(   [1,0,0,0],
                                            [0,1,0,-10],
                                            [0,0,1,0],
                                            [0,0,0,1]).tra();
        
        let modelMatrixLight = new Mat( [1,0,0,20],
                                        [0,1,0,10],
                                        [0,0,1,0],
                                        [0,0,0,1]).tra();
        modelMatrixLight = modelMatrixLight.rotateY((time * 0.05) % 360);


        // draw the light source
        drawLight(modelMatrixLight);

        // draw the cube
        drawTerrain(modelMatrixTerrain, [0, 0.8, 0.5], modelMatrixLight);
    }

    function drawTerrain(modelMatrix, color, modelMatrixLight) {

        let normalMatrix = modelMatrix.matNormal();

        gl.useProgram(shaderProgramTerrain);
        // enable vertex attributes
        let attrVertexTerrain = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.enableVertexAttribArray(attrVertexTerrain);
        let attrNormalTerrain = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.enableVertexAttribArray(attrNormalTerrain);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramTerrain, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix.flatten());
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramTerrain, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix.flatten());
        let uniformLocNormalMatrix = gl.getUniformLocation(shaderProgramTerrain, "normalMatrix");
        gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix.flatten());
        let uniformLocColor = gl.getUniformLocation(shaderProgramTerrain, "color");
        gl.uniform3fv(uniformLocColor, color);
        let lightPosition = new Vec(0,0,0).transformAsPoint(modelMatrixLight);
        let uniformLocLightPosition = gl.getUniformLocation(shaderProgramTerrain, "lightPosition");
        gl.uniform3fv(uniformLocLightPosition, lightPosition);
        let uniformLocCameraMatrixInverse = gl.getUniformLocation(shaderProgramTerrain, "cameraMatrixInverse");
        gl.uniformMatrix4fv(uniformLocCameraMatrixInverse, false, camera.cameraMatrixInverse.flatten());
        let uniformLocShiny = gl.getUniformLocation(shaderProgramTerrain, "shiny");
        gl.uniform1f(uniformLocShiny, shiny);
        let uniformLocAmbient = gl.getUniformLocation(shaderProgramTerrain, "ambient");
        gl.uniform1i(uniformLocAmbient, ambient);
        let uniformLocDiffuse = gl.getUniformLocation(shaderProgramTerrain, "diffuse");
        gl.uniform1i(uniformLocDiffuse, diffuse);
        let uniformLocSpecular = gl.getUniformLocation(shaderProgramTerrain, "specular");
        gl.uniform1i(uniformLocSpecular, specular);
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboTerrain);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboTerrain);
        let attrVertex = gl.getAttribLocation(shaderProgramTerrain, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 24, 0);
        let attrNormal = gl.getAttribLocation(shaderProgramTerrain, "vNormal");
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 24, 12);
        // draw
        gl.drawElements(gl.TRIANGLES, iboNTerrain, gl.UNSIGNED_SHORT, 0);
    }

    function drawLight(modelMatrix) {
        gl.useProgram(shaderProgramLight);
        // enable vertex attributes
        let attrVertexLight = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.enableVertexAttribArray(attrVertexLight);
        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramLight, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramLight, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix.flatten());
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramLight, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix.flatten());
        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboLight);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboLight);
        let attrVertex = gl.getAttribLocation(shaderProgramLight, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 12, 0);
        // draw
        gl.drawElements(gl.POINTS, iboNLight, gl.UNSIGNED_SHORT, 0);
    }


    ////////////////////////////////////
    //////////   shader helper   ///////
    ////////////////////////////////////

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
        let vertexShader = getShader( vertexShaderSourceID);
        let fragmentShader = getShader( fragmentShaderSourceID);

        // create shader program
        let shaderProgram = gl.createProgram();

        // attach shaders
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // link program
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not initialize shaders");
        }
        return shaderProgram;
    }
}

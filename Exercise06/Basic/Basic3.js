/////////////////////////
////////   6.3   ////////
/////////////////////////

function Basic3(canvas, isCheckerTex, doRepeat, doMipmap, camMove, checkerTCScale, startTime) {
    // shader programs
    let shaderProgramPlane;
    let shaderProgramLight;

    // clear color
    let clearColor = [0.1, 0.1, 0.5];

    // gl buffer data
    let vboPlane;
    let iboPlane;
    let iboNPlane;
    let vboLight;
    let iboLight;
    let iboNLight;

    // camera
    let camera = new Camera3D();
    for (let i = 0; i < camMove; i++) camera.move(0);

    // texture
    let textureCheckerboard;
    let textureCobblestone;

    // global variables for interaction
    let cobblestone = !isCheckerTex;
    let mipmapping = doMipmap;
    let repeat = doRepeat;

    // width and height of the plane
    let width = 50;
    let height = 50;


    let gl; // webGL context
    let time = startTime; // time counter

    //////////////////////////////////
    //////////   setup webGl   ///////
    //////////////////////////////////

    if (canvas.id == "canvasTexturing") {
        
        // add event listener
        document.addEventListener('keypress', onKeyPress, false);

        // reset the checkboxes and radio buttons
        let textures = document.getElementsByName('texture');
        textures[0].checked = !cobblestone;
        textures[1].checked = cobblestone;
        textures[0].addEventListener("change",()=>{cobblestone=false; initScene();});
        textures[1].addEventListener("change",()=>{cobblestone=true; initScene();});

        let mipmapping_box = document.getElementById('mipmap');
        mipmapping_box.addEventListener("change", onChangeMipmap);
        mipmapping_box.checked = mipmapping;

        let repeat_box = document.getElementById('repeat');
        repeat_box.addEventListener("change", onChangeRepeat);
        repeat_box.checked = repeat;  

        let checker_size_slider = document.getElementById('checkersize');
        checker_size_slider.addEventListener("change", onChangeSizeSlider);
        checker_size_slider.value = checkerTCScale;
    }


    // initialize webGL canvas
    gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true , antialias: false});
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(");

    // init scene and shaders
    initScene();

    // set clear color and enable depth test
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], 1.0);
    gl.enable(gl.DEPTH_TEST);

    // start render loop
    let render_once = (canvas.id != "canvasTexturing");
    renderLoop(render_once);

    /////////////////////////////////////
    //////////   event listener   ///////
    /////////////////////////////////////

    function onKeyPress(e) {
        if (e.charCode == 119) { // W
            camera.move(0);
        } else if (e.charCode == 115) { // S
            camera.move(1);
        }
    }

    function onChangeMipmap() {
        mipmapping = !mipmapping;
        let minFilterMode = mipmapping ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilterMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function onChangeRepeat() {
        repeat = !repeat;
        let wrapMode = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function onChangeSizeSlider() {
        checkerTCScale = this.value;
        initScene();
    }

    /////////////////////////////
    ///////   Render Loop   /////
    /////////////////////////////

    function renderLoop(render_once) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        // draw scene
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        drawScene();

        // wait
        if (render_once) {
            return;
        }
        window.setTimeout(renderLoop, 1000 / 60);

        // update time
        time += 1000 / 60;
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
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error("Could not initialize shaders");
        }
        return shaderProgram;
    }

    //////////////////////////////
    ////////  init scene  ////////
    //////////////////////////////
    function initScene() {

        //////////////////////////////////////////
        ////////  set up geometry - plane ////////
        //////////////////////////////////////////

        let vPlane = [];

        for (let j = height - 1; j >= 0; j--) {
            for (let i = 0; i < width; i++) {
                let A = new Vec(i - (width - 1) * 0.5,
                    height - 1 - j - (height - 1) * 0.5,
                    0);
                // push the vertex coordinates
                vPlane.push(A.x);
                vPlane.push(A.y);
                vPlane.push(A.z);
                // push the normal coordinates
                vPlane.push(0);
                vPlane.push(0);
                vPlane.push(1);
                // push texture coordinates
                if (!cobblestone) {
                    // scaled tc to enlarge checker Tiles for better visibility
                    vPlane.push(i/checkerTCScale);
                    vPlane.push(j/checkerTCScale);
                } else {
                    vPlane.push(i);
                    vPlane.push(j);
                }
            }
        }

        let iPlane = [];

        for (let j = 0; j < height - 1; j++) {
            for (let i = 0; i < width - 1; i++) {
                iPlane.push(j * width + i);
                iPlane.push((j + 1) * width + i);
                iPlane.push(j * width + i + 1);
                iPlane.push(j * width + i + 1);
                iPlane.push((j + 1) * width + i);
                iPlane.push((j + 1) * width + i + 1);
            }
        }

        // create vertex buffer on the gpu
        vboPlane = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vboPlane);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vPlane), gl.STATIC_DRAW);

        // create index buffer on the gpu
        iboPlane = gl.createBuffer();
        // bind buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboPlane);
        // copy data from cpu to gpu memory
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(iPlane), gl.STATIC_DRAW);

        iboNPlane = iPlane.length;

        ///////////////////////////////////////////////
        ////////  set up geometry - light source //////
        ///////////////////////////////////////////////

        let vLight = [0.0, 0.0, 0.0];

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

        ////////////////////////////////
        ////////  set up shaders  //////
        ////////////////////////////////
        shaderProgramPlane = shaderProgram("shader-vs-phong", "shader-fs-phong");
        shaderProgramLight = shaderProgram("shader-vs-light", "shader-fs-light");

        /////////////////////////////////
        ////////  set up textures  //////
        /////////////////////////////////
        let image = document.getElementById('checkerboard');
        textureCheckerboard = gl.createTexture();
        let wrapMode = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
        let minFilterMode = mipmapping ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR;

        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilterMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapMode);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapMode);
        gl.bindTexture(gl.TEXTURE_2D, null);


        // TODO 6.3a):  Set up the texture containing the checkerboard
        //              image. Have a look at the functions gl.bindTexture(),
        //              gl.texImage2D() and gl.texParameteri(). Also do not
        //              forget to generate the mipmap pyramid using 
        //              gl.generateMipmap(). Note: Both format and internal
        //              format parameter should be gl.RGBA, the data type
        //              used should be gl.UNSIGNED_BYTE.
        
        // --- Checkerboard Texture Setup ---
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);

        // Upload image
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        // Generate mipmap pyramid
        gl.generateMipmap(gl.TEXTURE_2D);

        // Unbind
        gl.bindTexture(gl.TEXTURE_2D, null);



        image = document.getElementById('cobblestone');
        textureCobblestone = gl.createTexture();

        // TODO 6.3b):  Set up the texture containing the cobblestone
        //              image, also using gl.bindTexture() and gl.texImage2D().
        //              We do not need mipmapping here, so do not forget to 
        //              use gl.texParameteri() to set the minification filter 
        //              to gl.LINEAR. Format, internal format and type should
        //              be the same as for the checkerboard texture.
// --- Cobblestone Texture Setup ---
        gl.bindTexture(gl.TEXTURE_2D, textureCobblestone);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image
        );

        gl.bindTexture(gl.TEXTURE_2D, null);



    }

    //////////////////////////////
    ////////  draw scene  ////////
    //////////////////////////////

    function drawScene() {

        let modelMatrixPlane = id4();
        let modelMatrixLight = new Mat([1,0,0,10],
                                        [0,1,0,0],
                                        [0,0,1,5],
                                        [0,0,0,1]).tra();

        modelMatrixLight = modelMatrixLight.rotateZ((time * 0.05) % 360);

        // draw the light source
        drawLight(modelMatrixLight);

        // draw the plane
        drawPlane(modelMatrixPlane, [0, 0.8, 0.5], modelMatrixLight);
    }

    function drawPlane(modelMatrix, color, modelMatrixLight) {

        let normalMatrix = matNormal(modelMatrix);

        gl.useProgram(shaderProgramPlane);
        // enable vertex attributes
        let attrVertexPlane = gl.getAttribLocation(shaderProgramPlane, "vVertex");
        gl.enableVertexAttribArray(attrVertexPlane);
        let attrNormalPlane = gl.getAttribLocation(shaderProgramPlane, "vNormal");
        gl.enableVertexAttribArray(attrNormalPlane);
        let attrTexCoordPlane = gl.getAttribLocation(shaderProgramPlane, "vTexCoord");
        gl.enableVertexAttribArray(attrTexCoordPlane);

        // set shader uniforms
        let uniformLocModelMatrix = gl.getUniformLocation(shaderProgramPlane, "modelMatrix");
        gl.uniformMatrix4fv(uniformLocModelMatrix, false, modelMatrix.flatten());
        let uniformLocCameraMatrix = gl.getUniformLocation(shaderProgramPlane, "cameraMatrix");
        gl.uniformMatrix4fv(uniformLocCameraMatrix, false, camera.cameraMatrix.flatten());
        let uniformLocProjectionMatrix = gl.getUniformLocation(shaderProgramPlane, "projectionMatrix");
        gl.uniformMatrix4fv(uniformLocProjectionMatrix, false, camera.projectionMatrix.flatten());
        let uniformLocNormalMatrix = gl.getUniformLocation(shaderProgramPlane, "normalMatrix");
        gl.uniformMatrix4fv(uniformLocNormalMatrix, false, normalMatrix.flatten());
        let lightPosition = modelMatrixLight.transformPoint(new Vec(0.0, 0.0, 0.0));
        let uniformLocLightPosition = gl.getUniformLocation(shaderProgramPlane, "lightPosition");
        gl.uniform3fv(uniformLocLightPosition, lightPosition);
        let uniformLocCameraMatrixInverse = gl.getUniformLocation(shaderProgramPlane, "cameraMatrixInverse");
        gl.uniformMatrix4fv(uniformLocCameraMatrixInverse, false, camera.cameraMatrixInverse.flatten());
        let uniformLocCobblestone = gl.getUniformLocation(shaderProgramPlane, "cobblestone");
        gl.uniform1i(uniformLocCobblestone, cobblestone);
        let uniformLocPlaneSize = gl.getUniformLocation(shaderProgramPlane, "planeSize");
        gl.uniform2f(uniformLocPlaneSize, width, height);

        // bind textures
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureCheckerboard);
        let uniformLocTexture = gl.getUniformLocation(shaderProgramPlane, "checkerboardTexture");
        gl.uniform1i(uniformLocTexture, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureCobblestone);
        uniformLocTexture = gl.getUniformLocation(shaderProgramPlane, "cobblestoneTexture");
        gl.uniform1i(uniformLocTexture, 1);


        // bind buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, vboPlane);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboPlane);
        let attrVertex = gl.getAttribLocation(shaderProgramPlane, "vVertex");
        gl.vertexAttribPointer(attrVertex, 3, gl.FLOAT, false, 32, 0);
        let attrNormal = gl.getAttribLocation(shaderProgramPlane, "vNormal");
        gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 32, 12);
        let attrTexCoord = gl.getAttribLocation(shaderProgramPlane, "vTexCoord");
        gl.vertexAttribPointer(attrTexCoord, 2, gl.FLOAT, false, 32, 24);


        // draw
        gl.drawElements(gl.TRIANGLES, iboNPlane, gl.UNSIGNED_SHORT, 0);
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
}

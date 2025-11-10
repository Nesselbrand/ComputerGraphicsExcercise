"use strict";

function Basic2(canvas, wireframe) {

    let gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true , antialias: false});
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");

    gl.viewport(0, 0, canvas.width, canvas.height);

    // position (2) + color (3) per vertex
    let vertices = [
        -0.5, -0.5,   1.0, 0.0, 0.0,   // red => barycentric coord for vertex0
         0.5, -0.5,   0.0, 1.0, 0.0,   // green => vertex1
         0.0,  0.5,   0.0, 0.0, 1.0    // blue => vertex2
    ];

    let indices = [0, 1, 2];

    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    let ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);


    let fragmentShader = getShader(gl, "shaderWireFrame-fs");
    let vertexShader = getShader(gl, "shaderWireFrame-vs");

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw new Error("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    const stride = 5 * Float32Array.BYTES_PER_ELEMENT; // 5 floats per vertex

    // position attribute (2 floats) offset 0
    let attrVertexPosition = gl.getAttribLocation(shaderProgram, "vVertex");
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.vertexAttribPointer(attrVertexPosition, 2, gl.FLOAT, false, stride, 0);

    // color attribute (3 floats) offset 2 floats
    let attrVertexColor = gl.getAttribLocation(shaderProgram, "vColor");
    gl.enableVertexAttribArray(attrVertexColor);
    gl.vertexAttribPointer(attrVertexColor, 3, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT);

    let uniformLocationWireframe = gl.getUniformLocation(shaderProgram, "wireframe");
    gl.uniform1i(uniformLocationWireframe, wireframe ? 1 : 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

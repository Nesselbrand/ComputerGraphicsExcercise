"use strict";

function Basic1(canvas, slices) {

    let gl = canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true, antialias: false});
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");

    gl.viewport(0, 0, canvas.width, canvas.height);

    let c = [0.3, 0.2]; // Mittelpunkt
    let r = 0.7;        // Radius
    
    if (slices < 3) slices = 3; // mind. Dreieck

    let vertices = [];
    let indices = [];

    // --- Vieleck-Geometrie ---
    // Mittelpunkt
    vertices.push(c[0]);
    vertices.push(c[1]);

    // Orientierung:
    // ungerade slices → Spitze oben
    // gerade slices → flache Kante oben
    let startAngle;
    if (slices % 2 === 1) {
        startAngle = -Math.PI / 2.0;     // Spitze oben
    } else {
        startAngle = -Math.PI / slices;  // flache Kante horizontal
    }

    // jetzt 1 Segment gegen den Uhrzeigersinn drehen
    startAngle += Math.PI / slices;

    // Außenpunkte erzeugen
    for (let i = 0; i <= slices; ++i) {
        let angle = startAngle + 2.0 * Math.PI * i / slices;
        let x = c[0] + r * Math.cos(angle);
        let y = c[1] + r * Math.sin(angle);
        vertices.push(x);
        vertices.push(y);
    }

    // Indizes für Triangle-Fan
    for (let i = 1; i <= slices; ++i) {
        indices.push(0);
        indices.push(i);
        indices.push(i + 1);
    }

    // --- Buffer upload + draw ---
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    let ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let vertexShader = getShader(gl, "shader-vs");
    let fragmentShader = getShader(gl, "shader-fs");

    let shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        throw new Error("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

    let attrVertexPosition = gl.getAttribLocation(shaderProgram, "vVertex");
    gl.enableVertexAttribArray(attrVertexPosition);
    gl.vertexAttribPointer(attrVertexPosition, 2, gl.FLOAT, false, 8, 0);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

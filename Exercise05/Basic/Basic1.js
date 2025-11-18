
/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

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

function arrow(context, fromx, fromy, tox, toy, text) {
    if (fromx == tox && fromy == toy) return;

    // http://stuff.titus-c.ch/arrow.html
    let headlen = 5;   // length of head in pixels
    let angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
    if (text) {
        let d = [tox - fromx, toy - fromy];
        let l = Math.sqrt(d[0] * d[0] + d[1] * d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}


///////////////////////////
////////   5.1a)   ////////
///////////////////////////

/**
 * @param {Object} context - Canvas 2D Context
 * @param {vec2} point - 2D surface point that should receive lighting
 * @param {vec2} normal - 2D surface normal
 * @param {vec2} eye - 2D eye position
 * @param {vec2} pointLight - 2D point light position
 * @param {vec3} albedo - base color
 * @param {boolean} showVectors 
 * @returns {vec3} - lighting color
 */
function PhongLighting(context, point, normal, eye, pointLight, albedo, showVectors) {

    // ----- 1. Vektoren berechnen -----
    // view vector (vom Punkt zum Auge)
    let v = eye.sub(point).normalize();

    // light vector (vom Punkt zur Lichtquelle)
    let l = pointLight.sub(point).normalize();

    // n·l
    let ndotl_raw = normal.x * l.x + normal.y * l.y;
    let ndotl = Math.max(0.0, ndotl_raw);

    // reflection vector r = 2(n·l)n – l
    let rx = 2.0 * ndotl * normal.x - l.x;
    let ry = 2.0 * ndotl * normal.y - l.y;
    let r = new Vec(rx, ry).normalize();


    // ----- 2. Ambient -----
    // 0.1 * albedo
    let ambient = new Vec(
        0.1 * albedo.x,
        0.1 * albedo.y,
        0.1 * albedo.z
    );


    // ----- 3. Diffuse -----
    // 0.5 * albedo * max(0, n·l)
    let diffuse = new Vec(
        0.5 * albedo.x * ndotl,
        0.5 * albedo.y * ndotl,
        0.5 * albedo.z * ndotl
    );


    // ----- 4. Specular -----
    let shiny = 30.0;
    let specularStrength = 0.4;

    // cos(theta) = max(0, r·v)
    let rdotv_raw = r.x * v.x + r.y * v.y;
    let rdotv = Math.max(0.0, rdotv_raw);

    let spec = specularStrength * Math.pow(rdotv, shiny);

    // weißes Spekularlicht
    let specular = new Vec(spec, spec, spec);


    // ----- 5. Alle Teile addieren -----
    let color = new Vec(
        ambient.x + diffuse.x + specular.x,
        ambient.y + diffuse.y + specular.y,
        ambient.z + diffuse.z + specular.z
    );


    // Debug-Vektoren zeichnen
    if (showVectors) {
        let vecScale = 100;
        context.strokeStyle = 'rgb(0,0,0)';
        arrow(context, point.x, point.y, point.x + vecScale * normal.x, point.y + vecScale * normal.y, "n");
        arrow(context, point.x, point.y, point.x + vecScale * v.x,      point.y + vecScale * v.y,      "v");
        arrow(context, point.x, point.y, point.x + vecScale * l.x,      point.y + vecScale * l.y,      "l");
        arrow(context, point.x, point.y, point.x + vecScale * r.x,      point.y + vecScale * r.y,      "r");
    }

    return color;
}



function Basic1_1(canvas, nSamples, eye_pos, light_pos) {
    let alpha = 0.25;

    if (canvas.id == "canvasPhongLighting") {
        // reset the slider and the checkboxes
        let slider = document.getElementById('nSamples');
        slider.addEventListener('change', onChangeNSamples);
        slider.value = 5;

        canvas.addEventListener('mousedown', onMouseDown, false);
    }
    
    Render();
    
    // Interaction

    function onChangeNSamples() {
        nSamples = this.value;
        Render();
    }

    function onMouseDown(e) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        alpha = x / rect.width;
        Render();
    }

    // Rendering

    function Render() {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        if (canvas.id == "canvasPhongLighting") {
            clearCanvas2d(canvas);
            context.font = "italic 12px Georgia";
            context.textAlign = "center";
        }

        // light source
        let eye = eye_pos;

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(eye.x, eye.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasPhongLighting") {
            // eye text
            context.fillText("eye", eye.x, eye.y + 20);
        }

        // light source
        let pointLight = light_pos;

        // draw light source
        context.fillStyle = 'rgb(50, 100, 250)';
        context.beginPath();
        context.arc(pointLight.x, pointLight.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasPhongLighting") {
            // light source text
            context.fillText("light", pointLight.x, pointLight.y + 20);
        }

        // line
        let line;
        if (canvas.id == "canvasPhongLighting") {
            line = [new Vec(0, 270), new Vec(600, 270)];
        } else {
            line = [new Vec(0, 150), new Vec(200, 150)];
        }
        let albedo = new Vec(0, 1, 0);

        // draw surface (line)
        setStrokeStyle(context, [0.5, 0.5, 0.5]);
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.lineWidth = 4;
        context.moveTo(line[0].x, line[0].y);
        context.lineTo(line[1].x, line[1].y);
        context.stroke();
        if (canvas.id == "canvasPhongLighting") {
            context.fillText("surface", line[0].x + 50, line[0].y + 20);
        }
        context.lineWidth = 1;

        for (let i = 0; i < nSamples; ++i) {
            let _alpha = i / (nSamples - 1.0);
            // sampled point on the surface
            let point = new Vec((1.0 - _alpha) * line[0].x + _alpha * line[1].x, (1.0 - _alpha) * line[0].y + _alpha * line[1].y);
            let normal = new Vec(0.0, -1.0);

            // compute light - Phong Lighting
            let color = PhongLighting(context, point, normal, eye, pointLight, albedo, false);

            // draw point
            setFillStyle(context, color)
            context.beginPath();
            context.arc(point.x, point.y, 4, 0, 2 * Math.PI);
            context.fill();
        }

        // current point on the surface
        let point = new Vec((1.0 - alpha) * line[0].x + alpha * line[1].x, (1.0 - alpha) * line[0].y + alpha * line[1].y);
        let normal = new Vec(0.0, -1.0);

        // compute light - Phong Lighting
        let color = PhongLighting(context, point, normal, eye, pointLight, albedo, canvas.id == "canvasPhongLighting");

        if (canvas.id == "canvasPhongLighting") {
        // draw point
            setFillStyle(context, color)
            context.beginPath();
            context.fillText("p", point.x, point.y + 20);
            context.arc(point.x, point.y, 6, 0, 2 * Math.PI);
            context.fill();
        }
    }
}


///////////////////////////
////////   5.1b)   ////////
///////////////////////////

function Basic1_2(canvas, nLineSegments, amplitude, eye_pos, light_pos) {

    if (canvas.id == "canvasFlatShading") {
        // reset the slider and the checkboxes
        let slider1 = document.getElementById('nLineSegments2_2');
        slider1.addEventListener("change",onChangeNLineSegments);
        slider1.value = nLineSegments;
        let slider2 = document.getElementById('amplitude2_2');
        slider2.addEventListener("change",onChangeAmplitude);
        slider2.value = amplitude;
    }

    Render();

    // Interaction

    function onChangeNLineSegments() {
        nLineSegments = this.value;
        Render();
    }
    function onChangeAmplitude() {
        amplitude = this.value;
        Render();
    }

    // Rendering

    function Render() {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        if (canvas.id == "canvasFlatShading") {
            clearCanvas2d(canvas);
            context.font = "italic 12px Georgia";
            context.textAlign = "center";
        }

        // light source
        let eye = eye_pos;

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(eye.x, eye.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasFlatShading") {
            context.fillText("eye", eye.x, eye.y + 20);
        }

        // light source
        let pointLight = light_pos;

        // draw light source
        context.fillStyle = 'rgb(50, 100, 250)';
        context.beginPath();
        context.arc(pointLight.x, pointLight.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasFlatShading") {
            context.fillText("light", pointLight.x, pointLight.y + 20);
        }

        // line segments
        let p0 = 0;
        let p1 = canvas.width;
        let y_start = canvas.height * 0.8;
        let lineSegments = new Array(nLineSegments);
        for (let i = 0; i < nLineSegments; ++i) {
            let _alpha = i / (nLineSegments);
            let start = new Vec(Math.floor((1.0 - _alpha) * p0 + _alpha * p1), y_start - amplitude * Math.sin(_alpha * Math.PI));
            _alpha = (i + 1.0) / (nLineSegments);
            let end = new Vec(Math.ceil((1.0 - _alpha) * p0 + _alpha * p1), y_start - amplitude * Math.sin(_alpha * Math.PI));
            lineSegments[i] = [start, end];
        }
        let albedo = new Vec(0, 1, 0);

        // draw surface (line segments) using flat shading
        for (let i = 0; i < nLineSegments; ++i) {
            // TODO 5.1b) Implement Flat Shading of the line segments - follow the stepwise instructions below:

            // 1. Compute representor of the primitive (-> midpoint on the line segment).

            // 2. Compute the normal of the line segment.

            // 3. Use the function PhongLighting that you implemented in the previous assignment to evaluate the color.

            // 4. Set the stroke color (use setStrokeStyle() defined in this .js-file).



            // draw the line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0].x, lineSegments[i][0].y);
            context.lineTo(lineSegments[i][1].x, lineSegments[i][1].y);
            context.stroke();

            if (canvas.id == "canvasFlatShading") {
                if (i < nLineSegments - 1) {
                    // draw auxiliary line between this and the next line segment
                    context.beginPath();
                    setStrokeStyle(context, [0, 0, 0]);
                    context.lineWidth = 1;
                    context.moveTo(lineSegments[i][1].x, lineSegments[i][1].y + 4);
                    context.lineTo(lineSegments[i][1].x, lineSegments[i][1].y + 14);
                    context.stroke();
                }
            }
        }
        context.fillStyle = 'rgb(0,0,0)';
        if (canvas.id == "canvasFlatShading") {
            context.fillText("surface", p0.x + 50, p0.y + 20);
        }
        context.lineWidth = 1;
    }
}



///////////////////////////
////////   5.1c)   ////////
///////////////////////////

function Basic1_3(canvas, nLineSegments, amplitude, eye_pos, light_pos) {
    if (canvas.id == "canvasGouraudShading") {
        // reset the slider and the checkboxes
        let slider1 = document.getElementById('nLineSegments2_3');
        slider1.addEventListener('change',onChangeNLineSegments);
        slider1.value = nLineSegments;
        let slider2 = document.getElementById('amplitude2_3');
        slider2.addEventListener('change',onChangeAmplitude);
        slider2.value = amplitude;
    }

    Render();

    // Interaction
        
    function onChangeNLineSegments() {
        nLineSegments = this.value;
        Render();
    }
    function onChangeAmplitude() {
        amplitude = this.value;
        Render();
    }
    
    // Rendering

    function Render() {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        if (canvas.id == "canvasGouraudShading") {
            clearCanvas2d(canvas);
            context.font = "italic 12px Georgia";
            context.textAlign = "center";
        }

        // light source
        let eye = eye_pos;

        // draw eye
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.arc(eye.x, eye.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasGouraudShading") {
            context.fillText("eye", eye.x, eye.y + 20);
        }

        // light source
        let pointLight = light_pos;

        // draw light source
        context.fillStyle = 'rgb(50, 100, 250)';
        context.beginPath();
        context.arc(pointLight.x, pointLight.y, 4, 0, 2 * Math.PI);
        context.fill();
        if (canvas.id == "canvasGouraudShading") {
            context.fillText("light", pointLight.x, pointLight.y + 20);
        }

        // line segments
        let p0 = 0;
        let p1 = canvas.width;
        let y_start = canvas.height * 0.8;
        let lineSegments = new Array(nLineSegments);
        for (let i = 0; i < nLineSegments; ++i) {
            let _alpha = i / (nLineSegments);
            let start = new Vec(Math.floor((1.0 - _alpha) * p0 + _alpha * p1), y_start - amplitude * Math.sin(_alpha * Math.PI));
            _alpha = (i + 1.0) / (nLineSegments);
            let end = new Vec(Math.ceil((1.0 - _alpha) * p0 + _alpha * p1), y_start - amplitude * Math.sin(_alpha * Math.PI));
            lineSegments[i] = [start, end];
        }
        let albedo = new Vec(0, 1, 0);

        // draw surface (line segments) using flat shading
        for (let i = 0; i < nLineSegments; ++i) {

            // TODO 5.1c) Implement Gouraud Shading of the line segments - follow the stepwise instructions below:

            // 1. Compute vertex normals by interpolating between normals of adjacent line segments (weighted by line segment length!). Take care of border cases.


            // 2. Evaluate the color at the vertices using the PhongLighting function.


            // 3. Use the linear gradient stroke style of the context to linearly interpolate the vertex colors over the primitive (https://www.w3schools.com/TAgs/canvas_createlineargradient.asp).
            //    The color triples can be scaled from [0,1] to [0,255] using the function floatToColor().
            //    To apply the gradient, set context.strokeStyle to your linear gradient.



            // draw line segment
            context.beginPath();
            context.lineWidth = 8;
            context.moveTo(lineSegments[i][0].x, lineSegments[i][0].y);
            context.lineTo(lineSegments[i][1].x, lineSegments[i][1].y);
            context.stroke();

            if (canvas.id == "canvasGouraudShading") {
                if (i < nLineSegments - 1) {
                    // draw auxiliary line between this and the next line segment
                    context.beginPath();
                    setStrokeStyle(context, [0, 0, 0]);
                    context.lineWidth = 1;
                    context.moveTo(lineSegments[i][1].x, lineSegments[i][1].y + 4);
                    context.lineTo(lineSegments[i][1].x, lineSegments[i][1].y + 14);
                    context.stroke();
                }
            }
        }
        if (canvas.id == "canvasGouraudShading") {
            context.fillText("surface", p0.x + 50, p0.y + 20);
        }
        context.lineWidth = 1;
    }
}


"use strict"

/////////////////////////////////////////////
/////////  Complex Number Helpers  //////////
/////////////////////////////////////////////

/** __Creates a new complex number {re, im}__
 * 
 * @param {Float} re - real part
 * @param {Float} im - imaginary part
 */
function ComplexNumber(re, im) {
    this.re = re;
    this.im = im;
}

/** __Creates a complex number by interprecting a point (x,y).__
 * 
 *  Mandelbrot canvases represent the complex plane [-2, 1] x [-1, 1].
 * 
 *  Julia canvases represent the complex plane [-1, 1] x [-1, 1].
 * 
 * @param {Float} x - x coordinate of point (x,y)
 * @param {Float} y - y coordinate of point (x,y)
 * @param {Float} canvasID - id of the canvas that (x,y) refers to
 * @param {Float} isJulia - whether canvasID belongs to a julia canvas (default: false)
 */
function ComplexNumberFromCoords(x, y, canvasID, isJulia=false) {
    let canvas = document.getElementById(canvasID);

    this.re = (x / (1.0 * canvas.width) - 0.5);
    this.im = (y / (1.0 * canvas.height) - 0.5);
    if (isJulia) {
        this.re *= 3;
        this.im *= 3;
    } else {
        let center = parseComplex(canvas.getAttribute("var_center"));
        let zoom = parseFloat(canvas.getAttribute("var_zoom"));
        this.re = this.re * 3 * Math.pow(2, zoom) + center.re;
        this.im = this.im * 2 * Math.pow(2, zoom) + center.im;
    }
}

function parseComplex(c) {
    let elems = c.split(",");
    let re = parseFloat(elems[0]);
    let im = parseFloat(elems[1]);
    return new ComplexNumber(re, im);
}

function complexToString(c) {
    return c.re.toString() + "," + c.im.toString();
}

function mult_c(x, y) {
    let re = (x.re * y.re - x.im * y.im);
    let im = (x.re * y.im + x.im * y.re);
    return new ComplexNumber(re, im);
}

function add_c(x, y) {
    let re = (x.re + y.re);
    let im = (x.im + y.im);
    return new ComplexNumber(re, im);
}

function sub_c(x, y) {
    let re = (x.re - y.re);
    let im = (x.im - y.im);
    return new ComplexNumber(re, im);
}

function abs_c(x) {
    return Math.sqrt(x.re * x.re + x.im * x.im);
}

/////////////////////////////////
/////////  Magic Math  //////////
/////////////////////////////////

function f_c(z, c) {
    // TODO 1.4a):      Compute the result of function f_c for a given z and
    //                  a given c. Use the complex helper functions.
    return add_c(mult_c(z, z), c);


}

function countIterationsNaive(start_z, c, max_iter) {
    // TODO 1.4a):      Count iterations needed for the sequence to diverge.
    //                  z is declared diverged as soon as its absolute value
    //                  is greater than 2. If the sequence does not diverge during
    //                  the first max_iter iterations, return max_iter. Use
    //                  function f_c().
    let z = new ComplexNumber(start_z.re, start_z.im);
    for(let i = 0; i < max_iter; i++){
        z = f_c(z, c);
        if(abs_c(z) > 2) return i+1;
    }
    return max_iter;
}

function countIterationsNoBanding(start_z, c, max_iter) {
    // TODO 1.4b):      Copy your code from countIterationsNaive and
    //                  change the return value to avoid banding. 
    //                  Use http://linas.org/art-gallery/escape/smooth.html
    //                  as reference.
    let z = new ComplexNumber(start_z.re, start_z.im);
    for(let i = 1; i <= max_iter; i++){
        z = f_c(z, c);
        const r = abs_c(z);
        if(r > 2){
            let mu = (i + 1) - Math.log(Math.log(r)) / Math.log(2);
            return mu;
        }
    }
    return max_iter;


}



/////////////////////////////
/////////  Colors  //////////
/////////////////////////////

function getColorForIter(iter, max_iter, color_scheme_index) {
    // find out which radio button is checked, i.e. which color scheme is picked
    let colorscheme;
    let radios = document.getElementsByName('colors');
    if (color_scheme_index == -1) {
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                colorscheme = radios[i].value;
                break;
            }
        }
    } else {
        colorscheme = radios[color_scheme_index].value;
    }

    // return color according to chosen color scheme
    let color = new Vec(128, 128, 128);


    if (iter >= max_iter) return new Vec(0, 0, 0);
    let t = Math.max(0, Math.min(1, iter / max_iter));
    
    if (colorscheme == "black & white") {
        // TODO 1.4a):      Return the correct color for the iteration count
        //                  stored in iter. Pixels corresponding to complex
        //                  numbers for which the sequence diverges should be
        //                  shaded white. Use the given parameter max_iter.

        if (iter == max_iter) {
            color = new Vec(0, 0, 0);
        } else {
            color = new Vec(255, 255, 255);
        }


    } else if (colorscheme == "greyscale") {
        // TODO 1.4b):      Choose a greyscale color according to the given
        //                  iteration count in relation to the maximum
        //                  iteration count. The more iterations are needed
        //                  for divergence, the darker the color should be.
        //                  Be aware of integer division!
        const v = Math.round(255 * (1 - t));
        return new Vec(v, v, v);


    } else if (colorscheme == "underwater") {
        // TODO 1.4b):      Choose a color between blue and green according
        //                  to the given iteration count in relation to the
        //                  maximum iteration count. The more iterations are
        //                  needed for divergence, the more green and less
        //                  blue the color should be.
        const g = Math.round(255 * t);
        const b = Math.round(255 * (1 - t));
        return new Vec(0, g, b);


    } else { // rainbow
        // TODO 1.4b):      Choose a rainbow color according to the given
        //                  iteration count in relation to the maximum
        //                  iteration count. Colors should change from cyan
        //                  (for very few needed iterations) over blue, violet, pink,
        //                  red, yellow and green back to cyan (for lots of
        //                  needed iterations). Use the HSV model and convert
        //                  HSV to RGB colors using function hsv2rgb.
        const hue = (180 + 360 * t) % 360;
        return hsv2rgb(new Vec(hue, 1, 1));

    }
    return color;
}

function hsv2rgb(hsv) {
    let h = hsv.r;
    let s = hsv.g;
    let v = hsv.b;

    if (s === 0) {
        const val = Math.round(v * 255);
        return new Vec(val, val, val);
    }

    h = (h % 360 + 360) % 360;
    const c  = v * s;
    const hp = h / 60;
    const x  = c * (1 - Math.abs((hp % 2) - 1));

    let r1=0, g1=0, b1=0;
    if      (0 <= hp && hp < 1) { r1=c; g1=x; b1=0; }
    else if (1 <= hp && hp < 2) { r1=x; g1=c; b1=0; }
    else if (2 <= hp && hp < 3) { r1=0; g1=c; b1=x; }
    else if (3 <= hp && hp < 4) { r1=0; g1=x; b1=c; }
    else if (4 <= hp && hp < 5) { r1=x; g1=0; b1=c; }
    else                        { r1=c; g1=0; b1=x; }

    const m = v - c;
    return new Vec(
        Math.round((r1 + m) * 255),
        Math.round((g1 + m) * 255),
        Math.round((b1 + m) * 255)
    );
}

/////////////////////////////////////
/////////  Canvas Fillers  //////////
/////////////////////////////////////

function mandelbrotSet(image, id, max_iter, color_scheme_index, use_naive_getIter) {
    for (let i = 0; i < 4 * image.width * image.height; i += 4) {
        let pixel = i / 4;
        let x = pixel % image.width;
        let y = image.height - pixel / image.width;
        let c = new ComplexNumberFromCoords(x, y, id, false);
        if (use_naive_getIter == null) {
            use_naive_getIter = false;
        }
        // select correct countInteraions verion for the current canvas
        let countIterations = use_naive_getIter ? countIterationsNaive : countIterationsNoBanding;

        // TODO 1.4a):      Replace the following line with the computation
        //                  of the Mandelbrot set. Use the countIterations() 
        //                  and getColorForIter() functions (keep in mind that
        //                  you will need to pass the given 'max_iter' and
        //                  'color_scheme_index' where required).

        let iterations = countIterations(new ComplexNumber(0,0), c, max_iter);


        let rgb = getColorForIter(iterations, max_iter, color_scheme_index);


        image.data[i] = rgb.r;
        image.data[i + 1] = rgb.g;
        image.data[i + 2] = rgb.b;
        image.data[i + 3] = 255;
    }
}

function juliaSet(image, id, max_iter, juliaC, color_scheme_index, use_naive_getIter) {
    for (let i = 0; i < 4 * image.width * image.height; i += 4) {
        let pixel = i / 4;
        let x = pixel % image.width;
        let y = image.height - pixel / image.width;
        let countIterations = use_naive_getIter ? countIterationsNaive : countIterationsNoBanding;

        // TODO 1.4d):      Replace the following line with the computation 
        //                  of the Julia set for c = juliaC (given parameter). 
        //                  Use the functions ComplexNumberFromCoords(),
        //                  countIterations() and getColorForIter().

        const z0 = new ComplexNumberFromCoords(x, y , id, true);
        const iter = countIterations(z0, juliaC, max_iter);
        const rgb = getColorForIter(iter, max_iter, color_scheme_index);


        image.data[i] = rgb.r;
        image.data[i + 1] = rgb.g;
        image.data[i + 2] = rgb.b;
        image.data[i + 3] = 255;
    }
}



///////////////////////////////
/////////  Renderers  //////////
///////////////////////////////

function RenderMandelbrotSet(canvas) {
    let max_iter = parseInt(canvas.getAttribute("var_max_iter"));
    let id = canvas.id;
    let color_scheme_index = (canvas.id == "mandelbrot_canvas") ? -1 : canvas.getAttribute("var_color_scheme_index");

    // get the canvas
    let ctx = canvas.getContext("2d");

    // create a new image
    let image = ctx.createImageData(canvas.width, canvas.height);

    // render Mandelbrot set
    mandelbrotSet(image, id, max_iter, color_scheme_index, canvas.use_naive_getIter);

    // write image back to canvas
    ctx.putImageData(image, 0, 0);
}

function RenderJuliaSet(canvas) {
    let max_iter = parseInt(canvas.getAttribute("var_max_iter"));
    let id = canvas.id;
    let juliaC = parseComplex(canvas.getAttribute("var_juliaC"));
    let color_scheme_index = (canvas.id == "julia_canvas") ? -1 : canvas.getAttribute("var_color_scheme_index");

    // get the canvas
    let ctx = canvas.getContext("2d");

    // create a new image
    let image = ctx.createImageData(canvas.width, canvas.height);

    // render Julia set
    juliaSet(image, id, max_iter, juliaC, color_scheme_index, canvas.use_naive_getIter);

    // write image back to canvas
    ctx.putImageData(image, 0, 0);
}

///////////////////////////////
//////////   "main"   /////////
///////////////////////////////


function setupMandelbrot(canvas) {
    // check for id of interactive canvas
    if (canvas.id == "mandelbrot_canvas") {
        // set special attributes required for interactive canvas
        canvas.setAttribute("var_dragging", false);
        canvas.setAttribute("var_lastPoint", str(new Vec(0,0)));

        // reset color scheme and maximum iteration number
        let radios = document.getElementsByName('colors');
        radios[0].checked = true;
        let slider = document.getElementById('slider');
        slider.value = 30;

         // add event listeners
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mouseup', onMouseUp, false);

        // TODO 1.4c):      Uncomment the following line to enable zooming.

        canvas.addEventListener('wheel', onMouseWheel, false);

        // make relevant function accessible to wrapper for testing callback implementation
        window.setupMandelbrot = setupMandelbrot;
        window.startMoveCanvas = startMoveCanvas;
        window.updateMoveCanvas = updateMoveCanvas;
        window.endMoveCanvas = endMoveCanvas;
    }

    // render set
    RenderMandelbrotSet(canvas);
}

function setupJulia(canvas) {
    // check for id of interactive canvas
    if(canvas.id == "julia_canvas") {
        canvas.setAttribute("var_firstLinePointSet", false);
        canvas.setAttribute("var_firstLinePoint", str(new Vec(0,0)));
        canvas.setAttribute("var_secondLinePoint", str(new Vec(0,0)));
        canvas.setAttribute("var_loopVariable", 0);
        canvas.looper = null;
    }

    // render the set
    RenderJuliaSet(canvas);
}

//////////////////////////////////////
//////////   Event Listeners   ///////
//////////////////////////////////////

function onMouseDown(e) {
    startMoveCanvas("mandelbrot_canvas", e.clientX, e.clientY, e.ctrlKey, e.shiftKey, document.getElementById("julia_canvas"));
}

function startMoveCanvas(mandel_canvas_id, mouse_x, mouse_y, ctrl = false, shift = false, julia_canvas = null) {
    let mandel_canvas = document.getElementById(mandel_canvas_id);
    let rect = mandel_canvas.getBoundingClientRect();
    let x = mouse_x - rect.left;
    let y = mouse_y - rect.top;
    y = mandel_canvas.height - y;

    if (julia_canvas != null && ctrl) {
        clearInterval(julia_canvas.looper);
        // choose and store new c for Julia set creation
        let juliaC = new ComplexNumberFromCoords(x, y, mandel_canvas_id, false);
        julia_canvas.setAttribute("var_juliaC", complexToString(juliaC));

        RenderJuliaSet(julia_canvas);
    } else if (julia_canvas != null && shift) {
        let firstLinePointSet = julia_canvas.getAttribute("var_firstLinePointSet") == "true";
        let firstLinePoint = parseVec(julia_canvas.getAttribute("var_firstLinePoint"));
        let secondLinePoint = parseVec(julia_canvas.getAttribute("var_secondLinePoint"));

        if (!firstLinePointSet) {
            firstLinePoint = new Vec(x, y);
            julia_canvas.setAttribute("var_firstLinePointSet", true);
            julia_canvas.setAttribute("var_firstLinePoint", str(firstLinePoint));
            RenderMandelbrotSet(mandel_canvas);
            clearInterval(julia_canvas.looper);
        } else {
            secondLinePoint = new Vec(x, y);
            julia_canvas.setAttribute("var_firstLinePointSet", false);
            julia_canvas.setAttribute("var_firstLinePoint", str(secondLinePoint));
            
            let c = document.getElementById(mandel_canvas_id);
            let ctx = c.getContext("2d");
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.moveTo(Math.round(firstLinePoint.x), mandel_canvas.height - Math.round(firstLinePoint.y));
            ctx.lineTo(Math.round(secondLinePoint.x), mandel_canvas.height - Math.round(secondLinePoint.y));
            ctx.stroke();

            // do not use setAttribute for looper, this will set it only as an object property but avoids casting to string
            julia_canvas.looper = setInterval(function() {juliaLoop(julia_canvas, mandel_canvas_id)}, 20);
            julia_canvas.setAttribute("var_loopVariable", 0);
        }

    } else {
        let dragging = false;
        let lastPoint = new Vec(0, 0);

        // TODO 1.4c):      Store the hit point (given as variables x and y) 
        //                  as pixel coordinates and start the dragging process. 
        //                  The variables dragging (bool) and lastPoint 
        //                  (two dimensional vector) are stored as 
        //                  canvas attributes below.
        dragging = true;
        lastPoint = new Vec(x,y);

        mandel_canvas.setAttribute("var_lastPoint", str(lastPoint));
        mandel_canvas.setAttribute("var_dragging", dragging);
    }
}

function juliaLoop(canvas, mandel_canvas_id) {
    let loopVariable = parseInt(canvas.getAttribute("var_loopVariable"));
    let firstLinePoint = parseVec(canvas.getAttribute("var_firstLinePoint"));
    let secondLinePoint = parseVec(canvas.getAttribute("var_secondLinePoint"));

    let alpha = 0.5 * Math.sin(loopVariable * 0.05) + 0.5; // oscillating between 0 and 1
    let juliaC = new ComplexNumberFromCoords((1 - alpha) * firstLinePoint.x + alpha * secondLinePoint.x, (1 - alpha) * firstLinePoint.y + alpha * secondLinePoint.y, mandel_canvas_id);
    canvas.setAttribute("var_juliaC", complexToString(juliaC));
    RenderJuliaSet(canvas);
    canvas.setAttribute("var_loopVariable", loopVariable + 1);
}


function onMouseMove(e) {
    updateMoveCanvas("mandelbrot_canvas", e.clientX, e.clientY);
}

function updateMoveCanvas(canvas_id, mouse_x, mouse_y) {
    let canvas = document.getElementById(canvas_id);
    let center = parseComplex(canvas.getAttribute("var_center"));
    let dragging = canvas.getAttribute("var_dragging") == "true";
    let lastPoint = parseVec(canvas.getAttribute("var_lastPoint"));

    if (dragging) {
        let rect = canvas.getBoundingClientRect();
        let x = mouse_x - rect.left;
        let y = mouse_y - rect.top;
        y = canvas.height - y;

        // TODO 1.4c):      Convert both last and current hit point to
        //                  their corresponding complex numbers, compute
        //                  their distance (also as a complex number) and
        //                  shift the plane accordingly. To do so, change
        //                  the variable center which is used to compute 
        //                  the complex number corresponding to a pixel.
        //
        //                  Also update lastPoint with the current point
        //                  to make movement more controllable.

        const lastC = new ComplexNumberFromCoords(lastPoint.x, lastPoint.y, canvas_id, false);
        const currC = new ComplexNumberFromCoords(x, y, canvas_id, false);
        const delta = sub_c(lastC, currC);
        center = add_c(center, delta);
        lastPoint = new Vec(x, y);


        // store new center and lastPoint
        canvas.setAttribute("var_center", complexToString(center));
        canvas.setAttribute("var_lastPoint", str(lastPoint)),

        // rerender image
        RenderMandelbrotSet(canvas);
    }
}

function onMouseUp(e) {
    endMoveCanvas("mandelbrot_canvas");
}
function endMoveCanvas(canvas_id) {
    let canvas = document.getElementById(canvas_id);
    // TODO 1.4c):      Prevent dragging of the plane once the mouse is
    //                  not pressed anymore.
    //                  You can set the 'var_dragging' variable of the
    //                  canvas by uncommenting the line below and replacing
    //                  <value> with the new dragging value.

    // canvas.setAttribute("var_dragging", <value>);
    canvas.setAttribute("var_dragging", false);

}

function onMouseWheel(e) {
    zoomCanvas("mandelbrot_canvas", e.wheelDelta, e.detail);
    // do not scroll the page
    e.preventDefault();
}

function zoomCanvas(canvas_id, wheelDelta, detail) {
    let canvas = document.getElementById(canvas_id);
    let zoom = parseFloat(canvas.getAttribute("var_zoom"));

    let delta = Math.max(-1, Math.min(1, (wheelDelta || -detail)));
    zoom = zoom + delta;
    canvas.setAttribute("var_zoom", zoom);
    // render
    RenderMandelbrotSet(canvas);
}

function onChangeMaxIter(mandelbrot_id, julia_id, value) {
    let mandel_canvas = document.getElementById(mandelbrot_id);
    let julia_canvas = document.getElementById(julia_id);
    mandel_canvas.setAttribute("var_max_iter", value);
    julia_canvas.setAttribute("var_max_iter", value);

    // render
    RenderMandelbrotSet(mandel_canvas);
    RenderJuliaSet(julia_canvas);
}

function onChangeColorScheme(mandelbrot_id, julia_id) {
    let mandel_canvas = document.getElementById(mandelbrot_id);
    let julia_canvas = document.getElementById(julia_id);
    // render
    RenderMandelbrotSet(mandel_canvas);
    RenderJuliaSet(julia_canvas);
}
/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

/**
 * computes the midpoint between a and b
 * @param {number[]} a - point with arbitrary dimension
 * @param {number[]} b - point with dimension like a
 * @returns {number[]} component wise center between a and b
 */
function midPoint(a, b) {
    let result = new Vec(...a);
    for (let i = 0; i < a.length; ++i) result[i] = 0.5 * (a[i] + b[i]);
    return result;
}

function Basic2a(canvas) {
    clearCanvas2d(canvas);
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    context.font = "bold 12px Georgia";
    context.textAlign = "center";

    // triangle - in camera space
    let triangle = [new Vec([0.5, -0.5, -1.0]), new Vec([0.0, 3.0, -4.0]), new Vec([-3.0, -1.0, -4.0])];

    // projection matrix
    let M = new Mat([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, -2.0, -1.0], [0.0, 0.0, -3.0, 0.0]);

    // TODO 6.2
    // Project triangle (Use the Mat.transformPoint function from num.js which performs homogenization, applies the matrix and dehomogenizes the result).
    // Then render the projected triangle instead of the original triangle!

    // 6.2a) Project triangle
    let triProjected = [
        M.transformPoint(triangle[0]),
        M.transformPoint(triangle[1]),
        M.transformPoint(triangle[2])
    ];

    // Draw projected triangle
    drawTriangle(context, canvasWidth, canvasHeight, triProjected, true);

    // Replace this dummy line!
    //rawTriangle(context, canvasWidth, canvasHeight, triangle, true);
}


function Basic2b(canvas) {
    clearCanvas2d(canvas);
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    context.font = "bold 12px Georgia";
    context.textAlign = "center";

    // triangle - in camera space
    let triangle = [new Vec([0.5, -0.5, -1.0]), new Vec([0.0, 3.0, -4.0]), new Vec([-3.0, -1.0, -4.0])];

    // projection matrix
    let M = new Mat([1.0, 0.0, 0.0, 0.0], [0.0, 1.0, 0.0, 0.0], [0.0, 0.0, -2.0, -1.0], [0.0, 0.0, -3.0, 0.0]);

    // TODO 6.2
    // 1. Project the triangle.

    // 2. Compute the midpoints of the edges (Use the helper function midPoint defined above!)
    //    and store them in another triangle.

    // 3. Draw the triangles (Set last argument to false for inner triangle!).
    
    let triProjected = [
        M.transformPoint(triangle[0]),
        M.transformPoint(triangle[1]),
        M.transformPoint(triangle[2])
    ];

    // 2. Compute midpoints (uncorrected centers) *after projection*
    let triInner = [
        midPoint(triProjected[0], triProjected[1]),
        midPoint(triProjected[1], triProjected[2]),
        midPoint(triProjected[2], triProjected[0])
    ];

    // 3. Draw triangles
    drawTriangle(context, canvasWidth, canvasHeight, triProjected, true);   // outer
    drawTriangle(context, canvasWidth, canvasHeight, triInner, false);      // inner




}


function Basic2c(canvas) {
    clearCanvas2d(canvas);
    let context = canvas.getContext("2d", { willReadFrequently: true });
    let W = canvas.width, H = canvas.height;

    let tri = [
        new Vec([0.5, -0.5, -1.0]),
        new Vec([0.0, 3.0, -4.0]),
        new Vec([-3.0, -1.0, -4.0])
    ];

    let M = new Mat(
        [1,0,0,0],
        [0,1,0,0],
        [0,0,-2,-1],
        [0,0,-3,0]
    );

    // 1. Convert to homogeneous and apply projection (no dehoming)
    let triH = tri.map(v => {
        let vh = new Vec([v[0], v[1], v[2], 1.0]);
        return M.mul(vh); // still 4D
    });

    // 2. Compute midpoints in homogeneous coords
    let innerH = [
        midPoint(triH[0], triH[1]),
        midPoint(triH[1], triH[2]),
        midPoint(triH[2], triH[0])
    ];

    // 3. Dehomogenize
    let triDehom = triH.map(v => v.dehom());
    let innerDehom = innerH.map(v => v.dehom());

    // 4. Draw
    drawTriangle(context, W, H, triDehom, true);
    drawTriangle(context, W, H, innerDehom, false);
}




/////////////////////////////////////
////////   Drawing Helpers   ////////
/////////////////////////////////////


function point(context, x, y, fillStyle) {
    context.fillStyle = fillStyle;
    context.beginPath();
    context.arc(x,y, 8, 0, 2 * Math.PI);
    context.fill();
}

function drawTriangle(context, canvasWidth, canvasHeight, trianglePoints, isOuterTriangle) {
    // draw triangle
    context.strokeStyle = 'rgb(0,0,0)';
    context.fillStyle = 'rgb(0,0,0)';
    context.beginPath();
    context.moveTo(canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[1][0] / 2.0), canvasHeight * (0.5 - trianglePoints[1][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[2][0] / 2.0), canvasHeight * (0.5 - trianglePoints[2][1] / 2.0));
    context.lineTo(canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0));
    context.stroke();

    if (isOuterTriangle) {
        point(context, canvasWidth * (0.5 - trianglePoints[0][0] / 2.0), canvasHeight * (0.5 - trianglePoints[0][1] / 2.0), 'rgb(255,0,0)');
        point(context, canvasWidth * (0.5 - trianglePoints[1][0] / 2.0), canvasHeight * (0.5 - trianglePoints[1][1] / 2.0), 'rgb(0,255,0)');
        point(context, canvasWidth * (0.5 - trianglePoints[2][0] / 2.0), canvasHeight * (0.5 - trianglePoints[2][1] / 2.0), 'rgb(0,0,255)');
    } else {
        context.fillStyle = 'rgb(100,100,100)';
        context.fill();
    }
}

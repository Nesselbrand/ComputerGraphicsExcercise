"use strict";

/////////////////////////////
//////////   helper   ///////
/////////////////////////////
function Point(x, y) {
    this.x = x;
    this.y = y;
}

function Triangle(pointA, pointB, pointC) {
    this.a = pointA;
    this.b = pointB;
    this.c = pointC;
}

function Viewport(width, height, x, y) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
}

function RenderTriangle(context, viewport, triangle, clear) {
    if (clear == undefined) clear = true;
    if (clear) {
        context.rect(viewport.x, viewport.y, viewport.width, viewport.height);
        context.stroke();
    }

    context.beginPath();
    context.moveTo(viewport.width * triangle.a.x + viewport.x, viewport.height * triangle.a.y + viewport.y);
    context.lineTo(viewport.width * triangle.b.x + viewport.x, viewport.height * triangle.b.y + viewport.y);
    context.lineTo(viewport.width * triangle.c.x + viewport.x, viewport.height * triangle.c.y + viewport.y);
    context.lineTo(viewport.width * triangle.a.x + viewport.x, viewport.height * triangle.a.y + viewport.y);
    context.fill();
}

function LinearTransformation(linearPart) {
    this.A = linearPart;
}

function ApplyLinearTransformation(linearTransf, point) {
    return new Point(linearTransf.A[0] * point.x + linearTransf.A[1] * point.y,
                     linearTransf.A[2] * point.x + linearTransf.A[3] * point.y)
}

function CompositeLinearTransformations(linearTransf2, linearTransf1) {
    return new LinearTransformation([linearTransf2.A[0] * linearTransf1.A[0] + linearTransf2.A[1] * linearTransf1.A[2], linearTransf2.A[0] * linearTransf1.A[1] + linearTransf2.A[1] * linearTransf1.A[3],
                                     linearTransf2.A[2] * linearTransf1.A[0] + linearTransf2.A[3] * linearTransf1.A[2], linearTransf2.A[2] * linearTransf1.A[1] + linearTransf2.A[3] * linearTransf1.A[3]]);
}

function AffineTransformation(linearPart, translPart) {
    this.A = linearPart;
    this.t = translPart;
}

function ApplyAffineTransformation(affineTransf, point) {
    return new Point(affineTransf.A[0] * point.x + affineTransf.A[1] * point.y + affineTransf.t[0],
                     affineTransf.A[2] * point.x + affineTransf.A[3] * point.y + affineTransf.t[1])
}


////////////////////////////
//////////   4a   //////////
////////////////////////////

function Basic4_1(canvas, operation, value) {
function Rotation(alpha) {
    const c = Math.cos(alpha), s = Math.sin(alpha);
    return new LinearTransformation([c, -s, s, c]);
}

function Scaling(scale) {
    return new LinearTransformation([scale, 0, 0, scale]);
}

function ShearingX(shearX) {
    // x' = x + k*y
    return new LinearTransformation([1, shearX, 0, 1]);
}


    if (canvas.id == "canvasBasic4_1") {
        clearCanvas2d(canvas)
        let context = canvas.getContext("2d", { willReadFrequently: true });
        context.font = "18px Arial";
        context.textAlign = "center";
        context.fillText("input triangle", 75, 140);
        let triangle = new Triangle(new Point(0.2, 0.2), new Point(0.8, 0.2), new Point(0.2, 0.8));
        RenderTriangle(context, new Viewport(150, 150, 0, 0), triangle, 'red');

        context.fillText("rotated triangle", 225, 140);
        let rot = Rotation(0.2);
        let triangleRot = new Triangle(ApplyLinearTransformation(rot, triangle.a),
                                        ApplyLinearTransformation(rot, triangle.b),
                                        ApplyLinearTransformation(rot, triangle.c));
        RenderTriangle(context, new Viewport(150, 150, 150, 0), triangleRot);

        context.fillText("scaled triangle", 375, 140);
        let scaling = Scaling(0.5);
        let triangleScaling = new Triangle(ApplyLinearTransformation(scaling, triangle.a),
                                            ApplyLinearTransformation(scaling, triangle.b),
                                            ApplyLinearTransformation(scaling, triangle.c));
        RenderTriangle(context, new Viewport(150, 150, 300, 0), triangleScaling);

        context.fillText("sheared triangle", 525, 140);
        let shearing = ShearingX(0.4);
        let triangleShearing = new Triangle(ApplyLinearTransformation(shearing, triangle.a),
                                            ApplyLinearTransformation(shearing, triangle.b),
                                            ApplyLinearTransformation(shearing, triangle.c));
        RenderTriangle(context, new Viewport(150, 150, 450, 0), triangleShearing);
    } else {
        clearCanvas2d(canvas)
        let context = canvas.getContext("2d", { willReadFrequently: true });

        let triangle = new Triangle(new Point(0.2, 0.2), new Point(0.8, 0.2), new Point(0.2, 0.8));
        let op;
        switch(operation) {
            case "rotate":
                op = Rotation(value);
                break;
            case "scale":
                op = Scaling(value);
                break;
            case "shear_x":
                op = ShearingX(value);
                break;
        }
        let transformed_triangle = new Triangle (ApplyLinearTransformation(op, triangle.a),
                                                ApplyLinearTransformation(op, triangle.b),
                                                ApplyLinearTransformation(op, triangle.c));
        RenderTriangle(context, new Viewport(canvas.width, canvas.height, 0, 0), transformed_triangle, false);
    }
}


////////////////////////////
//////////   4b   //////////
////////////////////////////

function Basic4_2(canvas, alpha, steps) {
    function ShearingX(shearX) {
        // TODO 3.4b)	Implement a linear transformation 
        //			    performing a shear along the x axis. 
        //              Replace the following code.
        return new LinearTransformation([1, 0, 0, 1]);
    }

function ShearingX(shearX) {
    return new LinearTransformation([1, shearX, 0, 1]);
}

function ShearingY(shearY) {
    return new LinearTransformation([1, 0, shearY, 1]);
}

function applyShearing1(triangle, alpha) {
    const k1 = -Math.tan(alpha / 2.0);
    const sx1 = ShearingX(k1);
    return new Triangle(
        ApplyLinearTransformation(sx1, triangle.a),
        ApplyLinearTransformation(sx1, triangle.b),
        ApplyLinearTransformation(sx1, triangle.c)
    );
}

function applyShearing2(triangle1, alpha) {
    const k2 = Math.sin(alpha);
    const sy = ShearingY(k2);
    return new Triangle(
        ApplyLinearTransformation(sy, triangle1.a),
        ApplyLinearTransformation(sy, triangle1.b),
        ApplyLinearTransformation(sy, triangle1.c)
    );
}

function applyShearing3(triangle2, alpha) {
    const k1 = -Math.tan(alpha / 2.0);
    const sx2 = ShearingX(k1);
    return new Triangle(
        ApplyLinearTransformation(sx2, triangle2.a),
        ApplyLinearTransformation(sx2, triangle2.b),
        ApplyLinearTransformation(sx2, triangle2.c)
    );
}


    if (canvas.id == "canvasBasic4_2") {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, 600, 150);
        context.font = "18px Arial";
        context.textAlign = "center";

        context.fillText("input triangle", 75, 140);
        let triangle = new Triangle(new Point(0.2, 0.2), new Point(0.8, 0.2), new Point(0.2, 0.8));
        RenderTriangle(context, new Viewport(150, 150, 0, 0), triangle);

        context.fillText("1. shearing", 225, 140);
        let triangle1 = applyShearing1(triangle, alpha);
        RenderTriangle(context, new Viewport(150, 150, 150, 0), triangle1);

        context.fillText("2. shearing", 375, 140);
        let triangle2 = applyShearing2(triangle1, alpha);
        RenderTriangle(context, new Viewport(150, 150, 300, 0), triangle2);

        context.fillText("3. shearing", 525, 140);
        let triangle3 = applyShearing3(triangle2, alpha);
        RenderTriangle(context, new Viewport(150, 150, 450, 0), triangle3);
    } else {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(255,255,255,1)'
        context.fill();
        context.fillStyle = 'rgba(0,0,0,1)'
        let triangle = new Triangle(new Point(0.2, 0.2), new Point(0.8, 0.2), new Point(0.2, 0.8));
        if (steps >= 1) {
            let triangle1 = applyShearing1(triangle, alpha);
            triangle = triangle1;
        }
        if (steps >= 2) {
            let triangle2 = applyShearing2(triangle, alpha);
            triangle = triangle2;
        }
        if (steps >= 3) {
            let triangle3 = applyShearing3(triangle, alpha);
            triangle = triangle3;
        }
        RenderTriangle(context, new Viewport(canvas.width, canvas.height, 0, 0), triangle, false);
    }
}


////////////////////////////
//////////   4c   //////////
////////////////////////////

function Basic4_3(canvas, transformations) {

function CompositeAffineTransformations(affineTransf2, affineTransf1) {
    // A = A2 * A1
    const a2 = affineTransf2.A, a1 = affineTransf1.A;
    const A = [
        a2[0]*a1[0] + a2[1]*a1[2],  a2[0]*a1[1] + a2[1]*a1[3],
        a2[2]*a1[0] + a2[3]*a1[2],  a2[2]*a1[1] + a2[3]*a1[3]
    ];
    // t = A2 * t1 + t2
    const t1 = affineTransf1.t, t2 = affineTransf2.t;
    const tx = a2[0]*t1[0] + a2[1]*t1[1] + t2[0];
    const ty = a2[2]*t1[0] + a2[3]*t1[1] + t2[1];
    return new AffineTransformation(A, [tx, ty]);
}


    let f1 = new AffineTransformation([Math.cos(Math.PI / 12), -Math.sin(Math.PI / 12), Math.sin(Math.PI / 12), Math.cos(Math.PI / 12)], [0.3, 0.0]);
    let f2 = new AffineTransformation([Math.cos(-Math.PI / 8), -Math.sin(-Math.PI / 8), Math.sin(-Math.PI / 8), Math.cos(-Math.PI / 8)], [0.0, 0.1]);
    let composite_f2_f1 = CompositeAffineTransformations(f2, f1);
    let composite_f1_f2 = CompositeAffineTransformations(f1, f2);

    if (canvas.id == "canvasBasic4_3") {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, 600, 150);
        context.font = "18px Arial";
        context.textAlign = "center";

        context.fillText("input triangle", 75, 140);
        let triangle = new Triangle(new Point(0.05, 0.2), new Point(0.65, 0.2), new Point(0.05, 0.8));
        RenderTriangle(context, new Viewport(150, 150, 0, 0), triangle);

        context.fillText("1. transf.", 225, 140);
        let triangle1 = new Triangle(   ApplyAffineTransformation(f1, triangle.a), 
                                        ApplyAffineTransformation(f1, triangle.b), 
                                        ApplyAffineTransformation(f1, triangle.c));
        RenderTriangle(context, new Viewport(150, 150, 150, 0), triangle1);

        context.fillText("1. then 2. transf.", 375, 140);
        let triangle2 = new Triangle(   ApplyAffineTransformation(f2, triangle1.a), 
                                        ApplyAffineTransformation(f2, triangle1.b), 
                                        ApplyAffineTransformation(f2, triangle1.c));
        RenderTriangle(context, new Viewport(150, 150, 300, 0), triangle2);

        context.fillText("composite transf.", 525, 140);
        let triangle3 = new Triangle(   ApplyAffineTransformation(composite_f2_f1, triangle.a), 
                                        ApplyAffineTransformation(composite_f2_f1, triangle.b), 
                                        ApplyAffineTransformation(composite_f2_f1, triangle.c));
        RenderTriangle(context, new Viewport(150, 150, 450, 0), triangle3);
    } else {
        let context = canvas.getContext("2d", { willReadFrequently: true });
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.rect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgba(255,255,255,1)'
        context.fill();
        context.fillStyle = 'rgba(0,0,0,1)'
        let triangle = new Triangle(new Point(0.05, 0.2), new Point(0.65, 0.2), new Point(0.05, 0.8));

        switch(transformations) {
            case "f1":
                let trianglef1 = new Triangle(ApplyAffineTransformation(f1, triangle.a), 
                                                ApplyAffineTransformation(f1, triangle.b), 
                                                ApplyAffineTransformation(f1, triangle.c));
                triangle = trianglef1;
                break;
            case "f2":
                let trianglef2 = new Triangle(ApplyAffineTransformation(f2, triangle.a), 
                                                ApplyAffineTransformation(f2, triangle.b), 
                                                ApplyAffineTransformation(f2, triangle.c));
                triangle = trianglef2;
                break;
            case "f1 f2":
                let trianglef1f2 = new Triangle(ApplyAffineTransformation(composite_f1_f2, triangle.a), 
                                                ApplyAffineTransformation(composite_f1_f2, triangle.b), 
                                                ApplyAffineTransformation(composite_f1_f2, triangle.c));
                triangle = trianglef1f2;
                break;
            case "f2 f1":
                let trianglef2f1 = new Triangle(ApplyAffineTransformation(composite_f2_f1, triangle.a), 
                                                ApplyAffineTransformation(composite_f2_f1, triangle.b), 
                                                ApplyAffineTransformation(composite_f2_f1, triangle.c));
                triangle = trianglef2f1;
                break;
        }
        RenderTriangle(context, new Viewport(canvas.width, canvas.height, 0, 0), triangle, false);
    }
}


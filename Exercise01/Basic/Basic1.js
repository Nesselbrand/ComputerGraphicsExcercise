"use strict"

/** __Draws a circle with {center, radius, color} on {canvas}__
 * 
 * @param {Vec} center - center of the circle
 * @param {number} radius - radius of the circle
 * @param {Vec} color - color of the circle
 */
function drawPixelwiseCircle(canvas, center, radius, color) {
    let context = canvas.getContext("2d");
    let img = context.createImageData(200, 200);

    //TODO 1.1a)      Copy the code from Example.js
    //                and modify it to create a 
    //                circle.

    let width = canvas.width;
    let height = canvas.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Pixelindex im 1D-Array (jeweils 4 Werte für RGBA)
            let i = 4 * (y * width + x);

            // Abstand vom Mittelpunkt
            let dx = x - center.x;
            let dy = y - center.y;
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
                // Pixel liegt im Kreis
                img.data[i + 0] = color.r; // Rot
                img.data[i + 1] = color.g; // Grün
                img.data[i + 2] = color.b; // Blau
                img.data[i + 3] = 255;     // Alpha (sichtbar)
            } else {
                // Hintergrund (weiß)
            }
        }
    }

    context.putImageData(img, 0, 0);
}

/** __Draws a circle with contour on {canvas}__
 * 
 * @param {Vec} center - center of the circle
 * @param {number} radius_inner - radius of the inner circle
 * @param {number} width_contour - width of the outer contour
 * @param {Vec} color_inner - color inside of the contour
 * @param {Vec} color_contour - color of the contour
 */
function drawContourCircle(canvas, center, radius_inner, width_contour, color_inner, color_contour) {
    const context = canvas.getContext("2d");
    const img = context.createImageData(canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;

    const rIn2 = radius_inner * radius_inner;
    const rOut = radius_inner + width_contour;
    const rOut2 = rOut * rOut;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = 4 * (y * width + x);

            const dx = x - center.x;
            const dy = y - center.y;
            const d2 = dx * dx + dy * dy; // Quadrat des Abstands

            if (d2 < rIn2) {
                // Innenfläche
                img.data[i + 0] = color_inner.r;
                img.data[i + 1] = color_inner.g;
                img.data[i + 2] = color_inner.b;
                img.data[i + 3] = 255;
            } else if (d2 < rOut2) {
                // Kontur (Ring)
                img.data[i + 0] = color_contour.r;
                img.data[i + 1] = color_contour.g;
                img.data[i + 2] = color_contour.b;
                img.data[i + 3] = 255;
            } else {
                // Hintergrund (schwarz)

            }
        }
    }

    context.putImageData(img, 0, 0);
}

/** __Draws a circle with a smooth contour on {canvas}__
 * 
 * @param {Vec} center - center of the circle
 * @param {number} radius_inner - radius of the inner circle
 * @param {number} width_contour - width of the outer contour
 * @param {Vec} color_inner - color inside of the contour
 * @param {Vec} color_contour - color of the contour
 * @param {Vec} color_background - color of the background
 */
function drawSmoothCircle(canvas, center, radius_inner, width_contour, color_inner, color_contour, color_background) {
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;

    const rIn = radius_inner;
    const rOut = radius_inner + width_contour;

    // 1-Pixel-breite Glättungsringe:
    const innerAA0 = rIn;   // Übergang inner -> contour: [rIn-1, rIn]
    const outerAA1 = rOut + 1;  // Übergang contour -> background: [rOut, rOut+1]

    // Hilfsfunktion: lineare Mischung c = (1-t)*a + t*b
    function mix(a, b, t) {
        t = Math.max(0, Math.min(1, t));
        return {
            r: Math.round((1 - t) * a.r + t * b.r),
            g: Math.round((1 - t) * a.g + t * b.g),
            b: Math.round((1 - t) * a.b + t * b.b)
        };
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = 4 * (y * width + x);
            const dx = x - center.x;
            const dy = y - center.y;

            // Euklidische Distanz (für lineare Interpolation sinnvoller als d^2)
            const d = Math.sqrt(dx * dx + dy * dy);

            let col;

            if (d < innerAA0) {
                // Klar innerhalb des Innenkreises
                col = color_inner;
                img.data[i + 0] = col.r;
                img.data[i + 1] = col.g;
                img.data[i + 2] = col.b;
                img.data[i + 3] = 255;
            } else if (d < rIn) {
                // 1-px Übergang: inner -> contour
                // d = innerAA0 .... rIn  -> t = 0 .... 1  (mehr Kontur je näher an rIn)
                const t = (d - innerAA0) / (rIn - innerAA0);
                col = mix(color_inner, color_contour, t);
                img.data[i + 0] = col.r;
                img.data[i + 1] = col.g;
                img.data[i + 2] = col.b;
                img.data[i + 3] = 255;
            } else if (d < rOut) {
                // Reine Konturzone (ohne Übergang)
                col = color_contour;
                img.data[i + 0] = col.r;
                img.data[i + 1] = col.g;
                img.data[i + 2] = col.b;
                img.data[i + 3] = 255;
            } else if (d < outerAA1) {
                // 1-px Übergang: contour -> background
                // d = rOut .... outerAA1 -> t = 0 .... 1  (mehr Hintergrund je weiter draußen)
                const t = (d - rOut) / (outerAA1 - rOut);
                col = mix(color_contour, color_background, t);
                img.data[i + 0] = col.r;
                img.data[i + 1] = col.g;
                img.data[i + 2] = col.b;
                img.data[i + 3] = 255;
            } else {
                // Klar außerhalb: Hintergrund
                col = color_background;
                img.data[i + 0] = col.r;
                img.data[i + 1] = col.g;
                img.data[i + 2] = col.b;
            }
        }
    }

    ctx.putImageData(img, 0, 0);
}


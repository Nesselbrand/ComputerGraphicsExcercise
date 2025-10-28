"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

// make changes for the interactive canvas persistent
var icanv_pixelScale = 10;
var icanv_line = new Line(new Point( 10 / icanv_pixelScale,  10 / icanv_pixelScale),
                          new Point(180 / icanv_pixelScale, 180 / icanv_pixelScale),
                          new Color(0, 0, 0));

//////////////
//// gui  ////
//////////////

// event listener for gui
function onChangePixelScale(value) {
    let canvas = document.getElementById("bresenham_canvas");
    // rescale line
    let s = icanv_pixelScale / value;
    let line = icanv_line;
    line.startPoint.x = line.startPoint.x * s;
    line.startPoint.y = line.startPoint.y * s;
    line.endPoint.x = line.endPoint.x * s;
    line.endPoint.y = line.endPoint.y * s;
    // set new scaling factor
    icanv_pixelScale = value;
    // rerender scene
    RenderCanvas1(canvas, icanv_line, icanv_pixelScale);
}

function onMouseDownCanvas1(e) {
    let canvas = document.getElementById("bresenham_canvas");
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    console.log("onMouseDownCanvas1: " + x + " " + y);

    let line = icanv_line;
    let pixelScale = icanv_pixelScale;
    // set new points
    if (e.ctrlKey) {
        line.endPoint.x = x / pixelScale;
        line.endPoint.y = y / pixelScale;
    } else {
        line.startPoint.x = x / pixelScale;
        line.startPoint.y = y / pixelScale;
    }

    // rerender image
    RenderCanvas1(canvas, icanv_line, icanv_pixelScale);
}


//////////////////////////////
//// bresenham algorithm  ////
//////////////////////////////

function bresenham(image, line, pixelScale) {
    // Integer-Koordinaten
    let x0 = Math.floor(line.startPoint.x);
    let y0 = Math.floor(line.startPoint.y);
    let x1 = Math.floor(line.endPoint.x);
    let y1 = Math.floor(line.endPoint.y);

    // Deltas und Schritt-Richtungen
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;

    // Fehlerterm (klassisch: err = dx - dy)
    let err = dx - dy;

    // Startkoordinaten
    let x = x0;
    let y = y0;

    // Anzahl der zu setzenden Pixel: längere Achse + 1 (inkl. Endpunkt)
    let nPixels = Math.max(dx, dy) + 1;

    for (let i = 0; i < nPixels; ++i) {
        // Pixel setzen
        setPixelS(image, new Point(x, y), line.color, pixelScale);

        // Ziel erreicht? (Sicherheitsabbruch, falls nPixels größer gewählt wurde)
        if (x === x1 && y === y1) break;

        // Fehler aktualisieren und Koordinaten je nach Fehler verschieben
        let e2 = 2 * err;
        if (e2 > -dy) {  // Schritt in x-Richtung
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {   // Schritt in y-Richtung
            err += dx;
            y += sy;
        }
    }
}


//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas1(canvas, line, pixelScale) {
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);
    clearImage(image);

    // draw line
    bresenham(image, line, pixelScale);

    // draw start and end point with different colors
    setPixelS(image, line.startPoint, new Color(255, 0, 0), pixelScale);
    setPixelS(image, line.endPoint, new Color(0, 255, 0), pixelScale);

    // show image
    context.putImageData(image, 0, 0);
}


function setupBresenham(canvas, red = new Vec(10,10), green = new Vec(180,180), pixelScale=10) {

    let new_line = new Line(new Point(red.x / pixelScale,  red.y / pixelScale),
                    new Point(green.x / pixelScale, green.y / pixelScale),
                    new Color(0, 0, 0));

    // execute rendering
    RenderCanvas1(canvas, new_line, pixelScale);

    // add event listener
    if (canvas.id == "bresenham_canvas") {
        canvas.addEventListener('mousedown', onMouseDownCanvas1, false);
    }
}

"use strict";

///////////////////////////
//// global variables  ////
///////////////////////////

// seedPoint for interactive Canvas persistent
var icanv_seedPoint = new Point(50, 50);

//////////////
//// gui  ////
//////////////

// event listener for gui
function onMouseDownCanvas2(e) {
    let canvas = document.getElementById("floodfill_canvas");
    let rect = canvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    console.log("onMouseDownCanvas2: " + x + " " + y);

    // set new seed point
    icanv_seedPoint.x = Math.floor(x);
    icanv_seedPoint.y = Math.floor(y);

    // rerender image
    RenderCanvas2(canvas, icanv_seedPoint);
}


///////////////////////////////
//// flood fill algorithm  ////
///////////////////////////////
function floodFill4(image, pixel, fillColor) {
    // Starte rekursives Flood-Fill ab dem Seed
    recursiveFloodFill(image, pixel.x, pixel.y, fillColor);
}

function recursiveFloodFill(image, x, y, fillColor) {
    const p = new Point(x, y);
    const c = getPixel(image, p);   // kann null sein (außerhalb)

    if (!c) return;
    if (c.r === fillColor.r && c.g === fillColor.g && c.b === fillColor.b) return;

    // Pixel einfärben
    setPixel(image, p, fillColor);

    recursiveFloodFill(image, x + 1, y, fillColor);
    recursiveFloodFill(image, x - 1, y, fillColor);
    recursiveFloodFill(image, x, y + 1, fillColor);
    recursiveFloodFill(image, x, y - 1, fillColor);
}

//////////////////////////
//// render function  ////
//////////////////////////

function RenderCanvas2(canvas, seedPoint) {
    // draw something onto the canvas
    let context = canvas.getContext("2d");
    let image = context.createImageData(canvas.width, canvas.height);
    clearImage(image);

    let inc = 1;
    for (let i = 1; i < 20; i += inc) {
        for (let j = 0; j < 200; j++) {
            setPixel(image, new Point(i * 10, j), new Color(255, 0, 0));
            setPixel(image, new Point(j, i * 10), new Color(255, 0, 0));
        }
        inc++;
    }

    // flood fill
    floodFill4(image, seedPoint, new Color(255, 0, 0));


    // show image
    context.putImageData(image, 0, 0);
}

function setupFloodFill(canvas, seedPoint=new Vec(50,50)) {
    // execute rendering
    RenderCanvas2(canvas, new Point(seedPoint.x, seedPoint.y));
    // add event listener
    if (canvas.id == "floodfill_canvas") {
        canvas.addEventListener('mousedown', onMouseDownCanvas2, false);
    }
}

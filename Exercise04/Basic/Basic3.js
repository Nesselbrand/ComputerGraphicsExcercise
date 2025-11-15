
/////////////////////////
////////   4.3   ////////
/////////////////////////

/**
 * @param {number} index - linearized image index 
 * @param {number[][]} images - array of circle images
 * @param {number[]} alphas - respective alpha values
 * @returns {number[]} - triple [r,g,b] of resulting color, each in range [0,255]
 */
 function doAlphaBlending(index, images, alphas) {
    // TODO 4.3:    Compute the blended color (as an array of 3 values
    //              in the interval [0, 255]) for one pixel
    //              of the resulting image. "images" is the array
    //              of circle images from left to right, "alphas"
    //              contains the respective alpha values. "index"
    //              is the linearized index for the images, so for
    //              example with images[2][index + 1] you can address
    //              the green color channel of the current pixel 
    //              in the third image.

    // 1. Set up a color as a return value, and initialize it with the 
    //    desired background color.

    // 2. Loop over the four circle images in the correct order to blend
    //    them one after another.

        // 3. Compute the resulting alpha value for the current pixel.
        //    If it is a background pixel of the current image (denoted
        //    with a zero alpha channel value), it should not contribute to the
        //    resulting image. Otherwise, it should contribute with the 
        //    alpha value given through the 'alphas' array.

        // 4. Compute the resulting color using alpha blending in all
        //    three color channels.

    // 5. Return the resulting color. Replace the following dummy line.
    return new Vec(255, 255, 255);
}


function Basic3(canvas, alphas_images_index) {
    let interactive = canvas.id == "canvasBasic3";
    let alphas_arr = [[0.5, 0.5, 0.5, 0.5],
                      [0.5, 0.5, 0.5, 0.5],
                      [1, 0.6, 0.7, 0.8]];

    // alpha values for the current subtask
    let alphas = alphas_arr[alphas_images_index];

    if (interactive) {
        // setup default values and event listeners
        let sliders = document.getElementsByName("alpha");
        for (let slider of sliders) {
            slider.addEventListener("change",onChangeAlpha);
            slider.value = 0.5;
            slider.canvas_id = canvas.id;
        }
        let srcImages = document.getElementsByName("srcImage");
        for (let img of srcImages) {
            img.addEventListener("drop",drop);
            img.addEventListener("dragover",allowDrop);
            img.children[0].addEventListener("dragstart",drag);
        }
    }

    // render
    render();

    function render() {
        let context = canvas.getContext('2d', { willReadFrequently: true });

        let img = context.createImageData(canvas.width, canvas.height);
        
        clearImage(img);

        let images_arr = [[getImageInContainer("div0"),
                           getImageInContainer("div1"),
                           getImageInContainer("div2"),
                           getImageInContainer("div3")],
                          [getImageById("blue-circle"),
                           getImageById("red-circle"),
                           getImageById("yellow-circle"),
                           getImageById("green-circle")],
                          [getImageById("green-circle"),
                           getImageById("blue-circle"),
                           getImageById("yellow-circle"),
                           getImageById("red-circle")]];
        
        let images = images_arr[alphas_images_index];

        // walk over the canvas image and set the blended color for each pixel
        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                // compute the linearized index for the image data array
                let i = 4 * (x + canvas.width * y);
                // compute the blended color using the index, the four circle images and the alpha values
                let color = doAlphaBlending(i, images, alphas);
                // set the color accordingly, alpha value is always 255
                img.data[i] = color.r;
                img.data[i + 1] = color.g;
                img.data[i + 2] = color.b;
                img.data[i + 3] = 255;
            }
        }

        context.putImageData(img, 0, 0);
    }

    function getImageInContainer(container) {
        let image = document.getElementById(container).children[0];
        let c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        clearCanvas2d(c, [255,255,255,0]);
        c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
        let data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        return data;
    }

    function getImageById(id) {
        let image = document.getElementById(id);
        let c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        clearCanvas2d(c, [255,255,255,0]);
        c.getContext('2d').drawImage(image, 0, 0, c.width, c.height);
        let data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        return data;
    }

    //////////////////////////
    ///// Event Listener /////
    //////////////////////////

    /**
     * @param {string} id - id ending in a single digit decimal number
     * @returns {number} single digit decimal number
     */
    function getIndex(id){ return -(-id[id.length-1]);  }

    function onChangeAlpha(ev) {
        // expecting id "alpha0" to "alpha3"
        alphas_arr[0][getIndex(this.id)] = this.value;
        render();
    }

    function allowDrop(ev) {
        ev.preventDefault();
    }

    function drag(ev) {
        ev.dataTransfer.setData("src", ev.target.id);
    }

    function drop(ev) {
        ev.preventDefault();
        let id = ev.dataTransfer.getData("src");

        let src = document.getElementById( id );
        let srcParent = src.parentNode;
        let tgt = ev.currentTarget.firstElementChild;

        // expecting id "div0" to "div4"
        let a = getIndex(srcParent.id);
        let b = getIndex(tgt.parentNode.id);

        let sliders = document.getElementsByName("alpha");
        let tmp = alphas_arr[0][a];
        alphas_arr[0][a] = alphas_arr[0][b];
        sliders[a].value = sliders[b].value;
        alphas_arr[0][b] = tmp;
        sliders[b].value = tmp;

        ev.currentTarget.replaceChild(src, tgt);
        srcParent.appendChild(tgt);

        render();
    }
}

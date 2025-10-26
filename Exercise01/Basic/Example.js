"use strict"

function drawIntoCanvas(canvas) {
	console.log("This is an exemplary log!");
	let context = canvas.getContext("2d");
	

	// "img.data" is a 1D array of size 200*200*4, containing the rgba pixel data in uint8 format.
	// The image data layout is [height, width, channel], i.e. [200, 200, 4] in this case.
	// For example, "img.data[842]" accesses the blue channel of the 10th pixel in the second row of the image.
	// (0, 0) corresponds to the top left corner of the canvas. 
	let img = context.createImageData(200, 200);

	// 'height' and 'width' are properties of the canvas object and can be referenced as seen below.
	let width = canvas.width;
	let height = canvas.height;

	// we store colors as vectors, you can access the elements like arrays (e.g. color[0]) or using .r/.g/.b or .x/.y/.z
	// all of these access the same value, as shown in the loop below.
	let color = new Vec(100, 200, 255);

	for (let i = 0; i < 4 * width * height; i += 4) {
		img.data[i + 0] = color.r;	// access with r(ed), g(reen), b(lue) and a(lpha)
		img.data[i + 1] = color.y;	// access with x, y, z and w
		img.data[i + 2] = color[2]; // access like an array
		img.data[i + 3] = 255;
	}

	context.putImageData(img, 0, 0);
}

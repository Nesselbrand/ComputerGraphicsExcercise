"use strict";

function binaryErrorMap(canvas_data, canvas_size, is_canvas_gl, img_data, diff_map_data, epsilon, metric_func) {
    let num_error_pixels = 0
    for (let i = 0; i < 4 * canvas_size.x * canvas_size.y; i += 4) {
        let idx = is_canvas_gl ? (canvas_size.y - 1) * canvas_size.x * 4 - i + 2 * (i % (canvas_size.x * 4)) : i;
        // check diff of rgb channels (ignore alpha until there is a reason not to)
        let loss_r = metric_func(canvas_data[idx + 0], img_data.data[i + 0]);
        let loss_g = metric_func(canvas_data[idx + 1], img_data.data[i + 1]);
        let loss_b = metric_func(canvas_data[idx + 2], img_data.data[i + 2]);
        let has_error = loss_r > epsilon || loss_g > epsilon || loss_b > epsilon;
        num_error_pixels += has_error ? 1 : 0;
        diff_map_data.data[i + 0] = has_error ? 255 : 0;
        diff_map_data.data[i + 1] = has_error ? 255 : 0;
        diff_map_data.data[i + 2] = has_error ? 255 : 0;
        diff_map_data.data[i + 3] = 255;
    }

    return [num_error_pixels, diff_map_data];
}

function linearErrorMap(canvas_data, canvas_size, is_canvas_gl, img_data, diff_map_data, epsilon, error_scale, metric_func) {
    let num_error_pixels = 0
    for (let i = 0; i < 4 * canvas_size.x * canvas_size.y; i += 4) {
        let idx = is_canvas_gl ? (canvas_size.y - 1) * canvas_size.x * 4 - i + 2 * (i % (canvas_size.x * 4)) : i;
        // check diff of rgb channels (ignore alpha until there is a reason not to)
        let loss_r = metric_func(canvas_data[idx + 0], img_data.data[i + 0]);
        let loss_g = metric_func(canvas_data[idx + 1], img_data.data[i + 1]);
        let loss_b = metric_func(canvas_data[idx + 2], img_data.data[i + 2]);
        let has_error = loss_r > epsilon || loss_g > epsilon || loss_b > epsilon;
        num_error_pixels += has_error ? 1 : 0;
        diff_map_data.data[i + 0] = loss_r * error_scale;
        diff_map_data.data[i + 1] = loss_g * error_scale;
        diff_map_data.data[i + 2] = loss_b * error_scale;
        diff_map_data.data[i + 3] = 255;
    }

    return [num_error_pixels, diff_map_data];
}

/** Computes L1 (or the Absolute Error) of two values a and b
 * 
 * @param {Float} a 
 * @param {Float} b 
 * @returns |a - b|
 */
function l1(a, b) {
    return Math.abs(a - b);
}

/** Computes L2 (or the Squared Error) of two values a and b
 * 
 * @param {Float} a 
 * @param {Float} b 
 * @returns (a - b)**2
 */
function l2(a, b) {
    return (a - b)**2;
}

function write_eval_points(node, points, num_error_pixels, num_pixels, eps = 1e-8) {
    // var ex_nr = node.getAttribute("ex-nr")
    var task_nr = node.getAttribute("task-nr");
    var subtask_nr = node.getAttribute("subtask-nr");
    var testcase_nr = node.getAttribute("testcase-nr");

    let awarded_points = points
    // decide if points are awarded
    if (num_error_pixels > num_pixels) {
        awarded_points = 0;
    }

    var error_pixel_value = document.querySelector('[type="error-pixel-value"][task-nr="' + task_nr + '"][subtask-nr="' + subtask_nr + '"][testcase-nr="' + testcase_nr + '"]');
    error_pixel_value.textContent = num_error_pixels;
    var error_pixel_max = document.querySelector('[type="error-pixel-max"][task-nr="' + task_nr + '"][subtask-nr="' + subtask_nr + '"][testcase-nr="' + testcase_nr + '"]');
    error_pixel_max.textContent = num_pixels;

    // write points to data struct
    window.eval_point_data.get(task_nr).get(subtask_nr).set(testcase_nr, awarded_points);
}

function saveCanvasBinary(img, canvas_data, submission_canvas_id) {
  const submission_canvas = document.getElementById(submission_canvas_id);
  const header = new Uint32Array([submission_canvas.width, submission_canvas.height]);
  const combined = new Uint8Array(header.byteLength + canvas_data.data.byteLength);
  combined.set(new Uint8Array(header.buffer), 0);
  combined.set(canvas_data.data, header.byteLength);

  const blob = new Blob([combined], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = img.id + ".bin";
  a.click();

  URL.revokeObjectURL(url);
}

function saveGLCanvasBinary(img, canvas_data, submission_canvas_id) {
  const canvas = document.getElementById(submission_canvas_id)
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  const width = canvas.width;
  const height = canvas.height;

  // Flip Y (WebGL's origin is bottom-left, Canvas is top-left)
  const rowStride = width * 4;
  const flipped = new Uint8ClampedArray(canvas_data.length);
  for (let y = 0; y < height; y++) {
    const src = y * rowStride;
    const dst = (height - 1 - y) * rowStride;
    flipped.set(canvas_data.subarray(src, src + rowStride), dst);
  }

  // Put into a 2D canvas so we can access data
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  const ctx = tmpCanvas.getContext("2d");
  const imageData = new ImageData(flipped, width, height);
  ctx.putImageData(imageData, 0, 0);

  const header = new Uint32Array([width, height]);
  const combined = new Uint8Array(header.byteLength + flipped.byteLength);
  combined.set(new Uint8Array(header.buffer), 0);
  combined.set(flipped, header.byteLength);

  const blob = new Blob([combined], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = img.id + ".bin";
  a.click();

  URL.revokeObjectURL(url);
}

// save color in sessionStorage of Browser
var savedColor = sessionStorage.getItem('color') || 'binary';

function changeColor(type) {
    const radios = document.querySelectorAll('input[name="diff-canvas-colors"]');
    let color;
    radios.forEach(radio => {
        if (radio.checked && radio.getAttribute("ex") == type) { // only consider the ex whose radio was pressed
            color = radio.value;
        }
    });
    sessionStorage.setItem('color', color);
    location.reload();
}

// set color value with radio buttons
var radios = document.querySelectorAll('input[name="diff-canvas-colors"]');
radios.forEach(radio => {
    if (radio.value === savedColor) {
        radio.checked = true;
    }
    radio.addEventListener('change', function(e) {changeColor(e.target.getAttribute("ex"))});
});

/** Writes a binary or greyscale error map to the provided canavs
 * 
 * @param {Canvas} diff_map_canvas
 * The canvas that will hold the difference map
 * 
 * @param {Canvas} submission_canvas
 * The canvas that will hold the difference map
 * 
 * @param {String} solution_img_id
 * The element id of the target image
 * 
 * @param {float} points
 * The amount of points that will be awarded when this canvas is deemed 'correct'
 * 
 * @param {float} error_pixel_threshold
 * How many pixels may be incorrect while the submission is still graded as 'correct'.
 * 
 * Values less then 1.0 are interpreted as percentage, e.g. 0.01 means 1% of pixels may be wrong.
 * 
 * Values of 1 or greater are interpreted as an absolute number of pixels, e.g. 200 will result in 200 pixels leniency.
 * 
 * @param {boolean} is_shader_canvas
 * Whether the canvas is a 2d canvas (false) or a gl canvas (true)
 * 
 * @param {{"l1", "l2"}} metric
 * What error metric should be used to calculate the error of a pixel.
 */
function errorMap(diff_map_canvas, submission_canvas_id, solution_img_id, points=1.0, error_pixel_threshold=0.05, is_shader_canvas=true, metric="l1") {

	// create new canvas to hold the solution image data for comparison
  var img_to_canvas = document.createElement('canvas');
  var img_context = img_to_canvas.getContext('2d');
  var img = document.getElementById(solution_img_id);

  let width = parseInt(img.getAttribute("width"));
  let height = parseInt(img.getAttribute("height"));

  img_to_canvas.width = width;
  img_to_canvas.height = height;
  img_context.drawImage(img, 0, 0);
	
  var img_data = img_context.getImageData(0, 0, width, height);
  
	// store student submission canvas data for comparison
	var submission_canvas = document.getElementById(submission_canvas_id);
  var canvas_data;
  if (is_shader_canvas) {
    let gl = submission_canvas.getContext("experimental-webgl", { preserveDrawingBuffer: true , antialias: false});
    canvas_data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, canvas_data);
  } else {
    canvas_data = submission_canvas.getContext('2d').getImageData(0, 0, width, height);
  }

  // set to true if you want to download solution image/binary (change the called function and the canvas_id)
  let save_to_bin_list = window.saveIDsToBinaryList
	if (false && save_to_bin_list.includes(submission_canvas_id)) {
		console.log("Saving " + submission_canvas_id)
        saveCanvasBinary(img, canvas_data, submission_canvas_id);
	}
  let save_to_png_list = window.saveGLIDsToImageList
	if (false && save_to_png_list.includes(submission_canvas_id)) {
		console.log("Saving " + submission_canvas_id)
		saveGLCanvasBinary(img, canvas_data, submission_canvas_id)
	}
  
	// setup the canvas that will hold the error map
  var diff_map_context = diff_map_canvas.getContext('2d')
  var diff_map_data = diff_map_context.createImageData(width, height);
	
	let canvas_size = new Vec(width, height);
  let metric_func = (metric == 'l1') ? l1 : l2
  let color = sessionStorage.getItem('color') || 'binary';
  let epsilon = is_shader_canvas ? 1 : 0;
  let error_scale = sessionStorage.getItem("settings-linear-scale") || 1.0;
  let num_error_pixels;
  if (color == "binary" ) {
		// unfortunatly gl-canvas data is stored in canvas_data, while 2d context stores it in canvas_data.data, therefore differentiate
    [num_error_pixels, diff_map_data] = binaryErrorMap(is_shader_canvas ? canvas_data : canvas_data.data, canvas_size, is_shader_canvas, img_data, diff_map_data, epsilon, metric_func);
  } else {
    [num_error_pixels, diff_map_data] = linearErrorMap(is_shader_canvas ? canvas_data : canvas_data.data, canvas_size, is_shader_canvas, img_data, diff_map_data, epsilon, error_scale, metric_func);
  }

  diff_map_context.putImageData(diff_map_data, 0, 0);

	// grade this exercise by writing to the golbal point struct
  var num_pixels = width * height;
  let error_pixel_max = Math.floor((error_pixel_threshold >= 1) ? error_pixel_threshold : num_pixels * error_pixel_threshold)
  write_eval_points(diff_map_canvas, points, num_error_pixels, error_pixel_max, epsilon)
}



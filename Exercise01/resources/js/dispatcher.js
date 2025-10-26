/** This script is responsible for calling the student scripts. 
 *  This abstraction layer exists, because some exercises have dynamic paramters (e.g. via sliders),
 *  that would have to be read from the student's function if not for this script.
 *  Of course this means that this file needs to be adjusted for each and all tasks/exercises to provide specific parameters if necessary
 * 
 *  ### USAGE:
 *  Each function that is called from within the html (or rather sheet.js) file will check whether there exists a function in this file that has an identical name.
 *  If so, it will call that function with all the available parameters before the actual script.
 *  Therfore, modifications can be made by creating a function here that matches the name and returns the additional parameters.
 *  If no such modifications are rquired, the function can be omitted. It is recommended to parse the arguments here as well.
 *  
 *  NOTE that returning [] will cause the script to not be called
 */ 

const functionMapper = {
  // Basic 1-1
  drawPixelwiseCircle: async args => {
    let canvas = args[0]
    let center = parseVec(args[1])
    let radius = parseFloat(args[2])
    let color = parseVec(args[3])
    return [canvas, center, radius, color]
  },
  // Basic 1-2
  drawContourCircle: async args => {
    let canvas = args[0]
    let center = parseVec(args[1])
    let radius_inner = parseFloat(args[2])
    let width_contour = parseFloat(args[3])
    let color_inner = parseVec(args[4])
    let color_contour = parseVec(args[5])
    return [canvas, center, radius_inner, width_contour, color_inner, color_contour]
  },
  // Basic 1-3
  drawSmoothCircle: async args => {
    let canvas = args[0]
    let center = parseVec(args[1])
    let radius_inner = parseFloat(args[2])
    let width_contour = parseFloat(args[3])
    let color_inner = parseVec(args[4])
    let color_contour = parseVec(args[5])
    let color_background = parseVec(args[6])
    return [canvas, center, radius_inner, width_contour, color_inner, color_contour, color_background]
  },
  // Basic 2
  drawArcCircle: async args => {
    let canvas = args[0]
    let center_blank = parseVec(args[1])
    let center_contour = parseVec(args[2])
    let radius_blank = parseFloat(args[3])
    let radius_contour_inner = parseFloat(args[4])
    let width_contour = parseFloat(args[5])
    let color_blank = parseVec(args[6])
    let color_contour_inner = parseVec(args[7])
    let color_contour_contour = parseVec(args[8])
    return [canvas, center_blank, center_contour, radius_blank, radius_contour_inner, width_contour, color_blank, color_contour_inner, color_contour_contour]
  },
  // Basic 3 is html

  // compare.js
  errorMap: async args => {
    let diff_map_canvas = args[0]
    let submission_canvas_id = args[1]
    let solution_img_id = args[2]
    let points = (args.length > 3) ? parseFloat(args[3]) : 1.0
    let error_pixel_threshold_perc = (args.length > 4) ? parseFloat(args[4]) : 0.05
    let shader_canvas = (args.length > 5) ? args[5] == "true" : false
    let metric = (args.length > 6) && (args[6] == 'l1' || args[6] == 'l2') ? args[6] : 'l1'

    let task_nr = diff_map_canvas.getAttribute("task-nr")
    let subtask_nr = diff_map_canvas.getAttribute("subtask-nr")
    
    if (task_nr == 3) {  
      // load solution from file (binary for precision)
      const new_canvas_id = "sol3a-1-bin"
      const canvas = document.createElement('canvas');
      canvas.id = new_canvas_id;
      canvas.style.display = 'none';
      canvas.width = 200; // Your SVG viewBox size
      canvas.height = 200;
      document.body.appendChild(canvas);
      await loadCanvasFromBinary("images/sol3a-1.bin", new_canvas_id);

      // fill solution canvas
      const img_canvas = document.getElementById(solution_img_id);
      const img_ctx = img_canvas.getContext('2d')
      img_ctx.drawImage(canvas, 0, 0)


      // special handing of IFRAME (copy data to canvas for comparison) (danke ChatGPT)
      let submission_canvas = document.getElementById(submission_canvas_id);
      let new_id = "iframe_canvas"
      const iframeDoc = submission_canvas.contentDocument || submission_canvas.contentWindow.document;
      const svgElement = iframeDoc.querySelector('svg');
      if (svgElement) {
        // Step 2: Serialize SVG into a string
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        // Step 3: Create an image from the SVG string
        const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
        const url = URL.createObjectURL(svgBlob);
    
        const img = new Image();

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        
        // Step 4: Create a canvas
        const canvas = document.createElement('canvas');
        canvas.id = new_id;
        canvas.style.display = 'none';
        canvas.width = 200; // Your SVG viewBox size
        canvas.height = 200;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        document.body.appendChild(canvas);

        // Step 5: Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Free memory
        URL.revokeObjectURL(url);
        
        // pass canvas instead of IFrame
        let new_args = [diff_map_canvas, new_id, solution_img_id, points, error_pixel_threshold_perc, shader_canvas, metric]
        if (points != -1) new_args.push(points)
        return new_args
      } else {
        console.error('SVG not found in iframe');
        return []
      }
    } else {
      const img_canvas = document.getElementById(solution_img_id);
      // load solution from file (binary for precision)
      const new_canvas_id = solution_img_id + "_gen"
      const canvas = document.createElement('canvas');
      canvas.id = new_canvas_id;
      canvas.style.display = 'none';
      canvas.width = img_canvas.width;
      canvas.height = img_canvas.heigth;
      document.body.appendChild(canvas);
      
      // fill solution canvas
      const src = img_canvas.getAttribute("src")
      await loadCanvasFromBinary(src, new_canvas_id);
      const img_ctx = img_canvas.getContext('2d')
      img_ctx.drawImage(canvas, 0, 0)

      return [diff_map_canvas, submission_canvas_id, solution_img_id, points, error_pixel_threshold_perc, shader_canvas, metric]
    }
    return [diff_map_canvas, submission_canvas_id, solution_img_id, points, error_pixel_threshold_perc, shader_canvas, metric]
  },

  // Advanced
  setupMandelbrot: async args => {
    let canvas = args[0]
    let max_iter = args[1]
    let center = args[2]
    let zoom = args[3]
    if (args.length > 4) {
      let color_scheme_index = args[4]
      canvas.setAttribute("var_color_scheme_index", color_scheme_index)
    }
    
    canvas.setAttribute("var_max_iter", max_iter)
    canvas.setAttribute("var_center", center)
    canvas.setAttribute("var_zoom", zoom)
    // instead of new param look for digit assuming canvases are named 'canvas4-y-z', with y being the subtask and z the testcase
    // bandaid solution but easily convertable later
    let isTask1 = canvas.id[7] == "a"
    canvas.use_naive_getIter = isTask1
    
    return [canvas]
  },
  setupJulia: async args => {
    let canvas = args[0]
    let max_iter = args[1]
    let juliaC = args[2]
    if (args.length > 3) {
      let color_scheme_index = args[3]
      canvas.setAttribute("var_color_scheme_index", color_scheme_index)
    }
    
    canvas.setAttribute("var_max_iter", max_iter)
    canvas.setAttribute("var_juliaC", juliaC)
    let isTask1 = canvas.id[6] == "1"
    canvas.use_naive_getIter = isTask1
    
    return [canvas]
  },
  testCallbackImplementation: async args => {
    let canvas = args[0]
    let max_iter = args[1]
    let center = args[2]
    let zoom = args[3]
    let color_scheme_index = args[4]
    let start = parseVec(args[5])
    let end = parseVec(args[6])
    let split = args[7] == "true"
    let testEnd = args[8] == "true"
    
    canvas.setAttribute("var_max_iter", max_iter)
    canvas.setAttribute("var_center", center)
    canvas.setAttribute("var_zoom", zoom)
    canvas.setAttribute("var_color_scheme_index", color_scheme_index)
    let isTask1 = canvas.id[8] == "1"
    canvas.use_naive_getIter = isTask1


    return [canvas, start, end, split, testEnd]
  }
}

// Trying to add scripts at runtime, with a built in dependency. Check if this works, else try setting all the dependencies up in a loop
async function dispatch_call(id, dep_id, container, chain_promise = null) {
  let node = document.querySelector('[data-call-id=call' + id + ']')
  let name = node.getAttribute("data-call")
  let src = node.getAttribute("data-call-src")
  let num_params = node.getAttribute("data-call-num-p")
  let next_id = (!node.getAttribute("data-call-next-dep") ? -1 : node.getAttribute("data-call-next-dep"))
  //console.log("Dispatching: " + id + " (prev: " + dep_id + "; next: " + next_id + ")")

  // default loading behaviour, in case functionMapper doesn't contain the function
  let args = []
  args.push(node)
  for (let p = 0; p < num_params; p++) {
    args.push(node.getAttribute(`data-call-p${p}`));
  }
  if (functionMapper[name]) {
    args = await Promise.resolve(functionMapper[name](args))
  }
  if (args.length > 0) {
    await Promise.resolve(add_script(src, name, args, node, next_id, dep_id, id, container, chain_promise))
  } else {
    // Stop waiting if script is never going to be executed
    chain_promise.resolve()
  }
}

async function add_script(src, name, args, node, next_id, dep_id, id, container, chain_promise) {
  let script = document.createElement("script")
  script.setAttribute("type", "text/javascript")
  script.setAttribute("src", src + "?t=9")
  script.setAttribute("async", "")
  script.onload = async function() {
    try {
      if (dep_id != -1) {
        // await finishing of node with dep_id, for now just wait for animation frame
        // might be sufficient since next dispatch is only done after method call and this body should be executed in order
        await waitForAnimationFrame()
      }
      await window[name](...args)
    } catch (e) {
      showErrorHint(node);
      throw e;
    }
    stopTheWait(id)
    if (next_id != -1) {
      dispatch_call(next_id, id, container, chain_promise);
    } else if(chain_promise != null) {
      // signal chain execution finished
      chain_promise.resolve()
    }
  }
  container.appendChild(script)
}

function showErrorHint(canvas){
  if(!canvas || !canvas.getContext) return;
  let context = canvas.getContext('2d');
  if(!context) return;
  context.font = "18px Arial";
  context.textAlign = "center";
  context.fillStyle ="red"
  context.fillText("⚠ error ⚠", 0.5*canvas.width, 0.5*canvas.height);
  context.fillText("check console", 0.5*canvas.width, 0.5*canvas.height+18);
}
function stopTheWait(id) {
  let img = document.querySelector("[data-call-id=img" + id + "]")
  if (img) {
    img.className += "transitionHidden"
  }
}

function waitForAnimationFrame() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function loadCanvasFromBinary(path, canvas_id) {
  try {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();

    // Read the first 8 bytes as width and height
    const headerView = new DataView(buffer, 0, 8);
    const width = headerView.getUint32(0, true);
    const height = headerView.getUint32(4, true);

    // The rest is pixel data
    const pixelData = new Uint8ClampedArray(buffer, 8);

    const imgData = new ImageData(pixelData, width, height);

    const canvas = document.getElementById(canvas_id);
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.error("Failed to load binary canvas data:", err);
  }
}


window.dispatch_call = dispatch_call

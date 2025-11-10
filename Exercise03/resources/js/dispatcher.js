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
  Basic1: async args => {
    let canvas = args[0];
    let slices = parseInt(args[1]);
    
    return [canvas, slices];
  },

  Basic2: async args => {
    let canvas = args[0];
    let wireframe = args[1] == "true";
    return [canvas, wireframe];
  },

  Basic3: async args => {
    let canvas = args[0];
    return [canvas];
  },

  Basic4_1: async args => {
    let canvas = args[0];
    // ['rotate', 'scale', 'shear_x']
    let operation = args[1];
    let value = parseFloat(args[2]);

    return [canvas, operation, value];
  },

  Basic4_2: async args => {
    let canvas = args[0];
    let alpha = parseFloat(args[1]);
    let steps = parseInt(args[2]);

    return [canvas, alpha, steps];
  },

  Basic4_3: async args => {
    let canvas = args[0];
    // define functions for composition in order by 'f1' for f1 and 'f2' for f2
    // e.g. 'f1 f2' meaning (f1 o f2)
    let transforms = args[1];

    return [canvas, transforms];
  },

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
        await waitForAnimationFrame();
      }
      // instead of preloading shaders with a callback, the resource loading is done and awaited before executing a script.
      // NOTE that 'shader' needs to set the shader-onload attribute, see prepareShaders in sheet.js
      let missing_shaders = node.getAttribute("shader-toload");
      if (missing_shaders) {
        let shader_ids = missing_shaders.split(";")
        for (let id of shader_ids) {
          let shader = document.getElementById(id);
          
          const { text, payload } = await loadResourceAsync(shader.getAttribute("data-inner"), shader)
          payload.innerHTML = text
        }
      }
      await window[name](...args);
      // wait for gl canvas to finish shader execution
      if (missing_shaders) {
        await node.getContext("experimental-webgl").finish();
      }
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

function loadResourceAsync(url, payload) {
  return new Promise((resolve, reject) => {
    url = url + '?t=' + Math.random()
    const xmlhttp = new XMLHttpRequest()
    const localTest = /^(?:file):/

    xmlhttp.payload = payload

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {
        let status = xmlhttp.status

        // Handle local file:// success case
        if (localTest.test(location.href) && xmlhttp.responseText) {
          status = 200
        }

        if (status === 200) {
          resolve({ text: xmlhttp.responseText, payload: xmlhttp.payload })
        } else {
          console.error("Failed to load", url, status, xmlhttp.readyState, "to", xmlhttp.payload)

          // Chrome file access nag
          if (typeof isChrome !== "undefined" && isChrome && !didNagChromers) {
            didNagChromers = true
            if (navigator.appVersion.indexOf("Win") != -1)
              alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
            else if (navigator.appVersion.indexOf("Mac") != -1)
              alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
            else
              alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
          }

          reject({ status, readyState: xmlhttp.readyState, payload: xmlhttp.payload })
        }
      }
    }

    try {
      xmlhttp.open("GET", url, true)
      xmlhttp.send()
    } catch (err) {
      reject({ status: -1, error: err })

      // Same Chrome nag in catch
      if (typeof isChrome !== "undefined" && isChrome && !didNagChromers) {
        didNagChromers = true
        if (navigator.appVersion.indexOf("Win") != -1)
          alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
        else if (navigator.appVersion.indexOf("Mac") != -1)
          alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
        else
          alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
      }
    }
  })
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

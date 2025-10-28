"use strict";


let isChrome = !!window.chrome && !!window.chrome.webstore;
let isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

function getMeta(scope, name, defaultValue) {
  let warn = false
  if (scope === undefined) scope = document;
  if (defaultValue === undefined) warn = true;

  let elements = scope.querySelectorAll('meta[name=' + name + ']');
  if (elements === undefined || elements.length == 0 || elements[0].getAttribute === undefined || elements[0].getAttribute('content') === undefined) {
    if (warn) {
      alert("You need a <meta name=\"" + name + "\" content=\"...\"> element in your <head> section")
    } else {
      return defaultValue
    }
  } else {
    return elements[0].getAttribute('content')
  }
}

function formatSheet() {
  let scope = document;

  let exerciseNr = getMeta(scope, 'exerciseNr');
  let lecture = getMeta(scope, 'lecture');
  let exercisePrefix = getMeta(scope, 'exercisePrefix', 'Exercise');
  let term = getMeta(scope, 'term');
  let dueDate = getMeta(scope, 'dueDate', '');

  let title = exercisePrefix + " #" + exerciseNr;
  let titleElements = scope.querySelectorAll('title');
  if (titleElements !== undefined && titleElements.length > 0) {
    title = titleElements[0]
  } else {
    setupTitle(scope, title)
  }

  if (exercisePrefix && title && lecture && exerciseNr && term) {
    setupHeaders(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)
    //setupFooters(scope, lecture, exercisePrefix, exerciseNr, term, dueDate)

    setupExercises(scope, exerciseNr)
    addPointTableEntry(-1, -1, -1, -1, "basic", "head")
    addPointTableEntry(-1, -1, -1, -1, "advanced", "head")
    setupTasks(scope, exerciseNr)
    addPointTableEntry(-1, -1, -1, 10, "basic", "sum")
    addPointTableEntry(-1, -1, -1, 10, "advanced", "sum")
    setSuperResolution(scope)

    //layout finished, show the pages
    let pages = document.querySelectorAll("page")
    for (let i in pages) {
      let page = pages[i]
      if (page.nodeType == Node.ELEMENT_NODE) {
        page.className += "transitionVisible"
      }
    }

    callScripts(scope)
    loadInner(scope)
  }
}

function setupTitle(scope, title) {
  if (scope === undefined) scope = document;
  let head = scope.querySelectorAll('head')[0];
  let node = document.createElement("title");
  node.innerHTML = title
  head.appendChild(node)
}

function setupHeaders(scope, lecture, prefix, number, term, dueDate) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('page');
  if (dueDate != '') dueDate = '<dueDate>Submission: <b>' + dueDate + '</b></dueDate>';
  for (let i in elements) {
    let page = elements[i];
    if (page && page.insertBefore) {
      let header = document.createElement("header");
      header.innerHTML = '<table style="width:100%"><tr><th><h1><lecture>' + lecture + '</lecture>' + prefix + ' ' + number + '</h1>' + dueDate + '</th><td><img src="./resources/lgdv.png" width=160 /></td></table>';

      page.insertBefore(header, page.firstChild)
    }
  }
}

function setupFooters(scope, lecture, prefix, number, term, dueDate) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('page');
  for (let i in elements) {
    let page = elements[i];
    if (page && page.appendChild) {
      let footer = document.createElement("footer");
      footer.innerHTML = '<table style="width:100%"><tr><th>' + lecture + '</th><td>' + term + '</td></table>'

      page.appendChild(footer);
    }
  }
}

function setupExercises(scope, number) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('exercise');
  for (let i in elements) {
    let exercise = elements[i];
    if (exercise.nodeType == Node.ELEMENT_NODE) {
      let prefix = "Exercise";
      if (exercise.getAttribute("prefix")) {
        prefix = exercise.getAttribute("prefix")
      }

      let title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (exercise.getAttribute("title")) {
        title = exercise.getAttribute("title")
      }

      let pointsExercise = "<span style='color:magenta'>[please add a points attribute]</span>"; if (exercise.getAttribute("points")) {
        pointsExercise = exercise.getAttribute("points")
      }

      let h1 = document.createElement("h1");
      h1.innerHTML = prefix + " " + number + " <strong>" + title + "</strong>" + " [" + pointsExercise + " points]";
      exercise.insertBefore(h1, exercise.firstChild)

      // create global list with all submission files required for the zip
      if (prefix.split(" ")[0] == "Basic") {
        window.submissionFilesBasic = [] 
      }
      if (prefix.split(" ")[0] == "Advanced") {
        window.submissionFilesAdvanced = [] 
      }
    }
  }
}

function setupTasks(scope, number) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('task');
  let partNr = 1;


  for (let i in elements) {
    let task = elements[i];
    if (task.nodeType == Node.ELEMENT_NODE) {

      //make sure that a task that is the first child of an exercise does not have a top-margin
      let zeroTopMargin = false;
      if (task.parentElement && task.parentElement.childNodes) {
        let lastWasHeadline = false;
        for (let c in task.parentElement.childNodes) {
          let child = task.parentElement.childNodes[c]
          if (child.nodeType == Node.COMMENT_NODE || child.nodeType == Node.TEXT_NODE) continue;

          if (child.nodeType == Node.ELEMENT_NODE) {
            if (lastWasHeadline && child === task) {
              zeroTopMargin = true;
            }

            if (child.nodeName === "H1" || child.nodeName === "H2" || child.nodeName === "H3" || child.nodeName === "H4") {
              lastWasHeadline = true
            } else {
              lastWasHeadline = false
            }
          } else {
            lastWasHeadline = false
          }
        }
      }

      //add a default header
      let prefix = "Task";
      if (task.getAttribute("prefix")) {
        prefix = task.getAttribute("prefix")
      }

      let title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (task.getAttribute("title")) {
        title = task.getAttribute("title")
      }

      let pointsTask = "<span style='color:magenta'>[please add a points attribute]</span>";
      if (task.getAttribute("points")) {
        pointsTask = task.getAttribute("points")
      }

      let submitFile = "<span style='color:magenta'>[please add a submit file attribute]</span>";
      if (task.getAttribute("submitfile")) {
        submitFile = task.getAttribute("submitfile")
      }

      // add submitFile to global submission file list
      let exercisePrefix = task.parentElement.getAttribute("prefix").split(" ")[0] // assumes attribute prefix="Basic Exercises", see setupExercises()
      let splitSubmitFiles = submitFile.split(",");
      for (const dirtyFile of splitSubmitFiles) {
        let file = dirtyFile.trim();
          if(exercisePrefix == "Basic" && !window.submissionFilesBasic.includes(file)) {
            window.submissionFilesBasic.push(file);
          } else if (exercisePrefix == "Advanced" && !window.submissionFilesAdvanced.includes(file)) {
            window.submissionFilesAdvanced.push(file);
          }
      }

      let h2 = document.createElement("h2");
      if (zeroTopMargin == true) {
        if (h2.style) {
          h2.style.marginTop = "0cm"
        }
      }
      h2.innerHTML = prefix + " " + number + "." + partNr + " <strong>" + title + "</strong>" + " [" + pointsTask + " points]" + " - Submission file: <i>" + submitFile + "</i>";
      task.insertBefore(h2, task.firstChild)

      setupSubTasks(task, number, partNr, pointsTask)
      partNr++;
    }
  }
}

function setupSubTasks(scope, number, taskNr, pointsTask) {
  if (scope === undefined) scope = document;

  let elements = scope.querySelectorAll('subtask');
  let partNr = 0;

  let sumPoints = 0

  for (let i in elements) {
    let subtask = elements[i];
    if (subtask.nodeType == Node.ELEMENT_NODE) {

      let subtask_details = subtask.querySelectorAll("details");
      let detail = subtask_details[0];
      let details_opened_item = "detail-" + taskNr + "-" + partNr + "_open";

      if (detail) {
          detail.addEventListener("toggle", event => {
              if (detail.open) {
                  sessionStorage.setItem(details_opened_item, true);
              } else {
                  sessionStorage.removeItem(details_opened_item);
              }
          });

          if (sessionStorage.getItem(details_opened_item)) {
              detail.open = true;
          }
      }

      let title = document.createElement("h1");

      title = "<span style='color:magenta'>[please add a title attribute]</span>";
      if (subtask.getAttribute("title")) {
        title = subtask.getAttribute("title")
      }

      let pointsSubTask = "<span style='color:magenta'>[please add a points attribute]</span>"; if (subtask.getAttribute("points")) {
        pointsSubTask = subtask.getAttribute("points")
      }
      sumPoints += parseInt(pointsSubTask);

      let typeSubTask;
      if (subtask.getAttribute("type")) {
        typeSubTask = subtask.getAttribute("type")
      } else {
          typeSubTask = "basic";
          console.log("SubTask " + title + " has no type set!");
      }

      let h3 = document.createElement("h3");
      h3.innerHTML = "<span class='enum'>" + String.fromCharCode(97 + partNr) +
            ")</span> <strong>" + title + ".</strong>" +
            //" Available points: [" + pointsSubTask + "/" + pointsTask + "]," +
            " Your points: [";

      let earned_points = document.createElement("span");
      earned_points.className = "earned_points";
      earned_points.setAttribute("type", "point_display");
      earned_points.setAttribute("ex-nr", number);
      earned_points.setAttribute("task-nr", taskNr);
      earned_points.setAttribute("subtask-nr", partNr);
      earned_points.setAttribute("testcase-nr", -1);
      earned_points.textContent = "0";

      let remainder = document.createTextNode( "/" + pointsSubTask + "]");

      h3.appendChild(earned_points)
      h3.appendChild(remainder)
          
      subtask.insertBefore(h3, subtask.firstChild)

      // set subtask id
      subtask.setAttribute("id", taskNr + "_" + partNr)

      // add tags to all scripted elements
      let scripted = subtask.querySelectorAll('[data-call]');
      scripted.forEach(s => {
        s.setAttribute("ex-nr", number)
        s.setAttribute("task-nr", taskNr)
        s.setAttribute("subtask-nr", partNr)
      })

      // add table entry at the top of html
      addPointTableEntry(number, taskNr, partNr, pointsSubTask, typeSubTask);

      // set up test cases
      setupTestCases(subtask, number, taskNr, partNr);

      partNr++;
    }
  }
  if (sumPoints > pointsTask)
    window.alert("Sum of subtask points exceeds task points");
}

function setupTestCases(scope, exNr, taskNr, partNr) {
  let elements = scope.querySelectorAll('[type="eval"]');
  let eval_point_param = "data-call-p2";
  elements.forEach((node, testcase_id) => {
    node.setAttribute("testcase-nr", testcase_id);

    // add 'Error Pixels: val/max' text and give attributes to val and max
    // also add point display below 'your code'
    // get parent table, add new row and padding elements
    let table_body = node.parentNode.parentNode.parentNode;
    let new_row = document.createElement("tr");
    table_body.appendChild(new_row);
    let point_entry = document.createElement("td");
    // point display
    new_row.appendChild(point_entry);
    let point_txt = document.createTextNode("Earned Points: ");
    let earned_points = document.createElement("span");
    earned_points.className = "earned_points_testcase";
    earned_points.setAttribute("type", "point_display");
    earned_points.setAttribute("ex-nr", exNr);
    earned_points.setAttribute("task-nr", taskNr);
    earned_points.setAttribute("subtask-nr", partNr);
    earned_points.setAttribute("testcase-nr", testcase_id);
    earned_points.textContent = "0";
    let points_txt_post = document.createTextNode("/" + node.getAttribute(eval_point_param));

    point_entry.appendChild(point_txt);
    point_entry.appendChild(earned_points);
    point_entry.appendChild(points_txt_post);

    // padding
    new_row.appendChild(document.createElement("td"));

    let pixel_entry = document.createElement("td");
    // error pixel entry
    new_row.appendChild(pixel_entry);
    // 'Error Pixel:'
    let error_txt = document.createTextNode("Error Pixel: ");
    // value
    let error_diff_value = document.createElement("span");
    error_diff_value.textContent = "val";
    error_diff_value.setAttribute("type", "error-pixel-value");
    error_diff_value.setAttribute("task-nr", taskNr);
    error_diff_value.setAttribute("subtask-nr", partNr);
    error_diff_value.setAttribute("testcase-nr", testcase_id);
    // '/'
    let error_txt_slash = document.createTextNode("/");
    // max
    let error_diff_max = document.createElement("span");
    error_diff_max.textContent = "max";
    error_diff_max.setAttribute("type", "error-pixel-max");
    error_diff_max.setAttribute("task-nr", taskNr);
    error_diff_max.setAttribute("subtask-nr", partNr);
    error_diff_max.setAttribute("testcase-nr", testcase_id);

    pixel_entry.appendChild(error_txt);
    pixel_entry.appendChild(error_diff_value);
    pixel_entry.appendChild(error_txt_slash);
    pixel_entry.appendChild(error_diff_max);

  });
}

function addPointTableEntry(ex_nr, task_nr, subtask_nr, points, ex_type, flag = "") {
  let table = document.querySelector(`.pointsTable[type="${ex_type}"]`)
  let row = document.createElement("tr")
  if (flag == "head") {
    let e1 = document.createElement("th")
    e1.textContent = "Tasks"
    let e2 = document.createElement("th")
    e2.textContent = "Points"
    row.appendChild(e1)
    row.appendChild(e2)
  } else if (flag == "sum") {
    let e1 = document.createElement("td")
    let b1 = document.createElement("b")
    b1.textContent = "Sum"
    e1.appendChild(b1)
    let e2 = document.createElement("td")
    let b2 = document.createElement("b")
    e2.textContent = "0/" + points
    e2.setAttribute("id", 'table_sum_'+ex_type)

    e2.appendChild(b2)
    row.appendChild(e1)
    row.appendChild(e2)

  } else {
    let e1 = document.createElement("td")
    e1.textContent = "Task " + ex_nr + "." + task_nr + " " + String.fromCharCode(97 + subtask_nr) + ")"
    let e2 = document.createElement("td")
    e2.textContent = "0/" + points
    e2.setAttribute("id", "table_"+task_nr+"_"+subtask_nr)

    row.appendChild(e1)
    row.appendChild(e2)
    row.onclick= function() {
      window.location="#"+task_nr+"_"+subtask_nr
      // reset location hash
      history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
  }
  table.appendChild(row)
}

function setSuperResolution(scope) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('[superResolution]');
  for (let i in elements) {
    let canvas = elements[i]
    if (canvas.nodeType == Node.ELEMENT_NODE) {
      let ctx = canvas.getContext('2d');

      if (ctx) {
        let scale = canvas.getAttribute("superResolution")
        //if (window.devicePixelRatio > 1) {
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        canvas.width = canvasWidth * scale;
        canvas.height = canvasHeight * scale;
        canvas.style.width = canvasWidth;
        canvas.style.height = canvasHeight;

        ctx.scale(scale, scale);
      }
    }
  }
}

Function.prototype.applyAsync = function (params, delay) {
  let function_context = this;
  setTimeout(function () {
    let val = function_context.apply(undefined, params);
  }, delay);
}

let didNagChromers = false
function loadResource(url, payload, didLoad, didFail) {
  url = url + '?t=' + Math.random()
  let xmlhttp = new XMLHttpRequest(),
    localTest = /^(?:file):/
  xmlhttp.payload = payload
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4) {
      status = xmlhttp.status;
    }
    if (localTest.test(location.href) && xmlhttp.responseText) {
      status = 200;
    }
    if (xmlhttp.readyState == 4 && status == 200) {
      let text = xmlhttp.responseText;
      didLoad.applyAsync([text, xmlhttp.payload]);
    } else if (xmlhttp.readyState == 4) {
      console.log("Failed to load", url, status, xmlhttp.readyState, "to", xmlhttp.payload)
      if (isChrome && !didNagChromers) {
        didNagChromers = true
        if (navigator.appVersion.indexOf("Win") != -1)
          alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
        if (navigator.appVersion.indexOf("Mac") != -1)
          alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
        else
          alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
      }
      try {
        didFail(status, xmlhttp.readyState, xmlhttp.payload)
      } catch (err) {

      }
    }
  }

  try {
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  } catch (err) {
    try {
      didFail(-1)
    } catch (err) {

    }
    if (isChrome && !didNagChromers) {
      didNagChromers = true
      if (navigator.appVersion.indexOf("Win") != -1)
        alert("Please start Chrome using Chrome.exe --allow-file-access-from-files " + window.location)
      if (navigator.appVersion.indexOf("Mac") != -1)
        alert("Please start Chrome using /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --allow-file-access-from-files " + window.location)
      else
        alert("Please start Chrome using chrome --allow-file-access-from-files " + window.location)
    }
  }
}

function loadInner(scope) {
  if (scope === undefined) scope = document;
  let elements = scope.querySelectorAll('[data-inner]');

  let svgid = 1
  for (let i in elements) {
    let node = elements[i]

    if (node.getAttribute) {
      let url = node.getAttribute("data-inner")
      url = url + '?t=' + Math.random()

      loadResource(url, node, function (text, payload) {
        //console.log("Did Load", text, node, payload)
        payload.innerHTML = text
      })

      /*node.setAttribute("data-inner-id", "node"+svgid)
      let container = document.createElement("object");
      container.setAttribute('id', 'svg'+svgid)
      container.setAttribute('data-inner-link', "node"+svgid)
      container.setAttribute('type', 'text/html')
      container.setAttribute('data', url)
      container.style['position'] = 'absolute'
      container.style['left'] = '-9999px'
      container.style['right'] = '-9999px'
      //container.style['visibility'] = 'hidden';
      container.addEventListener("load", function(e){
        let svg = scope.querySelector('[data-inner-id='+e.target.getAttribute('data-inner-link')+']');
        console.log(e.target, e, e.target.contentDocument.querySelector('body').firstChild.innerHTML)
        if (e.target.contentDocument.querySelector('body').firstChild.nodeName === "SVG") {
          svg.innerHTML = e.target.contentDocument.querySelector('body').firstChild.innerHTML
        } else {
          svg.innerHTML = e.target.contentDocument.querySelector('body').innerHTML
        }
        //e.target.parentNode.removeChild(e.target)
      });
      node.parentNode.insertBefore(container, node)
      svgid++
      console.log("added", container)*/
    }
  }
}



let GLOBAL_SHADERS = [];
function didLoadShader(id, scriptNodeId) {
  GLOBAL_SHADERS.push(id);
  //console.log("Shaders", GLOBAL_SHADERS, id, scriptNodeId);
  if (scriptNodeId) {
    let shader = document.querySelector("#" + id);
    //console.log(shader)

    let script = document.createElement("script");
    script.setAttribute("type", shader.getAttribute("type"))
    script.setAttribute("id", shader.getAttribute("id"));
    script.innerHTML = shader.innerHTML;
    shader.parentNode.replaceChild(script, shader);

    didLoadCall(document.querySelector("#" + scriptNodeId));
  }
}

function didLoadCall(script) {
  //console.log("script", script)
  let all = true;
  if (script && script.getAttribute('data-call-depends')) {
    let depends = JSON.parse(script.getAttribute('data-call-depends'))
    let onload = script.getAttribute('data-call-onload')
    let d = depends.length;

    while (d--) {
      let name = depends[d];
      let g = GLOBAL_SHADERS.length;
      let one = false;
      while (g--) {
        let gname = GLOBAL_SHADERS[g]
        if (gname == name) {
          one = true;
          break;
        }
      }

      if (!one) {
        all = false;
        break;
      }
    }
  }

  //console.log(script, depends, onload);
  if (all) {
    //console.log("init call for ", script);
    eval(onload);
  } else {
    //console.log("deferred init call for ", script)
  }
}


function callScripts(scope) {
  if (scope === undefined) scope = document;

  // setup eval point datastruct
  let eval_point_data = new Map();

  let elements = scope.querySelectorAll('[data-call]');
  let scripts = [];
  let callId = 1;
  let container = undefined;

  // collect call information from dom enteties
  // set the required information as attributes to enable use of depenedency chains
  for (let i in elements) {
    let node = elements[i]

    if (node.getAttribute) {
      let img = undefined
      if (!isFirefox) {
        container = document.createElement("div");
        let parent = document.createElement("overlayContainer");
        let img = document.createElement("img");
        img.setAttribute("data-call-id", "img" + callId)
        let computedStyle = window.getComputedStyle(node, null);
        let completeStyle = computedStyle.cssText;
        if (isChrome) {
          completeStyle = completeStyle.replace(/,/g, ".")
        }
        container.style.cssText = completeStyle;
        container.style['padding'] = "0"
        container.style['border'] = "0px solid white"
        container.style['margin'] = "59,4px"
        node.style['margin'] = "0px"

        container.appendChild(parent)

        node.parentNode.replaceChild(container, node);
        parent.appendChild(node)
        parent.appendChild(img)
      }

      node.setAttribute("data-call-id", "call" + callId)

      let methodName = node.getAttribute("data-call")
      let src = node.getAttribute("data-call-src")
      let num_params = 0
      while(node.getAttribute("data-call-p" + num_params) != null) {
        num_params += 1
      }
      node.setAttribute("data-call-num-p", num_params)
      
      if (node.getAttribute("type")) {
        if (node.getAttribute("type") === "eval") {
          // for all eval nodes, allocate space in the global point struct
          // structure: {task_nr: {subtask_nr: {testcase_nr: <val>, ...}, ...}, ...}
          let ex_nr = node.getAttribute("ex-nr");
          let task_nr = node.getAttribute("task-nr");
          let subtask_nr = node.getAttribute("subtask-nr");
          let testcase_nr = node.getAttribute("testcase-nr");
          if (!eval_point_data.get(task_nr)) {
            eval_point_data.set(task_nr, new Map());
          }
          let task = eval_point_data.get(task_nr);
          if (!task.get(subtask_nr)) {
            task.set(subtask_nr, new Map());
          }
          let subtask = task.get(subtask_nr);
          if (!subtask.get(testcase_nr)) {
            subtask.set(testcase_nr, 0);
          }
          
          
          // set dependencies for all nodes involved in eval
          let student_canvas = document.getElementById(node.getAttribute("data-call-p0"))
          student_canvas.setAttribute("data-call-next-dep", callId)
        }
      }
      

      //we can define shader code that needs to get loaded BEFORE the actual script
      let shaders = node.querySelectorAll('shader');
      let dependencies = [];
      for (let i in shaders) {
        let shader = shaders[i]

        if (shader.getAttribute) {
          let type = shader.getAttribute('type');
          if (type === 'vertex') type = '--vertex';
          else if (type === 'fragment') type = '--fragment';

          let script = document.createElement("script");
          script.setAttribute("id", shader.getAttribute("id"));
          script.setAttribute("type", type)

          if (shader.getAttribute("src")) {
            script.setAttribute("data-inner", shader.getAttribute("src"))
            //script.setAttribute("async", "")
            dependencies.push(shader.getAttribute("id"));
            script.setAttribute("data-inner-onload", "didLoadShader('" + shader.getAttribute("id") + "', '" + node.getAttribute("data-call-id") + "');")
          } else {
            script.innerHTML = shader.innerHTML;
          }

          node.removeChild(shader);
          node.parentNode.insertBefore(script, node);
        }
      }
      scripts.push(callId)
      callId++
    }
  }

  // set global point datastruct
  window.eval_point_data = eval_point_data;

  // filter scripts to only include dep-chain starting scripts
  let referencedDeps = new Set();
  scripts.forEach(id => {
    let n = document.querySelector('[data-call-id="call' + id + '"]');
    if (n) {
      let nextDep = n.getAttribute('data-call-next-dep');
      if (nextDep) {
        referencedDeps.add(parseInt(nextDep));
      }
    }
  });
  
  let filtered_scripts = scripts.filter(callId => !referencedDeps.has(callId));
  // setup promises to be resolved by the end of dep-chains to signal execution ending of all scripts
  let chain_promise_pairs = filtered_scripts.map(() => {
    let resolve, reject
    let promise = new Promise((res, rej) => {resolve = res; reject = rej})
    return {promise, resolve, reject}
  })

  executeCalls(filtered_scripts, chain_promise_pairs, container)

  Promise.all(chain_promise_pairs.map(pair => pair.promise)).then(() => {
    point_writer();
  })
}

async function executeCalls(ids, promises, container) {
  if (container === undefined) {
    container = document.querySelector('body')
  }
  // load the start nodes of all dependency-chains
  for (let i in ids) {
    let id = ids[i]
    let promise = promises[i]
    window.dispatch_call(id, -1, container, promise)
  }
}

function point_writer() {
  let ex_nr = getMeta(document, 'exerciseNr');
  let basic_points = 0
  let advances_points = 0
  for (let [task_nr, task_data] of window.eval_point_data) {
    let task_points = 0
    for (let [subtask_nr, subtask_data] of task_data) {
      let points = 0
      for (let [testcase_nr, testcase_data] of subtask_data) {
        // set text at testcase
        var testcase_point_node = document.querySelector('[type="point_display"][ex-nr="' + ex_nr + '"][task-nr="' + task_nr + '"][subtask-nr="' + subtask_nr + '"][testcase-nr="' + testcase_nr + '"]');
        testcase_point_node.textContent = testcase_data;
        points += testcase_data
      }
      // set text at subtask
      var point_node = document.querySelector('[type="point_display"][ex-nr="' + ex_nr + '"][task-nr="' + task_nr + '"][subtask-nr="' + subtask_nr + '"][testcase-nr="-1"]');
      point_node.textContent = points;
      // set text in point table
      var table_entry = document.getElementById('table_' + task_nr + '_' + subtask_nr)
      var max_p = table_entry.textContent.split("/")[1]
      table_entry.textContent = points + "/" + max_p

      task_points += points
    }
    if (task_nr <= 2) {
      basic_points += task_points
    } else {
      advances_points += task_points
    }
  }
  let table_sum = document.getElementById('table_sum_basic')
  let max_sum = table_sum.textContent.split("/")[1]
  table_sum.textContent = basic_points + "/" + max_sum

  table_sum = document.getElementById('table_sum_advanced')
  max_sum = table_sum.textContent.split("/")[1]
  table_sum.textContent = advances_points + "/" + max_sum

  if (false) { write_points_to_file(); }
}

function write_points_to_file() {
  let basic_sum = document.getElementById('table_sum_basic').textContent.split("/")[0];
  let advanced_table_element = document.getElementById('table_sum_advanced')

  let advanced_sum;
  if (advanced_table_element) {
    advanced_sum = document.getElementById('table_sum_advanced').textContent.split("/")[0];
  }
  
  let output;
  if (advanced_sum) {
    output = "basic:" + basic_sum + ",advanced:" + advanced_sum;
  } else {
    output = "basic:" + basic_sum;
  }

  var file = new Blob([output], { type: "application/plain" });
  var url = URL.createObjectURL(file);

  var a = document.createElement("a");
  a.href = url;
  a.download = "output.txt";
  a.click();

  URL.revokeObjectURL(url);
}

function clearCanvas2d(canvas, color=[255,255,255,255]) {
  let context = canvas.getContext("2d");
  let w = canvas.width;
  let h = canvas.height;
  let img = context.createImageData(w, h);
  clearImage(img, color);
  context.putImageData(img, 0, 0);
}

function clearImage(img, color=[255,255,255,255]) {
  let w = img.width;
  let h = img.height;
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let idx = 4*(x+w*y);
      img.data[idx] = color[0];
      img.data[idx+1] = color[1];
      img.data[idx+2] = color[2];
      img.data[idx+3] = color[3];
    }
  }
}

window.onload = function (e) {
  formatSheet()
  try {
    onLoad()
  } catch (err) {

  }
}

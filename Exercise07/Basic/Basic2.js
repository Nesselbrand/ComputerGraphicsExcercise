function Basic2(canvas, steps) {

    if (canvas.id == "fractal") {
        let slider = document.getElementById("slider");
        slider.addEventListener("change", changeSteps);
        slider.value = 1;
    }

    createScene(canvas);
    
    // interaction
    function changeSteps() {
        steps = this.value;
        createScene(canvas, true);
    }
    
function createCube() {
    let shape = document.createElement("shape");
    let cube = document.createElement("cube");
    let material = document.createElement("material");
    material.setAttribute("color", "1 1 1");
    shape.appendChild(cube);
    shape.appendChild(material);
    return shape;
}



    function refine(parents) {
        // refine each of the transformations ("parents") into 12 single transformations
        let children = new Array(parents.length * 12);
        let counter = 0;
        for (let p = 0; p < parents.length; p++) {
            // for each of the 27 smaller "boxes", ...
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    for (let k = -1; k <= 1; k++) {
                        // ... decide whether they should be considered or thrown away
                        let sum = Math.abs(i) + Math.abs(j) + Math.abs(k);
                        if (sum < 3 && sum > 1) {
                            // set up a new child transformation
                            children[counter] = constructChildTransformation(parents[p], 0.66 * i + " " + 0.66 * j + " " + 0.66 * k);
                            counter++;
                        }
                    }
                }
            }
        }

        return children;
    }

function constructChildTransformation(parent, translation) {
    let child = document.createElement("transform");
    child.setAttribute("scale", "0.33 0.33 0.33");
    child.setAttribute("translation", translation);
    parent.appendChild(child);
    return child;
}


    function createScene(canvas, remove_children=false) {
        const sceneinfo = canvas.querySelector("sceneinfo");
        
        // get the background node, and change the skycolor to dark blue
        const background = sceneinfo.querySelector("background");
        background.setAttribute("skycolor", "0 0 0.3");

        const scene = canvas.querySelector("scene");
        while (remove_children && scene.children.length > 0) {
            scene.removeChild(scene.lastChild);
        }

        // create the root transform, which enlarges its contents 
        let transf = document.createElement("transform");
        transf.setAttribute("scale", "2 2 2");
        scene.appendChild(transf);

        // create a list of transforms which are filled with boxes in the end
        // initially, this only contains the root transform
        let listOfTransforms = [transf];

        // for the number of iterations stored in "steps",
        // compute the new list of transforms from the old list
        // of transforms using the function refine()
        for (let i = 0; i < steps; i++) {
            listOfTransforms = refine(listOfTransforms);
        }

        // for every transform in the resulting list,
        // append a box to be drawn
        for (let i = 0; i < listOfTransforms.length; i++) {
            let cube = createCube();
            listOfTransforms[i].appendChild(cube);
        }

        showScene(canvas, canvas.id == "fractal");
    }
}

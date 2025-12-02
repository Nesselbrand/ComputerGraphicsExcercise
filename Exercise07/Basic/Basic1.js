/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

/**
 * Converts a color given in float range [0,1] to the integer range [0,255]
 * @param {number[]} rgb_float - three float color values [r,g,b] in the range [0,1]
 * @returns {number[]} - three integer color values [r,g,b] in the range [0,255]
 */
function floatToColor(rgb_float) {
    return [Math.max(Math.min(Math.floor(rgb_float[0] * 255.0), 255), 0),
    Math.max(Math.min(Math.floor(rgb_float[1] * 255.0), 255), 0),
    Math.max(Math.min(Math.floor(rgb_float[2] * 255.0), 255), 0)];
}

function Basic1(canvas, cull_mode, depth_mode) {
    /**
     * compute a perspective transformation
     * that perspectively maps the 2D space onto a 1D line
     * @param {number[]} out - resulting 3x3 Matrix, column-major, 
     * @param {number} fovy
     * @param {number} near 
     * @param {number} far 
     * @returns out
     */
    perspective = function (fovy, near, far) {
        let f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);

        return new Mat( [f, 0, 0],
                        [0, (far + near) * nf, -1],
                        [0, (2 * far * near) * nf, 0]);
    };

    /**
     * a camera rendering a 2D scene to a 1D line
     */
    class Camera {
        constructor() {
            this.eye = new Vec(400, 55);
            this.fovy = 30.0 / 180.0 * Math.PI;
            this.near = 150;
            this.far = 500;
            this.lookAtPoint = new Vec(260, 270);

            // the cameraMatrix transforms from world space to camera space
            this.cameraMatrix = id3();
            // the cameraMatrixInverse transforms from camera space to world space
            this.cameraMatrixInverse = id3();
            // projection matrix
            this.projectionMatrix = id3();

            // setup matrices
            this.update();
        }

        setNear(n) {
            this.near = n;
            this.update();
        }

        setFar(f) {
            this.far = f;
            this.update();
        }

        lookAt(point2D) {
            this.lookAtPoint = point2D.copy();
            this.update();
        }

        setEye(eye2D) {
            this.eye = eye2D.copy();
            this.update();
        }

        /**
         * setup matrices based on eye, lookAtPoint and perspective configuration
         */
        update() {
            // note: opengl looks into the negative viewDir!
            let negViewDir = this.eye.sub(this.lookAtPoint).normalized();

            // the cameraMatrix transforms from world space to camera space
            // the cameraMatrixInverse transforms from camera space to world space
            this.cameraMatrixInverse = new Mat( [negViewDir.y, -negViewDir.x, 0.0], 
                                                [negViewDir.x, negViewDir.y, 0.0],
                                                [this.eye.x, this.eye.y, 1.0]);

            this.cameraMatrix = this.cameraMatrixInverse.inv();
            this.projectionMatrix = perspective(this.fovy, this.near, this.far);
        }

        render(context) {
            // near plane
            let p_near_0 = this.cameraMatrixInverse.transformPoint(new Vec(this.near * Math.sin(this.fovy / 2), -this.near));
            let p_near_1 = this.cameraMatrixInverse.transformPoint(new Vec(-this.near * Math.sin(this.fovy / 2), -this.near));
            // far plane
            let p_far_0 = this.cameraMatrixInverse.transformPoint(new Vec(this.far * Math.sin(this.fovy / 2), -this.far));
            let p_far_1 = this.cameraMatrixInverse.transformPoint(new Vec(-this.far * Math.sin(this.fovy / 2), -this.far));

            // render frustum
            context.fillStyle = 'rgb(0,0,0)';
            context.lineWidth = 1;
            context.fillText("near plane", p_near_1[1], p_near_1[0] + 20);
            context.fillText("far plane", p_far_1[1], p_far_1[0] + 20);
            context.strokeStyle = 'rgb(100,100,100)';
            context.fillStyle = 'rgb(240,240,240)';
            context.beginPath();
            context.moveTo(p_near_0[1], p_near_0[0]);
            context.lineTo(p_near_1[1], p_near_1[0]);
            context.lineTo(p_far_1[1], p_far_1[0]);
            context.lineTo(p_far_0[1], p_far_0[0]);
            context.lineTo(p_near_0[1], p_near_0[0]);
            context.fill();
            context.stroke();

            // render eye
            context.fillStyle = 'rgb(0,0,0)';
            context.beginPath();
            context.fillText("eye", this.eye[1], this.eye[0] + 20);
            context.arc(this.eye[1], this.eye[0], 4, 0, 2 * Math.PI);
            context.arc(this.lookAtPoint[1], this.lookAtPoint[0], 4, 0, 2 * Math.PI);
            context.fill();
        };

        enableFrustumClipping(context) {
            // near plane
            let p_near_0 = this.cameraMatrixInverse.transformPoint(new Vec(this.near * Math.sin(this.fovy / 2), -this.near));
            let p_near_1 = this.cameraMatrixInverse.transformPoint(new Vec(-this.near * Math.sin(this.fovy / 2), -this.near));
            // far plane
            let p_far_0 = this.cameraMatrixInverse.transformPoint(new Vec(this.far * Math.sin(this.fovy / 2), -this.far));
            let p_far_1 = this.cameraMatrixInverse.transformPoint(new Vec(-this.far * Math.sin(this.fovy / 2), -this.far));

            context.save();
            context.lineWidth = 1;
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            context.moveTo(p_near_0[1], p_near_0[0]);
            context.lineTo(p_near_1[1], p_near_1[0]);
            context.lineTo(p_far_1[1], p_far_1[0]);
            context.lineTo(p_far_0[1], p_far_0[0]);
            context.lineTo(p_near_0[1], p_near_0[0]);
            context.stroke();
            context.clip();
        }

        disableFrustumClipping(context) {
            context.restore();
        }
    }
    let camera = new Camera();

    // canonical volume image location
    let offset = (canvas.id == "canvasBasic1") ? new Vec(20, 40) : new Vec(0,10);
    let dim = (canvas.id == "canvasBasic1") ? new Vec(120, 120) : new Vec(190,190);

    // target resolution
    let resolution = (canvas.id == "canvasBasic1") ? 120 : 190;

    // render targets
    let depthBuffer = new DepthBuffer(resolution, 10);
    let renderTarget = new RenderTarget(resolution);

    // rendering pipeline
    let renderingPipeline = new RenderingPipeline(depthBuffer, renderTarget);


    if (canvas.id == "canvasBasic1") {
        // setup interaction
        canvas.addEventListener('mousedown', onMouseDown, false);

        let slider_near = document.getElementById("slider_near");
        slider_near.addEventListener("change", onChangeNearSlider);
        slider_near.value = 150;

        let slider_far = document.getElementById("slider_far");
        slider_far.addEventListener("change", onChangeFarSlider);
        slider_far.value = 500;

        let slider_depth = document.getElementById("slider_depth");
        slider_depth.addEventListener("change", onChangeDepthBitSlider);
        slider_depth.value = 10;

        let radios_cull = document.getElementsByName("cull_mode");
        radios_cull[0].addEventListener("change", ()=>onChangeCullingMode(0) );
        radios_cull[1].addEventListener("change", ()=>onChangeCullingMode(1) );
        radios_cull[2].addEventListener("change", ()=>onChangeCullingMode(-1) );
        switch (cull_mode) {
            case 0: radios_cull[0].checked = true; break;
            case 1: radios_cull[1].checked = true; break;
            case -1: radios_cull[2].checked = true; break;
        }

        let radios_depth = document.getElementsByName("depth_mode");
        radios_depth[0].addEventListener("change", ()=>onChangeDepthMode(0));
        radios_depth[1].addEventListener("change", ()=>onChangeDepthMode(1));
        radios_depth[2].addEventListener("change", ()=>onChangeDepthMode(-1));
        switch (depth_mode) {
            case 0: radios_depth[0].checked = true; break;
            case 1: radios_depth[1].checked = true; break;
            case -1: radios_depth[2].checked = true; break;
        }

        let checkbox_verbose = document.getElementById("verbose");
        checkbox_verbose.addEventListener("change", onChangeVerbose);
        checkbox_verbose.checked = false;
    }
    onChangeDepthMode(depth_mode);
    onChangeCullingMode(cull_mode);

    Render();

    /////////////////////////////////////
    //////////// Interaction ////////////
    /////////////////////////////////////

    function onMouseDown(e) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (e.ctrlKey) {
            camera.setEye(new Vec(y, x));
        } else {
            camera.lookAt(new Vec(y, x));
        }
        Render();
    }

    function onChangeNearSlider() {
        camera.setNear(this.value * 1.0);
        Render();
    }

    function onChangeFarSlider() {
        camera.setFar(this.value * 1.0);
        Render();
    }
    function onChangeCullingMode(value) {
        renderingPipeline.SetCullingMode(value);
        Render();
    }
    function onChangeDepthMode(value) {
        renderingPipeline.SetDepthMode(value);
        Render();
    }
    function onChangeVerbose() {
        renderingPipeline.verbose = !renderingPipeline.verbose;
        Render();
    }
    function onChangeDepthBitSlider() {
        depthBuffer.bits = this.value;
        Render();
    }

    //////////////////////////// Render

    function Render() {
        clearCanvas2d(canvas);
        let context = canvas.getContext("2d");
        context.font = "bold 12px Georgia";
        context.textAlign = "center";
        camera.render(context);
        Debug_RenderCanonicalVolume(context);

        // geometry
        let geometry = [
            {
                modelMatrix: new Mat([100.0, 0.0, 0.0], [0.0, 100.0, 0.0], [100.0, 400.0, 1.0]),
                vbo: [[0.0, 0.0, 1.0, 0.0, 0.0], [0.0, 1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 0.0, 1.0, 0.0], [1.0, 0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 0.0, 0.0]],
                ibo: [0, 1, 1, 2, 2, 3, 3, 4]
            },
            {
                modelMatrix: new Mat([0.0, -50.0, 0.0], [100.0, 0.0, 0.0], [200.0, 250.0, 1.0]),
                vbo: [[0.0, 0.0, 1.0, 0.0, 0.0], [0.0, 1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 0.0, 1.0, 0.0], [1.0, 0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 0.0, 0.0]],
                ibo: [0, 1, 1, 2, 2, 3, 3, 4]
            },
            {
                modelMatrix: new Mat([-100.0, 0.0, 0.0], [0.0, -10.0, 0.0], [450.0, 550.0, 1.0]),
                vbo: [[0.0, 0.0, 1.0, 0.0, 0.0], [0.0, 1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 0.0, 1.0, 0.0], [1.0, 0.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 0.0, 0.0]],
                ibo: [0, 1, 1, 2, 2, 3, 3, 4]
            },
        ];

        // clear rendertargets
        if (renderingPipeline.depthTest == -1) depthBuffer.Clear(0.0);
        else depthBuffer.Clear(1.0);
        renderTarget.Clear();

        for (let i = 0; i < geometry.length; ++i) {
            // set uniforms
            let uniforms = {
                modelMatrix: geometry[i].modelMatrix,
                cameraMatrix: camera.cameraMatrix,
                projectionMatrix: camera.projectionMatrix
            };
            renderingPipeline.SetUniforms(uniforms);

            // render geometry
            renderingPipeline.Render(geometry[i].vbo, geometry[i].ibo, context);

            // debug output: draw homogeneouse coordinate system
            Debug_RenderToCanonicalVolume(context);
        }

        // set rendertarget pixels on screen
        let rtv_data = context.createImageData(2, renderTarget.w);
        for (let i = 0; i < renderTarget.w; ++i) {
            rtv_data.data[4 * 2 * (renderTarget.w - 1 - i) + 0] = rtv_data.data[4 * (2 * (renderTarget.w - 1 - i) + 1) + 0] = Math.min(Math.max(renderTarget.data[i][0] * 255, 0), 255);
            rtv_data.data[4 * 2 * (renderTarget.w - 1 - i) + 1] = rtv_data.data[4 * (2 * (renderTarget.w - 1 - i) + 1) + 1] = Math.min(Math.max(renderTarget.data[i][1] * 255, 0), 255);
            rtv_data.data[4 * 2 * (renderTarget.w - 1 - i) + 2] = rtv_data.data[4 * (2 * (renderTarget.w - 1 - i) + 1) + 2] = Math.min(Math.max(renderTarget.data[i][2] * 255, 0), 255);
            rtv_data.data[4 * 2 * (renderTarget.w - 1 - i) + 3] = rtv_data.data[4 * (2 * (renderTarget.w - 1 - i) + 1) + 3] = 255;
        }

        if (canvas.id == "canvasBasic1") {
            context.putImageData(rtv_data, offset[1] - 12, offset[0]);
            context.putImageData(rtv_data, offset[1] - 14, offset[0]);
        } else {
            context.putImageData(rtv_data, offset[1] - 10, offset[0]);
            context.putImageData(rtv_data, offset[1] - 8, offset[0]);
            context.putImageData(rtv_data, offset[1] - 6, offset[0]);
            context.putImageData(rtv_data, offset[1] - 4, offset[0]);
            context.putImageData(rtv_data, offset[1] - 2, offset[0]);
        }
        

        if (canvas.id == "canvasBasic1") {
            context.save();
            context.translate(offset[1] - 20, offset[0] + dim[0] / 2);
            context.rotate(-Math.PI / 2);
            context.fillText("Render Target", 0, 0);
            context.restore();
        }

        // draw world space
        for (let i = 0; i < geometry.length; ++i) {
            Debug_RenderToWorldSpace(context, geometry[i].vbo, geometry[i].ibo, geometry[i].modelMatrix);
        }
    }

    function Debug_RenderCanonicalVolume(context) {
        context.strokeStyle = 'rgb(100,100,100)';
        context.fillStyle = 'rgb(240,240,240)';
        context.beginPath();
        context.rect(offset[1], offset[0], dim[1], dim[0]);
        context.fill();
        context.stroke();
    }

    function Debug_RenderToCanonicalVolume(context) {
        context.fillStyle = 'rgb(0,0,0)';
        context.beginPath();
        context.strokeStyle = 'rgb(0,0,0)';
        for (let i = 0; i < renderingPipeline.clippedPrimitives.length; ++i) {
            let a = renderingPipeline.clippedPrimitives[i].primitive[0].position;
            let b = renderingPipeline.clippedPrimitives[i].primitive[1].position;
            let alpha_a = renderingPipeline.clippedPrimitives[i].alpha[0];
            let alpha_b = renderingPipeline.clippedPrimitives[i].alpha[1];
            let a_clipped = [0.0, 0.0, 0.0];
            let b_clipped = [0.0, 0.0, 0.0];
            for (let j = 0; j < 3; ++j) {
                a_clipped[j] = (1.0 - alpha_a) * a[j] + alpha_a * b[j];
                b_clipped[j] = (1.0 - alpha_b) * a[j] + alpha_b * b[j];
            }

            let p = [(-a_clipped[0] / a_clipped[2] / 2 + 0.5) * dim[0] + offset[0], (a_clipped[1] / a_clipped[2] / 2 + 0.5) * dim[1] + offset[1]];
            context.moveTo(p[1], p[0]);
            p = [(-b_clipped[0] / b_clipped[2] / 2 + 0.5) * dim[0] + offset[0], (b_clipped[1] / b_clipped[2] / 2 + 0.5) * dim[1] + offset[1]];
            context.lineTo(p[1], p[0]);
        }
        context.stroke();
        if (canvas.id == "canvasBasic1") {
            context.fillText("Canonical Volume", offset[1] + dim[1] / 2, offset[0] + dim[0] - 4);
        }
    }

    function Debug_RenderToWorldSpace(context, vbo, ibo, modelM) {
        // draw polygon
        context.strokeStyle = 'rgb(220,220,220)';
        context.beginPath();
        for (let i = 0; i < ibo.length / 2; ++i) {
            let a = modelM.transformPoint(new Vec(vbo[ibo[2 * i]][0], vbo[ibo[2 * i]][1]));
            let b = modelM.transformPoint(new Vec(vbo[ibo[2 * i + 1]][0], vbo[ibo[2 * i + 1]][1]));

            context.moveTo(a[1], a[0]);
            context.lineTo(b[1], b[0]);
        }
        context.stroke();

        camera.enableFrustumClipping(context);
        for (let i = 0; i < ibo.length / 2; ++i) {
            let a = modelM.transformPoint(new Vec(vbo[ibo[2 * i]][0], vbo[ibo[2 * i]][1]));
            let b = modelM.transformPoint(new Vec(vbo[ibo[2 * i + 1]][0], vbo[ibo[2 * i + 1]][1]));

            let grd = context.createLinearGradient(a[1], a[0], b[1], b[0]);
            let c_0 = floatToColor([vbo[ibo[2 * i]][2], vbo[ibo[2 * i]][3], vbo[ibo[2 * i]][4]]);
            let c_1 = floatToColor([vbo[ibo[2 * i + 1]][2], vbo[ibo[2 * i + 1]][3], vbo[ibo[2 * i + 1]][4]]);
            grd.addColorStop(0, 'rgb(' + c_0[0] + ',' + c_0[1] + ',' + c_0[2] + ')');
            grd.addColorStop(1, 'rgb(' + c_1[0] + ',' + c_1[1] + ',' + c_1[2] + ')');
            context.strokeStyle = grd;
            context.beginPath();
            context.moveTo(a[1], a[0]);
            context.lineTo(b[1], b[0]);
            context.stroke();
        }
        camera.disableFrustumClipping(context);
    }
}

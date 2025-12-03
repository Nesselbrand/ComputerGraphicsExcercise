

/**
 * linearly interpolate a and b using interpolation factor alpha
 * @param {number[]} a - vector with arbitrary dimensions
 * @param {number[]} b - vector with the same number of dimensions like a
 * @param {number} alpha - interpolation factor in [0,1]
 * @returns {number[]} - vector with the same number of dimensions like a, component-wise linearly interpolated btw. a and b
 */
function interpolateA(a, b, alpha) {
    let result = new Array(a.length);
    for (let i = 0; i < a.length; ++i) {
        result[i] = (1.0 - alpha) * a[i] + alpha * b[i];
    }
    return result;
}


/**
 * 1D buffer of fragment colors
 * @property {number} w - number of pixels
 * @property {number[][]} data - fragment data
 */
class RenderTarget {
    /**
     * 1D buffer of fragment colors
     * @param {number} w - number of pixels
     */
    constructor(w) {
        this.w = w;
        this.data = new Array(w);
        this.Clear();
    }

    /**
     * reset all fragment data to black ([0,0,0])
     */
    Clear() {
        for (let i = 0; i < this.w; ++i) this.data[i] = [0.0, 0.0, 0.0];
    }

    /**
     * set buffer value at index x
     * @param {number} x - index into the data array (integer in [0, w-1])
     * @param {number[]} value - vec3 fragment color [r,g,b]
     */
    SetFragment(x, value) {
        if (x >= 0 && x < this.w) this.data[x] = value;
    }
}


/**
 * 1D buffer of depth values
 * @property {number} w - number of pixels 
 * @property {number} bits - number of bits of a depth value
 * @property {number[]} data - depth data
 */
class DepthBuffer {
    /**
     * 1D buffer of depth values
     * @param {number} w 
     * @param {number} bits 
     */
    constructor(w, bits) {
        this.w = w;
        this.bits = bits;
        this.data = new Array(w);
        this.Clear();
    }

    /**
     * convert float value to fixed point depth value
     * @param {number} valueF - float value in [0,1]
     * @returns {number} - integer depth value in [0, (2^bits)- 1 ]
     */
    ComputeFixedPointDepth(valueF){
        return Math.floor(valueF * (Math.pow(2, this.bits) - 1));
    }

    /**
     * reset all depth values to clrF (reduced to precision given by this.bits)
     * @param {number} [clrF=1.0] - clear depth
     */
    Clear(clrF) {
        if (clrF == undefined) clrF = 1.0;
        let clr = this.ComputeFixedPointDepth(clrF);
        for (let i = 0; i < this.w; ++i) this.data[i] = clr;
    }

    /**
     * perform depth test (and write) for pixel x with depth valueF
     * @param {number} x - index into the data array (integer in [0, w-1])
     * @param {number} valueF - depth value in [0,1]
     * @param {number} depthTestMode - 0 = no depth test (always pass), 1 = pass if less, -1 = pass if greater
     * @returns {boolean} - true = depth test passes, false = depth test fails
     */
TestAndSetFragment(x, valueF, depthTestMode) {
    if (x < 0 || x >= this.w) return false;

    let newValue = this.ComputeFixedPointDepth(valueF);
    let oldValue = this.data[x];

    // 0 = kein Depth-Test
    if (depthTestMode === 0) {
        this.data[x] = newValue;
        return true;
    }

    // 1 = pass if less
    if (depthTestMode === 1) {
        if (newValue < oldValue) {
            this.data[x] = newValue;
            return true;
        }
        return false;
    }

    // -1 = pass if greater
    if (depthTestMode === -1) {
        if (newValue > oldValue) {
            this.data[x] = newValue;
            return true;
        }
        return false;
    }

    return false;
}



}


/**
 * Simplified 2D rendering pipeline
 */
class RenderingPipeline {
    /**
     * Simplified 2D rendering pipeline
     * @param {DepthBuffer} depthBuffer
     * @param {RenderTarget} renderTarget
     */
    constructor(depthBuffer, renderTarget) {
        this.uniforms = undefined;
        this.culling = 0; // 0 = false, 1 = backface culling, -1 = frontface culling
        this.depthTest = 0; // 0 = false, 1 = pass if less, -1 = pass if greater
        this.viewport = { x: 0, w: depthBuffer.w };

        this.depthBuffer = depthBuffer;
        this.renderTarget = renderTarget;

        // results from the pipeline stages, in practice you won't store these results
        this.vertexStream = undefined;
        this.primitives = undefined;
        this.culledPrimitives = undefined;
        this.clippedPrimitives = undefined;
        this.fragments = undefined;
        this.processedFragments = undefined;

        this.verbose = false;
    }

    SetUniforms(uniforms) {
        this.uniforms = uniforms;
    }

    SetCullingMode(cullingMode) {
        // 0 = false, 1 = backface culling, -1 = frontface culling
        this.culling = cullingMode;
    }

    SetDepthMode(depthMode) {
        // 0 = false, 1 = pass if less, -1 = pass if greater
        this.depthTest = depthMode;
    }

    SetViewport(x, w) {
        this.viewport.x = x;
        this.viewport.w = w;
    }

    /**
     * Execute the rendering pipeline for a given object
     * @param {number[][]} vbo - vertex buffer object. i.e. array of vertices [x,z,a0,a1,...] including programmable additional attributes
     * @param {number[]} ibo - index buffer object. i.e. array of indices into vertex buffer, every 2 consecutive indices form a primitive
     * @param {context2d} context 
     */
    Render(vbo, ibo, context) {
        if (this.verbose) console.log("Call Rendering Pipeline:");

        // vbo is handed to the vertex shader stage
        this.vertexStream = this.VertexShaderStage(vbo);

        // primitive assembly stage (converts a vertex stream into a sequence of primitives)
        this.primitives = this.PrimitiveAssemblyStage(this.vertexStream, ibo);

        // front-/back-face culling
        this.culledPrimitives = this.FaceCullingStage(this.primitives);

        // clipping
        this.clippedPrimitives = this.ClippingStage(this.culledPrimitives);

        // rasterization
        this.fragments = this.Rasterization(this.clippedPrimitives)

        // fragment shader stage
        this.processedFragments = this.FragmentShaderStage(this.fragments);

        // per sample processing
        this.PerSampleProcessingStage(this.processedFragments);

        if (this.verbose) console.log("----------------------------------");
    }

    /**
     * Execute the vertex Shader for each vertex in vertices
     * @param {number[][]} vertices - array of vertices [x,z,a0,a1,...] including programmable additional attributes
     * @returns {object[]} - array of vertex shader outputs
     */
    VertexShaderStage(vertices) {
        if (this.verbose) console.log("  Vertex Shader Stage:");
        if (this.verbose) console.log("    - #vertices: " + vertices.length);

        let vertexShaderStageOut = new Array(vertices.length);

        for (let i = 0; i < vertices.length; ++i) {
            vertexShaderStageOut[i] = this.VertexShader(vertices[i], i);
        }

        return vertexShaderStageOut;
    }

    /**
     * Exemplary vertex shader, transforming a vertex to a homogeneous position and other attributes
     * @param {number[]} vertex - [x,z,a0,a1,...] including programmable additional attributes
     * @param {number} vId - vertex id
     * @returns {object} - {position:[x,z,w], attributes:[[r,g,b]]}  homogeneous position and additional vs-output attributes
     */
    VertexShader(vertex, vId) {
        // elevate position of the vertex to homogeneous coordinates
        let p = new Vec(vertex[0], vertex[1], 1.0);

        // apply model space to world space transformation
        let p_worldSpace = this.uniforms.modelMatrix.mul(p);

        // apply world space to camera space transformation
        let p_cameraSpace = this.uniforms.cameraMatrix.mul(p_worldSpace);

        // project point
        let q = this.uniforms.projectionMatrix.mul(p_cameraSpace);

        // additional programable list of vertex attributes
        let color = new Vec(vertex[2], vertex[3], vertex[4]);

        let vertexAttributes = [color];

        // set the vertex shader output
        return {
            position: q.copy(), // homogeneous coordinate! (note that we are in 2D)
            attributes: vertexAttributes
        };
    }

    /**
     * Assemble primitives
     * @param {object[]} vertexStream - array of vertex shader outputs (here in the form of {position:[x,z,w], attributes:[[r,g,b]]})
     * @param {number[]} ibo - index buffer object. i.e. array of indices into vertex buffer, every 2 consecutive indices form a primitive
     * @returns {object[][]} - array of primitives in the form  primitives[i] = [vertexStream[idx_a], vertexStream[idx_b]]
     */
PrimitiveAssemblyStage(vertexStream, ibo) {
    if (this.verbose) console.log("  Primitive Assembly Stage:");
    if (this.verbose) console.log("    - #vertices [in]: " + vertexStream.length);

    let primitives = new Array(ibo.length / 2);

    for (let i = 0; i < ibo.length; i += 2) {
        let idxA = ibo[i];
        let idxB = ibo[i + 1];

        primitives[i/2] = [
            vertexStream[idxA],
            vertexStream[idxB]
        ];
    }

    if (this.verbose) console.log("    - #primitives [out]: " + primitives.length);

    return primitives;
}


    /**
     * For each primitive, perform line-culling
     * @param {object[][]} primitives - array of pairs of vertex shader outputs (here in the form of {position:[x,z,w], attributes:[[r,g,b]]})
     * @returns {object[][]} - array of unculled primitives
     */
    FaceCullingStage(primitives) {
        if (this.verbose) console.log("  Face Culling Stage:");
        if (this.verbose) console.log("    - #primitives [in]: " + primitives.length);

        let cullingStageOut = new Array();

        for (let i = 0; i < primitives.length; ++i) {
            if (!this.LineCulling(primitives[i][0].position, primitives[i][1].position)) {
                cullingStageOut.push(primitives[i]);
            }
        }

        if (this.verbose) console.log("    - #primitives [out]: " + cullingStageOut.length);

        return cullingStageOut;
    }

    /**
     * Determine if a (line-) primitive given by homogeneous points a and b needs to be culled
     * @param {number[]} a - [x,z,w] homogeneous start point of the line primitive
     * @param {number[]} b - [x,z,w] homogeneous end point of the line primitive
     * @returns {boolean} - true = primitive should be culled,  false = primitive shouldn't be culled
     */
LineCulling(a, b) {
    // 0 = kein Culling
    if (this.culling === 0) return false;

    // Tiefe in Canonical Volume (NDC entlang der Tiefenachse)
    let depthA = a[1] / a[2];
    let depthB = b[1] / b[2];

    // Linien, die im Prinzip parallel zur Bildebene sind, nicht cullen
    if (Math.abs(depthA - depthB) < 1e-6) return false;

    // true, wenn die Linie von a nach b "von der Kamera weg" zeigt
    let pointsAwayFromCamera = (depthB > depthA);

    if (this.culling === 1) {
        // backface culling: primitives, die von der Kamera WEG zeigen, verwerfen
        return pointsAwayFromCamera;
    } else if (this.culling === -1) {
        // frontface culling: primitives, die ZUR Kamera zeigen, verwerfen
        return !pointsAwayFromCamera;
    }

    return false;
}




    /**
     * For each primitive, perform line-clipping (discard if outside clip space)
     * @param {object[][]} primitives - array of pairs of vertex shader outputs (here in the form of {position:[x,z,w], attributes:[[r,g,b]]})
     * @returns {object[]} - array of clipped primitives in the form of {primitive:[prim_a, prim_b], alpha:[alpha_a, alpha_b]}
     */
    ClippingStage(primitives) {
        let clippingStageOut = new Array();

        if (this.verbose) console.log("  Clipping Stage:");
        if (this.verbose) console.log("    - #line segments [in]:  " + primitives.length);

        for (let i = 0; i < primitives.length; ++i) {
            let clippingResult = this.LineClipping(primitives[i][0].position, primitives[i][1].position);
            if (clippingResult != undefined) {
                let res = {
                    primitive: primitives[i],
                    alpha: clippingResult
                };
                clippingStageOut.push(res);
            }
        }

        if (this.verbose) console.log("    - #line segments [out]: " + clippingStageOut.length);

        return clippingStageOut;
    }

    /**
     * Perform clipping of a (line-) primitive given by homogeneous points a and b
     * @param {number[]} a - [x,z,w] homogeneous start point of the line primitive
     * @param {number[]} b - [x,z,w] homogeneous end point of the line primitive
     * @returns {(number[]|undefined)} - undefined, if outside of clip space; the interpolation factors [alpha_a, alpha_b] otherwise (each in range [0,1]).
     */
    LineClipping(a, b) {
        // clip triangle against canonical volume in homogeneous coordinates
        let alpha_a = 0.0;
        let alpha_b = 1.0;

        for (let dim = 0; dim < 2; ++dim) {
            // window edge coordinates
            let wec_min = [a[2] + a[dim], b[2] + b[dim]];
            let wec_max = [a[2] - a[dim], b[2] - b[dim]];

            // trivial rejects
            if ((wec_min[0] < 0 && wec_min[1] < 0) || (wec_max[0] < 0 && wec_max[1] < 0)) {
                return undefined;
            }

            // compute alpha values
            if (!(wec_min[0] > 0 && wec_min[1] > 0)) {
                let alpha_min_edge = wec_min[0] / (wec_min[0] - wec_min[1]);
                alpha_min_edge = Math.max(Math.min(alpha_min_edge, 1.0), 0.0);

                // update global alpha values
                if (wec_min[0] < 0) { // a outside, b inside
                    if (alpha_min_edge > alpha_a) alpha_a = alpha_min_edge;
                } else {
                    if (alpha_min_edge < alpha_b) alpha_b = alpha_min_edge;
                }
            }

            if (!(wec_max[0] > 0 && wec_max[1] > 0)) {
                let alpha_max_edge = wec_max[0] / (wec_max[0] - wec_max[1]);
                alpha_max_edge = Math.max(Math.min(alpha_max_edge, 1.0), 0.0);

                // update global alpha values
                if (wec_max[0] < 0) { // a outside, b inside
                    if (alpha_max_edge > alpha_a) alpha_a = alpha_max_edge;
                } else {
                    if (alpha_max_edge < alpha_b) alpha_b = alpha_max_edge;
                }
            }
        }
        if (alpha_a >= alpha_b) return undefined;

        return [alpha_a, alpha_b];
    }


    /**
     * for each clipped primitive, perform rasterization
     * @param {object[]} primitives - array of clipped primitives in the form of {primitive:[prim_a,prim_b], alpha:[alpha_a, alpha_b]},  (here prim_x is in the form of {position:[x,z,w], attributes:[[r,g,b]]})
     * @returns {object[]} - array of fragments
     */
    Rasterization(primitives) {
        if (this.verbose) console.log("  Rasterizer Stage:");
        if (this.verbose) console.log("    - #primitives [in]:  " + primitives.length);

        let fragments = new Array();

        for (let i = 0; i < primitives.length; ++i) {
            let primitiveFragments = this.RasterizePrimitive(primitives[i], i);
            for (let j = 0; j < primitiveFragments.length; ++j)
                fragments.push(primitiveFragments[j]);
        }

        if (this.verbose) console.log("    - #fragments [out]:  " + fragments.length);

        return fragments;
    }

    /**
     * Perform rasterization of a (line-) primitive (including interpolation of attributes)
     * @param {object} primitive - clipped primitives in the form of {primitive:[prim_a,prim_b], alpha:[alpha_a, alpha_b]},  (here prim_x is in the form of {position:[x,z,w], attributes:[[r,g,b]]})
     * @param {number} pId - integer primitive id
     * @returns {object[]} - array of fragments in the form of {screenCoord:number, depth:number, attributes:number[][], primitiveId:pId }
     */
    RasterizePrimitive(primitive, pId) {
        let a = primitive.primitive[0].position;
        let b = primitive.primitive[1].position;

        // apply result from clipping stage
        let alpha_a = primitive.alpha[0];
        let alpha_b = primitive.alpha[1];
        let aC = interpolateA(a, b, alpha_a);
        let bC = interpolateA(a, b, alpha_b);

        // apply viewport transformation
        let aC_screenCoord = Math.floor(((aC[0] / aC[2]) / 2.0 + 0.5) * this.viewport.w + this.viewport.x);
        let bC_screenCoord = Math.ceil(((bC[0] / bC[2]) / 2.0 + 0.5) * this.viewport.w + this.viewport.x);

        // map depth to [0.0, 1.0]
        let a_depth = (a[1] / a[2]) / 2.0 + 0.5;
        let b_depth = (b[1] / b[2]) / 2.0 + 0.5;

        // read vertex attributes
        let attributes_a = primitive.primitive[0].attributes;
        let attributes_b = primitive.primitive[1].attributes;

        // compute number of fragments
        let sgn = bC_screenCoord > aC_screenCoord ? 1 : -1;
        let nFragments = Math.abs(bC_screenCoord - aC_screenCoord) + 1;
        let fragments = new Array(nFragments);
        for (let i = 0; i < nFragments; ++i) {
            // current screen coordinates
            let scrCoord = aC_screenCoord + i * sgn;

            // rasterizer alpha
            let alpha_rasterizer = i / (nFragments - 1.0);
            // primitive alpha, note: linear interpolation (might not be perspective correct)
            let alpha = (1.0 - alpha_rasterizer) * alpha_a + alpha_rasterizer * alpha_b;

            // interpolated depth
            let interpolatedDepth = (1.0 - alpha) * a_depth + alpha * b_depth;

            // interpolate attributes
            let interpolatedAttributes = new Array(attributes_a.length)
            for (let j = 0; j < attributes_a.length; ++j) {
                interpolatedAttributes[j] = interpolateA(attributes_a[j], attributes_b[j], alpha);
            }

            // set fragment
            fragments[i] = {
                screenCoord: scrCoord,
                depth: interpolatedDepth,
                attributes: interpolatedAttributes,
                primitiveId: pId
            };
        }
        return fragments;
    }

    /**
     * For each fragment, call the fragment shader
     * @param {object[]} fragments - array of fragments in the form of {screenCoord:number, depth:number, attributes:number[][], primitiveId:pId }
     * @returns {object[]} - output Fragments in the form of {depth:number, screenCoord:number, fragColor:number[]}
     */
    FragmentShaderStage(fragments) {
        let processedFragments = new Array();
        if (this.verbose) console.log("  Fragment Shader Stage:");
        if (this.verbose) console.log("    - #fragments [in]:  " + fragments.length);
        for (let i = 0; i < fragments.length; ++i) {
            let processedFragment = this.FragmentShader(fragments[i]);
            if (processedFragment != undefined) // check if pixel has been discarded
                processedFragments.push(processedFragment);
        }
        if (this.verbose) console.log("    - #fragments [out]:  " + processedFragments.length);
        return processedFragments;
    }

    /**
     * Exemplary fragment shader, setting a color from interpolated vertex attributes.
     * @param {object} fragment - in the form of {screenCoord:number, depth:number, attributes:number[][], primitiveId:pId }
     * @returns {object} - output Fragment in the form of {depth:number, screenCoord:number, fragColor:number[]}
     */
    FragmentShader(fragment) {
        // simplest fragment shader, just pass on interpolated vertex colors
        let color = fragment.attributes[0];

        // return results
        return {
            depth: fragment.depth,
            screenCoord: fragment.screenCoord,
            fragColor: color
        };
    }

    /**
     * Process each output fragment.
     * @param {object[]} processedFragments - array of output fragments in the form of {depth:number, screenCoord:number, fragColor:number[]}
     */
    PerSampleProcessingStage(processedFragments) {
        if (this.verbose) console.log("  Per Sample Processing Stage:");
        if (this.verbose) console.log("    - #fragments [in]:  " + processedFragments.length);
        for (let i = 0; i < processedFragments.length; ++i) {
            this.PerSampleProcessing(processedFragments[i]);
        }
    }

    /**
     * Process one output fragment, i.e. write it to the render target if the depth test passes
     * @param {object} processedFragment - output fragment in the form of {depth:number, screenCoord:number, fragColor:number[]}
     */
    PerSampleProcessing(processedFragment) {
        let depthTestResult = this.depthBuffer.TestAndSetFragment(processedFragment.screenCoord, processedFragment.depth, this.depthTest);
        if (depthTestResult) {
            this.renderTarget.SetFragment(processedFragment.screenCoord, processedFragment.fragColor);
        }
    }
}

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

/**
 * Set current stroke color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setStrokeStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.strokeStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

/**
 * Set current fill color of context to the given color.
 * @param {object} context - canvas 2D context
 * @param {number[]} rgb_float - three float color values in the range [0,1]
 */
function setFillStyle(context, rgb_float) {
    let c = floatToColor(rgb_float);
    context.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
}

function arrow(context, fromx, fromy, tox, toy, text) {
    if (fromx == tox && fromy == toy) return;

    // http://stuff.titus-c.ch/arrow.html
    let headlen = 5;   // length of head in pixels
    let angle = Math.atan2(toy - fromy, tox - fromx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.stroke();
    if(text) {
        let d = [tox - fromx, toy - fromy];
        let l = Math.sqrt(d[0]*d[0]+d[1]*d[1]);
        context.fillText(text, tox + 10 / l * d[0], toy + 10 / l * d[1]);
    }
}



///////////////////////////
////////   6.1a)   ////////
///////////////////////////


function Basic1a(canvas, texture, texDimU, texDimV, sample_nearest) {
    //console.log("2D Texture (", texDimU, "x", texDimV, "): ", texture);

    Render();

    /**
     * access texture at texCoord in nearest neighbor mode.
     * @param {number[]} texCoord - 2D vector [u,v], each component in the range of [0,1]
     * @returns {number[]} - 3D vector, color value (same range as values in texture)
     */
    function sampleNearestNeighbor(texCoord) {
        // this implements texture clamp mode -> texCoord is in the range of [0,1]
        texCoord[0] = Math.max(Math.min(texCoord[0], 1.0), 0.0);
        texCoord[1] = Math.max(Math.min(texCoord[1], 1.0), 0.0);
        // compute nearest neighbor
        let u = Math.round(texCoord[0] * (texDimU - 1));
        let v = Math.round(texCoord[1] * (texDimV - 1));
        let idx = texDimU * v + u;
        return [texture[idx][0], texture[idx][1], texture[idx][2]];
    }

    /**
     * linearly interpolate two color values
     * @param {number[]} color0 - color value at alpha==0
     * @param {number[]} color1 - color value at alpha==1 
     * @param {number} alpha - interpolation factor in [0,1]
     * @returns {number[]} interpolated color value
     */
    function interpolateColor(color0, color1, alpha) {
        return [(1.0 - alpha) * color0[0] + alpha * color1[0],
                (1.0 - alpha) * color0[1] + alpha * color1[1],
                (1.0 - alpha) * color0[2] + alpha * color1[2]];
    }

    /**
     * access texture at texCoord in bilinear interpolation mode.
     * @param {number[]} texCoord - 2D vector [u,v], each component in the range of [0,1]
     * @returns {number[]} - 3D vector, color value (same range as values in texture)
     */
function sampleBilinear(texCoord) {

    // --- 1) Clamp + Umrechnung in Texelkoordinaten ---
    let u = Math.max(Math.min(texCoord[0], 1.0), 0.0) * (texDimU - 1);
    let v = Math.max(Math.min(texCoord[1], 1.0), 0.0) * (texDimV - 1);

    // Nachbarn bestimmen
    let u0 = Math.floor(u);
    let u1 = Math.min(u0 + 1, texDimU - 1);
    let v0 = Math.floor(v);
    let v1 = Math.min(v0 + 1, texDimV - 1);

    // Interpolationsfaktoren
    let fu = u - u0;
    let fv = v - v0;

    // --- 2) Indizes der 4 Texel ---
    let idx00 = v0 * texDimU + u0;   // oben links
    let idx10 = v0 * texDimU + u1;   // oben rechts
    let idx01 = v1 * texDimU + u0;   // unten links
    let idx11 = v1 * texDimU + u1;   // unten rechts

    // --- 3) Horizontal interpolieren ---
    let top    = interpolateColor(texture[idx00], texture[idx10], fu);
    let bottom = interpolateColor(texture[idx01], texture[idx11], fu);

    // --- 4) Vertikal interpolieren ---
    return interpolateColor(top, bottom, fv);
}


    function Render() {
        clearCanvas2d(canvas);
        let context = canvas.getContext("2d", { willReadFrequently: true });

        if (sample_nearest) {
            context.font = "bold 12px Arial";
            context.textAlign = "center";
            let canvasNN = context.createImageData(200, 200);
            for (let y = 0; y < 200; ++y) {
                for (let x = 0; x < 200; ++x) {
                    let texCoord = [x / 199.0, y / 199.0];

                    let color = sampleNearestNeighbor(texCoord);

                    let pixelIdx = 4 * (y * 200 + x);
                    canvasNN.data[pixelIdx + 0] = Math.min(Math.max(0, Math.floor(color[0] * 255)), 255);
                    canvasNN.data[pixelIdx + 1] = Math.min(Math.max(0, Math.floor(color[1] * 255)), 255);
                    canvasNN.data[pixelIdx + 2] = Math.min(Math.max(0, Math.floor(color[2] * 255)), 255);
                    canvasNN.data[pixelIdx + 3] = 255;
                }
            }
            
            context.putImageData(canvasNN, 0, 0);

            // draw texel centers
            for (let y = 0; y < texDimV; ++y) {
                for (let x = 0; x < texDimU; ++x) {
                    let coord = [200.0 * x / (texDimU-1.0), 200.0 * y / (texDimV-1.0)];
                    context.fillStyle = (texture[y * texDimU + x].every((val, i) => val == 0)) ? 'rgb(255, 255, 255)' : 'rgb(0,0,0)';
                    context.beginPath();
                    context.arc(coord[0], coord[1], 3, 0, 2 * Math.PI);
                    context.fill();
                    context.beginPath();
                    context.arc(200 + coord[0], coord[1], 3, 0, 2 * Math.PI);
                    context.fill();
                }
            }

        } else {
            let canvasBI = context.createImageData(200, 200);
            for (let y = 0; y < 200; ++y) {
                for (let x = 0; x < 200; ++x) {
                    let texCoord = [x / 199.0, y / 199.0];

                    let color = sampleBilinear(texCoord);

                    let pixelIdx = 4 * (y * 200 + x);
                    canvasBI.data[pixelIdx + 0] = Math.min(Math.max(0, Math.floor(color[0] * 255)), 255);
                    canvasBI.data[pixelIdx + 1] = Math.min(Math.max(0, Math.floor(color[1] * 255)), 255);
                    canvasBI.data[pixelIdx + 2] = Math.min(Math.max(0, Math.floor(color[2] * 255)), 255);
                    canvasBI.data[pixelIdx + 3] = 255;
                }
            }

            context.putImageData(canvasBI, 0, 0);
        }
    }
}




///////////////////////////
////////   6.1b)   ////////
///////////////////////////


function Basic1b(canvas, n_pixels) {
    class MipMap {
        /**
         * @param {number[][]} texture1D - initial texture to build a mipmap pyramid from
         * @param {number} nLevelMax - upper bound for mipmap levels
         */
        constructor(texture1D, nLevelMax) {
            let texDim = texture1D.length;
            this.nLevel = Math.max(Math.min(Math.log2(texDim)+1, nLevelMax), 1);
            this.texLevels = new Array(this.nLevel);

            // copy first level
            this.texLevels[0] = new Array(texDim);
            for (let i = 0; i < texDim; ++i) this.texLevels[0][i] = [texture1D[i][0], texture1D[i][1], texture1D[i][2]];

            // TODO 6.1b)   Compute the MIP map pyramid.
            //              Use a simple boxfilter (same weight for 
            //              both contributors) to compute the
            //              next mipmap level. Assume the dimension of 
            //              the texture to be a power of 2.
for (let l = 1; l < this.nLevel; ++l) {

    // 1. Dimension des Levels
    let prevDim = this.texLevels[l - 1].length;
    let dim = prevDim / 2;

    // 2. Array anlegen
    this.texLevels[l] = new Array(dim);

    // 3. Boxfilter: Durchschnitt aus je 2 Texeln
    for (let i = 0; i < dim; ++i) {
        let c0 = this.texLevels[l - 1][2 * i];
        let c1 = this.texLevels[l - 1][2 * i + 1];

        this.texLevels[l][i] = [
            0.5 * (c0[0] + c1[0]),
            0.5 * (c0[1] + c1[1]),
            0.5 * (c0[2] + c1[2])
        ];
    }
}
        }

        sampleNearestNeighbor(texCoord, level) {
            texCoord = Math.max(Math.min(texCoord, 1.0), 0.0); // this implements texture clamp mode -> texCoord is in the range of [0,1]
            level = Math.max(Math.min(level, this.nLevel - 1), 0);
            if (this.texLevels[level] == undefined) return [0.0, 0.0, 0.0];
            let idx = Math.max(Math.min(Math.round(texCoord * (this.texLevels[level].length) - 0.5), this.texLevels[level].length-1), 0); // nearest neigbor lookup idx
            return [this.texLevels[level][idx][0], this.texLevels[level][idx][1], this.texLevels[level][idx][2]];
        }
    }

    // texture
    let texture1D = [[228/255, 3/255, 3/255], [255/255, 140/255, 0/255], [255/255, 237/255, 0/255], [0/255, 128/255, 38/255], [0/255, 76/255, 255/255], [115/255, 41/255, 130/255], [0/255, 0/255, 0/255], [240/255, 240/255, 240/255]];

    // mip map
    let mipmap = new MipMap(texture1D, 4);

    //// Scene Description
    
    // eye
    let eye = [4, 4];

    // line surface
    let line_x = 270;
    let line_minZ = 140;
    let line_maxZ = 590;
    let nSamples = texture1D.length;
    
    // image Plane
    let pixel_minX = 50;
    let pixel_maxX = 175;
    let imagePlaneZ = 100;
    let nPixels = n_pixels;

    let showcase = canvas.id == "canvasBasic1b";

    if (showcase) {
        //// setup interaction
        document.getElementById("nPixels")
            .addEventListener("change", onChangeNPixels);
    }

    function onChangeNPixels() {
        nPixels = this.value;
        Render();
    }
    
    // draw results
    Render();


    /**
     * Projects point2D to the line-surface given by the scene
     * @param {number[]} point2D - pixel coordinate in world space
     * @returns {number[]} [x, z, texCoord]; projected point and its texture coordinate
     */
    function ProjectPointOntoSurfaceLine( point2D ) {
        let z_intersect = eye[1] + (line_x - eye[0]) / (point2D[0] - eye[0]) * (point2D[1] - eye[1]);
        let texCoord = (z_intersect - line_minZ) / (line_maxZ - line_minZ);
        return [line_x, z_intersect, texCoord];
    }

    /**
     * @param {number} i - index of the pixel 
     * @returns {number} mipmap level of the pixel i
     */
function DetermineMipMapLevelOfPixel(i) {

    let pixelTop = [pixel_minX + (i / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
    let pixelBottom = [pixel_minX + ((i + 1.0) / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];

    let pixelTop_proj = ProjectPointOntoSurfaceLine(pixelTop);
    let pixelBottom_proj = ProjectPointOntoSurfaceLine(pixelBottom);

    // 1) Footprint (Abstand in texCoords)
    let footprint = Math.abs(pixelBottom_proj[2] - pixelTop_proj[2]);

    // 2) Level finden
    for (let l = 0; l < mipmap.nLevel; ++l) {
        let texelSize = 1.0 / mipmap.texLevels[l].length;
        if (texelSize >= footprint) {
            return l;
        }
    }

    // Falls kein Level groß genug ist → letzte Stufe (gröbste)
    return mipmap.nLevel - 1;
}



    function Render() {
        clearCanvas2d(canvas);
        let context = canvas.getContext("2d", { willReadFrequently: true });

        // draw texture onto surface
        if (showcase) {
            context.font = "italic 12px Georgia";
            context.textAlign = "center";

            for (let i = 0; i < nSamples; ++i) {
                let texCoord0 = i / nSamples;
                let texCoord1 = (i + 1.0) / nSamples;
                let p0 = [line_x, Math.floor((1.0 - texCoord0) * line_minZ + texCoord0 * line_maxZ)];
                let p1 = [line_x, Math.floor((1.0 - texCoord1) * line_minZ + texCoord1 * line_maxZ)];

                // draw texture and MIP levels
                for (let level = 0; level < mipmap.nLevel; ++level) {
                    let color = mipmap.sampleNearestNeighbor(0.5 * (texCoord0 + texCoord1), level);
                    setStrokeStyle(context, color);
                    context.beginPath();
                    context.lineWidth = 6;
                    context.moveTo(p0[1], p0[0] + 1 + level * 8);
                    context.lineTo(p1[1], p1[0] + 1 + level * 8);
                    context.stroke();

                    // draw auxiliary line between this and the next line segment
                    context.beginPath();
                    setStrokeStyle(context, [0.2, 0.2, 0.2]);
                    context.lineWidth = 4;
                    if (i % Math.pow(2, level) == 0) {
                        context.moveTo(p0[1], p0[0] + level * 8 - 2);
                        context.lineTo(p0[1], p0[0] + level * 8 + 4);
                    }
                    if (i + 1 == texture1D.length) {
                        context.moveTo(p1[1], p1[0] + level * 8 - 2);
                        context.lineTo(p1[1], p1[0] + level * 8 + 4);
                    }
                    context.stroke();
                }

                // draw texture coordinates
                context.fillText(texCoord0, p0[1], p0[0] - 10);
                if (i + 1 == texture1D.length) {
                    context.fillText(texCoord1, p1[1], p1[0] - 10);
                }
            }
            context.fillText("texture coordinates:", 70, 250 + 10);
            context.fillText("texture + MIP Maps:", line_minZ - 70, line_x + 5);
            context.fillText("Camera", 50, 15);
            
            // draw eye
            context.fillStyle = 'rgb(0,0,0)';
            context.beginPath();
            context.arc(eye[1], eye[0], 4, 0, 2 * Math.PI);
            context.fill();

            // draw axis
            arrow(context, eye[1], eye[0], eye[1] + 125, eye[0]);
            arrow(context, eye[1], eye[0], eye[1], eye[0] + 125);
            context.fillText("X", eye[1] + 11, eye[0] + 150);
            context.fillText("Z", eye[1] + 150, eye[0] + 14);

            // image plane
            context.fillStyle = 'rgb(0,0,0)';
            context.lineWidth = 1;
            context.fillText("image plane", imagePlaneZ - 25, 210);
            context.fillText("(" + nPixels + " pixel" + (nPixels > 1 ? "s" : "") + ")", imagePlaneZ - 25, 225);
            context.strokeStyle = 'rgb(100,100,100)';
            context.beginPath();
            context.setLineDash([1, 1]);
            context.moveTo(imagePlaneZ, eye[0]);
            context.lineTo(imagePlaneZ, 200);
            context.stroke();
            context.setLineDash([1, 0]);
        }


        // evaluate pixels
        for (let i = 0; i < nPixels; ++i) {
            // pixel coordinates in world space
            let pixelTop = [pixel_minX + (i / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
            let pixelBottom = [pixel_minX + ((i + 1.0) / nPixels) * (pixel_maxX - pixel_minX), imagePlaneZ];
            let pixelCenter = [0.5 * (pixelTop[0] + pixelBottom[0]), 0.5 * (pixelTop[1] + pixelBottom[1])];

            // pixel projected onto the surface
            let pixelTop_proj = ProjectPointOntoSurfaceLine( pixelTop );
            let pixelBottom_proj = ProjectPointOntoSurfaceLine( pixelBottom );
            let pixelCenter_proj = ProjectPointOntoSurfaceLine( pixelCenter );

            let level = DetermineMipMapLevelOfPixel( i );

            // read color from the mip map pyramid
            let color = mipmap.sampleNearestNeighbor(pixelCenter_proj[2], level);

            // draw pixel
            context.beginPath();
            setStrokeStyle(context, color);
            context.lineWidth = 6;
            context.moveTo(pixelTop[1], pixelTop[0]);
            context.lineTo(pixelBottom[1], pixelBottom[0]);
            context.stroke();

            // draw auxiliary line between this and the next line segment
            context.beginPath();
            setStrokeStyle(context, [0, 0, 0]);
            context.lineWidth = 2;
            context.moveTo(pixelTop[1] - 6, pixelTop[0]);
            context.lineTo(pixelTop[1] + 6, pixelTop[0]);
            context.moveTo(pixelBottom[1] - 6, pixelBottom[0]);
            context.lineTo(pixelBottom[1] + 6, pixelBottom[0]);
            context.stroke();

            if (showcase) {
                // draw projection lines
                context.strokeStyle = 'rgb(200,200,200)';
                context.beginPath();
                context.lineWidth = 1.5;
                context.setLineDash([3, 3]);
                context.moveTo(eye[1], eye[0]);
                context.lineTo(pixelTop_proj[1], pixelTop_proj[0]);
                context.moveTo(eye[1], eye[0]);
                context.lineTo(pixelBottom_proj[1], pixelBottom_proj[0]);
                context.stroke();
                context.beginPath();
                context.strokeStyle = 'rgb(50,50,50)';
                context.moveTo(eye[1], eye[0]);
                context.lineTo(pixelCenter_proj[1], pixelCenter_proj[0]);
                context.stroke();
                context.setLineDash([1, 0]);
            }
        }
        context.lineWidth = 1;
    }
}

"use strict";

// create 2d point
function Point(x, y) {
    this.x = x;
    this.y = y;
}

// create rgb color triple
function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

// create a line with two points and a color
function Line(p0, p1, color) {
    this.startPoint = p0;
    this.endPoint = p1;
    this.color = color;
}

// create a polygon consisting of multiple vertices (corner points)
function Polygon(vertices, color) {
    let nVertices = vertices.length;
    if (nVertices >= 3) {
        this.nEdges = nVertices;
        this.edges = new Array(nVertices);
        for (let i = 0; i < nVertices - 1; i++) {
            this.edges[i] = new Line(vertices[i], vertices[i + 1], color);
        }
        this.edges[nVertices - 1] = new Line(vertices[nVertices - 1], vertices[0], color);
        this.color = color;
    }
}

// set a color at a pixel considering the pixel scaling pixelScale
function setPixelS(image, pixel, color, pixelScale) {
    if (pixel.x >= 0 && pixel.y >= 0) {
        let px = Math.floor(pixel.x);
        let py = Math.floor(pixel.y);
        for (let y = py * pixelScale; y < (py + 1) * pixelScale; ++y) {
            for (let x = px * pixelScale; x < (px + 1) * pixelScale; ++x) {
                if ((x < image.width) && (y < image.height)) {
                    let index = (x + y * image.width) * 4;
                    image.data[index + 0] = color.r; // R
                    image.data[index + 1] = color.g; // G
                    image.data[index + 2] = color.b; // B
                    image.data[index + 3] = 255; // A
                }
            }
        }
    }
}

// get a color value at a pixel
function getPixel(image, pixel) {
    if (pixel.x >= 0 && pixel.y >= 0 && pixel.x < image.width && pixel.y < image.height) {
        let index = (pixel.x + pixel.y * image.width) * 4;
        return new Color(image.data[index + 0], image.data[index + 1], image.data[index + 2]);
    }
    return null;
}

// set a color value at a pixel
function setPixel(image, pixel, color) {
    if (pixel.x >= 0 && pixel.y >= 0 && pixel.x < image.width && pixel.y < image.height) {
        let index = (pixel.x + pixel.y * image.width) * 4;
        image.data[index + 0] = color.r; // R
        image.data[index + 1] = color.g; // G
        image.data[index + 2] = color.b; // B
        image.data[index + 3] = 255; // A
    }
}

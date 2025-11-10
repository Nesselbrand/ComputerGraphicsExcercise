// init webGL
function initGL(canvas) {
    console.log("init webGL");
    let gl = canvas.getContext("experimental-webgl");
    if (!gl) throw new Error("Could not initialise WebGL, sorry :-(\nTo enable WebGL support in your browser, go to about:config and skip the warning.\nSearch for webgl.disabled and set its value to false.");

    gl.viewport(0, 0, canvas.width, canvas.height);
    return gl;
}

// shader from java script block
function getShader(gl, id) {
    let shaderScript = document.getElementById(id);
    if (!shaderScript) return null;

    let str = "";
    let k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    return getShaderFromSource(gl, str, shaderScript.type);
}

// shader from string source
function getShaderFromSource(gl, shaderSource, shaderType) {
    if (!shaderSource) {
        return null;
    }

    let shader;
    if (shaderType == "--fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderType == "--vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error( gl.getShaderInfoLog(shader) );
    return shader;
}

// shader program
class ShaderProgram {
    constructor(gl, vertexShaderSource, fragmentShaderSource, as_string) {
        let vertexShader;
        let fragmentShader;

        if (as_string) {
            vertexShader = getShaderFromSource(gl, vertexShaderSource, "--vertex");
            fragmentShader = getShaderFromSource(gl, fragmentShaderSource, "--fragment");
        } else {
            vertexShader = getShader(gl, vertexShaderSource)
            fragmentShader = getShader(gl, fragmentShaderSource);
        }

        // create shader program
        let shaderProgram = this.shaderProgram = gl.createProgram();

        // attach shaders
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);

        // link program
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) throw new Error("Could not initialise shaders");
        gl.useProgram(shaderProgram);
    }

    // member function used to attach attributes to the shader program
    attachAttribute(gl, attributeVarName) {
        let shaderProgram = this.shaderProgram;
        gl.useProgram(shaderProgram);
        let attributeLocation = gl.getAttribLocation(shaderProgram, attributeVarName);

        if (attributeLocation == null) {
            console.log("Could not attach attribute [" + attributeVarName + "]! Either not defined or unused attribute!");
        } else {
            this[attributeVarName] = attributeLocation;
        }
    }

    // member function used to attach uniforms to the shader program
    attachUniform(gl, uniformVarName) {
        let shaderProgram = this.shaderProgram;
        gl.useProgram(shaderProgram);
        let uniformLocation = gl.getUniformLocation(shaderProgram, uniformVarName);

        if (uniformLocation == null) {
            console.log("Could not attach uniform [" + uniformVarName + "]! Either not defined or unused uniform!");
        } else {
            this[uniformVarName] = uniformLocation;
        }
    }
}

////////////////////////////////////////////////////////////////////////
//////////////////////    point class        ///////////////////////////
////////////////////////////////////////////////////////////////////////
class GLPoint{
    constructor(x, y, r, g, b) {
        this.x = x;
        this.y = y;
        this.vbo = null;
        this.r = r;
        this.g = g;
        this.b = b;
    }
    initBuffers(gl) {
        let vertices = [this.x, this.y];
        if (this.vbo != 0) {
            console.log("Delete VBO");
            gl.deleteBuffer(this.vbo);
        }
    
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vbo.itemSize = 2;
        this.vbo.numItems = 1;
    }
    updateBuffers(gl) {
        if (this.vbo != 0) {
            let vertices = [this.x, this.y];
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        } else {
            this.initBuffers(gl);
        }
    }
}


////////////////////////////////////////////////////////////////////////
/////////////////    line class        /////////////////////////////////
////////////////////////////////////////////////////////////////////////
class Line2D{
    constructor(from, to, r, g, b) {
        this.fromX = from[0];
        this.fromY = from[1];
        this.toX = to[0];
        this.toY = to[1];
        this.r = r;
        this.g = g;
        this.b = b;
    }
    initBuffers(gl) {
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([this.fromX, this.fromY, this.toX, this.toY]), gl.STATIC_DRAW);
        this.vbo.itemSize = 2;
        this.vbo.numItems = 2;
    };
    updateBuffers(gl) {
        if (this.vbo != 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([this.fromX, this.fromY, this.toX, this.toY]), gl.STATIC_DRAW);
        } else {
            this.initBuffers(gl);
        }
    }
}

////////////////////////////////////////////////////////////////////////
/////////////////    triangle strip  class       ///////////////////////
////////////////////////////////////////////////////////////////////////
class TriangleStrip2D{
    constructor(vertices, nVertices, r, g, b) {
        this.vertices = vertices;
        this.nVertices = nVertices;
        this.r = r;
        this.g = g;
        this.b = b;
    }
    initBuffers(gl) {
        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        this.vbo.itemSize = 2;
        this.vbo.numItems = this.nVertices;
    }
    updateBuffers(gl) {
        if (this.vbo != 0) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        } else {
            this.initBuffers(gl);
        }
    }
}

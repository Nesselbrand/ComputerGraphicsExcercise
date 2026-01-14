/** pi */
const pi = Math.PI;
/** factor degrees to radiants */
const torad = pi / 180;

/**
 * Convert string to Vec
 * @param {String} str has to have the format "Vec(a,b,...)"
 * @returns {Vec} the parsed vec
 */
function parseVec(str) {
    if (str.slice(0,3) != "vec") {
        console.error("Invalid vec constructor string >> " + str + " << (doesn't start with 'vec')")
    }
    let nums = str.slice(4,-1).split(",").map(num => parseFloat(num.trim()))
    return vec(...nums)
}

/// Generation ///
/**
 * See {@link Vec}
 */
function vec(...v) {
    // this happens if vec([x,y,z]) is called instead of vec(x,y,z)
    if (Array.isArray(v[0])) {
        v = v[0]
    }
    //cg.assert(v.length > 1, "num.vec() must have more than one argument");
    return new Vec(...v);
}
/**
 * See {@link Mat}
 */
function mat(...v) {
    //cg.assert(v.length > 1 && v[0]?.length > 1, "num.mat() must have more than one argument and vectors with length > 1")
    if (Array.isArray(v[0]) && v.length == 1) {
        v = v[0]
    }
    // TODO is not being deep copied, maybe use v.map() or smth
    return new Mat(...v);
}

// setter and getter
function set_x(x, v) {
    x[0] = v;
}
function set_y(x, v) {
    x[1] = v;
}
function set_z(x, v) {
    //cg.assert(v.length > 2, "z not available for vectors shorter than 3");
    x[2] = v;
}
function set_w(x, v) {
    //cg.assert(v.length > 3, "w not available for vectors shorter than 4");
    x[3] = v;
}
function get_x(x) {
    return x[0];
}
function get_y(x) {
    return x[1];
}
function get_z(x) {
    //cg.assert(v.length > 2, "z not available for vectors shorter than 3");
    return x[2];
}
function get_xyz(x) {
    return x.slice(0,3)
}
function get_w(x) {
    //cg.assert(v.length > 3, "w not available for vectors shorter than 4");
    return x[3];
}

// helper function: create empty copy of array. return type Vec or Mat, depending on input
function empty(x) {
    //cg.assert(x?.length > 1, "num.empty(): length must be > 1");
    if (!x[0].length)
        return new Vec(x.length);
    else {
        let y = new Mat(x.length);
        for (let i = 0; i < y.length; i++)
            y[i] = Array(x[0].length);
        return y;
    }
}
/** make copy */
function copy(x) {
    //cg.assert(x?.length > 1, "num.copy(): length must be > 1");
    if (!x[0].length)
        return new Vec(...x);
    else {
        let y = new Mat(x.length);
        for (let i = 0; i < y.length; i++)
            y[i] = x[i].slice();
        return y;
    }
}
/** generate zero vector (n==0) or matrix (n>0) */
function zeroes(m, n = 0) {
    if (n == 0)
        return new Vec(m).fill(0);
    else {
        let y = new Mat(m);
        for (let i = 0; i < m; i++)
            y[i] = Array(n).fill(0);
        return y;
    }
}
/** generate nxn identity matrix */
function id(n) {
    let y = zeroes(n,n);
    for (let i = 0; i < n; i++)
        y[i][i] = 1;
    return y;
}
/** generate nxn identity matrix */
function id2(n) { return id(2); }
/** generate nxn identity matrix */
function id3(n) { return id(3); }
/** generate nxn identity matrix */
function id4(n) { return id(4); }

function equals(x, y, epsilon = 1e-6) {
    if (!x[0].length) {
        for(let i = 0; i < x.length; i++) {
            if (Number.isNaN(x[i]) || Number.isNaN(y[i]) || Math.abs(x[i] - y[i]) > epsilon) return false
        }
    } else {
        for (let i = 0; i < x.length; i++) {
            for(let j = 0; j < x[i].length; j++) {
                if (Number.isNaN(x[i][j]) || Number.isNaN(y[i][j]) || Math.abs(x[i][j] - y[i][j]) > epsilon) return false
            }
        }
    }
    return true
}

/// Output ///

// helper function for formatted output

/** convert to string */
function str(x) {
    if (!x[0].length)
        return "vec(" + x.map(v => parseFloat(v)).join(",") + ")";
    else
        return "mat[" + x.map(y => "[" + y.map(v => parseFloat(v)).join(",") + "]").join(",") + "]";
}
/** convert to nice string */
function pretty(x) {
    if (!x[0].length)
        return "[" + x.map(conv).join(",") + "]";
    else {
        let s = "";
        let m = x.length, n = x[0].length;
        for (let i = 0; i < m; i++) {
            if (i > 0)
                s += "\n";
            s += "|";
            for (let j = 0; j < n; j++) {
                if (j > 0) s += " ";
                s += conv(x[i][j]);
            }
            s += "|"
        }
        return s;
    }
}
function flatten(x) {
    if (!x[0].length) {
        return x;
    }
    return x.flat(2);
}

/// Access ///

/** extract col */
function col(x,i) {
    //cg.assert(x[0]?.length, "num.col(): argument x must be matrix");
    return new Vec(...x[i]);
}
/** extract row */
function row(x,j) {
    //cg.assert(x[0]?.length, "num.row(): argument x must be matrix");
    let y = new Vec(x.length);
    for (let i = 0; i < x.length; i++)
        y[i] = x[i][j];
    return y;
}
/** adjoint of a matrix, row i, col j*/
function adj(x,j,i) {
    //cg.assert(x[0]?.length, "num.adj(): argument x must be matrix");
    let del_col = x.filter((_, col_idx) => col_idx != j);
    let del_row = del_col.map(col => col.filter((_, row_idx) => row_idx !== i));
    return del_row;
}

/// Algebra ///
function negTo(y,x) {
    //cg.assert(x.length, "num.neg(): argument x must be vector or matrix");
    if (!x[0].length)
        for (let i = 0; i < x.length; i++)
            y[i] = -x[i];
    else
        for (let i = 0; i < x.length; i++)
            for (let j = 0; j < x[0].length; j++)
                y[i][j] = -x[i][j];
    return y;
}
/** negate */
function neg(x) {
    return negTo(empty(x),x);
}
/** negate self */
function mneg(x) {
    return negTo(x,x);
}
function scaTo(y,s,x) {
    //cg.assert(typeof s == "number", "num.sca(): argument s must be number");
    //cg.assert(x.length, "num.sca(): argument x must be vector or matrix");
    if (!x[0].length)
        for (let i = 0; i < y.length; i++)
            y[i] = x[i] * s;
    else
        for (let i = 0; i < y.length; i++)
            for (let j = 0; j < x[0].length; j++)
                y[i][j] = s * x[i][j];
    return y;
}
/** scale */
function sca(s,x) {
    return scaTo(empty(x),s,x);
}
/** scale self */
function msca(s,x) {
    return scaTo(x,s,x);
}
/** add vectors or matrices to self. Arguments x can also contain scalars! */
function madd(y,...x) {
    let ix = 0;
    if (!y[0].length)
        while (ix < x.length)
            if (typeof x[ix] == "number") {
                let s = x[ix++], a = x[ix++];
                for (let i = 0; i < y.length; i++)
                    y[i] += s * a[i];
            } else {
                let a = x[ix++];
                for (let i = 0; i < y.length; i++)
                    y[i] += a[i];
            }
    else
        while (ix < x.length)
            if (typeof x[ix] == "number") {
                let s = x[ix++], a = x[ix++];
                for (let i = 0; i < y.length; i++)
                    for (let j = 0; j < y[0].length; j++)
                        y[i][j] += s * a[i][j];
            } else {
                let a = x[ix++];
                for (let i = 0; i < y.length; i++)
                    for (let j = 0; j < y[0].length; j++)
                        y[i][j] += a[i][j];
            }

    return y;
}
/** add vectors or matrices */
function add(a,...b) {
    return madd(copy(a),...b);
}
/** subtract vectors or matrices from self */
function msub(y,...b) {
    if (!y[0].length)
        for (let ix = 0; ix < b.length; ix++)
            for (let i = 0; i < y.length; i++)
                y[i] -= b[ix][i];
    else
        for (let ix = 0; ix < b.length; ix++)
            for (let i = 0; i < y.length; i++)
                for (let j = 0; j < y[0].length; j++)
                    y[i][j] -= b[ix][i][j];
    return y;
}
/** subtract vectors or matrices */
function sub(a,...b) {
    return msub(copy(a),...b);
}
/** weighted sum */
function wsum(...x) {
    let ix,y;
    if (typeof x[0] == "number") {
        y = sca(x[0],x[1]);
        ix = 2;
    } else {
        y = copy(x[0]);
        ix = 1;
    }
    return madd(y,...x.slice(ix));
}
/** linear interpolation */
function lerp(x,y,u) {
    return wsum(1-u,x,u,y);
}

/// norms ///

/** dot product of two vectors */
function dot(a,b) {
    //cg.assert(a?.length && b?.length, "num.dot(): arguments must be vectors");
    let d = 0;
    for (let i = 0; i < a.length; i++)
        d += a[i] * b[i];
    return d;
}
/** compute vector norm */
function norm(x) {
    //cg.assert(x?.length, "num.norm(): argument x must be vector");
    let s = 0;
    for (let i = 0; i < x.length; i++)
        s += x[i] * x[i];
    return Math.sqrt(s);
}
/**
 * Normalizes a vector and returns it's original length. This modifies the original vector!
 * @param {Vec} x The vector to be normalized
 * @return {Float} The normalized vector
*/
function normalize(x) {
    //cg.assert(x?.length, "num.normalize(): argument x must be vector");
    let n = norm(x);
    for (let i = 0; i < x.length; i++)
        x[i] /= n;
    return x;
}
/**
     * Returns a normalized copy of the vector.
     *  @param {Vec} x The vector to be normalized, it will not be modified.
     * @return {Vec} The normalized vector
    */
function normalized(x) {
    //cg.assert(x?.length, "num.normalized(): argument x must be vector");
    return sca(1 / norm(x), x);
}

/** normalized direction from a to b */
function dir(a,b) {
    //cg.assert(a?.length && b?.length, "num.dir(): arguments must be vectors");
    let v = new Vec(a.length);
    let d = 0;
    for (let i = 0; i < v.length; i++) {
        v[i] = b[i] - a[i];
        d += v[i]*v[i];
    }
    let dd = Math.sqrt(d);
    for (let i = 0; i < v.length; i++)
        v[i] /= dd;
    return v;
}
/** squared distance between a and b */
function dist2(a,b) {
    //cg.assert(a?.length && b?.length, "num.dist2(): arguments must be vectors");
    let s2 = 0;
    for (let i = 0; i < a.length; i++)
        s2 += (b[i]-a[i])*(b[i]-a[i]);
    return s2;
}
/** distance between a and b */
function dist(a,b) {
    return Math.sqrt(dist2(a,b));
}

/**
 * Clampes a vetcor or scalar to [min,max] (element-wise). Does not modify the original vector.
 * @param {(Vec|number)} x the vector or scaler to be clamped
 * @param {number} min min value - default 0.0
 * @param {number} max max value - default 1.0
 * @returns {Vec} The clamped vector.
*/
function clamp(x, min = 0.0, max = 1.0) {
    if (typeof(x) == "number")
        return Math.min(max,Math.max(min,x));
    else if (!x[0].length) {
        let y = empty(x);
        for (let i = 0; i < x.length; i++)
            y[i] = x[i] < 0 ? -x[i] : x[i];
        return y;
    }
}
function abs(x) {
    if (typeof(x) == "number")
        return x < 0 ? -x : x;
    else if (!x[0].length) {
        let y = empty(x);
        for (let i = 0; i < x.length; i++)
            y[i] = Math.min(max,Math.max(min,x[i]))
        return y;
    } //else
        //cg.error("num.abs(): must get number or vector");
}

/// 3D vector algebra ///

/** cross product */
function cross(a,b) {
    //cg.assert(a?.length == 3 && b?.length == 3, "num.cross(): arguments must be vectors of length 3");
    return new Vec(
        a[1]*b[2]-a[2]*b[1],
        a[2]*b[0]-a[0]*b[2],
        a[0]*b[1]-a[1]*b[0]
    );
}
/** find two perpendicular vectors */
function perp(u) {
    //cg.assert(u?.length == 3, "num.perp(): argument must be vector of length 3");
    if (Math.abs(u[0]) <= Math.abs(u[1]) && Math.abs(u[0]) <= Math.abs(u[2]))
        var h = [1,0,0];
    else if (Math.abs(u[1]) <= Math.abs(u[0]) && Math.abs(u[1]) <= Math.abs(u[2]))
        var h = [0,1,0];
    else
        var h = [0,0,1];
    var w = normalized(cross(u,h));
    var v = normalized(cross(w,u));
    return [v,w];
}

/** returns 3D unit vector from polar coordinates (in degrees) with azimuth around z-axis */
function polarZ(theta,phi) {
    let c = Math.cos(phi * torad), s = Math.sin(phi * torad);
    let r = Math.cos(theta * torad);
    return new Vec(r*c,r*s,Math.sin(theta * torad));
}
/** returns 3D unit vector from polar coordinates (in degrees) with azimuth around y-axis */
function polarY(theta,phi) {
    let c = Math.cos(phi * torad), s = Math.sin(phi * torad);
    let r = Math.cos(theta * torad);
    return new Vec(r*c,Math.sin(theta * torad),-r*s);
}

/// matrix algebra ///

/** matrix transpose */
function tra(x) {
    let y = empty(x);
    if (!x[0].length)
        // x is vector -> transpose is matrix
        for (let i = 0; i < y.length; i++)
            y[i] = [ x[i] ];
    else
        for (let i = 0; i < y.length; i++)
            for (let j = 0; j < x.length; j++)
                y[i][j] = x[j][i];
    return y;
}
// helper function for matrix-matrix multiplication
function mulMM(a,b) {
    //cg.assert(a[0]?.length == b.length, "num.mulMM(): incompatible matrices");
    let y = empty(a)
    for (let i = 0; i < y.length; i++)
        for (let j = 0; j < y[0].length; j++) {
            let s = 0;
            for (let k = 0; k < b.length; k++)
                s += a[i][k] * b[k][j];
            y[i][j] = s;
        }
    return y;
}
// helper function for matrix-vector multiplication
function mulMV(a,b) {
    let y = empty(b);
    for (let i = 0; i < y.length; i++) {
        let yy = 0;
        for (let j = 0; j < a[i].length; j++) {
            yy += a[j][i] * b[j];
        }
        y[i] = yy;
    }
    return y;
}
/** matrix-matrix multiplication.
 * First argument can be scalar, last argument can be vector */
function mul(...a) {
    if (a[a.length-1][0].length) {
        // last entry is matrix
        let M;
        if (typeof a[0] == "number") {
            let s = a.shift();
            M = sca(s,a[0]);
        } else
            M = a[0];
            
        for (let ix = 1; ix < a.length; ix++)
            M = mulMM(M,a[ix]);
        return M;
    } else {
        // last entry is vector
        let y;
        if (typeof a[0] == "number") {
            let s = a.shift();
            y = sca(s,a[a.length-1])
        } else
            y = a[a.length-1];
        for (let ix = a.length - 2; ix >= 0; ix--)
            y = mulMV(a[ix],y);
        return y;
    }
}
/** determinant of 2x2 matrix */
function det2(x) {
    //cg.assert(x.length == 2 && x[0].length == 2, "num.det2(): not a 2x2 matrix");
    return x[0][0]*x[1][1] - x[1][0]*x[0][1];
}
/** determinant of 3x3 matrix */
function det3(x) {
    //cg.assert(x.length == 3 && x[0].length == 3, "num.det3(): not a 3x3 matrix");
    return x[0][0]*(x[1][1]*x[2][2] - x[1][2]*x[2][1]) +
           x[1][0]*(x[2][1]*x[0][2] - x[2][2]*x[0][1]) +
           x[2][0]*(x[0][1]*x[1][2] - x[0][2]*x[1][1]);
}
/** determinant */
function det(x) {
    //cg.assert(x.length == x[0].length, "num.det(): not a square matrix");
    if (x.length == 1)
        return x[0][0];
    else if (x.length == 2)
        return det2(x);
    else if (x.length == 3)
        return det3(x);
    else {
        let D = 0;
        // develop over j = 0
        for (let i = 0; i < x.length; i++)
            D += (i%2 ? -x[i][0] : x[i][0]) * det(adj(x,i,0));
        return D;
    }
}
/** invert matrix */
function inv(x) {
    //cg.assert(x.length == x[0].length, "num.inv(): not a square matrix");
    let D = det(x);
    if (D == 0) return x;
    let y = empty(x);
    for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < x.length; j++) {
            y[i][j] = ((i+j)%2 ? -1 : 1) * det(adj(x,j,i)) / D;
        }
    }
        
    return y;
}

/// geometric transformations ///

/**
 * Dehomogenizes a point. This modifies the input x!
 * @param {Vec} x Input point to be dehomogenized.
 * @return {Vec} The dehomogenized point.
*/
function dehom(v) {
    //cg.assert(v?.length > 1, "num.dehom(): not a vector");
    v = v.slice();
    let w = v.pop();
    if (w == 0) return v;
    for (let i = 0; i < v.length; i++)
        v[i] /= w;
    return v;
}
/**
 * Dehomogenizes a vector. This modifies the input x!
 * @param {Vec} x Input vector to be dehomogenized.
 * @return {Vec} The dehomogenized vector.
*/
function dehomVec(x) {
    return new Vec(...x.slice(0,-1));
}
/**
 * Dehomogenizes the input x, treating it as a point. This does not modify x.
 * @param {Vec} x Input point to be dehomogenized.
 * @return {Vec} The dehomogenized point.
*/
function point3D(x) {
    return new Vec(x[0]/x[3],x[1]/x[3],x[2]/x[3]);
}
/**
 * Dehomogenizes the input x, treating it as a vector. This does not modify x.
 * @param {Vec} x Input vector to be dehomogenized.
 * @return {Vec} The dehomogenized vector.
*/
function vec3D(x) {
    return new Vec(x[0],x[1],x[2]);
}
/** transform a point by adding 1 as hom. coord, multiplying with matrix, and dehomogenization */
function transformPoint(M,p) {
    //cg.assert(p?.length > 1, "num.transformPoint(): not a vector");
    return dehom(mul(M, new Vec(...p,1)));
}
/** transform a point by adding 0 as hom. coord, multiplying with matrix, and removing last element */
function transformVector(M,p) {
    //cg.assert(p?.length > 1, "num.transformVector(): not a vector");
    return mul(M, new Vec(...p,0)).slice(0,-1);
}
/** returns an affine 4x4-matrix based on origin and basis vectors */
function aff(t,u,v,w) {
    //cg.assert(t?.length && u?.length && v?.length && w?.length, "num.aff(): not a vector");

    return new Mat(
        [...u, 0],
        [...v, 0],
        [...w, 0],
        [...t ,1]
    );
}
/** returns inverse of affine 4x4-matrix based on origin and basis vectors */
function affInv(t,u,v,w) {
    //cg.assert(t?.length && u?.length && v?.length && w?.length, "num.aff(): not a vector");
    return new Mat(
        [u[0], v[0], w[0], 0],
        [u[1], v[1], w[1], 0],
        [u[2], v[2], w[2], 0],
        [-dot(u,t), -dot(v,t), -dot(w,t), 1]
    );
}
/**
 * Creates a translation matrix given by the translation vector v.
 * @param {Vec} v translation vector, must be 3D!
 * @returns {Mat} translation matrix.
*/
function translate(...v) {
    return new Mat([1,0,0,0], [0,1,0,0], [0,0,1,0], [v.x,v.y,v.z,1]);
}
/**
 * Creates a scaling matrix given by the scaling vector v.
 * @param {(Vec|Float)} v scaling vector, must be 3D or scalar!
 * @returns {Mat} scaling matrix.
*/
function scale(...s) {
    var scal = (arguments.length == 1) ? new Vec(s,s,s) : s;
    return new Mat([scal.x,0,0,0], [0,scal.y,0,0], [0,0,scal.z,0], [0,0,0,1]);
}
/**
 * Creates a rotation matrix given by the angle phi around the x-axis.
 * @param {Float} a rotation angle, given in degrees.
 * @returns {Mat} rotation matrix.
*/
function rotateX(a) {
    return new Mat(
        [1,0,0,0],
        [0,Math.cos(a*torad),Math.sin(a*torad),0],
        [0,-Math.sin(a*torad),Math.cos(a*torad),0],
        [0,0,0,1]
    );
}
/**
 * Creates a rotation matrix given by the angle phi around the y-axis.
 * @param {Float} a rotation angle, given in degrees.
 * @returns {Mat} rotation matrix.
*/
function rotateY(a) {
    return new Mat(
        [Math.cos(a*torad),0,-Math.sin(a*torad),0],
        [0,1,0,0],
        [Math.sin(a*torad),0,Math.cos(a*torad),0],
        [0,0,0,1]
    );
}
/**
 * Creates a rotation matrix given by the angle phi around the z-axis.
 * @param {Float} a rotation angle, given in degrees.
 * @returns {Mat} rotation matrix.
*/
function rotateZ(a) {
    return new Mat(
        [Math.cos(a*torad),Math.sin(a*torad),0,0],
        [-Math.sin(a*torad),Math.cos(a*torad),0,0],
        [0,0,1,0],
        [0,0,0,1]
    );
}
/**
 * Creates a rotation matrix given by the angle phi and rotation axis v.
 * @param {Float} phi rotation angle, given in degrees.
 * @param {Vec} v roation axis, must be normalized.
 * @returns {Mat} rotation matrix.
*/
function rotate(phi,...v) {
    let axis = normalized(v);
    var x = axis.x;
    var y = axis.y;
    var z = axis.z;
    var c = Math.cos(phi*torad);
    var s = Math.sin(phi*torad);
    var l = Math.sqrt(x*x+y*y+z*z);
    x /= l; y /= l; z /= l;

    return new Mat(
        [x*x*(1-c)+c,   x*y*(1-c)+z*s, x*z*(1-c)-y*s, 0],
        [y*x*(1-c)-z*s, y*y*(1-c)+c,   y*z*(1-c)+x*s, 0],
        [x*z*(1-c)+y*s, y*z*(1-c)-x*s, z*z*(1-c)+c,   0],
        [0,0,0,1]
    );
}
/** generate 4x4 matrix that rotates vector a to vector b */
function rotateAToB(a,b) {
    //cg.assert(a?.length && b?.length, "num.rotateAToB(): not a vector");
    let axis = cross(b,a);
    let ab = norm(a) * norm(b);
    var aa = Math.acos(dot(a,b) / ab);
    return rotate(-aa*180/Math.PI,...axis);
}
/** build matrix from (incomplete) coordinate system, where not all vectors must be given */
function matFromSome(t,u,v,w) {
    // if t not given, set it to origin
    t ||= [0,0,0];

    if (!u && !v && !w)
        return translate(...t);
        
    if (u && v && !w) // if u and v is given, compute w
        w = normalized(cross(u,v));
    else if (!u && !v && w) // if only w is given, compute some u and v
        [u,v] = perp(w);
    //cg.assert(u && v && w,"num.matfrom: u,v and w required");
    return aff(t,u,v,w);
}

/** generate 4x4 lookat matrix */
function lookat(eye,at,up) {
    //cg.assert(eye?.length && at?.length && up?.length, "num.lookat(): not a vector");
    let [u,v,w] = this.lookatUVW(eye,at,up);
    return affInv(eye,u,v,neg(w));
}
/** generate camera coordinate system */
function lookatUVW(eye,at,up) {
    //cg.assert(eye?.length && at?.length && up?.length, "num.lookat(): not a vector");
    let w = dir(eye,at);
    let u = normalized(cross(w,up));
    let v = cross(u,w);
    return [u,v,w];
}

/** generate normal matrix for given model matrix */
function matNormal(M) {
    //cg.assert(M[0]?.length, "num.matNormal(): argument M must be matrix");
    return tra(inv(M));
}

/**
* 
* Array derived Vector class.
* @class 
*/
class Vec extends Array {
    /**
     * @constructor Constructs a Vec given the elements. Input can be given in multiple ways:
     * 
     * ```js
     * new Vec(a, b, c);      // single values
     * new Vec([a, b, c]);    // array
     * new Vec(...[a, b, c]); // spread operator on array
     * ```
     * 
     * Most function work on a Vec object, but some functions can be used staticly:
     * 
     * ```js
     * x = x.mul(y);          // Multiply x and y
     * x.mul(y);              // Some functions overwrite the original vector without needing a reasignment (check the doc)
     * const v = mul(x, y);   // most functions can also be called without a vector object
     * ```
     * 
     * Finally, while this is an Array based class, you can access a Vectors elements using x/y/z/w and r/g/b/a, as well as rgb and xyz:
     * ```js
     * const v = new Vec(1,2,3);
     * console.log(v[1]);    // 2
     * console.log(v.z);     // 3
     * console.log(v.rgb);   // [1,2,3]
     * ```
     * 
     * @return {Vec} New Vec
    */
    constructor(...v) {
        if (Array.isArray(v[0])) {
            v = v[0]
        }
        super(...v);
    }
    // setter and getter
    get x() {return get_x(this)}
    get r() {return get_x(this)}
    get y() {return get_y(this)}
    get g() {return get_y(this)}
    get z() {return get_z(this)}
    get b() {return get_z(this)}
    get w() {return get_w(this)}
    get a() {return get_w(this)}
    get xyz() {return get_xyz(this)}
    get rgb() {return get_xyz(this)}
    set x(v) {return set_x(this, v)}
    set r(v) {return set_x(this, v)}
    set y(v) {return set_y(this, v)}
    set g(v) {return set_y(this, v)}
    set z(v) {return set_z(this, v)}
    set b(v) {return set_z(this, v)}
    set w(v) {return set_w(this, v)}
    set a(v) {return set_w(this, v)}
    /**
     * Creates a new Vec with the original values
     * @return {Float} The copied vector
    */
    copy() { return copy(this); }
    /**
     * Creates a String from the vector
     * @return {Float} The formatted String with the vectors values
    */
    str() { return str(this); }
    /**
     * Same as {@link Vec.str}, used by javascript when turning objects to Strings, e.g. when printing to console
    */
    toString() { return str(this); }
    /**
     * Same as {@link Vec.str} but with nicer formating
    */
    pretty() { return pretty(this); }
    /**
     * Compares a vector to another arraylike.
     * @param {Vec} v the vector/array to compare with.
     * @return {Boolean} Returns true if the vector is element-wise identical to v.
    */
    equals(v) {return equals(this, v)}
    /**
     * Takes the element-wise absolute values of this vector. Does not modify the original vector.
     * @returns {Vec} The absolute vector.
    */
    abs() { return abs(this); }
    /**
     * Clampes this vetcor to [min,max] (element-wise). Does not modify the original vector.
     * @param {number} min min value - default 0.0
     * @param {number} max max value - default 1.0
     * @returns {Vec} The clamped vector.
    */
    clamp(min=0.0, max=1.0) { return clamp(this, min, max); }
    /**
     * Creates a negated (element wise multiplied with -1) vector. Does not modify the original one.
     * @returns {Vec} The negated vector.
    */
    neg() { return neg(this); }
    /**
     * Same as {@link Vec.neg}, but overwrites the original vector!
     * @returns {Vec} The negated vector.
    */
    mneg() { return mneg(this); }
    /**
     * Creates a new vector that is scales by a given length.
     * @param {Float} scalar Value to scale the vector with.
     * @returns {Vec} The scaled vector.
    */
    sca(s) { return sca(s,this); }
    /**
     * Same as {@link Vec.sca}, but overwrites the original vector!
     * @param {Float} scalar Value to scale the vector with.
     * @returns {Vec} The scaled vector.
    */
    msca(s) { return msca(s,this); }
    /**
     * Creates a new vector that is an element-wise addition of this vector + b.
     * @param {Vec} b Vector to add to this vector. This can be an Array of Vecs to add all of them to this vector.
     * @returns {Vec} The added up vector.
    */
    add(...b) { return add(this,...b); }
    /**
     * Same as {@link Vec.add}, but overwrites the original vector!
     * @param {Vec} b Vector to add to this vector. This can be an Array of Vecs to add all of them to this vector.
     * @returns The added up vector.
    */
    madd(...b) { return madd(this,...b); }
    /**
     * Creates a new vector that is the element-wise subtraction of this vector - b.
     * @param {Vec} b Vector to subtract to this vector. This can be an Array of Vecs to subtract the sum of them from this vector.
     * @returns {Vec} The resulting vector.
    */
    sub(...b) { return sub(this,...b); }
    /**
     * Same as {@link Vec.sub}, but overwrites the original vector!
     * @param {Vec} b Vector to subtract to this vector. This can be an Array of Vecs to subtract the sum of them from this vector.
     * @returns {Vec} The resulting vector.
    */
    msub(...b) { return msub(this,...b); }
    /**
     * Creates a new vector that is the element-wise sum of this vector and all vectors in b, weighted by their respective weight.
     * @param {Array} b Array containing Vecs and weights. To weight a vector, add a skalar value before it (e.g. [2, v, 5, x] -> this + (2*v) + (5*x))
     * @returns {Vec} The resulting vector.
    */
    wsum(...b) { return wsum(this,...b); }
    /**
     * Calculates the dot product of this vector and b.
     * @param {Array} b The other vector.
     * @returns {Float} The dot product <this, b>
    */
    dot(b) { return dot(this,b); }
    /**
     * Calculates the euclidian norm (length) of this vector.
     * @returns {Float} This vectors length.
     */
    norm() { return norm(this); }
    /**
     * Normalizes the vector and returns it. This modifies the original vector!
     * @return {Float} The normalized vector
    */
    normalize() { return normalize(this); }
    /**
     * Returns a normalized copy of the vector without modifiying the original.
     * @return {Vec} The normalized vector
    */
    normalized() { return normalized(this); }
    /**
     * Creates a new vector from this, but all negative values are multiplied with -1.
     * @returns {Vec} A vector without negative values
    */
    abs() { return abs(this); }
    /**
     * Calculates the normalized direction vector from this vector to b.
     * @return {Float} The direction vector from this to b.
    */
    dir(b) { return dir(this,b); }
    /**
     * Calculates the squared eucledian distance from this vector to b
     * @return {Float} The squared eucledian distance.
    */
    dist2(b) { return dist2(this,b); }
    /**
     * Calculates the eucledian distance from this vector to b. Same as {@link Vec.norm}
     * @return {Float} The eucledian distance.
    */
    dist(b) { return dist(this,b); }
    /**
     * Creates a new vector orthogonal to this vector and b. Works only on 3D vectors.
     * @param b the other vector.
     * @return {Vec} The cross product.
    */
    cross(b) { return cross(this,b); }
    /**
     * Creates two new vectors orthogonal to this vector and each other. Works only on 3D vectors.
     * @return {Array[Vec]} The two orthogonal vectors.
    */
    perp() { return perp(this); }
    /**
     * Dehomogenizes the point. This modifies the original!
     * @return {Vec} The dehomogenized point.
    */
    dehom() { return dehom(this); }
    /**
     * Dehomogenizes the vector. This modifies the original!
     * @param {Vec} x Input vector to be dehomogenized.
     * @return {Vec} The dehomogenized vector.
    */
    dehomVec() { return dehomVec(this); }
    /**
     * Same as {@link Vec.dehom}, but doesn't modify the orginal point.
    */
    point3D() { return point3D(this); }
    /**
     * Same as {@link Vec.dehomVec}, but doesn't modify the orginal vector.
    */
    vec3D() { return vec3D(this); }
    /**
     * Creates a new vector by applying the transformation matrix m to this vector, interpresting it as a point (homogenization with 1).
     * @param {Matrix} M transformation matrix
     * @returns {Vec} The transformed vector (already dehomogenized).
    */
    transformAsPoint(M) { return transformPoint(M,this); }
    /**
     * Creates a new vector by applying the transformation matrix m to this vector, interpresting it as a vector (homogenization with 0).
     * @param {Matrix} M transformation matrix
     * @returns {Vec} The transformed vector (already dehomogenized).
    */
    transformAsVector(M) { return transformVector(M,this); }
}

/** matrix class */
class Mat extends Array {
    /**
     * @constructor Constructs a Mat given the elements. Input can be given in multiple ways (Take care that Mat assumes column major!!!):
     * 
     * ```js
     * new Mat([a,c],[b,d]);    // column vectors
     * new Mat([[a,c],[b,d]]);  // 2D array
     * ```
     * 
     * Most function work on a Mat object, but some functions can be used staticly:
     * 
     * ```js
     * x = x.mul(y);            // Multiply x and y
     * x.mul(y);                // Some functions overwrite the original Mat without needing a reasignment (check the doc)
     * const m = mul(x, y);     // most functions can also be called without a Mat object
     * ```
     * 
     * Finally, to access elements of a Mat object, refer to these examples:
     * ```js
     * const m = new Mat([1,3],[2,4]);
     * console.log(m[0]);       // [1,3]
     * console.log(m.col(0));   // [1,3]
     * console.log(m.row(0));   // [1,2]
     * console.log(m[1][0]);    // 2
     * ```
     * 
     * @return {Mat} New Mat
    */
    constructor(...v) {
        if (Array.isArray(v[0]) && v.length == 1) {
            v = v[0]
        }
        // TODO is not being deep copied, maybe use v.map() or smth
        super(...v);
    }
    /**
     * Creates a new Mat with the original values
     * @return {Float} The copied matrix
    */
    copy() { return copy(this); }
    /**
     * Creates a String from the matrix
     * @return {Float} The formatted String with the matrix values
    */
    str() { return str(this); }
    /**
     * Same as {@link Mat.str}, used by javascript when turning objects to Strings, e.g. when printing to console
    */
    toString() { return str(this); }
    /**
     * Same as {@link Mat.str} but with nicer formating
    */
    pretty() { return pretty(this); }
    /**
     * Compares this matrix to another arraylike.
     * @param {Mat} m the matrix/array of arrays to compare with.
     * @return {Boolean} Returns true if the matrix is element-wise identical to m.
    */
    equals(m) {return equals(this, m)}
    /**
     * Flattens this matrix to a 1d array. Useful for e.g. passing a matrix into a gl shader.
     * @return {Array} 1d array of this matrix
    */
    flatten() {return flatten(this); }
    /**
     * Returns the i-th row of this matrix as a Vec.
     * @param {Int} i row index.
     * @return {Vec} i-th row of this matrix.
    */
    row(i) { return row(this,i); }
    /**
     * Returns the i-th column of this matrix as a Vec.
     * @param {Int} i column index.
     * @return {Vec} i-th column of this matrix.
    */
    col(i) { return col(this,i); }
    /**
     * Creates a negated (element wise multiplied with -1) matrix. Does not modify the original one.
     * @returns {Mat} The negated matrix.
    */
    neg() { return neg(this); }
    /**
     * Same as {@link Mat.neg}, but overwrites the original matrix!
     * @returns {Mat} The negated matrix.
    */
    mneg() { return mneg(this); }
    /**
     * Creates a new matrix that is scales by a given factor.
     * @param {Float} scalar Value to scale the matrix with.
     * @returns {Mat} The scaled matrix.
    */
    sca(s) { return sca(s,this); }
    /**
     * Same as {@link Mat.sca}, but overwrites the original vector!
     * @param {Float} scalar Value to scale the matrix with.
     * @returns {Mat} The scaled matrix.
    */
    msca(s) { return msca(s,this); }
    /**
     * Creates a new matrix that is an element-wise addition of this matrix + b.
     * @param {Mat} b matrix to add to this matrix. This can be an Array of Mats to add all of them to this matrix.
     * @returns {Mat} The added up matrix.
    */
    add(...b) { return add(this,...b); }
    /**
     * Same as {@link Mat.add}, but overwrites the original matrix!
     * @param {Mat} b matrix to add to this matrix. This can be an Array of Mats to add all of them to this matrix.
     * @returns {Mat} The added up matrix.
    */
    madd(...b) { return madd(this,...b); }
    /**
     * Creates a new matrix that is the element-wise subtraction of this matrix - b.
     * @param {Mat} b matrix to subtract to matrix vector. This can be an Array of Mats to subtract the sum of them from this matrix.
     * @returns {Mat} The resulting matrix.
    */
    sub(...b) { return sub(this,...b); }
    /**
     * Same as {@link Mat.sub}, but overwrites the original matrix!
     * @param {Mat} b matrix to subtract to this matrix. This can be an Array of Mats to subtract the sum of them from this matrix.
     * @returns {Mat} The resulting matrix.
    */
    msub(...b) { return msub(this,...b); }
    /**
     * Creates a new matrix that is the element-wise sum of this matrix and all matrices in b, weighted by their respective weight.
     * @param {Array} b Array containing Mats and weights. To weight a matrix, add a skalar value before it (e.g. [2, v, 5, x] -> this + (2*v) + (5*x))
     * @returns {Vec} The resulting matrix.
    */
    wsum(...b) { return wsum(this,...b); }
    /**
     * Transpose this matrix.
     * @returns {Mat} transposed matrix
    */
    tra() { return tra(this); }
    /**
     * Matrix-matrix multiplication or Matrix-vector multiplication. Calculates this * b[0] * b[1] * ...
     * @param {(Mat|Vec|Array[Mat])} b List of Mats, last entry can be a Vec (may also be only a vector).
     * @returns {(Mat|Vec)} result of the multiplication.
    */
    mul(...b) { return mul(this,...b); }
    /**
     * Calculate the determinant of this matrix.
     * @returns {Float} determinant of this matrix.
    */
    det() { return det(this); }
    /**
     * Calculate the inverse of this matrix. Fails silently if matrix is not invertible (check if det != 0 beforehand)
     * @returns {Mat} inverse of this matrix.
    */
    inv() { return inv(this); }
    /**
     * Calculate the normal matrix of this matrix (transpose of inverse). May fail similar to {@link Mat.inv} if this matrix is not invertible.
     * @returns {Mat} normal matrix from this matrix.
    */
    matNormal() {return matNormal(this); }
    /**
     * Transforms a given Vec, interpreting it as a point and this matrix as the transformation.
     * @param {Vec} x point to be transformed.
     * @returns {Vec} transformed point.
    */
    transformPoint(x) { return transformPoint(this,x); }
    /**
     * Transforms a given Vec, interpreting it as a vector and this matrix as the transformation.
     * @param {Vec} x vector to be transformed.
     * @returns {Vec} transformed vector.
    */
    transformVector(x) { return transformVector(this,x); }
    /**
     * Applies this matrix to the transformation matrix given by the translation vector v.
     * @param {Vec} v translation vector, must be 3D!
     * @returns {Mat} new transformation matrix.
    */
    translate(...v) { return mul(this,translate(...v)); }
    /**
     * Applies this matrix to the scaling matrix given by the scaling vector v (gives scaling for each dimension).
     * @param {(Vec|Float)} v scaling vector, must be 3D or scalar!
     * @returns {Mat} new transformation matrix.
    */
    scale(...v) { return mul(this,scale(...v)); }
    /**
     * Applies this matrix to the rotation matrix given by the angle a and rotation axis v.
     * @param {Float} a rotation angle, given in degrees.
     * @param {Vec} v roation axis, must be normalized.
     * @returns {Mat} new transformation matrix.
    */
    rotate(a, ...v) { return mul(this,rotate(a, ...v)); }
    /**
     * Applies this matrix to the rotation matrix given by the angle a and assuming rotation axis (1,0,0).
     * @param {Float} a rotation angle, given in degrees.
     * @returns {Mat} new transformation matrix.
    */
    rotateX(a) { return mul(this,rotateX(a)); }
    /**
     * Applies this matrix to the rotation matrix given by the angle a and assuming rotation axis (0,1,0).
     * @param {Float} a rotation angle, given in degrees.
     * @returns {Mat} new transformation matrix.
    */
    rotateY(a) { return mul(this,rotateY(a)); }
    /**
     * Applies this matrix to the rotation matrix given by the angle a and assuming rotation axis (0,0,1).
     * @param {Float} a rotation angle, given in degrees.
     * @returns {Mat} new transformation matrix.
    */
    rotateZ(a) { return mul(this,rotateZ(a)); }
}

window.Vec = Vec;
window.Mat = Mat;
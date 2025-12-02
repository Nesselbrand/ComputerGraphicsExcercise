/////////////////////////////
////////   Helpers   ////////
/////////////////////////////

/**
 * Compute a perspective transformation
 * that maps the 3D space onto a 2D plane
 * @param {number[]} out - resulting 4x4 Matrix, column-major, 
 * @param {number} fovy
 * @param {number} near 
 * @param {number} far 
 * @returns out
 */
function perspective(fovy, near, far) {
    let f = 1.0 / Math.tan(fovy / 2),
    nf = 1 / (near - far);

    return new Mat( [f, 0, 0, 0],
                    [0, f, 0, 0],
                    [0, 0, (far + near) * nf, -1],
                    [0, 0, (2 * far * near) * nf, 0]);
};

/**
 * a camera rendering a 3D scene to a 2D plane
 */
 class Camera3D {
    constructor(){
        this.eye = new Vec(0, 0, 100);
        this.fovy = 30.0 / 180.0 * Math.PI;
        this.near = 5;
        this.far = 500;
        this.lookAtPoint = new Vec(0, 0, 0);
        this.upVector = new Vec(0, 1, 0);

        // the cameraMatrix transforms from world space to camera space
        this.cameraMatrix = id(4).flatten();
        // projection matrix
        this.projectionMatrix = id(4).flatten();
        // the cameraMatrixInverse transforms from camera space to world space
        this.cameraMatrixInverse = id(4).flatten();

        // setup matrices
        this.update();
    }

    setMatrices(cameraMatrix, projectionMatrix) {
        this.cameraMatrix = cameraMatrix;
        this.projectionMatrix = projectionMatrix;
    }

    lookAt(point3D) {
        this.lookAtPoint = point3D.copy();
        this.update();
    }

    setEye(eye3D) {
        this.eye = eye3D.copy();
        this.update();
    }

    setFar(far) {
        this.far = far;
        this.update();
    }

    setFovy(fovy) {
        this.fovy = fovy;
        this.update();
    }

    move(dir) {
        if (dir == 0) {
            if (this.eye.y >= -99.0) {
                this.eye = this.eye.transformAsPoint(rotateX(-3).tra());
            }
        } else if (dir == 1) {
            if (this.eye.y < 0.0) {
                this.eye = this.eye.transformAsPoint(rotateX(3).tra());
                this.eye.y = Math.min(this.eye.y, 0.0);
            }
        } 
        this.update();
    }

    update() {
        let e = this.eye.copy();
        let g = this.lookAtPoint.sub(this.eye);
        let t = this.upVector.copy();

        this.w = g.neg().normalized();

        this.u = cross(t, this.w).normalized();

        this.v = cross(this.w, this.u)

        let first_matrix = new Mat( [...this.u, 0],
                                    [...this.v, 0],
                                    [...this.w, 0],
                                    [0, 0, 0, 1]).tra();

        let second_matrix = new Mat([1, 0, 0, -e.x],
                                    [0, 1, 0, -e.y],
                                    [0, 0, 1, -e.z],
                                    [0, 0, 0, 1]).tra();

        this.cameraMatrix = second_matrix.mul(first_matrix);

        this.cameraMatrixInverse = this.cameraMatrix.inv();
        
        this.projectionMatrix = perspective(this.fovy, this.near, this.far);
    }
} // end of Camera3D

window.Camera3D = Camera3D

/////////////////////////////
////////   Helpers   ////////
/////////////////////////////


/**
 * a camera rendering a 3D scene to a 2D plane
 */
 class Camera3D {
    constructor(){
        this.theta = 0.0;
        this.phi = 0.0;
        this.radius = 1.0;

        this.fovy = 30.0 / 180.0 * Math.PI;
        this.near = 5;
        this.far = 500;
        this.aspect = 1.0;
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

    perspective(fovy, near, far, aspect) {
        let f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);

        return new Mat( [f/aspect, 0, 0, 0],
                        [0, f, 0, 0],
                        [0, 0, (far + near) * nf, -1],
                        [0, 0, (2 * far * near) * nf, 0]);
    };

    setMatrices(cameraMatrix, projectionMatrix) {
        this.cameraMatrix = cameraMatrix;
        this.projectionMatrix = projectionMatrix;
    }

    lookAt(point3D) {
        this.lookAtPoint = point3D.copy();
        this.update();
    }

    setEye(eye3D) {
        let d = eye3D.sub(this.lookAtPoint);
        let r = d.norm();
        this.theta = Math.atan2(d.x, d.z);
        this.phi = Math.asin(d.y / r);
        this.radius = r;
        this.update();
    }
    
    getEye() {
        return this.lookAtPoint.add(this.sphericalToCartesian(this.radius, this.theta, this.phi));
    }

    setFar(far) {
        this.far = far;
        this.update();
    }

    setFovy(fovy) {
        this.fovy = fovy;
        this.update();
    }

    setAspect(aspect) {
        this.aspect = aspect;
        this.update();
    }

    orbit(dPos) {
        const speed = 0.005;

        this.theta -= dPos.x * speed;
        this.phi   += dPos.y * speed;
        // clamp phi to avoid flipping upside down
        const limit = Math.PI/2 - 0.01;
        this.phi = Math.max(-limit, Math.min(limit, this.phi));

        this.update();
    }

    zoom(delta) {
        const min_radius = 10.0;
        const max_radius = 50.0;
        this.radius += delta * 0.01;
        this.radius = Math.max(Math.min(max_radius, this.radius), min_radius);

        this.update();
    }

    update() {
        let e = this.getEye();
        let g = this.lookAtPoint.sub(e);
        let t = this.upVector.copy();

        this.w = g.neg().normalized();

        this.u = cross(t, this.w).normalized();

        this.v = cross(this.w, this.u);

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
        
        this.projectionMatrix = this.perspective(this.fovy, this.near, this.far, this.aspect);
    }

    sphericalToCartesian(r, theta, phi) {
        return new Vec(r * Math.cos(phi)* Math.sin(theta), r * Math.sin(phi), r * Math.cos(phi) * Math.cos(theta));
    }
} // end of Camera3D

window.Camera3D = Camera3D
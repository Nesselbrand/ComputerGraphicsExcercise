#pragma once

#include "framework/window.h"
#include "framework/camera.h"
#include "framework/mesh.h"
#include "quaternion.h"
#include "fps_camera.h"

using namespace glm;


struct Transformation {
    vec3 position = vec3(0);
    Quaternion orientation;
    float scale = 1;

    mat4 computeModelMatrix() {
            mat4 T = glm::translate(mat4(1),position);
            mat4 R = orientation.toMat4();
            mat4 S = glm::scale(mat4(1),vec3(scale));
            return T * R * S;
    }
};

struct Object {
    Transformation currentTransformation;
    Transformation lastTransformation;
    Transformation interpolatedTransformation;

    void update() {
        lastTransformation = currentTransformation;
    }

    void interpolate(float alpha) {
        // TODO 7.5 b)
        // Interpolate between the current and last transformation with the interpolation parameter alpha.
        interpolatedTransformation = currentTransformation;
    }
};

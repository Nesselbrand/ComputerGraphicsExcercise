#pragma once

#include "framework/config.h"
#include "object.h"

class FPSCamera : public Object {
public:
    FPSCamera();

    void translate(float dx, float dz, float dt);
    void turn(vec2 relMouseMovement);

    void updatePosition(float dt);
    void updateOrientation(bool capture);

    const glm::mat4& getProjectionMatrix() {
        return projectionMatrix;
    }

    glm::vec2 prevMousePosition =  glm::vec2(0.0f, 0.0f);
    glm::mat4 projectionMatrix;

    float startY;
    float vy = 0;

    float cameraSpeed = 5;
    float sensitivity = 0.005f;
};

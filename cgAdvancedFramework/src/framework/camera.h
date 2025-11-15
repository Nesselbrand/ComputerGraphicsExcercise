#pragma once

#include "config.h"

class Camera {
public:
    Camera();
    virtual ~Camera();

    static Camera* getCurrent();
    void setCurrent();

    void reset();
    void translate(float us, float vs, float ws);
    void lookAt(glm::vec3 eye, glm::vec3 center, glm::vec3 up);
    void setProjection(float fovy_degrees, float aspect, float near, float far);

    glm::vec3 getViewPosition() const;
    glm::vec3 getViewDirection() const;
    glm::vec3 getViewUp() const;

    glm::mat4 getModelMatrix() const;
    glm::mat4 getViewMatrix() const;
    glm::mat4 getProjectionMatrix() const;

    void update(float dt);
    void setSpeed(float s) { cameraSpeed = s; }

protected:
    void computeViewMatrix();
    void updateFromSDLKeyboard(float dt);
    void updateFromSDLMouse();

    glm::vec3 m_cameraViewPosition;
    glm::quat orientation;

    glm::mat4 modelMatrix;
    glm::mat4 viewMatrix;
    glm::mat4 projectionMatrix;

    float cameraSpeed = 1;
    glm::vec2 prevMousePosition =  glm::vec2(0.f, 0.f);
};

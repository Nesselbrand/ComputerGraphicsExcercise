#include "camera.h"

static Camera* current_cam = 0;

Camera::Camera() {
    reset();
}

Camera::~Camera() {
    if (current_cam == this)
        current_cam = 0;
}

Camera* Camera::getCurrent() {
    static Camera default_cam;
    return current_cam ? current_cam : &default_cam;
}

void Camera::setCurrent() {
    current_cam = this;
}

void Camera::reset() {
    orientation = glm::quat();
    m_cameraViewPosition = glm::vec3(0.f, 0.f, 4.f);
    computeViewMatrix();
    setProjection(70.f, 16.f / 9.f, 0.1f, 1000.f);
}

void Camera::translate(float us, float vs, float ws) {
    auto d2 = orientation*glm::vec3(-us, -vs, -ws);
    m_cameraViewPosition += d2;
}

void Camera::lookAt(glm::vec3 eye, glm::vec3 center, glm::vec3 up) {
    viewMatrix = glm::lookAt(eye, center, up);
    modelMatrix = glm::inverse(viewMatrix);
    glm::mat3 rot = glm::mat3(modelMatrix);
    orientation = normalize(glm::quat_cast(rot));
    m_cameraViewPosition = eye;
}

void Camera::setProjection(float fovy_degrees, float aspect, float near, float far) {
    projectionMatrix = glm::perspective(glm::radians(fovy_degrees), aspect, near, far);
}

glm::vec3 Camera::getViewPosition() const {
    return m_cameraViewPosition;
}

glm::vec3 Camera::getViewDirection() const {
    return glm::vec3(modelMatrix[2]);
}

glm::vec3 Camera::getViewUp() const {
    return glm::vec3(modelMatrix[1]);
}

glm::mat4 Camera::getModelMatrix() const {
    return modelMatrix;
}

glm::mat4 Camera::getViewMatrix() const {
    return viewMatrix;
}

glm::mat4 Camera::getProjectionMatrix() const {
    return projectionMatrix;
}

void Camera::update(float dt) {
    updateFromSDLKeyboard(dt);
    updateFromSDLMouse();
    computeViewMatrix();
}

void Camera::computeViewMatrix() {
    glm::mat4 T = glm::translate(glm::mat4(1), glm::vec3(m_cameraViewPosition));
    glm::mat4 R = glm::mat4_cast(orientation);
    modelMatrix = T * R;
    viewMatrix = inverse(modelMatrix);
}

void Camera::updateFromSDLKeyboard(float dt) {
    const Uint8 *keyBoardState = SDL_GetKeyboardState(NULL);
    float timeDelta = dt;
    float translateDelta = cameraSpeed * timeDelta * 10.0f;

    if (keyBoardState[SDL_SCANCODE_R]) { reset(); cameraSpeed = 1.0f; };
    if (keyBoardState[SDL_SCANCODE_W]) translate(0.0f, 0.0f, +translateDelta);
    if (keyBoardState[SDL_SCANCODE_S]) translate(0.0f, 0.0f, -translateDelta);
    if (keyBoardState[SDL_SCANCODE_A]) translate(+translateDelta, 0.0f, 0.0f);
    if (keyBoardState[SDL_SCANCODE_D]) translate(-translateDelta, 0.0f, 0.0f);
    if (keyBoardState[SDL_SCANCODE_Q]) translate(0.0f, +translateDelta, 0.0f);
    if (keyBoardState[SDL_SCANCODE_E]) translate(0.0f, -translateDelta, 0.0f);
}

void Camera::updateFromSDLMouse() {
    int mouseX, mouseY;
    Uint32 buttons = SDL_GetMouseState(&mouseX, &mouseY);
    glm::vec2 newMousePos = glm::vec2(mouseX,mouseY);
    glm::vec2 relMovement = prevMousePosition - newMousePos;

    if ( SDL_BUTTON(SDL_BUTTON_LEFT) & buttons) {
        float thetaX = relMovement.x / 360.0f;
        float thetaY = relMovement.y / 360.0f;
        this->orientation = glm::rotate(this->orientation,thetaX,glm::vec3(0, 1, 0));
        this->orientation = glm::rotate(this->orientation,thetaY,glm::vec3(1, 0, 0));
        this->orientation = normalize(this->orientation);
    }

    prevMousePosition = newMousePos;
}

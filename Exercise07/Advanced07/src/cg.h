#pragma once

#include "framework/window.h"
#include "framework/camera.h"
#include "framework/mesh.h"
#include "fps_camera.h"


class CG : public Window {
public:
    CG(int w, int h);

    virtual void update(float dt);
    void interpolate(float dt, float alpha);
    virtual void render();
    virtual void renderGui();
    virtual void processEvent(const SDL_Event& event);

    void decoupledMainLoop();

private:
    float time = 0;
    float timeScale = 1;

    FPSCamera fpscamera; // TODO: Camera::getCurrent()
    Mesh teapotMesh, planeMesh, boxMesh;
    Object teapot, box, box2;
    glm::mat4 plane;

    bool wireframe = true;
    bool captureMouse = false;
    glm::vec3 lightDir = glm::normalize(-glm::vec3(-1, 5, 4));

    glm::vec3 pointOnPlane;
    glm::vec3 planeNormal;

    //================= Game Loop Stuff ==============

    int interpolationMethod = 1;
    Uint64 lastFrameTime = 0, lastUpdateTime = 0;
    Uint64 lastUpdate = 0, lastRender= 0;
    float currentFps = 0, currentUps = 0;

    float updateRate = 10;
    float frameRate = 60;
};

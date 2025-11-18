#pragma once

#include "framework/window.h"
#include "framework/camera.h"
#include "framework/mesh.h"


struct Light {
    int type = 0;
    bool enable = true;

    float ambientIntensity = 0.1f;
    glm::vec3 colorDiffuse = glm::vec3(1);
    float diffuseIntensity = 0.7f;
    float specularIntensity = 0.1f;
    float shiny = 30.f;

    // only for spot and point light
    glm::vec3 position;

    // only for spot and directional light
    glm::vec3 direction = glm::normalize(glm::vec3(-1, -2, -1));

    // only for point and spot light
    glm::vec3 attenuation = glm::vec3(0.1, 0.4, 0.4);

    float angle = glm::radians(45.0f);
    float sharpness = 0.85f;

    void uploadUniform(int location);
    void renderImgui();
};

class CG : public Window {
public:
    CG(int w, int h);

    virtual void update(float dt);
    virtual void render();
    virtual void renderGui();

private:
    float time = 0;
    float timeScale = 1;

    Mesh teapotMesh, armadilloMesh, planeMesh, lanternMesh, lanternLampMesh, bonfireMesh;
    glm::mat4 teapot, armadillo, plane, lantern, lanternLamp, bonfire, fire;

    Light directionalLight;
    Light spotLight;
    Light pointLight;

    bool cellShading = false;
};

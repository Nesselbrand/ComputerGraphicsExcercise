#pragma once

#include "framework/window.h"
#include "framework/camera.h"
#include "framework/mesh.h"


class CG : public Window {
public:
    CG(int w, int h);

    virtual void update(float dt);
    virtual void render();
    virtual void renderGui();

private:
    float time = 0;
    float timeScale = 1;
    Mesh teapotMesh, planeMesh;

    glm::mat4 teapot, plane;

    struct Particle {
        glm::vec3 position;		// the position of the particle in world space
        glm::vec3 velocity;		// the velocity of the particle
        float lifeTime;			// the time until the particle is resetted to the starting position
        float timeOffset;		// an individual time offset to get particles out of sync
    };

    glm::vec3 particleStart;
    std::vector<Particle> particles;

    glm::vec3 lightDir = normalize(-glm::vec3(2, 5, -0.1));

    glm::vec3 pointOnPlane;
    glm::vec3 planeNormal;

    bool enableGeometry = true;
    bool enableTeapotShadows = false;
    bool enableParticles = false;
    bool enableParticleShadows = false;

    void renderOpaqueGeometry();
    void renderOpaqueGeometryShadows();
    void renderParticles();
    void renderParticleShadows();
};

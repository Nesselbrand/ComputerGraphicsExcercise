#include "cg.h"

using namespace glm;

CG::CG(int w, int h) : Window(w, h) {
    shaderManager.registerProgram("simple_color", SHADERTYPE_FLAG::VERTEX | SHADERTYPE_FLAG::FRAGMENT);
    shaderManager.update();
    
    sphereMesh.load("data/icosphere.obj");

    {
        // create ring mesh
        int segments = 100;
        float radius = 1;
        std::vector<int> indices;
        std::vector<VertexNT> vertices;
        for(int i = 0; i < segments; ++i) {
            VertexNT v;
            float angle = float(i) / segments * glm::two_pi<float>();
            v.position = vec4(radius * sin(angle), -cos(angle), 0, 1);
            vertices.push_back(v);
            indices.push_back(i);
        }
        indices.push_back(0);
        ringMesh.create(vertices.data(), vertices.size(), indices.data(), indices.size());
    }

    Camera::getCurrent()->lookAt(vec3(0, 0, 10), vec3(0), vec3(0, 1, 0));
}

void CG::update(float dt) {
    time += dt * timeScale;

    if(!ImGui::GetIO().WantCaptureMouse)
        Camera::getCurrent()->update(dt);

    auto wSunSpin    = (sunRotationTime    > 0.f) ? glm::two_pi<float>() / sunRotationTime    : 0.f;
    auto wEarthSpin  = (earthRotationTime  > 0.f) ? glm::two_pi<float>() / earthRotationTime  : 0.f;
    auto wEarthRev   = (earthRevolutionTime> 0.f) ? glm::two_pi<float>() / earthRevolutionTime: 0.f;
    auto wMoonSpin   = (moonRotationTime   > 0.f) ? glm::two_pi<float>() / moonRotationTime   : 0.f;
    auto wMoonRev    = (moonRevolutionTime > 0.f) ? glm::two_pi<float>() / moonRevolutionTime : 0.f;

    float sunSpinAngle   = wSunSpin   * time;
    float earthSpinAngle = wEarthSpin * time;
    float earthRevAngle  = wEarthRev  * time;
    float moonSpinAngle  = wMoonSpin  * time;
    float moonRevAngle   = wMoonRev   * time;


    sun =
          glm::rotate(sunObliquity, glm::vec3(1,0,0))
        * glm::rotate(sunSpinAngle, glm::vec3(0,0,1))
        * glm::scale(glm::vec3(sunRadius));


    earth =
          glm::rotate(earthRevAngle, glm::vec3(0,0,1))
        * glm::translate(glm::vec3(earthOrbitRadius, 0, 0))
        * glm::rotate(earthObliquity, glm::vec3(1,0,0))
        * glm::rotate(earthSpinAngle, glm::vec3(0,0,1))
        * glm::scale(glm::vec3(earthRadius));


    moon =
          glm::rotate(earthRevAngle, glm::vec3(0,0,1))
        * glm::translate(glm::vec3(earthOrbitRadius, 0, 0))
        * glm::rotate(moonOrbitalInclination, glm::vec3(1,0,0))
        * glm::rotate(moonRevAngle, glm::vec3(0,0,1))
        * glm::translate(glm::vec3(moonOrbitRadius, 0, 0))
        * glm::rotate(moonObliquity, glm::vec3(1,0,0))
        * glm::rotate(moonSpinAngle, glm::vec3(0,0,1))
        * glm::scale(glm::vec3(moonRadius));

    earthOrbit =
          glm::scale(glm::vec3(earthOrbitRadius));

    moonOrbit =
          glm::rotate(earthRevAngle, glm::vec3(0,0,1))
        * glm::translate(glm::vec3(earthOrbitRadius, 0, 0))
        * glm::rotate(moonOrbitalInclination, glm::vec3(1,0,0))
        * glm::scale(glm::vec3(moonOrbitRadius));
}


void CG::render() {
    glClearColor(0, 0, 0, 1);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glEnable(GL_DEPTH_TEST);

    // enable wireframe mode
    glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    glUseProgram(shaderManager.getProgramGL("simple_color"));

    glm::mat4 m = Camera::getCurrent()->getProjectionMatrix() * Camera::getCurrent()->getViewMatrix();
    glUniformMatrix4fv(0, 1, GL_FALSE, &m[0][0]);

    // render sun
    glUniform4fv(2, 1, &vec4(1, 1, 0, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &sun[0][0]);
    sphereMesh.render();

    // render earth
    glUniform4fv(2, 1, &vec4(0, 0, 1, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &earth[0][0]);
    sphereMesh.render();
    glUniformMatrix4fv(1, 1, GL_FALSE, &earthOrbit[0][0]);
    ringMesh.render(GL_LINE_STRIP);

    // render moon
    glUniform4fv(2, 1, &vec4(0.6, 0.6, 0.6, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &moon[0][0]);
    sphereMesh.render();
    glUniformMatrix4fv(1, 1, GL_FALSE, &moonOrbit[0][0]);
    ringMesh.render(GL_LINE_STRIP);

    // disable wireframe mode
    glPolygonMode(GL_FRONT_AND_BACK, GL_FILL);
}

void CG::renderGui() {
    ImGui::SetNextWindowPos(ImVec2(0, 0), ImGuiSetCond_Once);
    ImGui::SetNextWindowSize(ImVec2(500, 400), ImGuiSetCond_Once);
    ImGui::Begin("Solar System");
    ImGui::SliderFloat("Time Scale", &timeScale, 0, 10);
    ImGui::SliderFloat("sunRotationTime", &sunRotationTime, 1, 100);
    ImGui::SliderAngle("sunObliquity", &sunObliquity, -90, 90);
    ImGui::SliderFloat("sunRadius", &sunRadius, 0, 10);
    ImGui::SliderFloat("earthRotationTime", &earthRotationTime,0, 5);
    ImGui::SliderFloat("earthRevolutionTime", &earthRevolutionTime,0, 500);
    ImGui::SliderAngle("earthObliquity", &earthObliquity, -90, 90);
    ImGui::SliderFloat("earthRadius", &earthRadius, 0, 5);
    ImGui::SliderFloat("earthOrbitRadius", &earthOrbitRadius, 0, 20);
    ImGui::SliderFloat("moonRevolutionTime", &moonRevolutionTime, 0, 50);
    ImGui::SliderFloat("moonRotationTime", &moonRotationTime, 0, 50);
    ImGui::SliderAngle("moonOrbitalInclination", &moonOrbitalInclination, -90, 90);
    ImGui::SliderAngle("moonObliquity", &moonObliquity, -90, 90);
    ImGui::SliderFloat("moonRadius", &moonRadius, 0, 2);
    ImGui::SliderFloat("moonOrbitRadius", &moonOrbitRadius, 0, 6);
    ImGui::End();
}

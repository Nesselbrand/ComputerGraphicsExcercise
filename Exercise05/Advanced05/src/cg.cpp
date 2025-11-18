#include "cg.h"

using namespace glm;

void Light::uploadUniform(int location) {
    glUniform1iv(location++, 1, &type);
    int e = enable;
    glUniform1iv(location++, 1, &e);
    glUniform3fv(location++, 1, &colorDiffuse[0]);
    glUniform1fv(location++, 1, &diffuseIntensity);
    glUniform1fv(location++, 1, &specularIntensity);
    glUniform1fv(location++, 1, &shiny);
    glUniform1fv(location++, 1, &ambientIntensity);
    glUniform3fv(location++, 1, &position[0]);
    glUniform3fv(location++, 1, &direction[0]);
    glUniform3fv(location++, 1, &attenuation[0]);
    glUniform1fv(location++, 1, &angle);
    glUniform1fv(location++, 1, &sharpness);
}

void Light::renderImgui() {
    ImGui::Checkbox("enable",&enable);
    if (type == 1 || type == 2) {
        ImGui::InputFloat3("attenuation",&attenuation[0]);
    } 
    if (type == 2) {
        ImGui::SliderAngle("angle",&angle,0,90);
        ImGui::SliderFloat("sharpness",&sharpness,0,1);
    }
    ImGui::NewLine();
    ImGui::SliderFloat("diffuseIntensity",&diffuseIntensity,0,1);
    ImGui::SliderFloat("specularIntensity",&specularIntensity,0,1);
    ImGui::SliderFloat("shiny",&shiny,0,100);
    ImGui::SliderFloat("ambientIntensity",&ambientIntensity,0,1);
    ImGui::ColorPicker3("colorDiffuse",&colorDiffuse[0]);
}

CG::CG(int w, int h) : Window(w, h) {
    shaderManager.registerProgram("simple_color", SHADERTYPE_FLAG::VERTEX | SHADERTYPE_FLAG::FRAGMENT);
    shaderManager.registerProgram("light_types", SHADERTYPE_FLAG::VERTEX | SHADERTYPE_FLAG::FRAGMENT);
    shaderManager.registerProgram("fire", SHADERTYPE_FLAG::VERTEX | SHADERTYPE_FLAG::FRAGMENT);
    shaderManager.update();

    teapotMesh.load("data/teapot.obj");
    lanternMesh.load("data/lantern.obj");
    lanternLampMesh.load("data/lanternlamp.obj");
    bonfireMesh.load("data/bonfire.obj");
    armadilloMesh.load("data/armadillo.obj");
    planeMesh.create_plane_mesh();

    teapot = glm::translate(vec3(-1,0,-6)) * glm::rotate(glm::radians(90.0f),vec3(0, 1, 0)) * glm::scale(vec3(0.6f)) * glm::translate(vec3(0, 1, 0));
    plane = glm::scale(vec3(10));

    // set default light parameters
    directionalLight.type = 0;
    directionalLight.colorDiffuse = vec3(201, 226, 255) / 255.0f;
    directionalLight.diffuseIntensity = 0.5;
    directionalLight.specularIntensity = 0.1f;
    directionalLight.ambientIntensity = 0.1f;

    bonfire = glm::translate(vec3(-5, 0, -5));
    vec4 bonfirePos = vec4(0, 2, 0, 1);
    pointLight.type = 1;
    pointLight.position = vec3(bonfire * bonfirePos);
    pointLight.colorDiffuse = vec3(242, 125, 12) / 255.0f;
    pointLight.specularIntensity = 0.1f;
    pointLight.diffuseIntensity = 0.8f;
    pointLight.ambientIntensity = 0;
    pointLight.attenuation =  vec3(0.1, 0.01, 0.02);

    lantern = glm::translate(vec3(3, 0, 3));
    lanternLamp = lantern;
    vec4 lanternPos = vec4(0, 6.7, 2.3, 1);
    spotLight.type = 2;
    spotLight.position = vec3(lantern * lanternPos);
    spotLight.direction = vec3(0, -1, 0);
    spotLight.colorDiffuse = vec3(1, 1, 1);
    spotLight.ambientIntensity = 0.f;
    spotLight.specularIntensity = 0.2f;
    spotLight.diffuseIntensity = 0.7f;
    spotLight.attenuation =  vec3(0.1, 0.01, 0.02);

    Camera::getCurrent()->lookAt(vec3(-8, 8, 8), vec3(0), vec3(0, 1, 0));
}

void CG::update(float dt) {
    shaderManager.update();

    if(!ImGui::GetIO().WantCaptureMouse)
        Camera::getCurrent()->update(dt);
    dt *= timeScale;
    time += dt;

    // create "flickering" effect by stacking some sin functions of different frequencies
    pointLight.diffuseIntensity = (glm::sin(time*10.0f) + glm::sin( (time+12)*7) + glm::sin((time+633)*20)) * 0.3333f * 0.05 + 0.95;

    // create orthonormal basis parallel to the x-z plane that rotates the fire towards the camera
    mat3 v = mat3(Camera::getCurrent()->getViewMatrix());
    v = inverse(v);
    v[2].y = 0;
    v[2] = normalize(v[2]);
    v[0] = normalize(cross(vec3(0,1,0),v[2]));
    v[1] = cross(v[2],v[0]);
    fire =  bonfire * glm::translate(vec3(0,2,0)) * mat4(v) * glm::rotate(glm::radians(90.0f), vec3(1,0,0)) * glm::scale(vec3(2));

    // rotate around y axis
    armadillo = glm::translate(vec3(4,0,7)) * glm::rotate(glm::radians(100.0f)+time,vec3(0,1,0)) * glm::scale(vec3(1.2f)) * glm::translate(vec3(0,1,0));
}


void CG::render() {
    glClearColor(0, 0, 0, 1);
    glDepthMask(GL_TRUE);
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glEnable(GL_DEPTH_TEST);

    glm::mat4 projView = Camera::getCurrent()->getProjectionMatrix() * Camera::getCurrent()->getViewMatrix();
    glUseProgram(shaderManager.getProgramGL("light_types"));

    // upload uniforms
    glUniformMatrix4fv(0, 1, GL_FALSE, &projView[0][0]);
    directionalLight.uploadUniform(5);
    spotLight.uploadUniform(17);
    pointLight.uploadUniform(29);
    int cs  = cellShading;
    glUniform1iv(4, 1, &cs);
    glUniform3fv(3, 1, &Camera::getCurrent()->getViewPosition()[0]);

    // plane
    glUniform3fv(2, 1, &vec4(0.7, 0.7, 0.7, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &plane[0][0]);
    planeMesh.render();

    // lantern
    glUniform3fv(2, 1, &vec4(0.7, 0.7, 0.7, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &lantern[0][0]);
    lanternMesh.render();

    // bonfire
    vec4 color = vec4(133, 94, 66, 255) / 255.0f;
    glUniform3fv(2, 1, &color[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &bonfire[0][0]);
    bonfireMesh.render();

    // teapot
    glUniform3fv(2, 1, &vec4(1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &teapot[0][0]);
    teapotMesh.render();

    // armadillo
    glUniform3fv(2, 1, &vec4(1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &armadillo[0][0]);
    armadilloMesh.render();

    // render the white part of the lantern
    glUseProgram(shaderManager.getProgramGL("simple_color"));
    glUniformMatrix4fv(0, 1, GL_FALSE, &projView[0][0]);

    glUniform4fv(2, 1, &vec4(spotLight.colorDiffuse, 1)[0]);
    glUniformMatrix4fv(1, 1, GL_FALSE, &lanternLamp[0][0]);
    lanternLampMesh.render();

    // render bonfire with "classic" alpha blending like the particles from last exercise
    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glDepthMask(GL_FALSE);

    glUseProgram(shaderManager.getProgramGL("fire"));
    glUniformMatrix4fv(0, 1, GL_FALSE, &projView[0][0]);
    glUniform1iv(3, 1, &cs);
    // fire
    glUniform1fv(2, 1, &time);
    glUniformMatrix4fv(1, 1, GL_FALSE, &fire[0][0]);
    planeMesh.render();

    glDepthMask(GL_TRUE);
    glDisable(GL_BLEND);
}

void CG::renderGui() {
    ImGui::SetNextWindowPos(ImVec2(0, 0), ImGuiSetCond_FirstUseEver);
    ImGui::SetNextWindowSize(ImVec2(400, 400), ImGuiSetCond_FirstUseEver);
    ImGui::Begin("Lighting");
    ImGui::SliderFloat("timeScale", &timeScale,0,2);
    ImGui::Checkbox("cellShading", &cellShading);
    ImGui::PushID(0);
    if(ImGui::CollapsingHeader("Directional Light")){
        directionalLight.renderImgui();
    }
    ImGui::PopID();
    ImGui::PushID(1);
    if(ImGui::CollapsingHeader("Point Light")){
        pointLight.renderImgui();
    }
    ImGui::PopID();
    ImGui::PushID(2);
    if(ImGui::CollapsingHeader("Spot Light")){
        spotLight.renderImgui();

    }
    ImGui::PopID();
    ImGui::End();
}

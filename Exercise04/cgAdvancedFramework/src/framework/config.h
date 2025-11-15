#pragma once

#define NOMINMAX

#include <assert.h>
#include <string>
#include <vector>
#include <map>
#include <cstdlib>
#include <iostream>
#include <fstream>

//#define SDL_MAIN_HANDLED
#include <SDL2/SDL.h>

#include <GL/glew.h>

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/glm.hpp>
#include <glm/ext.hpp>

inline std::ostream& operator<<(std::ostream& os, const glm::quat& v) {
    os << "(" << v.x << "," << v.y << "," << v.z << "," << v.w << ")";
    return os;
}

inline std::ostream& operator<<(std::ostream& os, const glm::vec4& v) {
    os << "(" << v.x << "," << v.y << "," << v.z << "," << v.w << ")";
    return os;
}

inline std::ostream& operator<<(std::ostream& os, const glm::vec3& v) {
    os << "("<< v.x << "," << v.y << "," << v.z << ")";
    return os;
}

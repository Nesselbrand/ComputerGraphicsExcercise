#pragma once

#include "config.h"

class Texture {
public:
    Texture();
    Texture(const std::string& path);
    Texture(const uint8_t* data, uint32_t width, uint32_t height, uint32_t channels);
    virtual ~Texture();

    void load(const std::string& path);
    void load(const uint8_t* data, uint32_t width, uint32_t height, uint32_t channels);
    void bind(int location, int uniform);

    GLuint id;
    GLenum target;
};

#include "texture.h"
#define STB_IMAGE_IMPLEMENTATION
#include "stb/stb_image.h"

// ------------------------------------------------------------
// stb image load helper, usage: auto [data, w, h, c, is_hdr] = load_image(path);

std::tuple<std::vector<uint8_t>, int, int, int, bool> image_load(const std::string& path) {
    stbi_set_flip_vertically_on_load(1); // important: the default value for this is different on windows and linux

    uint8_t* data = 0;
    int w_out, h_out, channels_out;
    bool is_hdr_out = stbi_is_hdr(path.c_str());
    size_t size_of_buffer = 0;

    // load image from disk
    if (is_hdr_out) {
        data = (uint8_t*)stbi_loadf(path.c_str(), &w_out, &h_out, &channels_out, 0);
        size_of_buffer = w_out * h_out * channels_out * sizeof(float);
    } else {
        data = stbi_load(path.c_str(), &w_out, &h_out, &channels_out, 0);
        size_of_buffer = w_out * h_out * channels_out;
    }
    if (!data)
        throw std::runtime_error("Failed to load image file: " + path);

    // copy array to output
    std::vector<uint8_t> data_out;
    data_out.insert(data_out.end(), &data[0], &data[size_of_buffer]);
    
    // free data
    stbi_image_free(data);

    return { data_out, w_out, h_out, channels_out, is_hdr_out };
}

// ------------------------------------------------------------
// Texture

Texture::Texture() : id(0), target(GL_TEXTURE_2D) { }

Texture::Texture(const std::string& path) : Texture() {
    load(path);
}

Texture::Texture(const uint8_t* data, uint32_t width, uint32_t height, uint32_t channels) : Texture() {
    load(data, width, height, channels);
}

Texture::~Texture() {
    if(glIsTexture(id)) glDeleteTextures(1, &id);
}

void Texture::load(const std::string& path) {
    auto [data, width, height, channels, is_hdr] = image_load(path);
    if (is_hdr)
        throw std::runtime_error("Error: HDR images not supported!");
    load(data.data(), width, height, channels);
}

void Texture::load(const uint8_t* data, uint32_t width, uint32_t height, uint32_t channels) {
    if(glIsTexture(id)) glDeleteTextures(1, &id);

    GLenum type = GL_UNSIGNED_BYTE;
    GLint internal_format = channels == 4 ? GL_RGBA8 : channels == 3 ? GL_RGB8 : channels == 2 ? GL_RG8 : GL_R8;
    GLenum format = channels == 4 ? GL_RGBA : channels == 3 ? GL_RGB : channels == 2 ? GL_RG : GL_RED;
    bool mipmap = true;

    // init GL texture
    glGenTextures(1, &id);
    glBindTexture(GL_TEXTURE_2D, id);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE); // GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE); // GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, mipmap ? GL_LINEAR_MIPMAP_LINEAR : GL_LINEAR);

    // OpenGL needs 4 byte alignment after every row by default
    // stbi loaded data is not aligned that way -> pixelStore attributes need to be set
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glPixelStorei(GL_UNPACK_ROW_LENGTH, 0);
    glPixelStorei(GL_UNPACK_SKIP_PIXELS, 0);
    glPixelStorei(GL_UNPACK_SKIP_ROWS, 0);

    // upload texture to GPU and generate mipmap
    glTexImage2D(GL_TEXTURE_2D, 0, internal_format, width, height, 0, format, type, data);
    if (mipmap) glGenerateMipmap(GL_TEXTURE_2D);
    glBindTexture(GL_TEXTURE_2D, 0);
}

void Texture::bind(int location, int uniform) {
    glUniform1i(uniform, location);
    glActiveTexture(GL_TEXTURE0+location);
    glBindTexture(target, id);
}

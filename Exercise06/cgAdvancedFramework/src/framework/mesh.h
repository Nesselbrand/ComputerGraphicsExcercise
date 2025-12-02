#pragma once

#include "config.h"
#include "obj_loader.h"

struct Mesh {
    Mesh();
    Mesh(const Mesh&) = delete;
    virtual ~Mesh();

    void load(const std::string& path);
    void create(const VertexNT* vertices, GLsizeiptr n_vertices, const int* indices, GLsizeiptr n_indices);

    void create_plane_mesh();

    void render(GLenum render_mode = GL_TRIANGLES);
    void render_array(GLenum render_mode = GL_TRIANGLES);

    GLuint vao, vbo, ibo;
    int num_elements;
    GLenum draw_mode;
};

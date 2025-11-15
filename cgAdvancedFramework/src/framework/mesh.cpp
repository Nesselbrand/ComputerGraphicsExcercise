#include "mesh.h"

Mesh::Mesh() : vao(0), vbo(0), ibo(0), num_elements(0) {}

Mesh::~Mesh() {
    if (glIsVertexArray(vao)) glDeleteVertexArrays(1, &vao);
    if (glIsBuffer(ibo)) glDeleteBuffers(1, &ibo);
    if (glIsBuffer(vbo)) glDeleteBuffers(1, &vbo);
}

void Mesh::load(const std::string& path) {
    ObjLoader objLoader;
    objLoader.loadFile(path);
    create(objLoader.outVertices.data(), objLoader.outVertices.size(), (const int*)objLoader.outTriangles.data(), objLoader.outTriangles.size() * 3);
}

void Mesh::create(const VertexNT* vertices, GLsizeiptr n_vertices, const int* indices, GLsizeiptr n_indices) {
    // delete old, if present
    if (glIsVertexArray(vao)) glDeleteVertexArrays(1, &vao);
    if (glIsBuffer(ibo)) glDeleteBuffers(1, &ibo);
    if (glIsBuffer(vbo)) glDeleteBuffers(1, &vbo);

    // create vertex array
    glGenVertexArrays(1, &vao);
    glBindVertexArray(vao);

    // create vertex buffer
    glGenBuffers(1, &vbo);
    glBindBuffer(GL_ARRAY_BUFFER, vbo);
    glBufferData(GL_ARRAY_BUFFER, sizeof(VertexNT) * n_vertices, vertices, GL_STATIC_DRAW);

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 4, GL_FLOAT, GL_FALSE, sizeof(VertexNT), 0);
    glEnableVertexAttribArray(1);
    glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, sizeof(VertexNT), (void*)(4 * sizeof(GLfloat)));
    glEnableVertexAttribArray(2);
    glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, sizeof(VertexNT), (void*)(8 * sizeof(GLfloat)));

    // create index buffer
    glGenBuffers(1, &ibo);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(int) * n_indices, indices, GL_STATIC_DRAW);

    glBindVertexArray(0);
    glBindBuffer(GL_ARRAY_BUFFER, 0);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, 0);

    num_elements = n_indices;
}

void Mesh::create_plane_mesh() {
    std::vector<VertexNT> vertices;
    VertexNT v;
    v.normal = glm::vec4(0, 1, 0, 0);
    v.position = glm::vec4(-1, 0, -1, 1);
    v.texture = glm::vec2(0, 0);
    vertices.push_back(v);
    v.position = glm::vec4(1, 0, -1, 1);
    v.texture = glm::vec2(1, 0);
    vertices.push_back(v);
    v.position = glm::vec4(1, 0, 1, 1);
    v.texture = glm::vec2(1, 1);
    vertices.push_back(v);
    v.position = glm::vec4(-1, 0, 1, 1);
    v.texture = glm::vec2(0, 1);
    vertices.push_back(v);
    std::vector<int> indices = {0, 1, 2, 2, 3, 0};
    create(vertices.data(), vertices.size(), indices.data(), indices.size());
}

void Mesh::render(GLenum render_mode) {
    glBindVertexArray(vao);
    glDrawElements(render_mode, num_elements, GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

void Mesh::render_array(GLenum render_mode) {
    glBindVertexArray(vao);
    glDrawArrays(render_mode, 0, num_elements);
    glBindVertexArray(0);
}

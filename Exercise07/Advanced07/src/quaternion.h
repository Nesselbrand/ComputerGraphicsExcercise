#pragma once

#include "framework/config.h"

/**
 * A quaternion of the form
 * q = w + xi + yj + zk
 * with i, j, k imaginary elements.
 */
class Quaternion {
public:
    float real; // <- Real part
    glm::vec3 img; // <- Imaginary part

    Quaternion();
    Quaternion(glm::vec3 axis, float angle);

    glm::mat3 toMat3();
    glm::mat4 toMat4();

    // simple functions
    float norm() const;
    Quaternion normalize();
    Quaternion conjugate() const;
    Quaternion inverse() const;
    friend float dot(Quaternion x, Quaternion y);
    friend Quaternion slerp(Quaternion l, Quaternion r, float t);

    // operators
    friend Quaternion operator*(Quaternion l, Quaternion r);
    friend Quaternion operator+(Quaternion l, Quaternion r);
    friend Quaternion operator*(Quaternion l, float r);
    friend glm::vec3 operator*(Quaternion l, glm::vec3 r);
    friend std::ostream& operator<<(std::ostream& str, Quaternion r);
};

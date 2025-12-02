cmake_minimum_required(VERSION 3.14)

############# PROJECT SETUP ###############

project(cgAdvancedFramework LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

set(PROGRAM_VERSION_MAJOR 1)
set(PROGRAM_VERSION_MINOR 3)

############# DEPENDENCIES SETUP ###############

set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(BUILD_STATIC_LIBS ON CACHE BOOL "" FORCE)

# submodule folder
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_SOURCE_DIR}/submodules)

# OpenGL
find_package(OpenGL REQUIRED)
set(LIB_INCLUDES ${LIB_INCLUDES} ${OPENGL_INCLUDE_DIRS})
set(LIBS ${LIBS} ${OPENGL_LIBRARIES})

# GLEW
set(glew-cmake_BUILD_STATIC ON CACHE BOOL "" FORCE)
set(glew-cmake_BUILD_SHARED OFF CACHE BOOL "" FORCE)
add_subdirectory(${CMAKE_SOURCE_DIR}/submodules/glew-cmake)
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_SOURCE_DIR}/submodules/glew-cmake/include)
set(LIBS ${LIBS} libglew_static)

# SDL2
set(SDL_TEST OFF CACHE BOOL "" FORCE)
add_subdirectory(${CMAKE_SOURCE_DIR}/submodules/SDL)
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_SOURCE_DIR}/submodules/SDL/include)
set(LIBS ${LIBS} SDL2-static)

# GLM
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_SOURCE_DIR}/submodules/glm)

# STB
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_SOURCE_DIR}/submodules/stb)

############# COMPILER FLAGS ###############

if (MSVC)
    # set warnings and multiprocessor compilation
    add_compile_options(/W2)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /MP")
else()
    # set warnings and std::filesystem
    add_compile_options(-pedantic)
    set(LIBS ${LIBS} stdc++fs)
endif()

############# SOURCE ###############

add_subdirectory(src)

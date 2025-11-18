#include "cg.h"

#include <filesystem>

#undef main

int main(int argc, char** argv) {
    // set assignment directory as current path
    std::filesystem::current_path( ASSIGNMENT_DIRECTORY );

    CG cg(1280,720);
    cg.startMainLoop();
    return 0;

}

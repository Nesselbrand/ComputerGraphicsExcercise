# CG C++ Framework

This is the C++ framework for the advanced tutorials of the computer graphics lecture at the Friedrich-Alexander-Universität Erlangen-Nürnberg.

# Setup the framework

In order to build the framework we require the following dependencies:

- C++17 build environment depending on your OS (g++ or MSVC, for example)
- CMake: https://cmake.org/

## Installing dependencies (CIP-Pool)

In the CIP-Pools, everything is already pre-installed. So, this step can be skipped.

## Installing dependencies (Ubuntu)

Execute the following commands (or similar for your distro) in a terminal:

    sudo apt-get update && sudo apt-get upgrade -y
    sudo apt-get install build-essential libx11-dev xorg-dev libopengl-dev freeglut3-dev cmake
    sudo apt-get install libsdl2-mixer-2.0-0 libudev-dev libasound2-dev libdbus-1-dev

## Installing dependencies (Windows)

Install either Visual Studio or the Visual Studio Build Tools (https://visualstudio.microsoft.com/downloads/).
We recommend installing the Visual Studio Build Tools and using Visual Studio Code as editor.
Finally, download and install CMake (https://cmake.org/).
Please note that Windows support is not guaranteed, you might need to do some troubleshooting on your own.
If it does not work on your machine, it will always work in the CIP pools.

# Build the framework

Run the following two commands in a terminal in the root folder, i.e. `cgAdvancedFramework`, to configure and build the framework:

    cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -Wno-dev
	cmake --build build --parallel

Alternatively, open the root folder, i.e. `cgAdvancedFramework`, in CMake GUI or an editor with CMake integration, like VSCode for example.

Using Visual Studio Code, install the extension "CMake Tools" (extension ID `ms-vscode.cmake-tools`) and make sure this is the **only** CMake extension installed, or building the framework may fail.
Next, hit "F1" and enter "CMake: Build" and select an appropriate kit for your system.

Using CMake GUI, enter the path to the `cgAdvancedFramework` folder on your system into "Where is the source code" and `<your-path-to>/cgAdvancedFramework/build` into "Where to build the binaries".
Next, hit "Configure", "Generate" and "Open Project" to open the resulting project in Visual Studio.

The compiled executables can be found in the respective assignment folders, i.e. **cgAdvancedFramework/src/Advanced03/**. Note that on Windows, it may generate an additional `Debug` or `Release` folder in this location.

# Adding an assignment to the framework

- Add the folder with the assignment to **cgAdvancedFramework/src**, i.e. **cgAdvancedFramework/src/Advanced03** or **cgAdvancedFramework/src/Advanced04**
- CMake configure and generate the project again (see above). This adds the new assignment to the project

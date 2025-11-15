#include "window.h"
#include "camera.h"

static std::string getStringForSource(GLenum source) {
    switch(source) {
    case GL_DEBUG_SOURCE_API:
        return "API";
    case GL_DEBUG_SOURCE_WINDOW_SYSTEM:
        return "Window System";
    case GL_DEBUG_SOURCE_SHADER_COMPILER:
        return "Shader Compiler";
    case GL_DEBUG_SOURCE_THIRD_PARTY:
        return "Third Party";
    case GL_DEBUG_SOURCE_APPLICATION:
        return "Application";
    case GL_DEBUG_SOURCE_OTHER:
        return "Other";
    default:
        return "Unknown";
    }
}

static std::string getStringForType(GLenum type) {
    switch(type) {
    case GL_DEBUG_TYPE_ERROR:
        return "Error";
    case GL_DEBUG_TYPE_DEPRECATED_BEHAVIOR:
        return "Deprecated Behaviour";
    case GL_DEBUG_TYPE_UNDEFINED_BEHAVIOR:
        return "Undefined Behaviour";
    case GL_DEBUG_TYPE_PORTABILITY:
        return "Portability Issue";
    case GL_DEBUG_TYPE_PERFORMANCE:
        return "Performance Issue";
    case GL_DEBUG_TYPE_OTHER:
        return "Other";
    default:
        return "Unknown";
    }
}

static std::string getStringForSeverity(GLenum severity) {
    switch(severity) {
    case GL_DEBUG_SEVERITY_HIGH_ARB:
        return "High";
    case GL_DEBUG_SEVERITY_MEDIUM_ARB:
        return "Medium";
    case GL_DEBUG_SEVERITY_LOW_ARB:
        return "Low";
    case GL_DEBUG_SEVERITY_NOTIFICATION:
        return "Notification";
    default:
        return "Unknown";
    }
}

static void DebugLogConst(GLenum source, GLenum type, GLuint id, GLenum severity, GLsizei length, const GLchar *message, const GLvoid *userParam) {
    (void)userParam; (void)length; // make compiler happy
    if (id == 131185 || id == 1282) return; // skip verbose buffer detailed info messages
    std::cout << "Type: " << getStringForType(type) << ", Source: " << getStringForSource(source) << ", ID: " << id << ", Severity: " << getStringForSeverity(severity) << std::endl;
    std::cout << "Message: " << message << std::endl;
}

static int eventWatcher(void* data, SDL_Event* event) {
    if (event->type == SDL_WINDOWEVENT && event->window.event == SDL_WINDOWEVENT_RESIZED) {
        SDL_Window* window = SDL_GetWindowFromID(event->window.windowID);
        if (window == (SDL_Window*)data) {
            int w, h;
            SDL_GetWindowSize(window, &w, &h);
            glViewport(0, 0, w, h);
            Camera::getCurrent()->setProjection(70.f, float(w) / float(h), 0.1f, 1000.f);
        }
  }
  return 0;
}

Window::Window(int w, int h, bool vsync) : w(w), h(h), shaderManager("shaders/", ".glsl", true) {
    // setup OpenGL/SDL
    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_AUDIO | SDL_INIT_TIMER)) {
        std::cerr << "SDL_Init() failed: " << SDL_GetError() << std::endl;
        exit(1);
    }

    SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
    SDL_GL_SetAttribute(SDL_GL_DEPTH_SIZE, 24);
    SDL_GL_SetAttribute(SDL_GL_RED_SIZE, 8);
    SDL_GL_SetAttribute(SDL_GL_GREEN_SIZE, 8);
    SDL_GL_SetAttribute(SDL_GL_BLUE_SIZE, 8);
    SDL_GL_SetAttribute(SDL_GL_ALPHA_SIZE, 8);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_PROFILE_MASK, SDL_GL_CONTEXT_PROFILE_CORE);
    SDL_GL_SetAttribute(SDL_GL_CONTEXT_FLAGS, SDL_GL_CONTEXT_DEBUG_FLAG);

    Uint32 flags =  SDL_WINDOW_OPENGL | SDL_WINDOW_SHOWN;
    sdlWindow = SDL_CreateWindow("CG", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, w, h, flags);
    assert(sdlWindow);
    context = SDL_GL_CreateContext(sdlWindow);
    assert(context);

    SDL_SetWindowResizable(sdlWindow, SDL_TRUE);
    SDL_AddEventWatch(eventWatcher, sdlWindow);

    // setup GLEW
    if (glewInit() != GLEW_OK) {
        std::cerr << "glewInit() failed." << std::endl;
        SDL_Quit();
        exit(1);
    }

    std::cout << "OpenGL version: " << glGetString(GL_VERSION) << std::endl;
    std::cout << "GLSL version: " << glGetString(GL_SHADING_LANGUAGE_VERSION) << std::endl;
    std::cout << "Renderer: " << glGetString(GL_RENDERER) << std::endl;

    SDL_GL_SetSwapInterval(vsync ? 1 : 0);

    glDebugMessageCallback((GLDEBUGPROC)DebugLogConst, 0);

    imgui.init(sdlWindow);
}

Window::~Window() {
    imgui.shutdown();
    SDL_Quit();
}

void Window::startMainLoop() {
    Uint64 startTime = SDL_GetPerformanceCounter();
    Uint64 previousTime = 0;

    // Mainloop
    bool running = true;
    while (running) {

        Uint64 currentTime = SDL_GetPerformanceCounter() - startTime;
        Uint64 diff = currentTime - previousTime;
        double diffS = double(diff) / SDL_GetPerformanceFrequency();

        if (previousTime > 0)
            fps = (1.0 / diffS) * 0.2 + 0.8 * fps; // smooth a little bit

        SDL_Event event;
        while (SDL_PollEvent(&event) > 0) {
            imgui.processEvent(event);
            processEvent(event);
            if (event.type == SDL_QUIT || (event.type == SDL_KEYDOWN && event.key.keysym.sym == SDLK_ESCAPE)) {
                running = false;
            }
        }
        if (!running) break;

        float dt = diffS;

        update(dt);
        render();

        imgui.beginFrame();
        renderGui();
        imgui.endFrame();

        SDL_GL_SwapWindow(sdlWindow);

        previousTime = currentTime;
    }
}

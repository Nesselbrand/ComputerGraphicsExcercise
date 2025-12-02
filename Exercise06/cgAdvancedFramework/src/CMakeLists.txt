# compile framework
file(GLOB_RECURSE FRAMEWORK_SOURCES framework/*.cpp framework/*.h)
add_library(CG STATIC ${FRAMEWORK_SOURCES})
target_include_directories(CG PRIVATE ${LIB_INCLUDES} .)
target_link_libraries(CG PRIVATE ${LIBS})
target_compile_definitions(CG PUBLIC -D_SILENCE_EXPERIMENTAL_FILESYSTEM_DEPRECATION_WARNING)

# add framework to libs
set(LIB_INCLUDES ${LIB_INCLUDES} ${CMAKE_CURRENT_SOURCE_DIR}/framework)
set(LIBS ${LIBS} CG)

# fetch assignments
file(GLOB children RELATIVE ${CMAKE_CURRENT_LIST_DIR} ${CMAKE_CURRENT_LIST_DIR}/*)
list(FILTER children INCLUDE REGEX "^Advanced[0-9][0-9].*$")

# build assignments
foreach(child ${children})
    if(IS_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}/${child})
        add_subdirectory(${child})
    endif()
endforeach()

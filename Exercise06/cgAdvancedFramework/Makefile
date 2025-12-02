all:
	cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -Wno-dev
	cmake --build build --parallel

debug:
	cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug -Wno-dev
	cmake --build build --parallel

clean:
	cmake --build build --target clean
	rm -rf build

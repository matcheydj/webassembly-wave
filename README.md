# WebAssembly - Wave

Simple benchmark comparing performance of WebAssembly and JavaScript.

## Description

This is a simulation of the [wave equation](https://en.wikipedia.org/wiki/Wave_equation)
<span class="eq">&#8706;<sup>2</sup>u/&#8706;t<sup>2</sup> = c<sup>2</sup>(&#8706;<sup>2</sup>u/&#8706;x<sup>2</sup>+&#8706;<sup>2</sup>u/&#8706;y<sup>2</sup>)</span>
across a 2D manifold with a boundary condition of u=0 along the unit circle. Use the mouse to create waves.

It contains two implementations of the same C code: one transpiled by hand to JavaScript, and one compiled by Enscripten to WebAssembly.
This particular algorithm processes large arrays and performs a lot of integer math (but does no floating point calculations).
Memory is shared between JS and WebAssembly with no copying, and almost all CPU time is spent in the algorithm itself.
(The canvas API introduces a minor overhead of about 10%.)
The speed increase is modest (about 20%) when the same code is run in a WebAssembly context as opposed to pure JavaScript.

### Compiling program

There are two options for generating the WebAssembly .wasm file:

* Go to [WebAssembly Explorer](https://mbebenita.github.io/WasmExplorer/)
or [WasmFiddle](https://mbebenita.github.io/WasmExplorer/)
or [WebAssembly Studio](https://webassembly.studio/),
paste the contents of `wasm/waves.c` in the editor, press "build", and download the `waves.wasm` file (and optionally `waves.wat`).
* Compile `waves.c` with Emscripten: `emcc source.c -s WASM=1 -s SIDE_MODULE=1 -o target.wasm`

## Other stuff

* Directory `codepen` is a version with the .wasm bundled inline as a base64 string.
* Directory `test` has a test page that loads the .wasm module and runs a small test.

## Author

[Jason Tiscione](<tiscione@gmail.com>)

## Version History

* 1.0
    * Initial Upload

## License

This project is licensed under the MIT License.
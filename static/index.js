// Import our outputted wasm ES6 module
// Which, export default's, an initialization function
import init from "/static/hello-wasm/hello_wasm.js";
import wasmInit from "/static/wasm-graphics/wasm_graphics.js"

const runWasm = async () => {
  // Instantiate our wasm module
  const helloWorld = await init("/static/hello-wasm/hello_wasm_bg.wasm");

  // Call the Add function export from wasm, save the result
  const addResult = helloWorld.add(24, 24);

  // Set the result onto the body
  document.body.innerHTML += `<br>This HTML is being added to the DOM via a .js File.`;
  document.body.innerHTML += `<br>This is the result of an imported WASM module 'addResult': ${addResult} !!`;

  /**
     * Part one: Write in Wasm, Read in JS
     */
  console.log("Write in Wasm, Read in JS, Index 0:");

  // First, let's have wasm write to our buffer
  helloWorld.store_value_in_wasm_memory_buffer_index_zero(24);

  // Next, let's create a Uint8Array of our wasm memory
  let wasmMemory = new Uint8Array(helloWorld.memory.buffer);

  // Then, let's get the pointer to our buffer that is within wasmMemory
  let bufferPointer = helloWorld.get_wasm_memory_buffer_pointer();

  // Then, let's read the written value at index zero of the buffer,
  // by accessing the index of wasmMemory[bufferPointer + bufferIndex]
  console.log(wasmMemory[bufferPointer + 0]); // Should log "24"

  /**
   * Part two: Write in JS, Read in Wasm
   */
  console.log("Write in JS, Read in Wasm, Index 1:");

  // First, let's write to index one of our buffer
  wasmMemory[bufferPointer + 1] = 15;

  // Then, let's have wasm read index one of the buffer,
  // and return the result
  console.log(helloWorld.read_wasm_memory_buffer_and_return_index_one()); // Should log "15"

  // Instantiate our wasm module
  const rustWasm = await wasmInit("/static/wasm-graphics/graphics_bg.wasm");

  // Create a Uint8Array to give us access to Wasm Memory
  const wasmByteMemoryArray = new Uint8Array(rustWasm.memory.buffer);

  // Get our canvas element from our index.html
  const canvasElement = document.querySelector("canvas");

  // Set up Context and ImageData on the canvas
  const canvasContext = canvasElement.getContext("2d");
  const canvasImageData = canvasContext.createImageData(
    canvasElement.width,
    canvasElement.height
  );

  // Clear the canvas
  canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

  const getDarkValue = () => {
    return Math.floor(Math.random() * 100);
  };

  const getLightValue = () => {
    return Math.floor(Math.random() * 127) + 127;
  };

  const drawCheckerBoard = () => {
    const checkerBoardSize = 20;

    // Generate a new checkboard in wasm
    rustWasm.generate_checker_board(
      getDarkValue(),
      getDarkValue(),
      getDarkValue(),
      getLightValue(),
      getLightValue(),
      getLightValue()
    );

    // Pull out the RGBA values from Wasm memory
    // Starting at the memory index of out output buffer (given by our pointer)
    // 20 * 20 * 4 = checkboard max X * checkerboard max Y * number of pixel properties (R,G.B,A)
    const outputPointer = rustWasm.get_output_buffer_pointer();
    const imageDataArray = wasmByteMemoryArray.slice(
      outputPointer,
      outputPointer + checkerBoardSize * checkerBoardSize * 4
    );

    // Set the values to the canvas image data
    canvasImageData.data.set(imageDataArray);

    // Clear the canvas
    canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Place the new generated checkerboard onto the canvas
    canvasContext.putImageData(canvasImageData, 0, 0);
  };

  drawCheckerBoard();
  setInterval(() => {
    drawCheckerBoard();
  }, 1000);
};

runWasm();

// TESTING GROUND FOR CUSTOM AUDIO AND GRAPHICS FUNCTIONS

let canvasElement any = undefined;
let canvasContext: any = undefined;
let canvasImageData: any = undefined;

// Define some constants
const GAMEBOY_CAMERA_WIDTH = 160;
const GAMEBOY_CAMERA_HEIGHT = 144;
const GAMEBOY_CAMERA_SCALE = 2;

const WASMBOY_SAMPLE_RATE = 44100;
// These magic numbers just come from preference, can be set as options
const DEFAULT_AUDIO_LATENCY_IN_MILLI = 100;
// Some constants that use the ones above that will allow for faster performance
const DEFAULT_AUDIO_LATENCY_IN_SECONDS = DEFAULT_AUDIO_LATENCY_IN_MILLI / 1000;

function init() {

    canvasElement = document.getElementById('wasmboyCanvas');

    if(canvasElement) {

        canvasContext = canvasElement.getContext('2d');

        canvasElement.width = GAMEBOY_CAMERA_WIDTH;
        canvasElement.height = GAMEBOY_CAMERA_HEIGHT;
        canvasImageData = canvasContext.createImageData(canvasElement.width, canvasElement.height);

        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // WasmBoy.setCanvas(canvasElement);
    } else {
        console.log("NO CANVAS")
    }

}

// Function to get our RGB image data array from our frame
const getImageDataFromFrame = async () => {
    // Get our output frame
    const frameInProgressVideoOutputLocation = await WasmBoy._getWasmConstant('FRAME_LOCATION');
    const frameInProgressMemory = await WasmBoy._getWasmMemorySection(
        frameInProgressVideoOutputLocation,
        frameInProgressVideoOutputLocation + GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 3 + 1
    );

    // Going to compare pixel values from the VRAM to confirm tests
    const imageDataArray = [];
    const rgbColor = [];

    for (let y = 0; y < GAMEBOY_CAMERA_HEIGHT; y++) {
        for (let x = 0; x < GAMEBOY_CAMERA_WIDTH; x++) {
            // Each color has an R G B component
            let pixelStart = (y * GAMEBOY_CAMERA_WIDTH + x) * 3;

            for (let color = 0; color < 3; color++) {
                rgbColor[color] = frameInProgressMemory[pixelStart + color];
            }

            // Doing graphics using second answer on:
            // https://stackoverflow.com/questions/4899799/whats-the-best-way-to-set-a-single-pixel-in-an-html5-canvas
            // Image Data mapping
            const imageDataIndex = (x + y * GAMEBOY_CAMERA_WIDTH) * 4;

            imageDataArray[imageDataIndex] = rgbColor[0];
            imageDataArray[imageDataIndex + 1] = rgbColor[1];
            imageDataArray[imageDataIndex + 2] = rgbColor[2];
            // Alpha, no transparency
            imageDataArray[imageDataIndex + 3] = 255;
        }
    }

    return imageDataArray;
}

function updateGraphicsCallback (imageDataArray: any) {
    console.log(imageDataArray);
    // Logic from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    for (var i = 0; i < imageDataArray.length; i += 4) {
        imageDataArray[i]     = 255 - imageDataArray[i];     // red
        imageDataArray[i + 1] = 255 - imageDataArray[i + 1]; // green
        imageDataArray[i + 2] = 255 - imageDataArray[i + 2]; // blue
    }
}

const sampleAudio = async () => {

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const numberOfSamples = await WasmBoy._runWasmExport('getNumberOfSamplesInAudioBuffer', [])
    // console.log("number of samples");
    // console.log(numberOfSamples)

    const audioLocation = await WasmBoy._getWasmConstant('AUDIO_BUFFER_LOCATION');
    // console.log(audioLocation);
    // const audioInProgressMemory = await WasmBoy._getWasmMemorySection(
    //     frameInProgressVideoOutputLocation,
    //     frameInProgressVideoOutputLocation + GAMEBOY_CAMERA_HEIGHT * GAMEBOY_CAMERA_WIDTH * 3 + 1
    // );

    // AUDIO_BUFFER_LOCATION

    await WasmBoy._runWasmExport('clearAudioBuffer', [])

    const leftChannelBuffer = 0
    const rightChannelBuffer = 0

    // Get our buffers as floats
    const leftChannelBufferAsFloat = new Float32Array(leftChannelBuffer);
    const rightChannelBufferAsFloat = new Float32Array(rightChannelBuffer);

    // Create an audio buffer, with a left and right channel
    let audioBuffer = audioContext.createBuffer(2, numberOfSamples, WASMBOY_SAMPLE_RATE);
    // this._setSamplesToAudioBuffer(this.audioBuffer, leftChannelBufferAsFloat, rightChannelBufferAsFloat);

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    let source = audioContext.createBufferSource();

    // set the buffer in the AudioBufferSourceNode
    source.buffer = audioBuffer;

    // source.playbackRate.setValueAtTime(playbackRate, this.audioContext.currentTime);

    let finalNode = source;

    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    finalNode.connect(audioContext.destination);

    let audioContextCurrentTime = audioContext.currentTime;
    let audioContextCurrentTimeWithLatency = audioContextCurrentTime + DEFAULT_AUDIO_LATENCY_IN_SECONDS;
    // let audioPlaytime = audioPlaytime || audioContextCurrentTimeWithLatency;
    let audioPlaytime = audioContextCurrentTimeWithLatency;

    // start the source playing
    source.start(audioPlaytime);

    
}

function loop() {

    // 0 return, execution succesful, -1 broken
    WasmBoy._runWasmExport('executeFrame', []);

    getImageDataFromFrame().then((imageDataArray: any) => {

        // load image data into canvas
        canvasImageData.data.set(imageDataArray);
        canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasContext.putImageData(canvasImageData, 0, 0);
    })
}
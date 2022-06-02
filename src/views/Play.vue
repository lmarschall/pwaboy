<template>

    <!-- WASMBOY CANVAS -->
    <div class="container">
        <canvas id="wasmboyCanvas" width="200" height="100" style="border:1px solid #000000;">
        </canvas>
    </div>

    <input type="file" id="inputROM" @change="loadROM" name="TEST">

    <input type="button" id="input" @click="play" value="PLAY">

    <!-- CONTROLS -->
    <Buttons v-on:buttonClicked="handleButtonClicked"></Buttons>
</template>

<style scoped>
</style>

<script setup lang="ts">

    import { onMounted, onUpdated, ref } from "vue";
    import { WasmBoy } from 'wasmboy'

    import Buttons from "../components/Buttons.vue";

    import { EButtons } from "./../defines"

    // let canvasElement: any = document.getElementById("wasmboyCanvas");
    let canvasElement: any = undefined;
    let canvasContext: any = undefined;
    let canvasImageData: any = undefined;
    let doLoop = true;

    // Define some constants
    const GAMEBOY_CAMERA_WIDTH = 160;
    const GAMEBOY_CAMERA_HEIGHT = 144;

    function init() {

        canvasElement = document.querySelector('canvas');

        if(canvasElement) {

            canvasContext = canvasElement.getContext('2d');
    
            canvasElement.width = GAMEBOY_CAMERA_WIDTH;
            canvasElement.height = GAMEBOY_CAMERA_HEIGHT;
            canvasImageData = canvasContext.createImageData(canvasElement.width, canvasElement.height);
    
            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
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

    function fps() {
        console.log(WasmBoy.getFPS())
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

    // const updateGraphicsCallback = (imageDataArray: any) => {
    //     console.log(imageDataArray);
    //     // Logic from: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    //     for (var i = 0; i < imageDataArray.length; i += 4) {
    //         imageDataArray[i]     = 255 - imageDataArray[i];     // red
    //         imageDataArray[i + 1] = 255 - imageDataArray[i + 1]; // green
    //         imageDataArray[i + 2] = 255 - imageDataArray[i + 2]; // blue
    //     }
    // }

    function control() {
        const newState = {
            UP: false,
            RIGHT: false,
            DOWN: false,
            LEFT: false,
            A: false,
            B: false,
            SELECT: false,
            START: false,
        }
        WasmBoy.setJoypadState(newState);
    }

    // default config
    // const WasmBoyOptions = {
    //     headless: false,
    //     useGbcWhenOptional: true,
    //         isAudioEnabled: true,
    //         frameSkip: 1,
    //         audioBatchProcessing: true,
    //         timersBatchProcessing: false,
    //         audioAccumulateSamples: true,
    //         graphicsBatchProcessing: false,
    //         graphicsDisableScanlineRendering: false,
    //         tileRendering: true,
    //         tileCaching: true,
    //         gameboyFPSCap: 60,
    //     updateGraphicsCallback: false,
    //     updateAudioCallback: false,
    //     saveStateCallback: false,
    //     onReady: false,
    //     onPlay: false,
    //     onPause: false,
    //     onLoadedAndStarted: false
    // }

    // headless config
    const WasmBoyOptions = {
        headless: true,
        useGbcWhenOptional: true,
            isAudioEnabled: true,
            frameSkip: 1,
            audioBatchProcessing: true,
            timersBatchProcessing: false,
            audioAccumulateSamples: true,
            graphicsBatchProcessing: false,
            graphicsDisableScanlineRendering: false,
            tileRendering: true,
            tileCaching: true,
            gameboyFPSCap: 60,
        updateGraphicsCallback: false,
        updateAudioCallback: false,
        saveStateCallback: false,
        onReady: false,
        onPlay: false,
        onPause: false,
        onLoadedAndStarted: false
    }

    // const WasmBoyOptions = {
    //     headless: true,
    //     useGbcWhenOptional: true,
    //         isAudioEnabled: true,
    //         frameSkip: 1,
    //         audioBatchProcessing: true,
    //         timersBatchProcessing: false,
    //         audioAccumulateSamples: true,
    //         graphicsBatchProcessing: false,
    //         graphicsDisableScanlineRendering: false,
    //         tileRendering: true,
    //         tileCaching: true,
    //         gameboyFPSCap: 60,
    //     updateGraphicsCallback: true,
    //     updateAudioCallback: true,
    //     saveStateCallback: true
    // }

    const wasmBoyConfig = {
        WasmBoyOptions,
        onPlay: () => {
            console.log("on play");
        },
        onPause: () => {
            console.log("on pause");
        },
        onReady: () => {
            console.log("on pause");
        },
        saveStateCallback: (saveStateObject: any) => {
            console.log("save state callback");
        },
        updateAudioCallback: (audioContext: any, audioBufferSourceNode: any) => {

            console.log("update audio callback");
        },
        updateGraphicsCallback: (imageDataArray: any) => {

            console.log("update graphics callback");
        }
    };

    // WasmBoy.config(WasmBoyOptions)
    WasmBoy.config(WasmBoyOptions, canvasElement)
    .then(() => {
        console.log('WasmBoy is configured!');
        // You may now load games, or use other exported functions of the lib.
    }).catch(() => {
        console.error('Error Configuring WasmBoy...');
    });

    function handleButtonClicked(buttonKey: EButtons) {

        console.log(buttonKey);
    }

    function loadROM(event: any) {
        console.log(event.target.files[0])

        init();

        // const url = `https://drive.google.com/file/d/1hNdtRcx6NKOT3U5oCVoeQ4nOn27U3Eji/view?usp=sharing`
        WasmBoy.loadROM(event.target.files[0]).then(() => {
            console.log('WasmBoy ROM loaded!');
            // init();
        }).catch(() => {
            console.error('Error loading the ROM');
        });

        // WasmBoy.loadROM(url).then(() => {
        //     console.log('WasmBoy ROM loaded!');
        // }).catch(() => {
        //     console.error('Error loading the ROM');
        // });
    }

    function play() {
        WasmBoy.play().then(() => {
            console.log('WasmBoy is playing!');
            loop();
        }).catch(() => {
            console.error('WasmBoy had an error playing...');
        });
    }

    function loop() {

        // WasmBoy.setCanvas(canvasElement);
        WasmBoy._runWasmExport('executeMultipleFrames', [1]);
        // Draw a screenshot of the frame reached
        getImageDataFromFrame().then((imageDataArray: any) => {

            console.log(imageDataArray);
            // Add our new imageData
            // canvasImageData.data.set(imageDataArray);

            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.putImageData(canvasImageData, 0, 0);
        })

        setTimeout(loop, 100);

    }

    function pause() {
        WasmBoy.pause().then(() => {
            console.log('WasmBoy is paused!');
            }).catch(() => {
            console.error('WasmBoy had an error pausing...');
            });
    }

</script>
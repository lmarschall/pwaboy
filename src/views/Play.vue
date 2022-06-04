<template>

    <!-- WASMBOY CANVAS -->
    <div class="container">
        <canvas id="wasmboyCanvas" width="200" height="100" style="border:1px solid #000000;" allow="autoplay">
        </canvas>
    </div>

    <audio id="myAudio" 
        controls loop
        src="./../assets/sound.mp3" 
        type="audio/mp3" hidden
        >
    </audio>

    <input type="file" id="inputROM" @change="loadROM" name="TEST">

    <input type="button" id="input" v-on:click="play" value="PLAY">

    <!-- <input type="button" id="input" @click="start" value="START"> -->

    <!-- CONTROLS -->
    <Controls v-on:updateControl="updateControlStates" v-on:buttonClicked="handleButtonClicked"></Controls>
</template>

<style scoped>
</style>

<script setup lang="ts">

    import { onMounted, onUpdated, ref } from "vue";
    import { WasmBoy } from 'wasmboy'

    import Controls from "../components/Controls.vue";

    import { EButton, EControl } from "./../defines"

    // let canvasElement: any = document.getElementById("wasmboyCanvas");
    let canvasElement: any = undefined;
    let canvasContext: any = undefined;
    let canvasImageData: any = undefined;
    let doLoop = true;
    let newControl = 0;

    // Define some constants
    const GAMEBOY_CAMERA_WIDTH = 160;
    const GAMEBOY_CAMERA_HEIGHT = 144;

    const WASMBOY_SAMPLE_RATE = 44100;
    // These magic numbers just come from preference, can be set as options
    const DEFAULT_AUDIO_LATENCY_IN_MILLI = 100;
    // Some constants that use the ones above that will allow for faster performance
    const DEFAULT_AUDIO_LATENCY_IN_SECONDS = DEFAULT_AUDIO_LATENCY_IN_MILLI / 1000;

    const controlStates = {
        UP: false,
        RIGHT: false,
        DOWN: false,
        LEFT: false,
        A: false,
        B: false,
        SELECT: false,
        START: false
    } as any

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

    // default config
    // const WasmBoyOptions = {
    //     headless: false,
    //     useGbcWhenOptional: true,
    //     isAudioEnabled: true,
    //     frameSkip: 1,
    //     audioBatchProcessing: true,
    //     timersBatchProcessing: false,
    //     audioAccumulateSamples: true,
    //     graphicsBatchProcessing: false,
    //     graphicsDisableScanlineRendering: false,
    //     tileRendering: true,
    //     tileCaching: true,
    //     gameboyFPSCap: 60,
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
        updateGraphicsCallback: async (imageDataArray: any) => {
            console.log("update graphics callback");

            canvasImageData.data.set(imageDataArray);

            canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasContext.putImageData(canvasImageData, 0, 0);
        },
        onReady: () => {
            console.log("on ready");
        },
        onPlay: () => {
            console.log("on play");
        },
        onPause: () => {
            console.log("on pause");
        },
        // updateGraphicsCallback: false,
        updateAudioCallback: async (audio: any) => {
            console.log("update audio callback");

            console.log(audio);

            // canvasImageData.data.set(imageDataArray);

            // canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
            // canvasContext.putImageData(canvasImageData, 0, 0);
        }
        // saveStateCallback: false,
        // onReady: false,
        // onPlay: false,
        // onPause: false,
        // onLoadedAndStarted: false
    }

    const wasmBoyConfig = {
        WasmBoyOptions,
        updateGraphicsCallback: (imageDataArray: any) => {

            console.log("update graphics callback");
        },
        updateAudioCallback: (audioContext: any, audioBufferSourceNode: any) => {

            console.log("update audio callback");
        },
        saveStateCallback: (saveStateObject: any) => {
            console.log("save state callback");
        },
        onReady: () => {
            console.log("on pause");
        },
        onPlay: () => {
            console.log("on play");
        },
        onPause: () => {
            console.log("on pause");
        }
    };

    // WasmBoy.config(wasmBoyConfig)
    WasmBoy.config(WasmBoyOptions)
    // WasmBoy.config(WasmBoyOptions, canvasElement)
    .then(() => {
        console.log('WasmBoy is configured!');
        // You may now load games, or use other exported functions of the lib.
    }).catch(() => {
        console.error('Error Configuring WasmBoy...');
    });


    function updateControlStates(controlKey: EControl, active: boolean) {

        // console.log(controlStates);
        // console.log(EControl[controlKey]);

        controlStates[EControl[controlKey]] = active
        
        WasmBoy.setJoypadState(controlStates);
    }

    function handleButtonClicked(buttonKey: EButton) {

        if(buttonKey == EButton.SAVE) {

            WasmBoy.saveState();
        }

        if(buttonKey == EButton.LOAD) {

            WasmBoy.getSaveStates().then((saveStates: any) => {
                console.log(saveStates);

                if(saveStates.length) {
                    WasmBoy.loadState(saveStates.at(-1));
                }
            })
        }
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

        WasmBoy.resumeAudioContext();
        var x = document.getElementById("myAudio") as any;
        x.play();
        WasmBoy.play().then(() => {
            console.log('WasmBoy is playing!');
            setInterval(loop, Math.floor(1000/60))
        }).catch(() => {
            console.error('WasmBoy had an error playing...');
        });
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

    function pause() {
        WasmBoy.pause().then(() => {
            console.log('WasmBoy is paused!');
            }).catch(() => {
            console.error('WasmBoy had an error pausing...');
            });
    }

</script>
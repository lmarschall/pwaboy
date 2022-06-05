<template>

    <!-- WASMBOY CANVAS -->
    <div class="container">
        <!-- <canvas id="wasmboyCanvas" width="200" height="100" style="border:1px solid #000000;" allow="autoplay"> -->
        <canvas id="wasmboyCanvas"></canvas>

        <input type="file" id="inputROM" @change="loadROM" name="TEST">

        <input type="button" id="input" v-on:click="play" value="PLAY">

        <!-- <input type="button" id="input" @click="start" value="START"> -->

        <!-- CONTROLS -->
        <Controls v-on:updateControl="updateControlStates" v-on:buttonClicked="handleButtonClicked"></Controls>
    </div>

</template>

<style scoped>
#wasmboyCanvas {
    height: 288px;
    width: 320px;
    border:1px solid #000000;
    padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
    padding-top: 1rem;
    display: block;
}

.container {
    background-color: pink;
    width: 100vw;
}
</style>

<script setup lang="ts">

    import { onMounted, onUpdated, ref } from "vue";
    import { WasmBoy } from 'wasmboy'

    import Controls from "../components/Controls.vue";

    import { EButton, EControl } from "../defines"

    // let canvasElement: any = document.getElementById("wasmboyCanvas");
    let canvasElement: any = undefined;

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

    const WasmBoyOptions = {
        headless: false,
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
        // updateGraphicsCallback: async (imageDataArray: any) => {
        //     console.log("update graphics callback");

        //     // WasmBoy.setJoypadState(controlStates);

        //     canvasImageData.data.set(imageDataArray);
        //     canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
        //     canvasContext.putImageData(canvasImageData, 0, 0);
        // },
        onReady: () => {
            console.log("on ready");
        },
        onPlay: () => {
            console.log("on play");
        },
        onPause: () => {
            console.log("on pause");
        },
        // updateAudioCallback: async (audioContext: any, audioBufferSourceNode: any) => {
        //     return audioBufferSourceNode;
        // }
        // saveStateCallback: false,
        // onReady: false,
        // onPlay: false,
        // onPause: false,
        // onLoadedAndStarted: false
    }

    function fps() {
        console.log(WasmBoy.getFPS())
    }

    WasmBoy.config(WasmBoyOptions)
    .then(() => {
        console.log('WasmBoy is configured!');
        // You may now load games, or use other exported functions of the lib.
    }).catch(() => {
        console.error('Error Configuring WasmBoy...');
    });

    function updateControlStates(controlKey: EControl, active: boolean) {

        console.log(EControl[controlKey]);

        if(EControl[controlKey] != undefined) {

            controlStates[EControl[controlKey]] = active

            WasmBoy.disableDefaultJoypad();
            WasmBoy.setJoypadState(controlStates);
    
            console.log(controlStates);
        }
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

    async function loadROM(event: any) {
        console.log(event.target.files[0])

        const wasmBoyCanvas = document.getElementById("wasmboyCanvas");
        await WasmBoy.setCanvas(wasmBoyCanvas);

        WasmBoy.loadROM(event.target.files[0]).then(() => {
            console.log('WasmBoy ROM loaded!');
        }).catch(() => {
            console.error('Error loading the ROM');
        });
    }

    function play() {

        WasmBoy.resumeAudioContext();
        WasmBoy.play().then(() => {
            console.log('WasmBoy is playing!');
        }).catch(() => {
            console.error('WasmBoy had an error playing...');
        });
    }

    function pause() {
        WasmBoy.pause().then(() => {
            console.log('WasmBoy is paused!');
            }).catch(() => {
            console.error('WasmBoy had an error pausing...');
            });
    }

</script>
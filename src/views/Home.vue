<template>

    <!-- CONTAINER FOR STARTUP ELEMENTS -->
    <div v-show="interfaceState == EInterfaceStates.LOAD_ROM ||
    interfaceState == EInterfaceStates.START_GAME" class="container start-container">
        <div class="d-flex flex-column">
            <div class="grid-item text-center">
                <input type="button" class="btn btn-primary" @click="handleButtonClicked(EButton.LOAD)"
                    value="Load ROM">
                <input id="inputROM" type="file" class="btn btn-primary" @change="loadROM" accept=".gbc" hidden>
            </div>

            <div class="grid-item text-center">
                <input id="loadedROMButton" type="button" class="btn btn-primary" disabled value="No ROM loaded">
            </div>

            <div class="grid-item text-center">
                <input type="button" class="btn btn-primary" @click="handleButtonClicked(EButton.NEW_GAME)"
                    v-bind:disabled="interfaceState <= EInterfaceStates.LOAD_ROM" value="New Game">
            </div>

            <div class="grid-item text-center">
                <input type="button" class="btn btn-primary" @click="handleButtonClicked(EButton.CONTINUE)"
                    v-bind:disabled="interfaceState <= EInterfaceStates.LOAD_ROM" value="Continue">
            </div>
        </div>
    </div>

    <!-- CONTAINER FOR GAME ELEMENTS -->
    <div v-show="interfaceState == EInterfaceStates.PLAY" class="container game-container">

        <!-- OUTER FRAME -->
        <div id="#canvasFrame">
            <!-- WASMBOY CANVAS -->
            <canvas id="wasmboyCanvas"></canvas>
        </div>

        <!-- CONTROLS -->
        <Controls
            v-if="interfaceState == EInterfaceStates.PLAY"
            v-on:close="handleButtonClicked(EButton.GO_BACK)"
            v-on:updateControl="updateControlStates">
        </Controls>
    </div>

</template>

<style scoped>
    div#\#canvasFrame {
        padding-top: 30px;
        padding-bottom: 30px;
        background-color: black;
    }

    #wasmboyCanvas {
        height: 288px;
        width: 320px;
        padding-left: 0;
        padding-right: 0;
        margin-left: auto;
        margin-right: auto;
        display: block;
        background-color: white;
    }

    .btn.btn-primary {
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        font-size: large;
    }

    .start-container {
        height: 100vh;
        width: 100vw;
        padding-top: 30px;
        background-color: pink;
    }

    .game-container {
        height: 100vh;
        width: 100vw;
        padding-top: 20px;
        background-color: rgb(91, 91, 218);
    }

    .grid-item {
        margin: 2rem;
    }
</style>

<script setup lang="ts">

import { onMounted, onUpdated, ref } from "vue";
import { WasmBoy } from "wasmboy";
import { EButton, EControl, EInterfaceStates } from "../defines";

import Controls from "../components/Controls.vue";

const interfaceState = ref(EInterfaceStates.LOAD_ROM as EInterfaceStates);
// const romPath = ref(new File([""], "filename") as File);

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

        // check if any rom was already provided and try to load it
        // const lastRom = localStorage.getItem('lastRom');

        // console.log(lastRom);

        // if(lastRom) {
        //     const fileJSON = JSON.parse(lastRom) as any
        //     const file = new File([fileJSON.arrayBuffer], fileJSON.name, fileJSON);
        //     const event = { target: { files: [file]}};
        //     console.log(event);
        // loadROM(event);
        // }
    }).catch(() => {
        console.error("Error Configuring WasmBoy...");
    });

function updateControlStates(controlKey: EControl, active: boolean) {

    console.log(EControl[controlKey]);

    if (EControl[controlKey] != undefined) {

        controlStates[EControl[controlKey]] = active

        WasmBoy.disableDefaultJoypad();
        WasmBoy.setJoypadState(controlStates);

        console.log(controlStates);
    }
}

function handleButtonClicked(buttonKey: EButton) {

    if (buttonKey == EButton.LOAD) {
        const inputROM = document.getElementById("inputROM");

        if (inputROM) {
            inputROM.click();
        }
    }

    if (buttonKey == EButton.NEW_GAME) {

        WasmBoy.resumeAudioContext();
        WasmBoy.saveState().then(() => {
            play();
        });
    }

    if (buttonKey == EButton.GO_BACK) {

        WasmBoy.saveState().then(() => {

            WasmBoy.pause().then(() => {
                console.log('WasmBoy is paused!');
                interfaceState.value = EInterfaceStates.START_GAME;
            }).catch(() => {
                console.error('WasmBoy had an error pausing...');
            });
        }).catch(() => {
            console.log("do sth");
        })


    }

    if (buttonKey == EButton.CONTINUE) {

        WasmBoy.resumeAudioContext();
        WasmBoy.getSaveStates().then((saveStates: any) => {

            // check if any states where stored and load last state when given
            if (saveStates.length) {
                WasmBoy.loadState(saveStates.at(-1)).then(() => {
                    play();
                });
            }
        })
    }
}

async function loadROM(event: any) {
    console.log(event.target.files[0])

    const loadedROMButton = document.getElementById("loadedROMButton") as any;
    const wasmBoyCanvas = document.getElementById("wasmboyCanvas");

    loadedROMButton.value = event.target.files[0].name;
    await WasmBoy.setCanvas(wasmBoyCanvas);

    // const romFile = {
    //     'lastModified': event.target.files[0].lastModified,
    //     'lastModifiedDate': event.target.files[0].lastModifiedDate,
    //     'name': event.target.files[0].name,
    //     'size': event.target.files[0].size,
    //     'type': event.target.files[0].type
    // } as any

    // const reader = new FileReader();
    // reader.onload = function(){
    //     console.log("reader load");
    //     const arrayBuffer = this.result;
    //     console.log(arrayBuffer);
    //     if(arrayBuffer) {
    //         const encoder = new TextDecoder("utf-8");

    //         romFile.arrayBuffer = encoder.decode(new Uint8Array(arrayBuffer));

    //         console.log(JSON.stringify(romFile))
    //         localStorage.setItem('lastRom', JSON.stringify(romFile));
    //     }
    // }
    // reader.readAsArrayBuffer(event.target.files[0]);

    WasmBoy.loadROM(event.target.files[0]).then(() => {
        console.log('WasmBoy ROM loaded!');
        interfaceState.value = EInterfaceStates.START_GAME;
    }).catch(() => {
        console.error('Error loading the ROM');
        // localStorage.removeItem('lastRom');
    });
}

function play() {

    WasmBoy.play().then(() => {
        console.log('WasmBoy is playing!');
        interfaceState.value = EInterfaceStates.PLAY;
    }).catch(() => {
        console.error('WasmBoy had an error playing...');
    });
}

async function unmute() {
    await WasmBoy.resumeAudioContext()
}

function pause() {
    WasmBoy.pause().then(() => {
        console.log('WasmBoy is paused!');
    }).catch(() => {
        console.error('WasmBoy had an error pausing...');
    });
}

</script>
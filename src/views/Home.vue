<template>
  <div>
    <!-- CONTAINER FOR STARTUP ELEMENTS -->
    <div
      v-show="
        interfaceState == EInterfaceStates.LOAD_ROM ||
        interfaceState == EInterfaceStates.START_GAME
      "
      class="container start-container"
    >
      <div id="carouselMenu" class="carousel slide" data-bs-interval="false">
        <div class="carousel-indicators">
          <button
            type="button"
            data-bs-target="#carouselMenu"
            data-bs-slide-to="0"
            class="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#carouselMenu"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="d-flex flex-column justify-content-center">
              <div
                class="grid-item text-center d-flex flex-row justify-content-center"
              >
                <span class="input-group-text">1</span>
                <div class="p-2"></div>
                <input
                  type="button"
                  class="btn btn-menu btn-start"
                  @click="handleButtonClicked(EButton.LOAD)"
                  value="LOAD ROM"
                />
                <input
                  id="inputROM"
                  type="file"
                  class="btn btn-start"
                  @change="loadROM"
                  accept=".gbc"
                  hidden
                />
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="d-flex flex-column justify-content-center">
              <div class="grid-item text-center">
                <input
                  id="loadedROMButton"
                  type="button"
                  class="btn btn-start"
                  disabled
                  value="NO ROM LOADED"
                />
              </div>

              <div
                class="grid-item text-center d-flex flex-row justify-content-center"
              >
                <span class="input-group-text">1</span>
                <div class="p-2"></div>
                <input
                  type="button"
                  class="btn btn-menu btn-start"
                  @click="handleButtonClicked(EButton.CONTINUE)"
                  :disabled="interfaceState <= EInterfaceStates.LOAD_ROM"
                  value="CONTINUE GAME"
                />
              </div>

              <div
                class="grid-item text-center d-flex flex-row justify-content-center"
              >
                <span class="input-group-text">2</span>
                <div class="p-2"></div>
                <input
                  type="button"
                  class="btn btn-menu btn-start"
                  @click="handleButtonClicked(EButton.NEW_GAME)"
                  :disabled="interfaceState <= EInterfaceStates.LOAD_ROM"
                  value="NEW GAME"
                />
              </div>

              <div
                class="grid-item text-center d-flex flex-row justify-content-center"
              >
                <span class="input-group-text">3</span>
                <div class="p-2"></div>
                <input
                  type="button"
                  class="btn btn-menu btn-start"
                  @click="handleButtonClicked(EButton.IMPORT)"
                  :disabled="interfaceState <= EInterfaceStates.LOAD_ROM"
                  value="IMPORT SAVE"
                />
                <input
                  id="inputDB"
                  type="file"
                  class="btn btn-primary"
                  @change="importStuff"
                  accept=".json"
                  hidden
                />
              </div>

              <div
                class="grid-item text-center d-flex flex-row justify-content-center"
              >
                <span class="input-group-text">4</span>
                <div class="p-2"></div>
                <input
                  type="button"
                  class="btn btn-menu btn-start"
                  @click="handleButtonClicked(EButton.EXPORT)"
                  :disabled="interfaceState <= EInterfaceStates.LOAD_ROM"
                  value="EXPORT SAVE"
                />
              </div>
            </div>
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#carouselMenu"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#carouselMenu"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </div>

    <!-- CONTAINER FOR GAME ELEMENTS -->
    <div
      v-show="interfaceState == EInterfaceStates.PLAY"
      class="container game-container"
    >
      <!-- OUTER FRAME -->
      <div id="#canvasFrame">
        <!-- WASMBOY CANVAS -->
        <canvas id="wasmboyCanvas"></canvas>
      </div>

      <!-- CONTROLS -->
      <Controls
        v-if="interfaceState == EInterfaceStates.PLAY"
        @closed="handleButtonClicked(EButton.GO_BACK)"
        @updateControl="updateControlStates"
      >
      </Controls>
    </div>
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

.carousel {
  height: 100%;
}

.btn.btn-start {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  font-size: large;
  background-color: #aaa;
}

.btn.btn-menu {
  width: 200px;
}

.start-container {
  height: 100vh;
  width: 100vw;
  padding-top: 30px;
  background-color: rgb(145, 175, 142);
}

.game-container {
  height: 100vh;
  width: 100vw;
  padding-top: 20px;
  background-color: rgb(145, 175, 142);
}

.d-flex.flex-column.justify-content-center {
  height: -webkit-fill-available;
}

.grid-item {
  margin: 2rem;
}

.grid-item-icon {
  position: absolute;
  margin-left: 1em;
  margin-top: 0.3rem;
  font-size: large;
}
</style>

<script setup lang="ts">
import { Carousel } from "bootstrap";
import { onMounted, onUpdated, ref } from "vue";
import { WasmBoy } from "wasmboy";
import { EButton, EControl, EInterfaceStates } from "../defines";

import Dexie from "dexie";
import {
  importDB,
  exportDB,
  importInto,
  peakImportFile,
} from "dexie-export-import";

import Controls from "../components/Controls.vue";

let db: any;

const interfaceState = ref(EInterfaceStates.LOAD_ROM as EInterfaceStates);
const carouselMenu = ref(null as Carousel);
// const romPath = ref(new File([""], "filename") as File);

initDB();

async function initDB() {
  db = await new Dexie("wasmboy").open();
}

const controlStates = {
  UP: false,
  RIGHT: false,
  DOWN: false,
  LEFT: false,
  A: false,
  B: false,
  SELECT: false,
  START: false,
} as any;

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
  saveStateCallback: async (saveStateObject: any) => {
    console.log("save state callback");
    // saveStateObject.screenshotCanvasDataURL = canvasElement.toDataURL();
  },
  // onReady: false,
  // onPlay: false,
  // onPause: false,
  // onLoadedAndStarted: false
};

function fps() {
  console.log(WasmBoy.getFPS());
}

WasmBoy.config(WasmBoyOptions)
  .then(() => {
    console.log("WasmBoy is configured!");

    // await new Dexie("wasmboy").open().then((db)

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
  })
  .catch(() => {
    console.error("Error Configuring WasmBoy...");
  });

function importStuff(event: any) {
  console.log(event.target.files[0]);
  // Dexie.delete('wasmboy');

  db.tables.forEach(function (table: any) {
    // if (table === db[table.name]);
    table.clear();
  });

  importDB(event.target.files[0]).then((db: any) => {
    console.log(db);
  });

  // initDB();
}

function download(file: any, fileName: any, contentType: any) {
  const a = document.createElement("a");
  // var file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

function updateControlStates(controlKey: EControl, active: boolean) {
  if (EControl[controlKey] != undefined) {
    controlStates[EControl[controlKey]] = active;

    WasmBoy.disableDefaultJoypad();
    WasmBoy.setJoypadState(controlStates);
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

  if (buttonKey == EButton.EXPORT) {
    exportDB(db).then((blob: any) => {
      console.log(blob);
      download(blob, "dexie-export.json", "application/json");
    });
  }

  if (buttonKey == EButton.IMPORT) {
    const inputDB = document.getElementById("inputDB");

    if (inputDB) {
      inputDB.click();
    }
  }

  if (buttonKey == EButton.GO_BACK) {
    WasmBoy.saveState()
      .then(() => {
        WasmBoy.pause()
          .then(() => {
            console.log("WasmBoy is paused!");
            interfaceState.value = EInterfaceStates.START_GAME;
          })
          .catch(() => {
            console.error("WasmBoy had an error pausing...");
          });
      })
      .catch(() => {
        console.log("do sth");
      });
  }

  if (buttonKey == EButton.CONTINUE) {
    WasmBoy.resumeAudioContext();
    WasmBoy.getSaveStates().then((saveStates: any) => {
      console.log(saveStates);

      // check if any states where stored and load last state when given
      if (saveStates.length) {
        const lastSaveState = saveStates.at(-1);
        WasmBoy.loadState(lastSaveState).then(() => {
          play();
        });
      }
    });
  }
}

async function loadROM(event: any) {
  console.log(event.target.files[0]);

  const loadedROMButton = document.getElementById("loadedROMButton") as any;
  const wasmBoyCanvas = document.getElementById("wasmboyCanvas");

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

  WasmBoy.loadROM(event.target.files[0])
    .then(() => {
      console.log("WasmBoy ROM loaded!");
      loadedROMButton.value = event.target.files[0].name;
      interfaceState.value = EInterfaceStates.START_GAME;
      const carouselElement = document.getElementById(
        "carouselMenu"
      ) as HTMLElement;
      if (carouselElement) {
        carouselMenu.value = new Carousel(carouselElement);
        if (carouselMenu.value) carouselMenu.value.next();
      }
    })
    .catch(() => {
      console.error("Error loading the ROM");
      // localStorage.removeItem('lastRom');
    });
}

function play() {
  WasmBoy.play()
    .then(() => {
      console.log("WasmBoy is playing!");
      interfaceState.value = EInterfaceStates.PLAY;
    })
    .catch(() => {
      console.error("WasmBoy had an error playing...");
    });
}

async function unmute() {
  await WasmBoy.resumeAudioContext();
}

function pause() {
  WasmBoy.pause()
    .then(() => {
      console.log("WasmBoy is paused!");
    })
    .catch(() => {
      console.error("WasmBoy had an error pausing...");
    });
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    console.log("hidden");

    // check if we were actually playing and save game
    if (interfaceState.value == EInterfaceStates.PLAY) {
      console.log("save because paused in play mode");

      WasmBoy.saveState().then(() => {
        interfaceState.value = EInterfaceStates.START_GAME;
      });
    }
  } else {
    console.log("visible");
  }
}

document.addEventListener("visibilitychange", handleVisibilityChange, false);
</script>

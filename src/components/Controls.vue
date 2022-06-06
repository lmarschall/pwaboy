<template>

    <!-- CONTAINER WHO CAN BE SWIPED UP AND DOWN -->
    <div class="container">

        <div class="modal fade" data-bs-backdrop="static" id="controlModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <!-- <div class="modal-header">
                        <h5 class="modal-title">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div> -->
                    <div class="modal-body">
                        <button
                            type="button"
                            class="btn-close"
                            @click="emit('closed')"
                            data-bs-dismiss="modal"
                            aria-label="Close">
                        </button>
                        <div class="row">
                            <div class="col">
                                <div id="zone_joystick"></div>
                            </div>
                            <div class="col">
                                <div class="d-flex flex-row flex-wrap">
                                    <div class="col-6">
                                        <button class="btn btn-none" disabled></button>
                                    </div>
                                    <div class="col-6">
                                        <button
                                            class="btn btn-ab"
                                            @touchstart="emit('updateControl', EControl.A, true)"
                                            @touchend="emit('updateControl', EControl.A, false)">
                                            A
                                        </button>
                                    </div>
                                    <div class="col-6">
                                        <button
                                            class="btn btn-ab"
                                            @touchstart="emit('updateControl', EControl.B, true)"
                                            @touchend="emit('updateControl', EControl.B, false)">
                                            B
                                        </button>
                                    </div>
                                    <div class="col-6">
                                        <button class="btn btn-none" disabled></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row">

                            <div class="text-center">
                                <button
                                    class="btn btn-selectstart"
                                    @touchstart="emit('updateControl', EControl.SELECT, true)"
                                    @touchend="emit('updateControl', EControl.SELECT, false)">
                                    SELECT
                                </button>
                                <button
                                    class="btn btn-selectstart"
                                    @touchstart="emit('updateControl', EControl.START, true)"
                                    @touchend="emit('updateControl', EControl.START, false)">
                                    START
                                </button>
                            </div>

                            <!--
                                <button @touchstart="emit('updateControl', EControl.UP, true)" @touchend="emit('updateControl', EControl.UP, false)">UP</button>
                                <button @touchstart="emit('updateControl', EControl.DOWN, true)" @touchend="emit('updateControl', EControl.DOWN, false)">DOWN</button>
                                <button @touchstart="emit('updateControl', EControl.LEFT, true)" @touchend="emit('updateControl', EControl.LEFT, false)">LEFT</button>
                                <button @touchstart="emit('updateControl', EControl.RIGHT, true)" @touchend="emit('updateControl', EControl.RIGHT, false)">RIGHT</button>
                            -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>  
    
</template>

<style scoped>

    .btn-close {
        position: absolute;
        left: 50%;
    }

    .row {
        margin-top: 40px;
    }

    .btn.btn-none {
        background-color: white;
    }

    .modal-dialog {
        position: absolute;
        bottom: 1vh;
        left: 3vw;
        width: 90vw;
    }

    .btn.btn-ab {
        color: #181414;
        width: 50px;
        height: 50px;
        text-align: center;
        background-color: #aaa;
        border-radius: 50%;
        /* box-shadow: 0px 3px 8px #aaa, inset 0px 2px 3px #fff; */
        box-shadow: 0 5px #666;
        border: solid 1px transparent;
    }

    .btn.btn-ab:active {
        /* background-color: #3e8e41; */
        box-shadow: 0 5px #666;
        transform: translateY(4px);
    }

    .btn.btn-selectstart {
        background-color: #aaa;
        box-shadow: 0px 5px #687e00;
        border: solid 1px transparent;
        color: #181414;
        margin: 10px 0 10px 10px;
    }

    /* Imitate a pressed effect for buttons */
    .btn.btn-selectstart:active {
        box-shadow: 0px 0px #717a33;
        transform: translateY(4px);
    }

    #zone_joystick {
        width: 100px;
        height: 100px;
    }
</style>

<script setup lang="ts">

    import { onMounted, ref } from "vue";
    import { Modal } from 'bootstrap';
    import nipplejs from 'nipplejs';
    import { EControl, EButton } from "./../defines"

    let actualControl: EControl;

    const emit = defineEmits(['updateControl', 'closed'])

    onMounted(() => {

        console.log("mounted");

        const joystickZone = document.getElementById('zone_joystick') || undefined;

        if(joystickZone != undefined) {

            const joystick = nipplejs.create({
                zone: joystickZone,
                mode: 'static',
                size: 100,
                threshold: 0.5,
                color: 'black',
                dynamicPage: true,
                position: { left: '75px', bottom: '180px' }
            });

            joystick.on('dir', (dir:any, data: any) => {
                console.log(data.direction.angle);

                emit("updateControl", actualControl, false);

                switch(data.direction.angle) {
                    case 'up': actualControl = EControl.UP; break;
                    case 'down': actualControl = EControl.DOWN; break;
                    case 'right': actualControl =  EControl.RIGHT; break;
                    case 'left': actualControl = EControl.LEFT; break;
                    default: break;
                }

                emit("updateControl", actualControl, true);
            })

            joystick.on('end', (dir:any, data: any) => {
                console.log(data);

                emit("updateControl", actualControl, false);

            })
        }

        const modalElement = document.getElementById('controlModal') as HTMLElement
        
        if(modalElement) {
            const showMoreModal = new Modal(modalElement, {
                keyboard: false,
                backdrop: false
            })
            if(showMoreModal) showMoreModal.show();
        }
    })

</script>

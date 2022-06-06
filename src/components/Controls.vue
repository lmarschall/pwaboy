<template>

    <!-- CONTAINER WHO CAN BE SWIPED UP AND DOWN -->
    <div class="container">

        <div class="row">
            <div class="col">
                <div id="zone_joystick"></div>
            </div>
            <div class="col">
                <div class="d-flex flex-row flex-wrap">

                    <div class="col-6">
                        <button class="btn btn-primary"></button>
                    </div>
                    <div class="col-6">
                        <button
                            class="btn btn-primary"
                            @touchstart="emit('updateControl', EControl.A, true)"
                            @touchend="emit('updateControl', EControl.A, false)">
                            A
                        </button>
                    </div>
                    <div class="col-6">
                        <button
                            class="btn btn-primary"
                            @touchstart="emit('updateControl', EControl.B, true)"
                            @touchend="emit('updateControl', EControl.B, false)">
                            B
                        </button>
                    </div>
                    <div class="col-6">
                        <button class="btn btn-primary"></button>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="text-center">
                <button
                    class="btn btn-primary"
                    @touchstart="emit('updateControl', EControl.SELECT, true)"
                    @touchend="emit('updateControl', EControl.SELECT, false)">
                    SELECT
                </button>
                <button
                    class="btn btn-primary"
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
    
</template>

<style scoped>
    .btn.btn-primary {
        margin: 0.5rem;
        background-color: var(--color-grey-blue);
        border-color: var(--color-grey-blue);
    }

    #zone_joystick {
        width: 100px;
        height: 200px;
    }
</style>

<script setup lang="ts">

    import { onMounted, ref } from "vue";
    import nipplejs from 'nipplejs';
    import { EControl, EButton } from "./../defines"

    let actualControl: EControl;

    const emit = defineEmits(['updateControl'])

    onMounted(() => {

        console.log("mounted");

        const joystickZone = document.getElementById('zone_joystick') || undefined;

        if(joystickZone != undefined) {

            const joystick = nipplejs.create({
                zone: joystickZone,
                mode: 'dynamic',
                size: 100,
                threshold: 0.5,
                color: 'black',
                // position: { left: '75px', top: '448px' }
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
    })

</script>

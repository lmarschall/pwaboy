<template>

    <!-- CONTAINER WHO CAN BE SWIPED UP AND DOWN -->
    <div class="container">
        <button @touchstart="emit('updateControl', EControl.A, true)" @touchend="emit('updateControl', EControl.A, false)">A</button>
        <button @touchstart="emit('updateControl', EControl.B, true)" @touchend="emit('updateControl', EControl.B, false)">B</button>
        <button @touchstart="emit('updateControl', EControl.UP, true)" @touchend="emit('updateControl', EControl.UP, false)">UP</button>
        <button @touchstart="emit('updateControl', EControl.DOWN, true)" @touchend="emit('updateControl', EControl.DOWN, false)">DOWN</button>
        <button @touchstart="emit('updateControl', EControl.LEFT, true)" @touchend="emit('updateControl', EControl.LEFT, false)">LEFT</button>
        <button @touchstart="emit('updateControl', EControl.RIGHT, true)" @touchend="emit('updateControl', EControl.RIGHT, false)">RIGHT</button>
        <button @touchstart="emit('updateControl', EControl.SELECT, true)" @touchend="emit('updateControl', EControl.SELECT, false)">SELECT</button>
        <button @touchstart="emit('updateControl', EControl.START, true)" @touchend="emit('updateControl', EControl.START, false)">START</button>

        <button @click="emit('buttonClicked', EButton.SAVE)">SAVE</button>
        <button @click="emit('buttonClicked', EButton.LOAD)">LOAD</button>

        <div id="zone_joystick" style="width:200px;height:200px;margin-bottom:20px;"></div>

    </div>  
    
</template>

<style scoped>
    .btn.btn-primary {
        margin: 0.5rem;
        background-color: var(--color-grey-blue);
        border-color: var(--color-grey-blue);
    }
</style>

<script setup lang="ts">

    import { onMounted, ref } from "vue";
    import nipplejs from 'nipplejs';
    import { EControl, EButton } from "./../defines"

    let actualControl: EControl;

    const emit = defineEmits(['buttonClicked', 'updateControl'])

    onMounted(() => {

        console.log("mounted");
        
        const joystick = nipplejs.create({
            zone: document.getElementById('zone_joystick'),
            mode: 'static',
            size: 100,
            threshold: 0.5,
            color: 'red',
            position: { left: '50vw', bottom: '10vh' }
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
    })

</script>

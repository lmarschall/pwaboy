<template>

    <!-- CONTAINER WHO CAN BE SWIPED UP AND DOWN -->
    <div class="container">
        <button @click="emit('buttonClicked', EButtons.A)">A</button>
        <button @click="emit('buttonClicked', EButtons.B)">B</button>
        <button @click="emit('buttonClicked', EButtons.UP)">UP</button>
        <button @click="emit('buttonClicked', EButtons.DOWN)">DOWN</button>
        <button @click="emit('buttonClicked', EButtons.LEFT)">LEFT</button>
        <button @click="emit('buttonClicked', EButtons.RIGHT)">RIGHT</button>
        <button @click="emit('buttonClicked', EButtons.SELECT)">SELECT</button>
        <button @click="emit('buttonClicked', EButtons.START)">START</button>
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

    import { ref } from "vue";

    import { EButtons } from "./../defines"
    
    const emit = defineEmits(['buttonClicked'])
    // const props = defineProps({
    //     status: { type: Number, required: true},
    // });

</script>

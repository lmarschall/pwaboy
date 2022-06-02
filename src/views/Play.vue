<template>

    <!-- WASMBOY CANVAS -->
    <div class="container">
        <canvas id="wasmboyCanvas" width="200" height="100" style="border:1px solid #000000;">
        </canvas>
    </div>

    <!-- CONTROLS -->
    <Buttons v-on:buttonClicked="handleButtonClicked"></Buttons>
</template>

<style scoped>
</style>

<script setup lang="ts">

    import { ref } from "vue";

    import Buttons from "../components/Buttons.vue";

    import { EButtons } from "./../defines"

    function handleButtonClicked(buttonKey: EButtons) {

        console.log(buttonKey);
    }

</script>
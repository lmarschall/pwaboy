<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setupimp
import Home from "./views/Home.vue";
</script>

<template>
  <Home></Home>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* define font style */
  font-family: "Open Sans", sans-serif;
  /* define theme colors */
  --color-white-blue: #fdfefe;
  --color-light-blue: #9fafd5;
  --color-sky-blue: #5973b7;
  --color-grey-blue: #334675;
  --color-dark-blue: #181d2a;
}

* {
  touch-action: manipulation;
}
</style>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
</script>

<template>
  <div>
    <div class="alert alert-warning text-center" role="alert">
      This app is still in development stage!
      Send feedback via <a href="mailto:mail@lmarschall.com">mail</a>.
    </div>
    <router-view />
  </div>
</template>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* define font style */
  font-family: "Open Sans", sans-serif;
  /* define theme colors */
  --color-white-blue: #FDFEFE;
  --color-light-blue: #9FAFD5;
  --color-sky-blue: #5973B7;
  --color-grey-blue: #334675;
  --color-dark-blue: #181D2A;
}
</style>
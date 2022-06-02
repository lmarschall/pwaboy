import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Play from '../views/Play.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
        {
        path: '/',
        name: 'Home',
        component: Home
        },
        {
        path: '/play',
        name: 'Play',
        component: Play
        }
    ]
})

export default router
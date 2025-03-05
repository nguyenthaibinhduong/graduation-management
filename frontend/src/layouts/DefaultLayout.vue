<template>
  <Header v-if="authStore.isAuthenticated" />
  <div class="container mx-auto flex gap-2 py">
    <div class="w-1/4 shadow-md"><NavBar /></div>
    <div class="w-3/4"><RouterView /></div>
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import NavBar from '@/components/NavBar.vue';
import { useAuthStore } from '@/stores/auth';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
</script>
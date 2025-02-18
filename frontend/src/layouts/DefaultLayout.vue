<template>
  <Header v-if="authStore.isAuthenticated" />
  <div class="container mx-auto">
    <RouterView />
    
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import { useAuthStore } from '@/stores/auth';
import { RouterView } from 'vue-router';

const authStore = useAuthStore();
</script>
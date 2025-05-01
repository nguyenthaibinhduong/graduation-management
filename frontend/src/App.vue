<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { Toast, useToast } from 'primevue';
import { initToast } from './utils/toast';
import { useAuthStore } from './stores/auth';
const toast = useToast();
const authStore = useAuthStore()

onMounted(() => {
  initToast(toast);
});
</script>

<template>
  <RouterView />
  <Toast />
</template>

<style>
.pi {
  font-family: 'PrimeIcons' !important;
  font-style: normal !important;
}
</style>
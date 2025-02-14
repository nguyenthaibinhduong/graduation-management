<script setup>
import { onMounted } from 'vue';
import { RouterView } from 'vue-router'
import { Toast, useToast } from 'primevue';
import { initToast } from './utils/toast';
import Header from './components/Header.vue'
const toast = useToast();

onMounted(() => {
  initToast(toast);
});
</script>

<template>
  <Header />
  <div class="container mx-auto">
    <RouterView />
    <Toast />
  </div>
</template>

<style>
.pi {
  font-family: 'PrimeIcons' !important;
  font-style: normal !important;
}

</style>
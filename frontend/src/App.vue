<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <div class="container mx-auto">
    <RouterView />
  </div>
</template>

<style>
.pi {
  font-family: 'PrimeIcons' !important;
  font-style: normal !important;
}

</style>
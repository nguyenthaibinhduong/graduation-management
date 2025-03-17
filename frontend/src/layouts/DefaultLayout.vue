<template>
  <div class="w-full flex gap-x-2">
    <NavBar />
    <div class="w-full flex-1">
      <Header />
      <RouterView />
    </div>
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import NavBar from '@/components/NavBar.vue';
import { RouterView } from 'vue-router';


</script>
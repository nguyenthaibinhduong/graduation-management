<template>
  
  
 
  <div class="w-full flex gap-x-2">
    <div class="w-1/5"> <NavBar /></div>
    <div class="w-4/5"><Header /><RouterView /></div>
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import NavBar from '@/components/NavBar.vue';
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { RouterView } from 'vue-router';


</script>
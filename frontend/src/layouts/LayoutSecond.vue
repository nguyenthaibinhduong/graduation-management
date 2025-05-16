<template>
    <div class="container mx-auto">
        <Navigation />
        <RouterView />
    </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import Navigation from '@/components/navigation/Navigation.vue';
import { RouterView } from 'vue-router';



</script>

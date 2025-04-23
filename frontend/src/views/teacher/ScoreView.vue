<template>
  <h1>{{ $route.params.id }}</h1>
</template>
<script setup>
import MyInput from '@/components/form/MyInput.vue'
import { useProjectStore } from '@/stores/store'
import { onMounted } from 'vue'
</script>

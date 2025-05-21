<template></template>
<script setup>
import { useStudentStore } from '@/stores/store'
import { onMounted } from 'vue'

const studentStore = useStudentStore()

onMounted(async () => {
  await Promise.all(studentStore.fetchItems())
})
</script>

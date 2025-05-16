<template>
    <Button label="Quay về" icon="pi pi-arrow-left" @click="router.back()" class="p-button-secondary" />
</template>
<script setup>
import { useRouter } from 'vue-router'
import { Button } from 'primevue'

const router = useRouter()
</script>
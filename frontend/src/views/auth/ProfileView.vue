<template>
  <Card>
    <template #title>Thông tin cá nhân</template>
    <template #content>
      <div class="flex items-center gap-2">
        <label class="font-semibold">Email:</label>
        <span>{{ authStore.user?.email }}</span>
      </div>
      <div class="flex items-center gap-2">
        <label class="font-semibold">Vai trò:</label>
        <span>{{ authStore.user?.role }}</span>
      </div>
    </template>
  </Card>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Card } from 'primevue';

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
})
</script>

<style scoped></style>
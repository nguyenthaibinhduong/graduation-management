<template>
  <div class="profile-container">
    <Card class="profile-card">
      <div class="profile-details">
        <div class="profile-item">
          <span>Email:</span>
          <span>{{ authStore.user.email }}</span>
        </div>
        <div class="profile-item">
          <span>Role:</span>
          <span>{{ authStore.user.role }}</span>
        </div>
      </div>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { Card } from 'primevue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = ref()

onMounted(() => authStore.fetchUser())
watchEffect(() => {
  user.value = authStore.user
})
</script>

<style scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.profile-card {
  width: 400px;
}

.profile-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-item {
  display: flex;
  justify-content: space-between;
}
</style>

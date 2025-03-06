<template>
  <div class="profile-view">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <label class="font-semibold">Email:</label>
            <span>{{ authStore.user?.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold">Vai trò:</label>
            <span>{{ authStore.user?.role }}</span>
          </div>
        </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = ref(authStore.user)

onMounted(() => {
  if (!user.value) {
    authStore.fetchUser().then(() => {
      user.value = authStore.user
    })
  }
})
</script>

<style scoped>
.profile-view {
  padding: 20px;
}
</style>
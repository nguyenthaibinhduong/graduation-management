<script setup>
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
    await authStore.fetchUser();
    const role = authStore.user?.role

    if (role === 'student') {
        router.replace('/student-dashboard')
    } else if (role === 'teacher') {
        router.replace('/teacher-dashboard')
    } else if (role === 'admin') {
        router.replace('/admin-dashboard') // hoặc route mặc định
    } else {
        router.replace('/not-found')
    }
})
</script>

<template>
    <div>Đang chuyển hướng...</div>
</template>

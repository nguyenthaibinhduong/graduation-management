<template>
    <div class="project-detail">
        <h1 class="text-2xl font-bold mb-4">Chi tiết Đề Tài</h1>
        <div v-if="project" class="details">
            <p><strong>Tên đề tài:</strong> {{ project.title }}</p>
            <p><strong>Mô tả:</strong> {{ project.description }}</p>
            <p><strong>Nội dung:</strong> <span v-html="project.content"></span></p>
            <p><strong>Giáo viên hướng dẫn:</strong> {{ project.teacher?.user?.fullname }}</p>
            <p><strong>Sinh viên thực hiện:</strong> {{ project.student?.user?.fullname }}</p>
            <p><strong>Học kỳ:</strong> {{ project.course?.name }}</p>
            <p>
                <strong>Trạng thái:</strong>
                <span :class="statusClass(project.status)">
                    {{ statusLabel(project.status) }}
                </span>
            </p>
        </div>
        <div v-else>
            <p>Đang tải thông tin đề tài...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const project = ref(null)
const route = useRoute()

const statusLabel = (status) => {
    const statuses = {
        propose: 'Đề xuất',
        pending: 'Đang chờ',
        approve: 'Đã duyệt',
    }
    return statuses[status] || 'Không xác định'
}

const statusClass = (status) => {
    const classes = {
        propose: 'bg-blue-100 text-blue-700 px-2 py-1 rounded',
        pending: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded',
        approve: 'bg-green-100 text-green-700 px-2 py-1 rounded',
    }
    return classes[status] || ''
}

onMounted(async () => {
    try {
        await authStore.fetchUser()

        const user = authStore.user
        if (!user) throw new Error('Không thể lấy thông tin người dùng')

        const projectId = route.params.id
        await projectStore.findItem(projectId, user.id, user.role)
    } catch (error) {
        console.error('Có lỗi xảy ra:', error)

    }
})


watchEffect(() => {
    project.value = projectStore.item
    console.log('Project:', project.value)
})
</script>

<style scoped>
.project-detail {
    padding: 1rem;
}

.details p {
    margin-bottom: 0.5rem;
}
</style>

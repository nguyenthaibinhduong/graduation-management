<template>
  <div class="w-full space-y-4">
    <!-- Nút chức năng -->
    <div class="flex gap-x-4 p-2 rounded-lg">
      <Button size="small" label="Tất cả" :class="{ 'p-button-outlined': activeRole !== 'all' }"
        @click="filterByRole('all')" />
      <Button size="small" label="Chấm điểm Hướng dẫn" :class="{ 'p-button-outlined': activeRole !== 'advisor' }"
        @click="filterByRole('advisor')" />
      <Button size="small" label="Chấm điểm phản biện" :class="{ 'p-button-outlined': activeRole !== 'reviewer' }"
        @click="filterByRole('reviewer')" />
      <Button size="small" label="Chấm điểm hội đồng" :class="{ 'p-button-outlined': activeRole !== 'committee' }"
        @click="filterByRole('committee')" />
    </div>
    <!-- Bảng dữ liệu nhóm -->
    <DataTableCustom title="Danh sách nhóm" :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="groups"
      :total="groups.length" :columns="dataColumns" @rowSelect="onSelectGroup" />
    <!-- Drawer hiển thị chi tiết nhóm -->
    <Drawer v-model:visible="drawerVisible" position="right" class="w-1/3" @close="onCancel">
      <template #header>
        <div class="flex justify-between items-center w-full">
          <div class="flex items-center gap-4">
            <Button @click="onCancel" icon="pi pi-arrow-left" variant="text" rounded />
            <h2 class="text-lg font-semibold text-black">Chi tiết nhóm</h2>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="onCancel" severity="danger">Đóng</Button>
          </div>
        </div>
      </template>

      <div class="mt-5 space-y-4">
        <p><strong>Người tạo nhóm:</strong> {{ selectedGroup?.leader.user.fullname }}</p>
        <p><strong>GVHD:</strong> {{ selectedGroup?.teacher.user.fullname }}</p>
        <p><strong>Khoa:</strong> {{ selectedGroup?.department.name }}</p>

        <h3 class="font-semibold text-base mt-4">Danh sách thành viên</h3>
        <ul class="space-y-3">
          <li v-for="member in selectedGroup?.students" :key="member?.id"
            class="p-3 border rounded-md flex justify-between items-center">
            <div>
              <p class="font-medium">{{ member.user.fullname }}</p>
              <p class="text-sm text-gray-500">MSSV: {{ member.code }}</p>
            </div>
            <Button label="Chấm điểm" size="small" icon="pi pi-pencil" @click="scoreStudent(member)" />
          </li>
        </ul>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import { Button, Drawer } from 'primevue' // <-- Đây là Drawer bạn đã đưa
import { useRouter } from 'vue-router'
import { useScoreStore } from '@/stores/store'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { watchEffect } from 'vue'

const scoreStore = useScoreStore()
const authStore = useAuthStore()
const groups = ref([])

const teacherId = authStore.user?.teacher?.id

const drawerVisible = ref(false)
const selectedGroup = ref(null)
const activeRole = ref('all')

const dataColumns = ref([
  { field: 'name', header: 'Tên nhóm' },
  { field: 'project.title', header: 'Tên đề tài' },
  { field: 'department.name', header: 'Khoa' },
  { field: 'teacherRole', header: 'Vai trò' },
])

onMounted(async () => {
  await authStore.fetchUser()
  await scoreStore.fetchGroupsByTeacher(teacherId)
})

watchEffect(() => {
  groups.value = scoreStore.teacherGroups
})
const filterByRole = (role) => {
  activeRole.value = role
  const queryType = role === 'all' ? null : role
  scoreStore.fetchGroupsByTeacher(teacherId, queryType)
}

const router = useRouter()

const onSelectGroup = (group) => {
  if (group != null) {
    selectedGroup.value = group
  }
  drawerVisible.value = true

}

const onCancel = () => {
  drawerVisible.value = false
}

const scoreStudent = (student) => {
  if (student?.id) router.push(`/edit-score/${student?.id}`)
}
</script>

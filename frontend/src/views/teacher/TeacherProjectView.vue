<template>
  <DataTableCustom
    title="Danh sách đề tài - Giảng viên"
    :data="projects"
    :columns="[
      { field: 'title', header: 'Tên đề tài' },
      { field: 'description', header: 'Mô tả' },
      { field: 'student.user.fullname', header: 'Sinh viên đề xuất' },
      { field: 'course.name', header: 'Học kỳ' },
      {
        field: 'status',
        header: 'Trạng thái',
        type: 'status',
        statuses: [
          { value: 'propose', label: 'Đề xuất', class: 'bg-blue-100 text-blue-700' },
          { value: 'pending', label: 'Đang chờ', class: 'bg-yellow-100 text-yellow-700' },
          { value: 'approve', label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
        ],
      },
    ]"
    :total="projectStore?.total"
    :loading="loading"
    @fetch="fetchProject"
    @add="addProject"
    @edit="editProject"
    @delete="deleteProject"
    @selectOne="handleSelectData"
    @selectAll="handleSelectData"
  />

  <MyDrawer
    class="w-full"
    title="đề tài dự kiến"
    :isEditing="isEditing"
    :onCancel="cancelForm"
    :onSave="saveProject"
    :showImport="isImport"
    v-model:visible="visibleLeft"
    position="right"
    :closable="false"
  >
    <div class="grid grid-cols-2 mt-5 gap-x-10">
      <div class="flex flex-col gap-4">
        <MyInput v-model="newData.title" title="Tên đề tài" id="name" required />
        <MyInput
          v-model="newData.max_total_group"
          title="Số lượng nhóm tham gia"
          id="max_total_group"
          required
        />
      </div>
      <div class="flex flex-col gap-4">
        <MyInput v-model="newData.description" title="Mô tả" id="description" required />
      </div>
    </div>
    <div class="w-full flex flex-col mt-10">
      <MyInput
        type="editor"
        v-model="newData.content"
        title="Nội dung"
        id="content"
        editorStyle="height: 300px"
        required
      />
    </div>
  </MyDrawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import { useProjectStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyInput from '@/components/form/MyInput.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'

const visibleLeft = ref(false)
const projectStore = useProjectStore()
const authStore = useAuthStore()
const projects = ref([])
const teacher = ref(null)
const loading = ref(false)
const isImport = ref(false)
const isEditing = ref(false)

const editedProjectId = ref(null)
const newData = ref({
  title: '',
  description: '',
  content: '',
  max_total_group: '',
  teacher_id: null,
})
const maxDate = ref(new Date())

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore?.user?.teacher?.id) {
    await projectStore.fetchItemsForTeacher(authStore.user.teacher.id)
  }
})
watchEffect(() => {
  projects.value = authStore.user?.teacher ? projectStore.items : []
  teacher.value = authStore.user?.teacher || null
  newData.value.teacher_id = authStore.user?.teacher?.id || null
})

const fetchProject = async (newPage, newLimit, newSearch) => {
  await projectStore.fetchItemsForTeacher(
    teacher.value?.id ?? null,
    newSearch ? 1 : newPage,
    newSearch ? projectStore.total : newLimit,
    newSearch
  )
}
const addProject = () => {
  newData.value.teacher_id = authStore.user?.teacher?.id || null
  visibleLeft.value = true
}

const saveProject = async () => {
  isEditing.value
    ? await projectStore.updateItem(editedProjectId.value, newData.value, 'teacher')
    : await projectStore.addItem(newData.value, 'teacher')
  if (authStore?.user?.teacher?.id) {
    await projectStore.fetchItemsForTeacher(authStore.user.teacher.id)
  }
  cancelForm()
}

const deleteProject = async (ids) => {
  await projectStore.deleteItem(ids, teacher.value?.id, 'teacher')
  if (authStore?.user?.teacher?.id) {
    await projectStore.fetchItemsForTeacher(authStore.user.teacher.id)
  }
}

const editProject = (dataEdit) => {
  newData.value = dataEdit
  editedProjectId.value = dataEdit.id
  isEditing.value = true
  visibleLeft.value = true
}

const cancelForm = () => {
  visibleLeft.value = false
  isEditing.value = false
  editedProjectId.value = null
  newData.value = {
    title: '',
    description: '',
    content: '',
    max_total_group: '',
    teacher_id: null,
  }
}

const handleSelectData = (ids) => {
  selectedIds.value = ids
}
</script>

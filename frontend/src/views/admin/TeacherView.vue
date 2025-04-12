<template>
  <DataTableCustom
    title="Danh sách Giảng Viên"
    :data="teachers"
    :columns="[
      { field: 'code', header: 'Mã giảng viên', sortable: true },
      { field: 'user.fullname', header: 'Họ và tên', sortable: true },
      { field: 'user.email', header: 'Email', sortable: true },
      { field: 'user.phone', header: 'Số điện thoại', sortable: true },
      { field: 'degree', header: 'Học vị', sortable: true },
      { field: 'position', header: 'Chức vụ', sortable: true },
    ]"
    :total="teacherStore?.total"
    :loading="loading"
    @fetch="fetchTeacher"
    @add="addTeacher"
    @edit="editTeacher"
    @delete="deleteTeacher"
  />
  <MyDrawer
    class="w-full"
    title="giảng viên"
    v-model:visible="visibleLeft"
    :isEditing="isEditing"
    :onCancel="cancelForm"
    :onSave="saveTeacher"
    :showImport="isImport"
    position="right"
    :closable="false"
  >
    <div>
      <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
      <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
        <MyInput v-model="newTeacher.code" title="Mã giảng viên" id="code" :disabled="isEditing" />
        <MyInput v-model="newTeacher.user.fullname" title="Họ và tên" id="fullname" />
        <MyInput
          v-model="newTeacher.user.birth_date"
          :maxDate="maxDate"
          title="Ngày sinh"
          id="date_of_birth"
          type="date"
          dateFormat="dd/mm/yy"
        />
        <MyInput v-model="newTeacher.user.email" title="Email" id="email" />
        <MyInput v-model="newTeacher.user.address" title="Địa chỉ" id="address" />
        <MyInput v-model="newTeacher.user.phone" title="Số điện thoại" id="phone" />
        <MyInput v-model="newTeacher.degree" title="Học vị" id="degree" />
        <MyInput
          type="multiselect"
          v-model="newTeacher.positionIds"
          title="Chức vụ"
          id="positions"
          :options="positions"
          optionLabel="name"
          optionValue="id"
          filter
          :showClear="true"
        />
      </div>
    </div>
  </MyDrawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import { Button, Drawer, InputText, DatePicker, MultiSelect } from 'primevue'
import { usePositionStore, useTeacherStore } from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import MyInput from '@/components/form/MyInput.vue'

const visibleLeft = ref(false)
const teacherStore = useTeacherStore()
const positionStore = usePositionStore()
const teachers = ref([])
const positions = ref([])
const loading = ref(false)
const isEditing = ref(false)
const editedTeacherId = ref(null)
const newTeacher = ref({
  code: '',
  degree: '',
  positionIds: [],
  user: {
    fullname: '',
    birth_date: '',
    email: '',
    phone: '',
    address: '',
  },
})
onMounted(async () => {
  teacherStore.fetchItems()
  positionStore.fetchItems()
})
watchEffect(() => {
  positions.value = positionStore.items
  teachers.value = teacherStore.items.map((teacher) => ({
    ...teacher,
    position: teacher.position.map((pos) => pos.name).join(', '),
  }))
})

const fetchTeacher = async (newPage, newLimit, newSearch) => {
  await teacherStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? teacherStore.total : newLimit,
    newSearch
  )
}
const addTeacher = () => {
  visibleLeft.value = true
}
const saveTeacher = async () => {
  if (isEditing.value) {
    await teacherStore.updateItem(editedTeacherId.value, newTeacher.value)
  } else {
    await teacherStore.addItem(newTeacher.value)
  }
  cancelForm()
}

const deleteTeacher = async (id) => {
  await teacherStore.deleteItem(id)
}

const editTeacher = (teacher) => {
  editedTeacherId.value = teacher.id
  newTeacher.value = { ...teacher }
  isEditing.value = true
  visibleLeft.value = true
}

const cancelForm = () => {
  visibleLeft.value = false
  isEditing.value = false
  editedTeacherId.value = null
  Object.keys(newTeacher.value).forEach((key) => (newTeacher.value[key] = ''))
}

watch(visibleLeft, (newVal) => {
  if (newVal == false) {
    cancelForm()
  }
})
</script>

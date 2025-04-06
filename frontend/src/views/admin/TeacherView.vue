<template>
  <DataTableCustom
    title="Danh sách Giảng Viên"
    :data="teachers"
    :columns="[
      { field: 'code', header: 'Mã giảng viên', sortable: true },
      { field: 'user.fullname', header: 'Họ và tên', sortable: true },
      { field: 'user.fullname', header: 'Họ và tên', sortable: true },
      { field: 'user.email', header: 'Email', sortable: true },
      { field: 'user.phone', header: 'Số điện thoại', sortable: true },
      { field: 'major', header: 'Ngành dạy', sortable: true }, //Them sau khi sua database
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
  <Drawer
    class="w-2/5"
    v-model:visible="visibleLeft"
    :header="isEditing ? 'Sửa giảng viên' : 'Thêm giảng viên'"
    position="right"
  >
    <div class="grid grid-cols-1 gap-5 w-full">
      <div class="p-field mb-2 mt-2">
        <div class="flex flex-col gap-2">
          <label for="name">Tên Giảng Viên</label>
          <InputText class="w-full" id="name" v-model="newTeacher.user.fullname" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="teacher_code">Mã Giảng Viên</label>
          <InputText class="w-full" id="teacher_code" v-model="newTeacher.code" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="date_of_birth">Ngày Sinh</label>
          <DatePicker class="w-full" v-model="newTeacher.user.birth_date" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="email">Email</label>
          <InputText class="w-full" id="email" v-model="newTeacher.user.email" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="phone">Số Điện Thoại</label>
          <InputText class="w-full" id="phone" v-model="newTeacher.user.phone" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="address">Địa Chỉ</label>
          <InputText class="w-full" id="address" v-model="newTeacher.user.address" />
        </div>
      </div>
      <!-- <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="major">Chuyên Ngành</label>
          <InputText class="w-full" id="major" />
        </div>
      </div> -->
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="degree">Học Vị</label>
          <InputText class="w-full" id="degree" v-model="newTeacher.degree" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="positions">Chức Vụ</label>
          <MultiSelect
            class="w-full"
            id="positions"
            :options="positions"
            optionLabel="name"
            optionValue="id"
            placeholder="Chọn chức vụ"
            filter
            :showClear="true"
            v-model="newTeacher.positionIds"
          />
        </div>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-2 mt-10">
      <Button label="Lưu" @click="saveTeacher" class="w-full" />
      <Button label="Hủy" @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import { Button, Drawer, InputText, DatePicker, MultiSelect } from 'primevue'
import { usePositionStore, useTeacherStore } from '@/stores/store'
import DataTableCustom from '@/components/DataTableCustom.vue'

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

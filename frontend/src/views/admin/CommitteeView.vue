<template>
  <DataTableCustom
    title="Danh sách Hội đồng"
    :data="committees"
    :columns="[
      { field: 'name', header: 'Tên hội đồng', sortable: true },
      { field: 'description', header: 'Mô tả', sortable: true },
      { field: 'course', header: 'Học kỳ', sortable: true },
      { field: 'status', header: 'Trạng thái', sortable: true },
    ]"
    :total="committeeStore?.total"
    :loading="loading"
    @fetch="fetchCommittee"
    @add="addCommittee"
    @edit="editCommittee"
    @delete="deleteCommittee"
    @selectOne="handleSelectData"
    @selectAll="handleSelectData"
    @rowSelect="getDetail"
  />

  <MyDrawer
    class="w-full"
    title="hội đồng"
    :isEditing="isEditing"
    :onCancel="cancelForm"
    :onSave="saveCommittee"
    :showImport="isImport"
    v-model:visible="visibleLeft"
    position="right"
    :closable="false"
  >
    <div v-if="!isImport" class="grid grid-cols-2 mt-5 gap-x-10">
      <div class="">
        <MyInput
          v-model="newCommittee.department"
          title="Khoa"
          id="department"
          type="select"
          :options="departments"
          optionLabel="name"
          optionValue="id"
        />
        <MyInput
          v-model="newCommittee.department"
          title="Học kỳ"
          id="course"
          type="select"
          :options="courses"
          optionLabel="name"
          optionValue="id"
        />
      </div>
      <div>
        <MyInput v-model="newCommittee.name" title="Tên hội đồng" id="name" />
        <MyInput v-model="newCommittee.description" title="Mô tả" id="description" />
        <MyInput v-model="newCommittee.content" title="Nội dung" id="content" />
        <MyInput
          v-model="newCommittee.total_teacher"
          title="Tổng số giảng viên"
          id="total_teacher"
          type="number"
        />
        <MyInput
          v-model="newCommittee.total_project"
          title="Tổng số đề tài"
          id="total_project"
          type="number"
        />
        <MyInput
          v-model="newCommittee.time_start"
          title="Thời gian bắt đầu"
          id="time_start"
          type="date"
          dateFormat="dd/mm/yy"
        />
        <MyInput
          v-model="newCommittee.time_end"
          title="Thời gian kết thúc"
          id="time_end"
          type="date"
          dateFormat="dd/mm/yy"
        />
        <MyInput
          v-model="newCommittee.status"
          title="Trạng thái"
          id="status"
          type="select"
          :options="statusOptions"
          optionLabel="name"
        />
      </div>
    </div>
  </MyDrawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import * as XLSX from 'xlsx'
import { Column, DataTable, FileUpload, Message } from 'primevue'
import { useCommitteeStore, useCourseStore, useDepartmentStore, useFileStore } from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyInput from '@/components/form/MyInput.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import { useRouter } from 'vue-router'

const committeeStore = useCommitteeStore()
const departmentStore = useDepartmentStore()
const courseStore = useCourseStore()

const committees = ref([])
const departments = ref([])
const courses = ref([])

const visibleLeft = ref(false)
const fileStore = useFileStore()
const src = ref(null)
const file = ref(null)

const loading = ref(false)
const isEditing = ref(false)
const isImport = ref(false)

const editedCommitteeId = ref(null)
const newCommittee = ref({
  name: '',
  description: '',
  content: '',
  total_teacher: null,
  total_project: null,
  time_start: null,
  time_end: null,
  status: 'active',
  course: null,
  department: null,
  teachers: [],
  project: [],
  evaluationForm: null,
})

onMounted(async () => {
  await committeeStore.fetchItems()
  await departmentStore.fetchItems()
  await courseStore.fetchItems()
})

watchEffect(() => {
  committees.value = committeeStore.items
  departments.value = departmentStore.items
  courses.value = courseStore.items
})

const addCommittee = () => {
  visibleLeft.value = true
}

const cancelForm = () => {
  visibleLeft.value = false
  isEditing.value = false
  editedStudentId.value = null
  isImport.value = false
  src.value = null
  file.value = null
  const newCommittee = ref({
    name: '',
    description: '',
    content: '',
    total_teacher: null,
    total_project: null,
    time_start: null,
    time_end: null,
    status: 'active',
    course: null,
    department: null,
    teachers: [],
    project: [],
    evaluationForm: null,
  })
}
</script>

<template>
  <DataTableCustom
    title="Danh sách Hội đồng"
    :data="committees"
    :columns="[
      { field: 'name', header: 'Tên hội đồng', sortable: true },
      { field: 'description', header: 'Mô tả', sortable: true },
      { field: 'course.name', header: 'Học kỳ', sortable: true },
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
    <div v-if="!isImport" class="">
      <!-- Department and Course Inputs -->
      <div class="grid grid-cols-2 gap-4">
        <h3 class="col-span-2 text-lg font-semibold">Thông tin chung</h3>
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
          v-model="newCommittee.course"
          title="Học kỳ"
          id="course"
          type="select"
          :options="courses"
          optionLabel="name"
          optionValue="id"
        />
      </div>

      <!-- Name and Description Inputs -->
      <div class="grid grid-cols-2 gap-4">
        <h3 class="col-span-2 text-lg font-semibold mt-5">Thông tin chi tiết</h3>
        <MyInput v-model="newCommittee.name" title="Tên hội đồng" id="name" type="text" />
        <MyInput v-model="newCommittee.description" title="Mô tả" id="description" type="text" />
        <MyInput v-model="newCommittee.content" title="Nội dung" id="content" type="text" />
        <MyInput
          v-model="newCommittee.status"
          title="Trạng thái"
          id="status"
          type="select"
          :options="statusOptions"
          optionLabel="name"
          optionValue="value"
        />
      </div>
      <!-- Projects and Teachers multiselect -->
      <div class="grid grid-cols-2 gap-4">
        <h3 class="col-span-2 text-lg font-semibold mt-5">Giáo viên và Đề tài</h3>
        <MyInput
          v-model="newCommittee.teachers"
          title="Giáo viên"
          id="teachers"
          type="multiselect"
          :options="teachers"
          optionLabel="displayName"
          optionValue="code"
          filter
        />
        <MyInput
          v-model="newCommittee.project"
          title="Đề tài"
          id="project"
          type="multiselect"
          :options="projects"
          optionLabel="name"
          optionValue="id"
          filter
        />
      </div>
      <!-- Time Start and Time End Inputs -->
      <div class="grid grid-cols-2 gap-4">
        <h3 class="col-span-2 text-lg font-semibold mt-5">Thời gian</h3>
        <MyInput
          v-model="newCommittee.time_start"
          title="Thời gian bắt đầu"
          id="time_start"
          type="date"
          dateFormat="dd/mm/yy"
          placeholder="dd/mm/yyyy"
        />
        <MyInput
          v-model="newCommittee.time_end"
          title="Thời gian kết thúc"
          id="time_end"
          type="date"
          dateFormat="dd/mm/yy"
          placeholder="dd/mm/yyyy"
        />
      </div>
    </div>
  </MyDrawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import * as XLSX from 'xlsx'
import { Column, DataTable, FileUpload, Message } from 'primevue'
import {
  useCommitteeStore,
  useCourseStore,
  useDepartmentStore,
  useFileStore,
  useProjectStore,
  useTeacherStore,
} from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyInput from '@/components/form/MyInput.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import { useRouter } from 'vue-router'

const committeeStore = useCommitteeStore()
const departmentStore = useDepartmentStore()
const courseStore = useCourseStore()
const teacherStore = useTeacherStore()
const projectStore = useProjectStore()

const committees = ref([])
const departments = ref([])
const courses = ref([])
const teachers = ref([])
const projects = ref([])

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

const statusOptions = ref([
  { name: 'Đang hoạt động', value: 'active' },
  { name: 'Ngừng hoạt động', value: 'inactive' },
])

onMounted(async () => {
  await committeeStore.fetchItems()
  await departmentStore.fetchItems()
  await courseStore.fetchItems()
  await teacherStore.fetchItems()
  await projectStore.fetchItems()
})

watchEffect(() => {
  committees.value = committeeStore.items
  departments.value = departmentStore.items
  courses.value = courseStore.items
  teachers.value = teacherStore.items.map((teacher) => ({
    ...teacher,
    displayName: `${teacher.code} - ${teacher.user.fullname}`,
  }))
  projects.value = projectStore.items
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

const saveCommittee = async () => {
  const newData = {
    ...newCommittee.value,
    department_id: newCommittee.value.department.id,
    course_id: newCommittee.value.course.id,
    teachers: newCommittee.value.teachers.map((teacher) => teacher.code),
    project: newCommittee.value.project.map((project) => project.id),
  }
  cancelForm()
}
</script>

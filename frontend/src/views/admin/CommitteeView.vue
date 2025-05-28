<template>
  <DataTableCustom
    :block="['headerBar', 'import', 'export']"
    title="Danh sách Hội đồng"
    :data="committees"
    :columns="[
      { field: 'name', header: 'Tên hội đồng', sortable: true },
      { field: 'description', header: 'Mô tả', sortable: true },
      { field: 'course.name', header: 'Học kỳ', sortable: true },
      {
        field: 'department.name',
        header: 'Khoa',
        sortable: true,
      },
      {
        field: 'status',
        header: 'Trạng thái',
        sortable: true,
        type: 'status',
        statuses: [
          { value: 'active', label: 'Đang hoạt động', class: 'bg-blue-100 text-blue-700' },
          { value: 'inactive', label: 'Ngừng hoạt động', class: 'bg-red-100 text-red-700' },
        ],
      },
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
          v-model="newCommittee.department_id"
          title="Khoa"
          id="department"
          type="select"
          :options="departments"
          optionLabel="name"
          optionValue="id"
        />
        <MyInput
          v-model="newCommittee.course_id"
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
          v-model="newCommittee.teacher_ids"
          title="Giáo viên"
          id="teachers"
          type="multiselect"
          :options="teachers"
          optionLabel="displayName"
          optionValue="id"
          filter
        />
        <MyInput
          v-model="newCommittee.project_ids"
          title="Đề tài"
          id="project"
          type="multiselect"
          :options="projects"
          optionLabel="title"
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
import { showToast } from '@/utils/toast'

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
  course_id: null,
  department_id: null,
  teacher_ids: [],
  project_ids: [],
  evaluation_id: null,
})

const statusOptions = ref([
  { name: 'Đang hoạt động', value: 'active' },
  { name: 'Ngừng hoạt động', value: 'inactive' },
])

onMounted(async () => {
  await committeeStore.fetchItems()
  await departmentStore.fetchItems()
  await courseStore.fetchItems()
  await teacherStore.fetchItems(1, 100, null, null)
  await projectStore.fetchItems('public')
})
watchEffect(() => {
  committees.value = committeeStore.items.map((committee) => ({
    ...committee,
    encodedId: committee.encodedId,
  }))
  departments.value = departmentStore.items
  courses.value = courseStore.items
  teachers.value = teacherStore.items.map((teacher) => ({
    ...teacher,
    displayName: `${teacher.code} - ${teacher.user.fullname}`,
  }))
  projects.value = projectStore.items
})

const fetchCommittee = async (newPage, newLimit, newSearch) => {
  await committeeStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? studentStore.total : newLimit,
    newSearch
  )
}
watch(
  newCommittee,
  async (newVal) => {
    if (newVal.department_id) {
      await teacherStore.fetchItems(1, 100, null, { departmentId: newVal.department_id })
    }
  },
  { deep: true }
)

const addCommittee = () => {
  clearValues()
  visibleLeft.value = true
  isEditing.value = false
}

const clearValues = () => {
  newCommittee.value = {
    name: '',
    description: '',
    content: '',
    total_teacher: null,
    total_project: null,
    time_start: null,
    time_end: null,
    status: 'active',
    course_id: null,
    department_id: null,
    teacher_ids: [],
    project_ids: [],
  }
}
const cancelForm = () => {
  visibleLeft.value = false
  isEditing.value = false
  editedStudentId.value = null
  isImport.value = false
  src.value = null
  file.value = null
  clearValues()
}

const saveCommittee = async () => {
  try {
    loading.value = true
    if (
      !newCommittee.value.name ||
      !newCommittee.value.course_id ||
      !newCommittee.value.department_id
    ) {
      showToast('Vui lòng điền đầy đủ thông tin: tên, khoá học và khoa.', 'error')
      return
    }

    if (!newCommittee.value.teacher_ids.length || !newCommittee.value.project_ids.length) {
      showToast('Vui lòng chọn ít nhất một giảng viên và một đề tài.', 'error')
      return
    }

    if (newCommittee.value.teacher_ids.length > 10) {
      showToast('Ủy ban tối đa chỉ có 10 giảng viên.', 'error')
      return
    }

    if (newCommittee.value.project_ids.length > 10) {
      showToast('Ủy ban tối đa chỉ có 10 đề tài.', 'error')
      return
    }

    if (!newCommittee.value.time_start || !newCommittee.value.time_end) {
      showToast('Vui lòng chọn thời gian bắt đầu và kết thúc.', 'error')
      return
    }

    if (newCommittee.value.time_start > newCommittee.value.time_end) {
      showToast('Thời gian bắt đầu phải trước thời gian kết thúc.', 'error')
      return
    }

    const now = new Date()
    if (newCommittee.value.time_start < now || newCommittee.value.time_end < now) {
      showToast('Thời gian bắt đầu và kết thúc phải trong tương lai.', 'error')
      return
    }
    newCommittee.value.total_teacher = newCommittee.value.teacher_ids.length
    newCommittee.value.total_project = newCommittee.value.project_ids.length

    if (isEditing.value) {
      await committeeStore.updateItem(editedCommitteeId.value, newCommittee.value)
    } else {
      await committeeStore.addItem(newCommittee.value)
    }

    cancelForm()
  } catch (error) {
    Message.error('Failed to save committee. Please try again.')
  } finally {
    loading.value = false
  }
}

const editCommittee = (committee) => {
  editedCommitteeId.value = committee.id
  newCommittee.value = {
    ...committee,
    teacher_ids: committee.teachers.map((teacher) => teacher.id),
    project_ids: committee.projects.map((project) => project.id),
    course_id: committee.course.id,
    department_id: committee.department.id,
  }
  isEditing.value = true
  visibleLeft.value = true
}

const deleteCommittee = async (ids) => {
  await committeeStore.deleteItem(ids)
}

const router = useRouter()
const getDetail = (data) => {
  if (data?.id) router.push(`/committee-management/${data?.id}`)
}
</script>

<template>
  <div class="w-full grid grid-cols-4 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
    <!-- Khoa -->
    <div class="flex flex-col gap-y-1">
      <label for="department" class="font-medium">Khoa</label>
      <MyInput class="w-full" id="department" type="select" v-model="filterData.departmentId" :options="departments"
        optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
    </div>

    <div class="flex flex-col gap-y-1">
      <label for="position" class="font-medium">Chức vụ</label>
      <MyInput class="w-full" type="multiselect" v-model="filterData.positionIds" id="positions" :options="positions"
        placeholder="Chọn chức vụ" optionLabel="name" optionValue="id" filter :showClear="true" />
    </div>

    <!-- Sắp xếp -->
    <div class="flex flex-col gap-y-1">
      <label for="order" class="font-medium">Sắp xếp</label>
      <MyInput class="w-full" id="order" type="select" v-model="filterData.orderBy" :options="[
        { label: 'Mới nhất', value: 'DESC' },
        { label: 'Cũ nhất', value: 'ASC' },
      ]" optionLabel="label" optionValue="value" placeholder="Chọn thứ tự" />
    </div>
    <div class="flex flex-col gap-y-1 justify-end">
      <Button label="Reset" @click="resetFilter" />
    </div>
  </div>
  <DataTableCustom title="Danh sách Giảng Viên" :data="teachers" :columns="optionColumn" :total="teacherStore?.total"
    :loading="loading" @fetch="fetchTeacher" @add="addTeacher" @edit="editTeacher" @delete="deleteTeacher"
    @rowSelect="getDetail" @export="handleOpenDialog('export')" @import="handleOpenDialog('import')" />
  <MyDrawer class="w-full" title="giảng viên" v-model:visible="visibleLeft" :isEditing="isEditing"
    :onCancel="cancelForm" :onSave="saveTeacher" :showImport="isImport" position="right" :closable="false">
    <div class="grid grid-cols-2 gap-x-10">
      <div>
        <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
          <MyInput v-model="newTeacher.user.fullname" title="Họ và tên" id="fullname" />
          <MyInput v-model="newTeacher.user.birth_date" title="Ngày sinh" id="date_of_birth" type="date"
            dateFormat="dd/mm/yy" />
          <MyInput v-model="newTeacher.user.email" title="Email" id="email" />
          <MyInput v-model="newTeacher.user.address" title="Địa chỉ" id="address" />
          <MyInput v-model="newTeacher.user.phone" title="Số điện thoại" id="phone" />
        </div>
      </div>
      <div>
        <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
          <MyInput v-model="newTeacher.code" title="Mã giảng viên" id="code" :disabled="isEditing" />
          <MyInput v-model="newTeacher.degree" title="Học vị" id="degree" />
          <MyInput type="multiselect" v-model="newTeacher.positionIds" title="Chức vụ" id="positions"
            :options="positions" optionLabel="name" optionValue="id" filter :showClear="true" />
          <MyInput v-model="newTeacher.departmentId" title="Khoa" id="department" type="select" :options="departments"
            optionLabel="name" optionValue="id" />
        </div>
      </div>
    </div>
  </MyDrawer>
  <ImportExportDialog v-model:visible="openDialog" :type="typeDialog" @hide="resetDialog" @export="exportData"
    @import="handleImport" :isShowUpload="importValue?.departmentId != '' && importValue?.positionIds?.length > 0">
    <template #import>
      <div class="w-full pb-2">
        <div class="w-full grid grid-cols-4 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
          <!-- Khoa -->
          <div class="flex flex-col gap-y-1">
            <label for="department" class="font-medium">Khoa</label>
            <MyInput class="w-full" id="department" type="select" v-model="importValue.departmentId"
              :options="departments" optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
          </div>

          <div class="flex flex-col gap-y-1">
            <label for="position" class="font-medium">Chức vụ</label>
            <MyInput class="w-full" type="multiselect" v-model="importValue.positionIds" id="positions"
              :options="positions" placeholder="Chọn chức vụ" optionLabel="name" optionValue="id" filter
              :showClear="true" />
          </div>
          <div class="flex flex-col gap-y-1 justify-end">
            <Button label="Tải file mẫu" icon="pi pi-download" class="p-button-secondary" @click="getTemplate" />
          </div>
          <div class="flex flex-col gap-y-1 justify-end">
            <Button :disabled="!importedData?.length > 0" label="Import Data" icon="pi pi-plus" class="btn-submit"
              @click="handleAddImport" />
          </div>
        </div>
        <div v-if="importErrors.length > 0" class="bg-red-100 border border-red-400 text-red-700 p-4 mt-4 rounded-lg">
          <div v-for="(error, index) in importErrors" :key="index" class="font-semibold mb-2">
            {{ error }}
          </div>
        </div>
        <DataTableCustom v-if="importedData?.length > 0" title="Danh sách Giảng viên"
          :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="importedData" :columns="[
            { field: 'code', header: 'Mã giảng viên' },
            { field: 'user.fullname', header: 'Họ và tên' },
            { field: 'user.email', header: 'Email' },
            { field: 'user.birth_date', header: 'Ngày sinh' },
            { field: 'user.phone', header: 'Số điện thoại' },
            { field: 'user.avatar', header: 'Link ảnh' },
            { field: 'degree', header: 'Chức vụ' },
          ]" :total="importedData?.total" />
      </div>
    </template>
    <template #export>
      <!-- UI export tuỳ chỉnh -->
      <div class="w-full pb-2">
        <div class="w-full grid grid-cols-4 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
          <!-- Khoa -->
          <div class="flex flex-col gap-y-1">
            <label for="department" class="font-medium">Khoa</label>
            <MyInput class="w-full" id="department" type="select" v-model="filterData.departmentId"
              :options="departments" optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
          </div>

          <div class="flex flex-col gap-y-1">
            <label for="position" class="font-medium">Chức vụ</label>
            <MyInput class="w-full" type="multiselect" v-model="filterData.positionIds" id="positions"
              :options="positions" placeholder="Chọn chức vụ" optionLabel="name" optionValue="id" filter
              :showClear="true" />
          </div>

          <!-- Sắp xếp -->
          <div class="flex flex-col gap-y-1">
            <label for="order" class="font-medium">Sắp xếp</label>
            <MyInput class="w-full" id="order" type="select" v-model="filterData.orderBy" :options="[
              { label: 'Mới nhất', value: 'DESC' },
              { label: 'Cũ nhất', value: 'ASC' },
            ]" optionLabel="label" optionValue="value" placeholder="Chọn thứ tự" />
          </div>
          <div class="flex flex-col gap-y-1 justify-end">
            <Button label="Reset" @click="resetFilter" />
          </div>
        </div>
        <DataTableCustom title="Danh sách Giảng viên" :block="['toolbar', 'headerBar', 'selectAll', 'action']"
          :data="teachers" :columns="optionColumn" :total="teacherStore?.total" :loading="loading"
          @fetch="fetchTeacher" />
      </div>
    </template>
  </ImportExportDialog>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from 'vue'
import { useDepartmentStore, usePositionStore, useTeacherStore } from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import MyInput from '@/components/form/MyInput.vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from 'primevue'
import ImportExportDialog from '@/components/drawer/ImportExportDialog.vue'
import { useExcelStore } from '@/stores/excel'

const visibleLeft = ref(false)
const teacherStore = useTeacherStore()
const positionStore = usePositionStore()
const departmentsStore = useDepartmentStore()
const teachers = ref([])
const positions = ref([])
const departments = ref([])
const loading = ref(false)
const isEditing = ref(false)
const editedTeacherId = ref(null)
const optionColumn = ref([
  { field: 'code', header: 'Mã giảng viên', sortable: true },
  { field: 'user.fullname', header: 'Họ và tên', sortable: true },
  { field: 'user.email', header: 'Email', sortable: true },
  { field: 'user.phone', header: 'Số điện thoại', sortable: true },
  { field: 'degree', header: 'Học vị', sortable: true },
  { field: 'position', header: 'Chức vụ', sortable: true },
  { field: 'department.name', header: 'Khoa', sortable: true },
])
const filterData = ref({
  positionIds: [],
  departmentId: null,
  orderBy: 'ASC',
})
const newTeacher = ref({
  code: '',
  degree: '',
  positionIds: [],
  user: {
    fullname: '',
    birth_date: null,
    email: '',
    phone: '',
    address: '',
    avatar: '',
  },
})
onMounted(async () => {
  teacherStore.fetchItems()
  positionStore.fetchItems()
  departmentsStore.fetchItems()
})
watchEffect(() => {
  positions.value = positionStore.items
  teachers.value = teacherStore.items.map((teacher) => ({
    ...teacher,
    position: teacher.position.map((pos) => pos.name).join(', '),
  }))
  departments.value = departmentsStore.items
  console.log(teachers.value)
})
const fetchTeacher = async (newPage, newLimit, newSearch, filter = {}) => {
  await teacherStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? studentStore.total : newLimit,
    newSearch,
    filter
  )
}
const addTeacher = () => {
  visibleLeft.value = true
}
const saveTeacher = async () => {
  console.log('newTeacher', newTeacher.value)
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

const resetFilter = async () => {
  filterData.value = {
    departmentId: '',
    positionIds: [],
    orderBy: 'ASC', // giá trị mặc định nếu có
  }
  await fetchTeacher(1, null, null, filterData.value)
}

watch(
  filterData,
  async (newFilters) => {
    await fetchTeacher(1, null, null, newFilters)
  },
  { immediate: true, deep: true }
)

watch(visibleLeft, (newVal) => {
  if (newVal == false) {
    cancelForm()
  }
})

const router = useRouter()
const getDetail = (data) => {
  if (data?.id) router.push(`/user-detail/${data?.user?.id}`)
}
// ============================== XU LY EXPORT - IMPORT ==============================//
const openDialog = ref(false)
const typeDialog = ref('export')
const importValue = ref({ departmentId: '', positionIds: [] })
const importedData = ref([])
const importErrors = ref([])
const excelStore = useExcelStore()

const handleOpenDialog = (type = 'export') => {
  openDialog.value = true
  typeDialog.value = type
}

// ĐÓNG DIALOG
const resetDialog = () => {
  openDialog.value = false
  importedData.value = []
  importValue.value = { departmentId: '', positionIds: [] }
  importErrors.value = []
}

// EXPORT THEO COLUMN CỦA BẢNG
const exportData = () => {
  excelStore.exportToExcel({
    data: teachers.value,
    columns: optionColumn.value,
    fileName: 'DanhSachGiangVien.xlsx',
  })
}

// TẢI FILE MẪU
const getTemplate = () => {
  excelStore.downloadExcelTemplate(
    [
      {
        code: '',
        degree: '',
        email: '',
        fullname: '',
        birth_date: '',
        phone: '',
        avatar: '',
      },
    ],
    'teacher_template.xlsx'
  )
}

// VALIDATE DATA IMPORT
const validateTeacher = (row, index) => {
  if (!row.code || !row.email || !row.fullname || !row.degree) {
    throw new Error(`Dòng ${index + 2} thiếu trường bắt buộc!`)
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(row.email)) {
    throw new Error(`Email không hợp lệ tại dòng ${index + 2}: ${row.email}`)
  }
}

// MAP DATA ĐỂ TẠO JSON THEO CẤU  TRÚC MONG MUỐN
const mapTeacher = (row) => ({
  code: row.code,
  degree: row.degree,
  user: {
    email: row.email,
    fullname: row.fullname,
    birth_date: row.birth_date ? new Date(row.birth_date) : null,
    phone: row.phone || '',
    avatar: row.avatar || '',
  },
  positionIds: importValue.value?.positionIds,
  departmentId: importValue.value?.departmentId,
})

const handleImport = async (file) => {
  if (!importValue.value?.departmentId || !importValue.value?.positionIds > 0) {
    showToast('Cần chọn khoa và chức vụ để import', 'error')
    file = null
  } else {
    const data = await excelStore.importExcel(file, {
      key: 'teachers',
      validateFn: validateTeacher, // Hàm validate dữ liệu sinh viên
      mapFn: mapTeacher, // Hàm map dữ liệu
    })
    importedData.value = data
  }
}
const handleAddImport = async () => {
  if (
    !importedData.value ||
    !importValue.value?.departmentId ||
    !importValue.value?.positionIds > 0
  ) {
    showToast('Dữ liệu chưa có hoặc chưa hợp lệ', 'error')
  } else {
    const data = await teacherStore.importItems(importedData.value)
    if (data && data?.errors.length > 0) {
      importErrors.value = data?.errors
    } else {
      await fetchTeacher()
      resetDialog()
      showToast(data?.message, 'success')
    }
  }
}
</script>

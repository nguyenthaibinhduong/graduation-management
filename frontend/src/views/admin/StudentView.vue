<template>
  <div class="w-full grid grid-cols-4 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">

    <!-- Khoa -->
    <div class="flex flex-col gap-y-1">
      <label for="department" class="font-medium">Khoa</label>
      <MyInput class="w-full" id="department" type="select" v-model="filterData.department_id" :options="departments"
        optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
    </div>

    <div class="flex flex-col gap-y-1">
      <label for="major" class="font-medium">Chuyên ngành</label>
      <MyInput class="w-full" id="major" type="select" v-model="filterData.major_id" :options="majors"
        optionLabel="name" optionValue="id" placeholder="Chọn chuyên ngành" />
    </div>

    <!-- Sắp xếp -->
    <div class="flex flex-col gap-y-1">
      <label for="order" class="font-medium">Sắp xếp</label>
      <MyInput class="w-full" id="order" type="select" v-model="filterData.orderBy" :options="[
        { label: 'Mới nhất', value: 'DESC' },
        { label: 'Cũ nhất', value: 'ASC' }
      ]" optionLabel="label" optionValue="value" placeholder="Chọn thứ tự" />
    </div>
    <div class="flex flex-col gap-y-1 justify-end">
      <Button label="Reset" @click="resetFilter" />
    </div>

  </div>
  <DataTableCustom title="Danh sách Sinh Viên" :data="students" :columns="optionColumn" :total="studentStore?.total"
    :loading="loading" @fetch="fetchStudent" @add="visibleLeft = true" @edit="editStudent" @delete="deleteStudent"
    @selectOne="handleSelectData" @selectAll="handleSelectData" @rowSelect="getDetail"
    @export="handleOpenDialog('export')" @import="handleOpenDialog('import')" />


  <MyDrawer class="w-full" title="sinh viên" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveStudent"
    :showImport="isImport" v-model:visible="visibleLeft" position="right" :closable="false">
    <div v-if="!isImport" class="grid grid-cols-2 mt-5 gap-x-10">
      <!-- Thông tin cá nhân -->
      <div>
        <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
          <MyInput v-model="newStudent.user.fullname" title="Họ và tên" id="name" />
          <MyInput v-model="newStudent.user.birth_date" :maxDate="maxDate" title="Ngày sinh" id="date_of_birth"
            type="date" dateFormat="dd/mm/yy" />
          <MyInput v-model="newStudent.user.email" title="Email" id="student_email" />
          <MyInput v-model="newStudent.user.address" title="Địa chỉ" id="student_address" />
          <MyInput v-model="newStudent.user.phone" title="Số điện thoại" id="student_phone" />
        </div>
      </div>
      <!-- Thông tin học vụ -->
      <div>
        <h3 class="text-lg font-semibold mb-6">Thông tin học vụ</h3>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
          <MyInput v-model="newStudent.code" title="Mã sinh viên" id="student_code" :disabled="isEditing" />
          <MyInput v-model="newStudent.department_id" title="Khoa" id="department" type="select" :options="departments"
            optionLabel="name" />
          <MyInput v-model="newStudent.major_id" title="Chuyên ngành" id="major" type="select" :options="majors"
            optionLabel="name" />
          <div class="card flex flex-col items-center gap-6">
            <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary"
              class="p-button-outlined" />
            <img v-if="src || newStudent.user.avatar" :src="src ?? newStudent.user.avatar" alt="Image"
              class="shadow-md rounded-xl w-full sm:w-64" />
          </div>
        </div>
      </div>
    </div>


  </MyDrawer>

  <ImportExportDialog v-model:visible="openDialog" :type="typeDialog" @hide="resetDialog" @export="exportData"
    @import="handleImport" :isShowUpload="(importValue?.department_id != '' && importValue?.major_id != '')">
    <template #import>
      <div class="w-full pb-2">
        <div class="w-full grid grid-cols-4 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">

          <!-- Khoa -->
          <div class="flex flex-col gap-y-1">
            <label for="department" class="font-medium">Khoa</label>
            <MyInput class="w-full" id="department" type="select" v-model="importValue.department_id"
              :options="departments" optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
          </div>

          <div class="flex flex-col gap-y-1">
            <label for="major" class="font-medium">Chuyên ngành</label>
            <MyInput class="w-full" id="major" type="select" v-model="importValue.major_id" :options="majors"
              optionLabel="name" optionValue="id" placeholder="Chọn chuyên ngành" />
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
        <DataTableCustom v-if="importedData?.length > 0" title="Danh sách Sinh Viên"
          :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="importedData" :columns="[
            { field: 'code', header: 'Mã sinh viên' },
            { field: 'user.fullname', header: 'Họ và tên' },
            { field: 'user.email', header: 'Email' },
            { field: 'user.birth_date', header: 'Ngày sinh' },
            { field: 'user.phone', header: 'Số điện thoại' },
            { field: 'user.avatar', header: 'Link ảnh' }
          ]" :total="importedData?.total" />
      </div>

    </template>
    <template #export>
      <!-- UI export tuỳ chỉnh -->
      <div class="w-full pb-2">
        <div class="w-full grid grid-cols-5 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">

          <!-- Khoa -->
          <div class="flex flex-col gap-y-1">
            <label for="department" class="font-medium">Khoa</label>
            <MyInput class="w-full" id="department" type="select" v-model="filterData.department_id"
              :options="departments" optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
          </div>

          <div class="flex flex-col gap-y-1">
            <label for="major" class="font-medium">Chuyên ngành</label>
            <MyInput class="w-full" id="major" type="select" v-model="filterData.major_id" :options="majors"
              optionLabel="name" optionValue="id" placeholder="Chọn chuyên ngành" />
          </div>

          <!-- Sắp xếp -->
          <div class="flex flex-col gap-y-1">
            <label for="order" class="font-medium">Sắp xếp</label>
            <MyInput class="w-full" id="order" type="select" v-model="filterData.orderBy" :options="[
              { label: 'Mới nhất', value: 'DESC' },
              { label: 'Cũ nhất', value: 'ASC' }
            ]" optionLabel="label" optionValue="value" placeholder="Chọn thứ tự" />
          </div>
          <div class="flex flex-col gap-y-1 justify-end">
            <Button label="Reset" @click="resetFilter" />
          </div>

        </div>
        <DataTableCustom title="Danh sách Sinh Viên" :block="['toolbar', 'headerBar', 'selectAll', 'action']"
          :data="students" :columns="optionColumn" :total="studentStore?.total" :loading="loading"
          @fetch="fetchStudent" />
      </div>
    </template>
  </ImportExportDialog>



</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { Column, DataTable, FileUpload, Message, Button } from "primevue";
import { useStudentStore, useMajorStore, useDepartmentStore, useFileStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";
import { useRouter } from "vue-router";
import ImportExportDialog from "@/components/drawer/ImportExportDialog.vue";
import { useExcelStore } from "@/stores/excel";
import dayjs from 'dayjs';
import { showToast } from "@/utils/toast";


const studentStore = useStudentStore();
const majorsStore = useMajorStore();
const fileStore = useFileStore();
const departmentsStore = useDepartmentStore();
const excelStore = useExcelStore()
const router = useRouter();

const students = ref([]);
const departments = ref([]);
const majors = ref([]);
const optionColumn = ref([
  { field: 'code', header: 'Mã sinh viên', sortable: true },
  { field: 'user.fullname', header: 'Họ và tên', sortable: true },
  { field: 'user.email', header: 'Email', sortable: true },
  { field: 'major.name', header: 'Ngành học', sortable: true },
  { field: 'department.name', header: 'Khoa', sortable: true }
])
const visibleLeft = ref(false);
const src = ref(null);
const file = ref(null);
const loading = ref(false);
const isEditing = ref(false);
const openDialog = ref(false);
const typeDialog = ref('import')
const editedStudentId = ref(null);
const newStudent = ref({ code: "", user: { email: "", fullname: "", birth_date: null, phone: "", avatar: "" }, major_id: null, department_id: null });
const maxDate = ref(new Date());
maxDate.value.setFullYear(maxDate.value.getFullYear() - 18);
const filterData = ref({ department_id: '', major_id: '', orderBy: 'ASC' });
const importValue = ref({ department_id: '', major_id: '' });
const importedData = ref([]);



onMounted(async () => {
  await Promise.all([studentStore.fetchItems(), majorsStore.fetchItems(), departmentsStore.fetchItems()]);

});
watchEffect(async () => {
  students.value = studentStore.items;
  departments.value = departmentsStore.items;
  majors.value = majorsStore.items;
})

watch(
  () => newStudent.value.department_id,
  (newDeptId) => {
    if (!isEditing.value) {
      majors.value = newDeptId?.major || [];
    }
  },
  { immediate: true }
);



const fetchStudent = async (newPage, newLimit, newSearch, filter = {}) => {
  await studentStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? studentStore.total : newLimit,
    newSearch,
    filter
  );
};

const resetFilter = async () => {
  filterData.value = {
    department_id: '',
    major_id: '',
    orderBy: 'ASC' // giá trị mặc định nếu có
  };
  await fetchStudent(1, null, null, filterData.value);
};


watch(filterData, async (newFilters) => {
  await fetchStudent(1, null, null, newFilters);
}, { immediate: true, deep: true });



const saveStudent = async () => {
  const newData = {
    ...newStudent.value,
    major_id: newStudent.value.major_id?.id || '',
    department_id: newStudent.value.department_id?.id || ''
  };
  if (file.value != null) {
    if (isEditing.value && newData?.user?.avatar) {
      await fileStore.deleteFileItem(newData.user.avatar);
    }
    const url = await fileStore.uploadFile(file.value, 'avatar');
    newData.user.avatar = url;
  }
  isEditing.value
    ? await studentStore.updateItem(editedStudentId.value, newData)
    : await studentStore.addItem(newData);


  cancelForm();
};

const deleteStudent = async (ids) => {
  await studentStore.deleteItem(ids);
};

const editStudent = (dataEdit) => {
  editedStudentId.value = dataEdit.id;
  const clonedData = JSON.parse(JSON.stringify(dataEdit));
  const { major_id, department_id, ...data } = clonedData;
  newStudent.value = {
    ...data,
    major_id: clonedData.major,
    department_id: departments.value.find(
      (item) => item.id == clonedData.department.id
    ),
  };
  console.log(newStudent.value);

  isEditing.value = true;
  visibleLeft.value = true;
};

const formatDate = (rowData) => {
  if (rowData.user.birth_date) {
    // Chuyển đổi ngày sinh từ ISO 8601 sang định dạng ngày mong muốn
    return dayjs(rowData.user.birth_date).format('DD/MM/YYYY');
  }
  return '';
};

const cancelForm = () => {
  visibleLeft.value = false;
  isEditing.value = false;
  editedStudentId.value = null;
  isImport.value = false;
  src.value = null;
  file.value = null;
  newStudent.value = {
    code: "",
    user: {
      email: "",
      fullname: "",
      birth_date: null,
      phone: "",
      avatar: ""
    },
    major_id: null,
    department_id: null
  };
};

const getDetail = (data) => {
  if (data?.user?.id) router.push(`/user-detail/${data?.user?.id}`);
};

const selectedIds = ref([]);
const handleSelectData = (ids) => {
  selectedIds.value = ids;
};

// ============================== XU LY EXPORT - IMPORT ==============================//


// MỞ DIALOG
const handleOpenDialog = (type = 'export') => {
  openDialog.value = true
  typeDialog.value = type

}

// ĐÓNG DIALOG
const resetDialog = () => {
  openDialog.value = false
  importedData.value = []
  importValue.value = { department_id: '', major_id: '' }
  importErrors.value = []

}


// EXPORT THEO COLUMN CỦA BẢNG
const exportData = () => {
  excelStore.exportToExcel({
    data: students.value,
    columns: optionColumn.value,
    fileName: 'DanhSachSinhVien.xlsx'
  })
}


// TẢI FILE MẪU
const getTemplate = () => {
  excelStore.downloadExcelTemplate(
    [{
      code: '',
      email: '',
      fullname: '',
      birth_date: '',
      phone: '',
      avatar: '',
    }],
    'student_template.xlsx'
  )

};


// VALIDATE DATA IMPORT
const validateStudent = (row, index) => {
  if (!row.code || !row.email || !row.fullname) {
    throw new Error(`Dòng ${index + 2} thiếu trường bắt buộc!`)
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(row.email)) {
    throw new Error(`Email không hợp lệ tại dòng ${index + 2}: ${row.email}`)
  }
}

// MAP DATA ĐỂ TẠO JSON THEO CẤU  TRÚC MONG MUỐN
const mapStudent = (row) => ({
  code: row.code,
  user: {
    email: row.email,
    fullname: row.fullname,
    birth_date: row.birth_date ? new Date(row.birth_date) : null,
    phone: row.phone || '',
    avatar: row.avatar || ''
  },
  major_id: importValue.value?.major_id,
  department_id: importValue.value?.department_id
})

// XỬ LÝ IMPORT
const handleImport = async (file) => {
  if (!importValue.value?.department_id || !importValue.value?.major_id) {
    showToast('Cần chọn khoa và chuyên ngành để import', 'error')
    file = null
  } else {
    const data = await excelStore.importExcel(file, {
      key: 'students',
      validateFn: validateStudent, // Hàm validate dữ liệu sinh viên
      mapFn: mapStudent // Hàm map dữ liệu
    })
    importedData.value = data

  }
}
const importErrors = ref([]);
const handleAddImport = async () => {
  if (!importedData.value || !importValue.value?.department_id || !importValue.value?.major_id) {
    showToast('Dữ liệu chưa có hoặc chưa hợp lệ', 'error')
  } else {
    const data = await studentStore.importItems(importedData.value)
    if (data && data?.errors.length > 0) {
      importErrors.value = data?.errors
    } else {
      await fetchStudent()
      resetDialog()
      showToast(data?.message, 'success',)
    }
  }

}

</script>
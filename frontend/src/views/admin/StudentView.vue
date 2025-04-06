<template>
  <DataTableCustom title="Danh sách Sinh Viên" :data="students" :columns="[
    { field: 'code', header: 'Mã sinh viên', sortable: true },
    { field: 'user.fullname', header: 'Họ và tên', sortable: true },
    { field: 'user.email', header: 'Email', sortable: true },
    { field: 'user.phone', header: 'Số điện thoại', sortable: true },
    { field: 'major.name', header: 'Ngành học', sortable: true },
    { field: 'department.name', header: 'Khoa', sortable: true }
  ]" :total="studentStore?.total" :loading="loading" @fetch="fetchStudent" @add="addStudent" @edit="editStudent"
    @delete="deleteStudent" @import="importStudent" @selectOne="handleSelectData" @selectAll="handleSelectData" />


  <Drawer class="w-full" v-model:visible="visibleLeft" position="right" :closable="false">
    <template #header>
      <div class="flex justify-between items-center w-full">
        <div class="flex items-center gap-4">
          <Button v-on:click="cancelForm" icon="pi pi-arrow-left" variant="text" rounded />
          <div>
            <h2 class="text-lg font-semibold  text-black">
              {{ isEditing ? 'Cập nhật thông tin sinh viên' : 'Thêm mới sinh viên' }}
            </h2>
          </div>

        </div>

        <div class="flex items-center gap-2">
          <Button @click="cancelForm" severity="danger">
            Hủy bỏ
          </Button>
          <Button v-if="!isImport" @click="saveStudent" class="btn-submit te">
            Lưu
          </Button>
          <Button v-if="isImport" label="Nhập dữ liệu" icon="pi pi-upload" class=""
            :disabled="errors.length || !excelData.length" @click="submitDataImport" />
        </div>

      </div>
    </template>
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
        </div>
      </div>

      <!-- Thông tin học vụ -->
      <div>
        <h3 class="text-lg font-semibold mb-6">Thông tin học vụ</h3>
        <div class="grid grid-cols-1 md:grid-cols-1 gap-10">
          <MyInput v-model="newStudent.code" title="Mã sinh viên" id="student_code" :disabled="isEditing" />
          <MyInput v-model="newStudent.major_id" title="Chuyên ngành" id="major" type="select" :options="majors"
            optionLabel="name" />
          <MyInput v-model="newStudent.department_id" title="Khoa" id="department" type="select" :options="departments"
            optionLabel="name" />
        </div>
      </div>
    </div>

    <div v-if="isImport" class="mt-6">
      <FileUpload mode="basic" chooseLabel="Tải lên file Excel" accept=".xlsx, .xls" @select="handleFileUpload" />

      <Message v-if="errors.length" severity="error">
        <ul class="list-disc ml-5">
          <li v-for="(error, index) in errors" :key="index">{{ error }}</li>
        </ul>
      </Message>

      <DataTable v-if="excelData.length" :value="excelData" class="mt-3">
        <Column field="name" header="Họ và tên"></Column>
        <Column field="student_code" header="Mã sinh viên"></Column>
        <Column field="date_of_birth" header="Ngày sinh"></Column>
        <Column field="major" header="Ngành học"></Column>
        <Column field="enrollment_year" header="Năm nhập học"></Column>
      </DataTable>


    </div>
  </Drawer>

</template>
<script setup>
import { ref, onMounted, watchEffect } from "vue";
import * as XLSX from "xlsx";
import { Button, Column, DataTable, Drawer, FileUpload, Message } from "primevue";
import { useStudentStore, useMajorStore, useDepartmentStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";


const visibleLeft = ref(false);
const studentStore = useStudentStore();
const majorsStore = useMajorStore();
const departmentsStore = useDepartmentStore();
const students = ref([]);
const departments = ref([]);
const majors = ref([]);
const loading = ref(false);
const isEditing = ref(false);
const isImport = ref(false);
const editedStudentId = ref(null);
const newStudent = ref({
  code: "",
  user: {
    email: "",
    fullname: "", // Cung cấp giá trị hợp lệ
    birth_date: null, // Định dạng YYYY-MM-DD (ISO)
    phone: "" // Loại bỏ khoảng trắng nếu cần
  },
  major_id: 0, // Để null thay vì chuỗi rỗng nếu chưa có giá trị
  department_id: 0
});
const maxDate = ref(new Date());
maxDate.value.setFullYear(maxDate.value.getFullYear() - 18);

onMounted(() => {
  studentStore.fetchItems();
  majorsStore.fetchItems();
  departmentsStore.fetchItems();
});
watchEffect(() => {
  students.value = studentStore.items;
  majors.value = majorsStore.items;
  departments.value = departmentsStore.items;
});

const fetchStudent = async (newPage, newLimit, newSearch) => {
  await studentStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? studentStore.total : newLimit,
    newSearch
  );
};
const addStudent = () => {
  visibleLeft.value = true;
};

const saveStudent = async () => {
  const newData = {
    ...newStudent.value,
    major_id: newStudent.value.major_id?.id || '',
    department_id: newStudent.value.department_id?.id || ''
  };

  isEditing.value
    ? await studentStore.updateItem(editedStudentId.value, newData)
    : await studentStore.addItem(newData);

  cancelForm();
};

const deleteStudent = async (ids) => {
  await studentStore.deleteItem(ids);
};

const editStudent = (student) => {
  editedStudentId.value = student.id;
  newStudent.value = {
    ...student,
    major_id: student.major,
    department_id: student.department
  };
  isEditing.value = true;
  visibleLeft.value = true;
};

const importStudent = () => {
  visibleLeft.value = true;
  isImport.value = true;
};

const cancelForm = () => {
  visibleLeft.value = false;
  isEditing.value = false;
  editedStudentId.value = null;
  isImport.value = false;
  Object.keys(newStudent.value).forEach((key) => (newStudent.value[key] = ""));
};


const excelData = ref([]);
const errors = ref([]);
const fieldMappings = {
  name: (v) => v || "",
  student_code: (v) => v || "",
  date_of_birth: (v) => formatDate(v),
  major: (v) => v || "",
  enrollment_year: (v) => parseInt(v) || "",
};

const validators = {
  student_code: (v) => (!v ? "Mã sinh viên không được để trống." : ""),
  name: (v) => (!v ? "Họ và tên không được để trống." : ""),
  date_of_birth: (v) => (!v ? "Ngày sinh không hợp lệ (dd/mm/YYYY)" : ""),
  major: (v) => (!v ? "Ngành học không được để trống." : ""),
  enrollment_year: (v) =>
    !v || v < 2000 || v > new Date().getFullYear() ? "Năm nhập học không hợp lệ." : "",
};

const handleFileUpload = (event) => {
  const file = event.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const binaryString = e.target.result;
    const workbook = XLSX.read(binaryString, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    processData(XLSX.utils.sheet_to_json(sheet, { header: 1 }));
  };
  reader.readAsBinaryString(file);
};

const processData = (jsonData) => {
  errors.value = [];
  const rawData = jsonData.slice(1);

  excelData.value = rawData.map((row, index) => {
    const item = Object.keys(fieldMappings).reduce((acc, key, i) => {
      acc[key] = fieldMappings[key](row[i]);
      return acc;
    }, {});

    Object.keys(validators).forEach((key) => {
      const error = validators[key](item[key]);
      if (error) errors.value.push(`Row ${index + 1}: ${error}`);
    });

    return item;
  });
};

const formatDate = (excelDate) => {
  if (!excelDate) return "";
  if (typeof excelDate === "number") {
    const date = XLSX.SSF.parse_date_code(excelDate);
    return `${date.d}/${date.m}/${date.y}`;
  }
  return excelDate.split("/").length === 3 ? excelDate : "";
};
const selectedIds = ref([]);
const submitDataImport = async () => {
  await studentStore.addItem(JSON.stringify(excelData.value));
  excelData.value = [];
};

const handleSelectData = (ids) => {
  selectedIds.value = ids;
};



</script>

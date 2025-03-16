<template>
  <DataTableCustom title="Danh sách Sinh Viên" :data="students" :columns="[
    { field: 'name', header: 'Họ và tên', sortable: true },
    { field: 'student_code', header: 'Mã sinh viên', sortable: true },
    { field: 'date_of_birth', header: 'Ngày sinh', sortable: true },
    { field: 'major', header: 'Ngành học', sortable: true },
    { field: 'enrollment_year', header: 'Năm nhập học', sortable: true },
  ]" :total="studentStore?.total" :loading="loading" @fetch="fetchStudent" @add="addStudent" @edit="editStudent"
    @delete="deleteStudent" @selectOne="handleSelectData" @selectAll="handleSelectData" />
  <Drawer class="w-1/2" v-model:visible="visibleLeft" :header="isEditing ? 'Sửa sinh viên' : 'Thêm sinh viên'"
    position="right">
    <Tabs value="0">
      <TabList>
        <Tab value="0">Nhập dữ liệu </Tab>
        <Tab v-if="!isEditing" value="1">Import Excel</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="0">
          <div class="grid grid-cols-1 gap-5 w-full">
            <div class="p-field mb-2 mt-2">
              <div class="flex flex-col gap-2">
                <label for="name">Tên Sinh Viên</label>
                <InputText class="w-full" id="name" v-model="newStudent.name" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="student_code">Mã Sinh Viên</label>
                <InputText class="w-full" id="student_code" v-model="newStudent.student_code" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="date_of_birth">Ngày Sinh</label>
                <DatePicker class="w-full" v-model="newStudent.date_of_birth" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="major">Chuyên Ngành</label>
                <InputText class="w-full" id="major" v-model="newStudent.major" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="enrollment_year">Năm Nhập Học</label>
                <InputText class="w-full" id="enrollment_year" v-model="newStudent.enrollment_year" />
              </div>
            </div>
          </div>
          <div class="w-full grid grid-cols-2 gap-2 mt-10">
            <Button label="Lưu" @click="saveStudent" class="w-full" />
            <Button label="Hủy" @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
          </div>
        </TabPanel>
        <TabPanel value="1">
          <div class="p-4">
            <div class="w-full flex">
              <FileUpload mode="basic" chooseLabel="Upload Excel" accept=".xlsx, .xls" @select="handleFileUpload" />
            </div>
            <Message v-if="errors.length" severity="error" class="mt-3">
              <ul>
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

            <!-- Nút Import -->
            <Button label="Import Data" icon="pi pi-upload" class="mt-3" :disabled="errors.length || !excelData.length"
              @click="submitDataImport" />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Drawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import {
  Button,
  Drawer,
  InputText,
  DatePicker,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Tabs,
  DataTable,
  Column,
  Message,
  FileUpload,
} from "primevue";
import { useStudentStore } from "@/stores/students";
import DataTableCustom from "@/components/DataTableCustom.vue";
import * as XLSX from "xlsx";

const visibleLeft = ref(false);
const studentStore = useStudentStore();
const students = ref([]);
const loading = ref(false);
const isEditing = ref(false);
const editedStudentId = ref(null);
const newStudent = ref({
  name: "",
  student_code: "",
  date_of_birth: "",
  major: "",
  enrollment_year: "",
});

onMounted(() => studentStore.fetchItems());
watchEffect(() => {
  students.value = studentStore.items;
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
  if (isEditing.value) {
    await studentStore.updateItem(editedStudentId.value, newStudent.value);
  } else {
    await studentStore.addItem(newStudent.value);
  }
  cancelForm();
};

const deleteStudent = async (ids) => {
  await studentStore.deleteItem(ids);
};

const editStudent = (student) => {
  editedStudentId.value = student.id;
  newStudent.value = student;
  isEditing.value = true;
  visibleLeft.value = true;
};

const cancelForm = () => {
  visibleLeft.value = false;
  isEditing.value = false;
  editedStudentId.value = null;
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

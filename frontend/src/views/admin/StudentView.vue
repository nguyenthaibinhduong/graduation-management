<template>
  <DataTableCustom title="Danh sách Sinh Viên" :data="students" :columns="[
    { field: 'code', header: 'Mã sinh viên', sortable: true },
    { field: 'user.fullname', header: 'Họ và tên', sortable: true },
    { field: 'user.email', header: 'Email', sortable: true },
    { field: 'user.phone', header: 'Số điện thoại', sortable: true },
    { field: 'major.name', header: 'Ngành học', sortable: true },
    { field: 'department.name', header: 'Khoa', sortable: true }
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
                <InputText class="w-full" id="name" v-model="newStudent.user.fullname" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="student_code">Mã Sinh Viên</label>
                <InputText :disabled="isEditing" class="w-full" id="student_code" v-model="newStudent.code" />
              </div>
            </div>

            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="date_of_birth">Ngày Sinh</label>
                <DatePicker class="w-full" v-model="newStudent.user.birth_date" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="student_email">Email</label>
                <InputText class="w-full" id="student_email" v-model="newStudent.user.email" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="student_address">Địa chỉ</label>
                <InputText class="w-full" id="student_address" v-model="newStudent.user.address" />
              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="major">Chuyên Ngành</label>
                <Select v-model="newStudent.major_id" :options="majors" optionLabel="name"
                  placeholder="Chọn chuyên ngành" class="w-full " />

              </div>
            </div>
            <div class="p-field mb-2">
              <div class="flex flex-col gap-2">
                <label for="department">Khoa</label>
                <Select v-model="newStudent.department_id" :options="departments" optionLabel="name"
                  placeholder="Chọn khoa" class="w-full " />
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
  Select,
} from "primevue";
import { useStudentStore } from "@/stores/store";
import { useMajorStore } from "@/stores/store";
import { useDepartmentStore } from "@/stores/store";
import DataTableCustom from "@/components/DataTableCustom.vue";
import * as XLSX from "xlsx";

const visibleLeft = ref(false);
const studentStore = useStudentStore();
const majorsStore = useMajorStore();
const departmentsStore = useDepartmentStore();
const students = ref([]);
const departments = ref([]);
const majors = ref([]);
const loading = ref(false);
const isEditing = ref(false);
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

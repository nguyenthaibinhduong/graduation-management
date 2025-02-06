
<template>
  <div class="p-4">
    <DataTable :value="students" :loading="loading" class="p-datatable-sm shadow-md">
      <template #header>
        <div class="flex flex-wrap items-center justify-between py-3 border-b">
        <!-- Tiêu đề -->
        <span class="text-2xl font-semibold">Danh sách Sinh viên</span>

        <!-- Thanh tìm kiếm -->
        <div class="flex items-center w-full md:w-1/3">
          <InputText class="w-full" type="text" v-model="search" placeholder="Tìm kiếm sinh viên..." />
          <!-- <Button @click="studentStore.fetchStudents(search)" class="ms-2" icon="pi pi-search" /> -->
        </div>

        <!-- Các chức năng khác -->
        <div class="flex items-center gap-3">
          <Select 
            v-model="limit" 
            :options="[2, 5, 10, 20]" 
            @change="onLimitChange" 
            placeholder="Hiện bản ghi" 
            class="w-45"
          />
          <Button icon="pi pi-file-excel" label="Xuất Excel" @click="exportToExcel" class="p-button-success" />
          <Button icon="pi pi-plus" label="Thêm mới" @click="visibleLeft = true" severity="info" />
        </div>
      </div>
      
      </template>
      <template #empty>
    <div class="text-center text-gray-500 py-5 w-full">
      <i class="pi pi-info-circle text-xl"></i>
      <p class="mt-2">Không tìm thấy dữ liệu.</p>
    </div>
  </template>
     <Column header="STT" sortable>
        <template #body="{ index }">
          {{ (page - 1) * limit + index + 1 }}
        </template>
    </Column>
      <Column field="name" header="Họ và tên" sortable></Column>
      <Column field="student_code" header="Mã sinh viên" sortable></Column>
      <Column field="date_of_birth" header="Ngày sinh" sortable></Column>
      <Column field="major" header="Ngành học" sortable></Column>
      <Column field="enrollment_year" header="Năm nhập học" sortable></Column>
      <Column header="Hành động">
      <template #body="slotProps">
      <div class="grid grid-cols-2 gap-2">
      <Button icon="pi pi-pencil"  class="bg-blue-600 text-white border-blue-500 " 
          @click="editStudent(slotProps.data)" />
        <Button icon="pi pi-trash"  class="bg-red-500 text-white border-red-500" 
          @click="deleteStudent(slotProps.data.id)" /></div>
        
      </template>
    </Column>
    </DataTable>
    <Paginator 
      v-if="studentStore.total > limit"
      :rows="limit" 
      :totalRecords="studentStore.total" 
      :first="(page - 1) * limit"
      @page="onPageChange" 
    />
  </div>

  <Drawer class="w-2/5" v-model:visible="visibleLeft" :header="isEditing?'Sửa sinh viên':'Thêm sinh viên'" position="right">
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
      <Button label="Lưu"  @click="saveStudent" class="w-full" />
      <Button label="Hủy"  @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>

  <Toast />
</template>
  <script setup>
  import { ref, onMounted, watchEffect, watch } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import { useStudentStore } from '@/stores/students';
  import * as XLSX from "xlsx";
  import { saveAs } from "file-saver";
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import { Button } from 'primevue';
  import Drawer from 'primevue/drawer';
  import InputText from 'primevue/inputtext';
  import Toast from 'primevue/toast';
  import DatePicker from 'primevue/datepicker';
  import Paginator from 'primevue/paginator';
  import Select from 'primevue/select';



  const visibleLeft = ref(false);
  const studentStore = useStudentStore();
  const students = ref([]);
  const search = ref('');
  const limit = ref(4); // Số lượng sinh viên trên mỗi trang
  const page = ref(1);
  const loading = ref(false);
  const toast = useToast();
  const isEditing = ref(false);
  const editedStudentId = ref(null);
  const newStudent = ref({ name: '', student_code: '', date_of_birth: '', major: '', enrollment_year: '' });

  onMounted(() => studentStore.fetchStudents(page.value,limit.value));
  watchEffect(() => (students.value = studentStore.students));
 watch([page, limit, search], async ([newPage, newLimit, newSearch]) => {
  await studentStore.fetchStudents(
    newSearch ? 1 : newPage, 
    newSearch ? studentStore.total : newLimit, 
    newSearch
  );
});
const saveStudent = async () => {
  // if (Object.values(newStudent.value).some((v) => !v)) {
  //   return toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đủ thông tin.', life: 3000 });
  // }
  try {
    if (isEditing.value) {
      await studentStore.updateStudent(editedStudentId.value, newStudent.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật sinh viên thành công.', life: 3000 });
    } else {
      await studentStore.addStudent(newStudent.value);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm sinh viên thành công.', life: 3000 });
    }
    cancelForm();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Đã xảy ra lỗi.', life: 3000 });
  }
};

  const deleteStudent = async (id) => { 
    try {
      await studentStore.deleteStudent(id);
      toast.add({ severity:'success', summary: 'Thành công', detail: 'Sinh viên đã được xóa.', life: 3000 });
    } catch (error) {
      
      toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Đã xảy ra lỗi.', life: 3000 });
    }
  }

  const editStudent = (student) => {
    editedStudentId.value = student.id;
    newStudent.value = { ...student };
    isEditing.value = true;
    visibleLeft.value = true;
  };

  const cancelForm = () => {
    visibleLeft.value = false;
    isEditing.value = false;
    editedStudentId.value = null;
    Object.keys(newStudent.value).forEach((key) => (newStudent.value[key] = ''));
  };

  watch(visibleLeft, (newVal) => {
  if (newVal==false) {
    cancelForm();
    }
  });

  const exportToExcel = () => {
  // 1. Chuẩn bị dữ liệu tùy chỉnh
    const formattedData = students.value.map(student => ({
      "Mã sinh viên": student.student_code,
      "Họ và tên": student.name,
      "Ngành": student.major,
      "Năm nhập học": student.enrollment_year, // Làm tròn điểm GPA
      "Ngày sinh": new Date(student.date_of_birth).toLocaleDateString(), // Format ngày sinh
    }));
      // 1. Chuyển dữ liệu thành worksheet
      const ws = XLSX.utils.json_to_sheet(formattedData);

      // 2. Tạo một Workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách sinh viên");

      // 3. Xuất file
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // 4. Lưu file
      const data = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(data, "DanhSachSinhVien.xlsx");
  }
    const onPageChange = async (event) => {
      page.value = event.page + 1;
    };
    const onLimitChange = async (event) => {
      page.value = 1; // Đặt lại về trang đầu tiên khi thay đổi số bản ghi
    };
</script>



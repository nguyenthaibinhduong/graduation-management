<template>
  <div class="p-4">
    <DataTable :value="students" paginator :rows="100" class="p-datatable-sm shadow-md">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2 py-2">
          <span class="text-xl font-bold">Danh sách Sinh viên</span>
          <Button label="Thêm mới" @click="visibleLeft = true" />
        </div>
      </template>
      <Column field="id" header="ID" sortable></Column>
      <Column field="name" header="Họ và tên" sortable></Column>
      <Column field="student_code" header="Mã sinh viên" sortable></Column>
      <Column field="date_of_birth" header="Ngày sinh" sortable></Column>
      <Column field="major" header="Ngành học" sortable></Column>
      <Column field="enrollment_year" header="Năm nhập học" sortable></Column>
      <Column header="Hành động">
      <template #body="slotProps">
      <div class="grid grid-cols-2 gap-5">
      <Button label="Sửa"  class="bg-blue-600 text-white border-blue-500 " 
          @click="editStudent(slotProps.data)" />
        <Button label="Xóa"  class="bg-red-500 text-white border-red-500" 
          @click="deleteStudent(slotProps.data.id)" /></div>
        
      </template>
    </Column>
    </DataTable>
  </div>

  <Drawer class="w-2/5" v-model:visible="visibleLeft" :header="isEditing?'Sửa sinh viên':'Thêm sinh viên'" position="right">
    <div class="grid grid-cols-1 gap-5 w-full">
      <div class="p-field mb-2 mt-2">
        <FloatLabel variant="on">
          <InputText class="w-full" id="name" v-model="newStudent.name" />
          <label for="name">Tên Sinh Viên</label>
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <InputText class="w-full" id="student_code" v-model="newStudent.student_code" />
          <label for="student_code">Mã Sinh Viên</label>
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label for="date_of_birth">Ngày Sinh</label>
          <DatePicker class="w-full" v-model="newStudent.date_of_birth" />
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <InputText class="w-full" id="major" v-model="newStudent.major" />
          <label for="major">Chuyên Ngành</label>
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <InputText class="w-full" id="enrollment_year" v-model="newStudent.enrollment_year" />
          <label for="enrollment_year">Năm Nhập Học</label>
        </FloatLabel>
      </div>
    </div>
    <div class="w-full grid grid-cols-1 gap-2 mt-10">
      <Button label="Lưu"  @click="saveStudent" class="w-full" />
      <Button label="Hủy"  @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>

  <Toast />
</template>

  <script setup>
  import { ref, onMounted, watchEffect } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import { Button } from 'primevue';
  import { useStudentStore } from '@/stores/students';
  import Drawer from 'primevue/drawer';
  import InputText from 'primevue/inputtext';
  import FloatLabel from 'primevue/floatlabel';
  import Toast from 'primevue/toast';
  import DatePicker from 'primevue/datepicker';

  const visibleLeft = ref(false);
const studentStore = useStudentStore();
const students = ref([]);
  const toast = useToast();
const isEditing = ref(false);
const editedStudentId = ref(null);
const newStudent = ref({ name: '', student_code: '', date_of_birth: '', major: '', enrollment_year: '' });

onMounted(() => studentStore.fetchStudents());
watchEffect(() => (students.value = studentStore.students));

const saveStudent = async () => {
  if (Object.values(newStudent.value).some((v) => !v)) {
    return toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng điền đủ thông tin.', life: 3000 });
  }
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
</script>

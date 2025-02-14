
<template>
  <!-- <div class="p-4">
    <DataTable :value="students" :loading="loading" class="p-datatable-sm shadow-md">
      <template #header>
        <div class="flex flex-wrap items-center justify-between py-3 border-b">
        <span class="text-2xl font-semibold">Danh sách Sinh viên</span>
        <div class="flex items-center w-full md:w-1/3">
          <InputText class="w-full" type="text" v-model="search" placeholder="Tìm kiếm sinh viên..." />
        </div>
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
  </div> -->
   <DataTableCustom
      title="Danh sách Sinh Viên"
      :data="students"
      :columns="[
        { field: 'name', header: 'Họ và tên', sortable: true },
        { field: 'student_code', header: 'Mã sinh viên', sortable: true },
        { field: 'date_of_birth', header: 'Ngày sinh', sortable: true },
        { field: 'major', header: 'Ngành học', sortable: true },
        { field: 'enrollment_year', header: 'Năm nhập học', sortable: true },
      ]"
      :total="studentStore?.total"
      :loading="loading"
      @fetch="fetchStudent"
      @add="addStudent"
      @edit="editStudent"
      @delete="deleteStudent"
    />
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

 
</template>
  <script setup>
  import { ref, onMounted, watchEffect, watch } from 'vue';
  import { Button, Drawer ,InputText, DatePicker} from 'primevue';
  import { useStudentStore } from '@/stores/students';
  import DataTableCustom from '@/components/DataTableCustom.vue';


  const visibleLeft = ref(false);
  const studentStore = useStudentStore();
  const students = ref([]);
  const loading = ref(false);
  const isEditing = ref(false);
  const editedStudentId = ref(null);
  const newStudent = ref({ name: '', student_code: '', date_of_birth: '', major: '', enrollment_year: '' });

  onMounted(() => studentStore.fetchItems());
  watchEffect(() => {
    students.value = studentStore.items
  });

  const fetchStudent = async (newPage, newLimit, newSearch) => {
    await studentStore.fetchItems(
      newSearch ? 1 : newPage, 
      newSearch ? studentStore.total : newLimit, 
      newSearch
    );
  }
  const addStudent = () => {
    visibleLeft.value = true;
  }
  const saveStudent = async () => {
    if (isEditing.value) {
      await studentStore.updateItem(editedStudentId.value, newStudent.value);
    } else {
      await studentStore.addItem(newStudent.value);
    }
    cancelForm();
};

  const deleteStudent = async (id) => { 
    await studentStore.deleteItem(id);
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

</script>



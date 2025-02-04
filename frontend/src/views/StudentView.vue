<template>
  <div class="p-4">
    <DataTable :value="students" paginator :rows="5" class="p-datatable-sm shadow-md">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2 py-2">
          <span class="text-xl font-bold">Danh sách khách hàng</span>
          <Button label="Thêm mới" @click="visibleLeft = true" />
        </div>
      </template>
      <Column field="id" header="ID" sortable></Column>
      <Column field="name" header="Họ và tên" sortable></Column>
      <Column field="student_code" header="Mã sinh viên" sortable></Column>
      <Column field="date_of_birth" header="Ngày sinh" sortable></Column>
      <Column field="major" header="Ngành học" sortable></Column>
      <Column field="enrollment_year" header="Năm nhập học" sortable></Column>
    </DataTable>
  </div>
  <Drawer class="w-2/5" v-model:visible="visibleLeft" header="Thêm sinh viên" position="right">
    <div class="grid grid-cols-2 gap-5">
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label class="mb-2" for="name">Tên Sinh Viên</label>
          <InputText id="name" v-model="newStudent.name" />
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label class="mb-2" for="student_code">Mã Sinh Viên</label>
          <InputText id="student_code" v-model="newStudent.student_code" />
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label class="mb-2" for="date_of_birth">Ngày Sinh</label>
          <InputText id="date_of_birth" v-model="newStudent.date_of_birth" />
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label class="mb-2" for="major">Chuyên Ngành</label>
          <InputText id="major" v-model="newStudent.major" />
        </FloatLabel>
      </div>
      <div class="p-field mb-2">
        <FloatLabel variant="on">
          <label class="mb-2" for="enrollment_year">Năm Nhập Học</label>
          <InputText id="enrollment_year" v-model="newStudent.enrollment_year" />
        </FloatLabel>
      </div>
    </div>
    <div class="p-d-flex p-jc-between mt-5">
      <Button label="Lưu" icon="pi pi-check" @click="saveStudent" />
      <Button
        label="Hủy"
        icon="pi pi-times"
        @click="dialogVisible = false"
        class="p-button-secondary"
      />
    </div>
  </Drawer>
  <Toast />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Button } from 'primevue'
import { useStudentStore } from '@/stores/students'
import Drawer from 'primevue/drawer'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Toast from 'primevue/toast'

const studentStore = useStudentStore()
const students = ref([])

// Gọi API khi component được mounted
onMounted(async () => {
  await studentStore.fetchStudents()
  students.value = studentStore.students
})
const visibleLeft = ref(false)
const toast = useToast()
const newStudent = ref({
  name: '',
  student_code: '',
  date_of_birth: '',
  major: '',
  enrollment_year: '',
})
const saveStudent = async () => {
  if (
    newStudent.value.name &&
    newStudent.value.student_code &&
    newStudent.value.date_of_birth &&
    newStudent.value.major &&
    newStudent.value.enrollment_year
  ) {
    // Gửi sinh viên mới tới store
    await studentStore.addStudent(newStudent.value)

    // Đóng form sau khi thêm thành công
    dialogVisible.value = false

    // Reset form
    newStudent.value = {
      name: '',
      student_code: '',
      date_of_birth: '',
      major: '',
      enrollment_year: '',
    }
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: 'Thêm mới sinh viên thành công',
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Vui lòng điền đủ thông tin',
      life: 3000,
    })
  }
}
</script>

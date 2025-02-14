
<template>
   <DataTableCustom
      title="Danh sách Giảng Viên"
      :data="teachers"
      :columns="[
        { field: 'name', header: 'Họ và tên', sortable: true },
        { field: 'teacher_code', header: 'Mã giảng viên', sortable: true },
        { field: 'date_of_birth', header: 'Ngày sinh', sortable: true },
        { field: 'major', header: 'Ngành dạy', sortable: true },
      ]"
      :total="teacherStore?.total"
      :loading="loading"
      @fetch="fetchTeacher"
      @add="addTeacher"
      @edit="editTeacher"
      @delete="deleteTeacher"
    />
  <Drawer class="w-2/5" v-model:visible="visibleLeft" :header="isEditing?'Sửa giảng viên':'Thêm giảng viên'" position="right">
    <div class="grid grid-cols-1 gap-5 w-full">
      <div class="p-field mb-2 mt-2">
        <div class="flex flex-col gap-2">
          <label for="name">Tên Giảng Viên</label>
          <InputText class="w-full" id="name" v-model="newTeacher.name" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="teacher_code">Mã Giảng Viên</label>
          <InputText class="w-full" id="teacher_code" v-model="newTeacher.teacher_code" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="date_of_birth">Ngày Sinh</label>
          <DatePicker class="w-full" v-model="newTeacher.date_of_birth" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="major">Chuyên Ngành</label>
          <InputText class="w-full" id="major" v-model="newTeacher.major" />
        </div>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-2 mt-10">
      <Button label="Lưu"  @click="saveTeacher" class="w-full" />
      <Button label="Hủy"  @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>

 
</template>
  <script setup>
  import { ref, onMounted, watchEffect, watch } from 'vue';
  import { Button, Drawer ,InputText, DatePicker} from 'primevue';
  import { useTeacherStore } from '@/stores/teachers';
  import DataTableCustom from '@/components/DataTableCustom.vue';


  const visibleLeft = ref(false);
  const teacherStore = useTeacherStore();
  const teachers = ref([]);
  const loading = ref(false);
  const isEditing = ref(false);
  const editedTeacherId = ref(null);
  const newTeacher = ref({ name: '', teacher_code: '', date_of_birth: '', major: '', enrollment_year: '' });

  onMounted(() => teacherStore.fetchItems());
  watchEffect(() => {
    teachers.value = teacherStore.items
  });

  const fetchTeacher = async (newPage, newLimit, newSearch) => {
    await teacherStore.fetchItems(
      newSearch ? 1 : newPage, 
      newSearch ? teacherStore.total : newLimit, 
      newSearch
    );
  }
  const addTeacher = () => {
    visibleLeft.value = true;
  }
  const saveTeacher = async () => {
    if (isEditing.value) {
      await teacherStore.updateItem(editedTeacherId.value, newTeacher.value);
    } else {
      await teacherStore.addItem(newTeacher.value);
    }
    cancelForm();
};

  const deleteTeacher = async (id) => { 
    await teacherStore.deleteItem(id);
  }

  const editTeacher = (teacher) => {
    editedTeacherId.value = teacher.id;
    newTeacher.value = { ...teacher };
    isEditing.value = true;
    visibleLeft.value = true;
  };

  const cancelForm = () => {
    visibleLeft.value = false;
    isEditing.value = false;
    editedTeacherId.value = null;
    Object.keys(newTeacher.value).forEach((key) => (newTeacher.value[key] = ''));
  };

  watch(visibleLeft, (newVal) => {
  if (newVal==false) {
    cancelForm();
    }
  });

</script>



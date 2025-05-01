<template>
  <DataTableCustom title="Danh sách đợt đăng ký" :block="['selectAll', 'import', 'export']" :data="students" :columns="[
    { field: 'title', header: 'Tiêu đề' },
    { field: 'content', header: 'Nội dung' },
    { field: 'course.name', header: 'Học kỳ', sortable: true },
    { field: 'department.name', header: 'Khoa', sortable: true },
    { field: 'start_time', type: 'datetime', header: 'Ngày bắt đầu', sortable: true },
    { field: 'end_time', type: 'datetime', header: 'Ngày Kết thúc', sortable: true },

  ]" :total="enrollmentStore?.total" :loading="loading" @fetch="fetchEnrollment" @add="addEnrollment"
    @edit="editEnrollment" @delete="deleteEnrollment" @selectOne="handleSelectData" @selectAll="handleSelectData" />


  <MyDrawer class="w-full" title="đợt đăng ký" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveEnrollment"
    :showImport="isImport" v-model:visible="visibleLeft" position="right" :closable="false">
    <div class="grid grid-cols-2 mt-5 gap-x-10">
      <div class="flex flex-col gap-4">
        <MyInput v-model="newData.title" title="Tên đợt đăng ký" id="title" required />
        <MyInput v-model="newData.content" title="Nội dung đợt này" id="content" required />
        <MyInput v-model="newData.department_id" title="Khoa" id="department" type="select" :options="departments"
          optionLabel="name" />
        <MyInput v-model="newData.course_id" title="Học kỳ" id="course" type="select" :options="courses"
          optionLabel="name" />
        <MyInput v-model="newData.start_time" title="Ngày bắt đầu" id="start_date" type="date"
          placeholder="Nhập ngày bắt đầu" dateFormat="dd/mm/yy" required />
        <MyInput v-model="newData.end_time" type="date" title="Ngày kết thúc" id="end_date"
          placeholder="Nhập ngày kết thúc" dateFormat="dd/mm/yy" required />
      </div>
    </div>
  </MyDrawer>

</template>
<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useCourseStore, useDepartmentStore, useEnrollmentStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";


const visibleLeft = ref(false);
const enrollmentStore = useEnrollmentStore();
const coursessStore = useCourseStore();
const departmentsStore = useDepartmentStore();
const students = ref([]);
const courses = ref([]);
const departments = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);

const editedEnrollmentId = ref(null);
const newData = ref({
  start_time: null,
  end_time: null,
  title: "",
  content: "",
  course_id: null,
  department_id: null,
});
const maxDate = ref(new Date());

onMounted(async () => {
  await enrollmentStore.fetchItems();
  await coursessStore.fetchItems();
  await departmentsStore.fetchItems();

});
watchEffect(() => {
  students.value = enrollmentStore.items;
  courses.value = coursessStore.items;
  departments.value = departmentsStore.items;

});


const fetchEnrollment = async (newPage, newLimit, newSearch) => {
  await enrollmentStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? enrollmentStore.total : newLimit,
    newSearch
  );
};
const addEnrollment = () => {
  visibleLeft.value = true;
};

const saveEnrollment = async () => {
  const { course, department, ...dta } = newData.value;
  const data = {
    ...dta,
    course_id: newData.value.course_id?.id || '',
    department_id: newData.value.department_id?.id || ''
  };
  console.log("data", data);
  isEditing.value
    ? await enrollmentStore.updateItem(editedEnrollmentId.value, data)
    : await enrollmentStore.addItem(data);

  cancelForm();
};

const deleteEnrollment = async (ids) => {
  await enrollmentStore.deleteItem(ids);
};

const editEnrollment = (dataEdit) => {
  editedEnrollmentId.value = dataEdit.id;
  const clonedData = JSON.parse(JSON.stringify(dataEdit));
  const { course_id, department_id, ...data } = clonedData;
  newData.value = {
    ...data,
    course_id: clonedData.course,
    department_id: departments.value.find(
      (item) => item.id == clonedData.department.id
    ),
  };
  isEditing.value = true;
  visibleLeft.value = true;
};


const cancelForm = () => {
  visibleLeft.value = false;
  isEditing.value = false;
  editedEnrollmentId.value = null;
  newData.value = {
    start_time: null,
    end_time: null,
    title: "",
    content: "",
    course_id: null,
    department_id: null,
  };
};


const handleSelectData = (ids) => {
  selectedIds.value = ids;
};



</script>
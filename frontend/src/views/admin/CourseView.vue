<template>
  <DataTableCustom title="Danh sách học kỳ" :data="students" :columns="[
    { field: 'name', header: 'Tên học kỳ', sortable: true },
    { field: 'start_time', type: 'datetime', header: 'Ngày bắt đầu', sortable: true },
    { field: 'end_time', type: 'datetime', header: 'Ngày Kết thúc', sortable: true },

  ]" :total="courseStore?.total" :loading="loading" @fetch="fetchCourse" @add="addCourse" @edit="editCourse"
    @delete="deleteCourse" @selectOne="handleSelectData" @selectAll="handleSelectData" />


  <MyDrawer class="w-full" title="học kỳ" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveCourse"
    :showImport="isImport" v-model:visible="visibleLeft" position="right" :closable="false">
    <div class="grid grid-cols-2 mt-5 gap-x-10">
      <div class="flex flex-col gap-4">
        <MyInput v-model="newData.name" title="Tên học kỳ" id="name" placeholder="Nhập tên học kỳ" required />
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
import { useCourseStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";


const visibleLeft = ref(false);
const courseStore = useCourseStore();
const students = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);

const editedCourseId = ref(null);
const newData = ref({
  name: "",
  start_time: null,
  end_time: null
});
const maxDate = ref(new Date());

onMounted(async () => {
  await courseStore.fetchItems();

});
watchEffect(() => {
  students.value = courseStore.items;

});


const fetchCourse = async (newPage, newLimit, newSearch) => {
  await courseStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? courseStore.total : newLimit,
    newSearch
  );
};
const addCourse = () => {
  visibleLeft.value = true;
};

const saveCourse = async () => {
  console.log("newData.value", newData.value);
  isEditing.value
    ? await courseStore.updateItem(editedCourseId.value, newData.value)
    : await courseStore.addItem(newData.value);

  cancelForm();
};

const deleteCourse = async (ids) => {
  await courseStore.deleteItem(ids);
};

const editCourse = (dataEdit) => {
  newData.value = dataEdit
  editedCourseId.value = dataEdit.id;
  isEditing.value = true;
  visibleLeft.value = true;
};


const cancelForm = () => {
  visibleLeft.value = false;
  isEditing.value = false;
  editedCourseId.value = null;
  newData.value = {
    name: "",
    start_time: null,
    end_time: null
  };
};


const handleSelectData = (ids) => {
  selectedIds.value = ids;
};



</script>
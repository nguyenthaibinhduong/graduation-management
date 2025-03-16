<template>
  <div class="p-4">
    <div class="w-full flex justify-between">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>


    </div>

    <DataTable :value="data" :loading="loading" class="p-datatable-sm">
      <template #header>


        <div class="flex flex-wrap items-center justify-between py-3">
          <div class="flex items-center">
            <Checkbox v-model="selectStatus" @change="toggleSelectAll" binary />
            <label v-if="!selectedRows.length > 0" class="ms-2" for="ingredient1"> Chọn tất cả </label>
            <Button v-if="selectedRows.length > 0" label="Xóa mục chọn" @click="$emit('delete', selectedRows)"
              class="bg-red-600 border border-red-600 text-white ms-2" />
          </div>
          <div class="flex items-center w-full md:w-1/2">
            <InputText class="w-full" v-model="search" placeholder="Tìm kiếm..." />
          </div>
          <div class="flex items-center gap-3">
            <Select v-model="limit" :options="[2, 5, 10, 20]" @change="onLimitChange" placeholder="Hiện bản ghi"
              class="w-45" />
            <Button icon="pi pi-file-excel" label="Xuất Excel" @click="exportToExcel" class="p-button-success" />
            <Button icon="pi pi-plus" label="Thêm mới" @click="$emit('add')" class="p-button-info" />
          </div>



        </div>
      </template>
      <Column>
        <template v-slot:body="{ data: row }">
          <Checkbox v-model="selectedRows" :value="row.id" @change="updateSelectAll" />
        </template>
      </Column>
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>
        <template v-slot:body="{ data }">
          <slot :name="col.field" :data="data">{{ data[col.field] }}</slot>
        </template>
      </Column>

      <Column header="Hành động">
        <template #body="{ data }">
          <div class="flex gap-4">
            <Button icon="pi pi-pencil" class="p-button-primary bg-blue-500 border-blue-500 text-white"
              @click="$emit('edit', data)" />
            <Button icon="pi pi-trash" class="p-button-danger bg-red-500 border-red-500 text-white"
              @click="$emit('delete', data.id)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Paginator v-if="total > limit" :rows="limit" :totalRecords="total" :first="(page - 1) * limit"
      @page="onPageChange" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Button, Column, DataTable, InputText, Paginator, Select, Checkbox } from 'primevue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const props = defineProps({
  title: String,
  data: Array,
  columns: Array,
  total: Number,
  loading: Boolean,
});

const emit = defineEmits(['edit', 'delete', 'add', 'fetch', 'selectOne', 'selectAll']);
const search = ref('');
const limit = ref(10);
const page = ref(1);
const selectedRows = ref([]);
const selectStatus = ref(false);


watch([page, limit, search], ([newPage, newLimit, newSearch]) => {
  emit('fetch', newPage, newLimit, newSearch);
});

watch(selectedRows, (newSelection) => {
  emit('selectOne', newSelection);
});


const toggleSelectAll = () => {
  if (selectStatus.value) {
    selectedRows.value = props.data.map(row => row.id);
  } else {
    selectedRows.value = [];
  }
  selectStatus.value = selectedRows.length == props.data.length;
  emit('selectAll', selectedRows.value);
};

const updateSelectAll = () => {
  selectStatus.value = selectedRows.value.length == props.data.length;

};


const onLimitChange = (event) => {
  page.value = 1; // Đặt lại về trang đầu tiên khi thay đổi số bản ghi
};
const onPageChange = (event) => {
  page.value = event.page + 1;
};



const exportToExcel = () => {
  const formattedData = props.data.map(row => {
    return props.columns.reduce((acc, col) => {
      acc[col.header] = row[col.field];
      return acc;
    }, {});
  });

  const ws = XLSX.utils.json_to_sheet(formattedData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dữ liệu');
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([excelBuffer]), 'Data.xlsx');
};



</script>

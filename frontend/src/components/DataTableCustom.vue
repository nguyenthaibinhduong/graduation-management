<template>
  <div class="px-2">
    <div class="w-full flex justify-center py-4">
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
    </div>

    <DataTable :value="data" stripedRows :loading="loading"
      class="p-datatable-sm border border-gray-200  rounded-[20px] text-xs py-[20px] pb-[20px]">
      <template #header>


        <div class="flex flex-wrap items-center justify-between py-3">
          <div class="flex items-center">
            <Checkbox size="small" v-model="selectStatus" @change="toggleSelectAll" binary />
            <label v-if="!selectedRows.length > 0" class="ms-2" for="ingredient1"> Chọn tất cả </label>
            <Button size="small" v-if="selectedRows.length > 0" label="Xóa" @click="$emit('delete', selectedRows)"
              class="bg-red-600 border border-red-600 text-white ms-2" />
          </div>
          <div class="flex items-center w-full md:w-1/2">
            <InputText size="small" class="w-full" v-model="search" placeholder="Tìm kiếm..." />
          </div>
          <div class="flex items-center gap-3">
            <Select size="small" v-model="limit" :options="[2, 5, 10, 20]" @change="onLimitChange"
              placeholder="Hiện bản ghi" class="w-45" />
            <Button variant="outlined" severity="contrast" size="small" icon="pi pi-file-excel" label="Xuất Excel"
              @click="exportToExcel" />
            <Button size="small" icon="pi pi-plus" severity="secondary" label="Thêm mới" @click="$emit('add')" />
          </div>



        </div>
      </template>
      <Column>
        <template v-slot:body="{ data: row }">
          <Checkbox size="small" v-model="selectedRows" :value="row.id" @change="updateSelectAll" />
        </template>
      </Column>
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header">
        <template v-slot:body="{ data }">
          {{ getNestedValue(data, col.field) }}
        </template>
      </Column>

      <template>
        <Column header="Hành động">
          <template #body="{ data }">
            <div class="relative">
              <!-- Nút ba chấm -->
              <Button icon="pi pi-ellipsis-h" class="w-[30px] h-[30px] ms-2 bg-transparent border-none text-black"
                @click="toggleDropdown($event, data.id)" />

              <!-- Dropdown menu -->
              <OverlayPanel ref="dropdown">
                <div class="w-[120px] text-sm">
                  <button class="w-full px-3 py-2 hover:bg-gray-100 flex items-center" @click="$emit('edit', data)">
                    <i class="pi pi-pencil mr-2"></i> Sửa
                  </button>
                  <button class="w-full px-3 py-2 hover:bg-gray-100 flex items-center text-red-500"
                    @click="$emit('delete', data.id)">
                    <i class="pi pi-trash mr-2"></i> Xóa
                  </button>
                </div>
              </OverlayPanel>
            </div>
          </template>
        </Column>
      </template>
    </DataTable>

    <Paginator v-if="total > limit" :rows="limit" :totalRecords="total" :first="(page - 1) * limit"
      @page="onPageChange" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Button, Column, DataTable, InputText, Paginator, Select, Checkbox, OverlayPanel } from 'primevue';
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
const dropdown = ref(null);

const toggleDropdown = (event) => {
  dropdown.value.toggle(event);
};


watch([page, limit, search], ([newPage, newLimit, newSearch]) => {
  emit('fetch', newPage, newLimit, newSearch);
});

watch(selectedRows, (newSelection) => {
  emit('selectOne', newSelection);
});


const getNestedValue = (obj, field) => {
  return field.split('.').reduce((acc, key) => acc?.[key], obj) || "N/A";
};

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
<style>
.p-popover-content {
  padding: 0;
}

.p-popover:after,
.p-popover:before {
  bottom: none !important;
  border: none !important;
}
</style>

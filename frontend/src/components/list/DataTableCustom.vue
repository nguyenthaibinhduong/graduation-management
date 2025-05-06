<template>
  <ConfirmDialog></ConfirmDialog>
  <div class="w-full flex justify-center py-4">
    <h1 class="text-2xl font-semibold title">{{ title }}</h1>
  </div>
  <div class="p-5 bg-white rounded-lg border-[#e6e4e4] border-[1px] ">

    <Toolbar class="mb-6 bg-slate-100" v-if="blockFuntion('toolbar')">
      <template #start>
        <Button v-if="blockFuntion('add')" size="small" severity="contrast" label="Tạo mới" icon="pi pi-plus"
          class="mr-2 btn-submit" @click="$emit('add')" />
        <Button size="small" v-if="selectedRows.length > 0" label="Delete" icon="pi pi-trash" severity="danger" outlined
          @click="confirmDelete()" />
      </template>

      <template #end>
        <Button v-if="blockFuntion('import')" size="small" label="Import" class="mr-2" icon="pi pi-plus"
          severity="contrast" @click="$emit('import')" />
        <Button v-if="blockFuntion('export')" size="small" label="Export" icon="pi pi-download" severity="contrast"
          @click="$emit('export')" />
      </template>
    </Toolbar>
    <div class="mx-auto  text-sm">
      <DataTable showGridlines :value="data" stripedRows :loading="loading" class="p-datatable-sm" dataKey="id"
        v-model:selection="selectedData" selectionMode="single">
        <template v-if="blockFuntion('headerBar')" #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div v-if="blockFuntion('selectAll')" class="flex items-center">
              <Checkbox size="small" v-model="selectStatus" @change="toggleSelectAll" binary />
              <label class="ms-2" for="ingredient1"> Chọn tất cả </label>
            </div>
            <IconField v-if="blockFuntion('search')">
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText size="small" class="w-full" v-model="search" placeholder="Tìm kiếm..." />
            </IconField>
          </div>
        </template>
        <Column v-if="blockFuntion('selectAll')">
          <template v-slot:body="{ data: row }">
            <Checkbox size="small" v-model="selectedRows" :value="row.id" @change="updateSelectAll" />
          </template>
        </Column>
        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
          :sortable="col.sortable">
          <template v-slot:body="{ data }">
            <span v-if="col.type === 'datetime'">
              {{ dayjs(getNestedValue(data, col.field)).format('DD/MM/YYYY') }}
            </span>
            <span v-else-if="col.type === 'image'">
              <img class="rounded-xl" v-if="getNestedValue(data, col.field) !== 'N/A'"
                :src="getNestedValue(data, col.field)" alt="image" style="max-width: 100px; max-height: 100px" />
            </span>
            <span v-else-if="col.type === 'status'">
              <template v-if="col.statuses">
                <span v-if="getStatus(col.statuses, getNestedValue(data, col.field))" :class="`px-2 py-1 text-sm rounded-xl ${getStatus(col.statuses, getNestedValue(data, col.field)).class
                  }`">
                  {{ getStatus(col.statuses, getNestedValue(data, col.field)).label }}
                </span>
              </template>
            </span>
            <span v-else>
              {{ getNestedValue(data, col.field) }}
            </span>
          </template>
        </Column>

        <template v-if="blockFuntion('action')">
          <Column header="Hành động">
            <template #body="{ data }">
              <div class="relative">
                <!-- Nút ba chấm -->
                <Button icon="pi pi-ellipsis-h" class="w-[30px] h-[30px] ms-2 bg-transparent border-none text-black"
                  @click="toggleDropdown($event, data)" />

                <!-- Dropdown menu -->
                <OverlayPanel ref="dropdown">
                  <div class="w-[100px] text-sm">
                    <button class="w-full px-3 py-2 hover:bg-gray-100 flex items-center"
                      @click="$emit('edit', selectedItem)">
                      <i class="pi pi-pencil mr-2"></i> Sửa
                    </button>
                    <button class="w-full px-3 py-2 hover:bg-gray-100 flex items-center text-red-500"
                      @click="confirmDelete(selectedItem.id)">
                      <i class="pi pi-trash mr-2"></i> Xóa
                    </button>
                  </div>
                </OverlayPanel>
              </div>
            </template>
          </Column>
        </template>
        <template #empty>
          <div class="text-center text-gray-500 py-4">Chưa có bản ghi</div>
        </template>
      </DataTable>
    </div>
    <Toolbar class="mt-6 bg-slate-100">
      <template #start>
        <Select size="small" v-model="limit" :options="[2, 5, 10, 20]" @change="onLimitChange"
          placeholder="Hiện bản ghi" class="w-45" />
      </template>

      <template #end>
        <Paginator v-if="total > limit" :rows="limit" :totalRecords="total" :first="(page - 1) * limit"
          @page="onPageChange" />
      </template>
    </Toolbar>
  </div>
</template>

<script setup>
import { ref, useAttrs, watch } from 'vue'
import dayjs from 'dayjs'
import {
  Button,
  Column,
  DataTable,
  InputText,
  Paginator,
  Select,
  Checkbox,
  OverlayPanel,
  Toolbar,
  IconField,
  InputIcon,
  ConfirmDialog,
  useConfirm,
} from 'primevue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

const props = defineProps({
  title: String,
  data: Array,
  columns: Array,
  total: Number,
  loading: Boolean,
  block: Array
})

const emit = defineEmits(['edit', 'delete', 'add', 'fetch', 'import', 'export', 'selectOne', 'selectAll', 'rowSelect'])
const search = ref('')
const limit = ref(10)
const page = ref(1)
const selectedRows = ref([])
const selectStatus = ref(false)
const dropdown = ref(null)
const selectedItem = ref(null)
const selectedData = ref(null);
const toggleDropdown = (event, data) => {
  selectedItem.value = data
  dropdown.value.toggle(event)
}


watch([page, limit, search], ([newPage, newLimit, newSearch]) => {
  emit('fetch', newPage, newLimit, newSearch)
})


watch(selectedRows, (newSelection) => {
  emit('selectOne', newSelection)
})

watch(selectedData, (newSelection) => {
  emit('rowSelect', newSelection)
})


const blockFuntion = (key) => {
  if (props?.block) {
    return !props.block.includes(key);
  } else {
    return true
  }

}


const getNestedValue = (obj, field) => {
  return field.split('.').reduce((acc, key) => acc?.[key], obj) || 'N/A'
}
const getStatus = (statuses, value) => {
  return statuses.find((s) => s.value === value)
}
const toggleSelectAll = () => {
  if (selectStatus.value) {
    selectedRows.value = props.data.map((row) => row.id)
  } else {
    selectedRows.value = []
  }
  selectStatus.value = selectedRows.length == props.data.length
  emit('selectAll', selectedRows.value)
}

const updateSelectAll = () => {
  selectStatus.value = selectedRows.value.length == props.data.length
}

const onLimitChange = (event) => {
  page.value = 1 // Đặt lại về trang đầu tiên khi thay đổi số bản ghi
}
const onPageChange = (event) => {
  page.value = event.page + 1
}
const handleGetRow = (e) => {
  emit('rowSelect', e.data)
}

const confirm = useConfirm()
const confirmDelete = (id = null) => {
  const key = id != null ? '' : 'các'
  confirm.require({
    message: 'Bạn có chắc chắn muốn xóa ' + key + ' bản ghi này?',
    header: 'Xác nhận xóa',
    icon: 'pi pi-exclamation-circle',
    rejectProps: {
      label: 'Hủy',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Xóa',
      severity: 'danger',
    },
    accept: () => {
      if (id !== null) {
        emit('delete', id)
      } else if (selectedRows.value.length > 0) {
        emit('delete', selectedRows.value)
      } else {
      }
    },
  })
}
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

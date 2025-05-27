<template>
  <!-- BẢNG DANH SÁCH --------------------------------------------------------->
  <DataTableCustom :block="['headerBar', 'selectAll', 'import', 'export']" title="Danh sách phiếu đánh giá"
    :data="evaluationForm" :columns="columns" :total="evaluationStore?.total" :loading="loading"
    @fetch="fetchEvaluation" @add="openDrawer" @edit="editEvaluation" @delete="deleteEvaluation" @rowSelect="goDetail"
    @selectOne="handleSelectData" @selectAll="handleSelectData" />

  <!-- DRAWER ----------------------------------------------------------------->
  <MyDrawer class="w-full" title="Phiếu đánh giá" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveEvaluation"
    v-model:visible="visibleLeft" position="right" :closable="false">
    <TabView>
      <!-- TAB 1: PHIẾU ĐÁNH GIÁ -->
      <TabPanel header="Thông tin phiếu đánh giá">
        <section class="grid grid-cols-2 gap-6 py-4">
          <div class="flex flex-col gap-y-2">
            <MyInput v-model="form.title" id="title" title="Tiêu đề phiếu" required />
            <span>Tiêu chí được chọn</span>
            <div class="w-full grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-lg h-[50px]">
              <Button v-for="criteria in selectedCriteria" class="btn-submit" :label="criteria?.name" />
            </div>
            <span>Nội dung</span>
            <MyInput v-model="form.content" id="content" type="editor" required />
          </div>
          <div class="flex flex-col">
            <DataTableCustom :block="['toolbar', 'action']" title=" Danh sách tiêu chí đánh giá" :data="criteriaOptions"
              :columns="[
                { field: 'name', header: 'Tiêu chí' },
                { field: 'content', header: 'Tiêu chí', type: 'html' },
                { field: 'max_score', header: 'Điểm tối đa' },
                { field: 'step', header: 'Bước nhảy' },
                { field: 'weightPercent', header: 'Phần trăm' },
              ]" :total="evaluationStore?.total" :loading="loading" @selectOne="handleSelectDataCriteria"
              @selectAll="handleSelectDataCriteria" />
          </div>

          <!-- Nếu cần chọn khoa -->
        </section>
      </TabPanel>

      <!-- TAB 2: TIÊU CHÍ -->
      <TabPanel header="Thêm tiêu chí đánh giá">
        <Button icon="pi pi-plus" @click="saveCriteria" class="btn-submit" label="Thêm" text size="small" />
        <section class="grid grid-cols-1 gap-6 py-4">
          <div class="grid grid-cols-2 gap-6">
            <MyInput v-model="newCriteria.name" id="name" title="Tên tiêu chí" />
            <MyInput v-model="newCriteria.max_score" id="max_score" title="Điểm tối đa" type="number" />
            <MyInput v-model="newCriteria.step" id="step" title="Bước nhảy" type="number" />
            <MyInput v-model="newCriteria.weightPercent" id="weightPercent" prefix="%" title="Tỉ trọng (%)"
              type="number" />
          </div>
          <MyInput v-model="newCriteria.content" id="criteria_content" title="Nội dung tiêu chí" type="editor" />
        </section>
      </TabPanel>
    </TabView>
  </MyDrawer>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import router from '@/router'
import { useCriteriaStore, useEvaluationStore } from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import MyInput from '@/components/form/MyInput.vue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import { Button, TabPanel, TabView } from 'primevue'
import { showToast } from '@/utils/toast'

// ---------- STATE -----------------------------------------------------------
const visibleLeft = ref(false)
const isEditing = ref(false)
const editedId = ref(null)

const evaluationStore = useEvaluationStore()
const evaluationForm = ref([])
const loading = ref(false)

// form dữ liệu
const form = ref({
  name: '',
  content: '',
  criteria_ids: [],
})
const newCriteria = ref({
  name: '',
  content: '',
  max_score: null,
  step: null,
  weightPercent: null,
})
const criteriaOptions = ref()
const criteriaStore = useCriteriaStore()

// ---------- COLUMNS ---------------------------------------------------------
const columns = [
  { field: 'title', header: 'Tiêu đề' },
  {
    field: 'status',
    header: 'Trạng thái',
    type: 'status',
    statuses: [
      { value: 'blocked', label: 'Đã hủy', class: 'bg-red-100 text-red-700' },
      { value: 'active', label: 'Khả dụng', class: 'bg-green-100 text-green-700' },
    ],
  },
]

// ---------- ON LOAD ---------------------------------------------------------
onMounted(async () => {
  await Promise.all([fetchEvaluation(), criteriaStore.fetchItems()])
})

watchEffect(async () => {
  ; (evaluationForm.value = evaluationStore.items), (criteriaOptions.value = criteriaStore.items)
})

// ---------- METHODS ---------------------------------------------------------
async function fetchEvaluation(page = 1, limit = 10, search = '') {
  await evaluationStore.fetchItems(page, limit, search)
}

function openDrawer() {
  resetForm()
  visibleLeft.value = true
}

function editEvaluation(row) {
  resetForm()
  isEditing.value = true
  editedId.value = row.id
  visibleLeft.value = true
}

async function saveEvaluation() {
  form.value.criteria_ids = selectedCriteriaIds.value


  const payload = {
    ...form.value,
  }

  if (isEditing.value) {

    await evaluationStore.updateItem(editedId.value, payload)
    cancelForm()
  } else {
    await evaluationStore.addItem(payload)
    cancelForm()
  }

}

async function saveCriteria() {
  if (!newCriteria.value.name) {
    showToast('Vui lòng điền tên thông tin tiêu chí.', 'error')
    return
  }
  if (!newCriteria.value.max_score) {
    showToast('Vui lòng điền điểm tối đa.', 'error')
    return
  }
  if (!newCriteria.value.step) {
    showToast('Vui lòng điền bước nhảy.', 'error')
    return
  }
  if (!newCriteria.value.weightPercent) {
    showToast('Vui lòng điền tỉ trọng.', 'error')
    return
  }
  if (newCriteria.value.weightPercent < 0 || newCriteria.value.weightPercent > 100) {
    showToast('Tỉ trọng phải nằm trong khoảng từ 0 đến 100.', 'error')
    return
  }
  if (newCriteria.value.max_score <= 0) {
    showToast('Điểm tối đa phải lớn hơn 0.', 'error')
    return
  }
  if (newCriteria.value.step <= 0) {
    showToast('Bước nhảy phải lớn hơn 0.', 'error')
    return
  }
  if (newCriteria.value.max_score % newCriteria.value.step !== 0) {
    showToast('Điểm tối đa phải chia hết cho bước nhảy.', 'error')
    return
  }
  if (newCriteria.value.weightPercent % 1 !== 0) {
    showToast('Tỉ trọng phải là số nguyên.', 'error')
    return
  }
  if (newCriteria.value.weightPercent < 0 || newCriteria.value.weightPercent > 100) {
    showToast('Tỉ trọng phải nằm trong khoảng từ 0 đến 100.', 'error')
    return
  }
  if (newCriteria.value.max_score <= 0) {
    showToast('Điểm tối đa phải lớn hơn 0.', 'error')
    return
  }
  if (newCriteria.value.step <= 0) {
    showToast('Bước nhảy phải lớn hơn 0.', 'error')
    return
  }
  if (newCriteria.value.max_score % newCriteria.value.step !== 0) {
    showToast('Điểm tối đa phải chia hết cho bước nhảy.', 'error')
    return
  }
  if (newCriteria.value.weightPercent % 1 !== 0) {
    showToast('Tỉ trọng phải là số nguyên.', 'error')
    return
  }
  if (newCriteria.value.weightPercent < 0 || newCriteria.value.weightPercent > 100) {
    showToast('Tỉ trọng phải nằm trong khoảng từ 0 đến 100.', 'error')
    return
  }


  const payload = {
    ...newCriteria.value,
  }
  await criteriaStore.addItem(payload)
  newCriteria.value = {

    content: '',
    max_score: null,
    step: null,
    weightPercent: null,
  }
}

async function deleteEvaluation(ids) {
  await evaluationStore.deleteItem(ids)
}

function cancelForm() {
  visibleLeft.value = false
  resetForm()
}

function resetForm() {
  form.value = {
    title: '',
    content: '',
  }
  isEditing.value = false
  editedId.value = null
}

const selectedIds = ref([])
const handleSelectData = (ids) => {
  selectedIds.value = ids
}

const selectedCriteriaIds = ref([])
const selectedCriteria = ref({})
const handleSelectDataCriteria = (ids) => {
  selectedCriteriaIds.value = ids
  selectedCriteria.value = criteriaOptions.value.filter((data) => ids.includes(data?.id))
}
// row click
function goDetail(row) {
  if (row?.id) router.push(`/evaluation-form-detail/${row.id}`)
}

// ---------- MULTI CRITERIA --------------------------------------------------
</script>

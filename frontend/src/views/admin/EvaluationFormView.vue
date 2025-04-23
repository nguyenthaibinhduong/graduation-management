<template>
    <!-- BẢNG DANH SÁCH --------------------------------------------------------->
    <DataTableCustom title="Danh sách phiếu đánh giá" :data="evaluationForm" :columns="columns"
        :total="evaluationStore?.total" :loading="loading" @fetch="fetchEvaluation" @add="openDrawer"
        @edit="editEvaluation" @delete="deleteEvaluation" @rowSelect="goDetail" @selectOne="handleSelectData"
        @selectAll="handleSelectData" />

    <!-- DRAWER ----------------------------------------------------------------->
    <MyDrawer class="w-full" title="Phiếu đánh giá" :isEditing="isEditing" :onCancel="cancelForm"
        :onSave="saveEvaluation" v-model:visible="visibleLeft" position="right" :closable="false">
        <form class="grid grid-cols-2 gap-6" @submit.prevent="saveEvaluation">
            <!-- Cột trái -->
            <section class="flex flex-col gap-4">
                <label class="font-semibold">Tiêu đề phiếu</label>

                <MyInput v-model="form.title" id="title" required />
                <MyInput v-model="form.content" id="content" title="Nội dung" type="editor" required />

                <!-- SELECT KHOA -->

            </section>

            <!-- Cột phải: Danh sách tiêu chí -->
            <section class="flex flex-col gap-4">
                <label class="font-semibold">Tiêu chí đánh giá</label>

                <!-- MultiSelect -->
                <MyInput class="w-full" v-model="selectedCriteria" id="criteria-picker" type="multiselect"
                    :options="criteriaOptions" optionLabel="name" optionValue="id" placeholder="Chọn tiêu chí có sẵn" />

                <!-- Danh sách đã chọn + thêm mới -->
                <div
                    class="border rounded-xl p-4 flex flex-col gap-2 max-h-80 overflow-y-auto min-h-[200px] bg-slate-100">
                    <div v-for="(cri, idx) in selectedCriteriaObjs" :key="cri.id"
                        class="flex items-center justify-between bg-blue-600 text-white px-3 py-2 rounded-md">
                        <span>{{ cri.name }}</span>
                        <Button icon="pi pi-times" severity="secondary" text size="small"
                            @click="removeCriterion(idx)" />
                    </div>

                    <div class="flex items-center gap-2 mt-2">
                        <InputText v-model="newCriterionName" placeholder="Tiêu chí mới..." class="flex-1" />
                        <Button label="Thêm" @click="addNewCriterion" :disabled="!newCriterionName" />
                    </div>
                </div>
            </section>
        </form>
    </MyDrawer>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import router from '@/router';
import { useEvaluationStore } from '@/stores/store';
import DataTableCustom from '@/components/list/DataTableCustom.vue';
import MyInput from '@/components/form/MyInput.vue';
import MyDrawer from '@/components/drawer/MyDrawer.vue';

// ---------- STATE -----------------------------------------------------------
const visibleLeft = ref(false);
const isEditing = ref(false);
const editedId = ref(null);

const evaluationStore = useEvaluationStore();
const evaluationForm = ref([]);
const loading = ref(false);

// form dữ liệu
const form = ref({
    title: '',
    content: '',
    departmentId: null,
    courseId: null,
    startDate: null,
    endDate: null,
    active: true,
});

// mock data select
const departmentOptions = ref([
    { id: 1, name: 'Khoa Công nghệ thông tin' },
    { id: 2, name: 'Khoa Quản trị kinh doanh' },
    { id: 3, name: 'Khoa Du lịch' },
]);

const courseOptions = ref([
    { id: 1, name: 'HK1 2024‑2025' },
    { id: 2, name: 'HK2 2024‑2025' },
    { id: 3, name: 'HK1 2025‑2026' },
]);

// ---------- COLUMNS ---------------------------------------------------------
const columns = [
    { field: 'title', header: 'Tiêu đề' },
    { field: 'description', header: 'Nội dung' },
    {
        field: 'status',
        header: 'Trạng thái',
        type: 'status',
        statuses: [
            { value: 'blocked', label: 'Đã hủy', class: 'bg-red-100 text-red-700' },
            { value: 'active', label: 'Khả dụng', class: 'bg-green-100 text-green-700' },
        ],
    },
];

// ---------- ON LOAD ---------------------------------------------------------
onMounted(fetchEvaluation);

watch(
    () => evaluationStore.items,
    (v) => {
        evaluationForm.value = v;
    },
    { immediate: true }
);

// ---------- METHODS ---------------------------------------------------------
async function fetchEvaluation(page = 1, limit = 10, search = '') {
    await evaluationStore.fetchItems(page, limit, search);
}

function openDrawer() {
    resetForm();
    visibleLeft.value = true;
}

function editEvaluation(row) {
    resetForm();
    isEditing.value = true;
    editedId.value = row.id;

    // nạp dữ liệu
    Object.assign(form.value, {
        ...row,
        departmentId: departmentOptions.value.find((d) => d.id === row.department?.id),
        courseId: courseOptions.value.find((c) => c.id === row.course?.id),
    });

    visibleLeft.value = true;
}

async function saveEvaluation() {
    const payload = {
        ...form.value,
        department_id: form.value.departmentId?.id,
        course_id: form.value.courseId?.id,
    };

    if (isEditing.value) {
        await evaluationStore.updateItem(editedId.value, payload);
    } else {
        await evaluationStore.addItem(payload);
    }
    cancelForm();
}

async function deleteEvaluation(ids) {
    await evaluationStore.deleteItem(ids);
}

function cancelForm() {
    visibleLeft.value = false;
    resetForm();
}

function resetForm() {
    form.value = {
        title: '',
        content: '',
        departmentId: null,
        courseId: null,
        startDate: null,
        endDate: null,
        active: true,
    };
    isEditing.value = false;
    editedId.value = null;
    selectedCriteria.value = [];
    newCriterionName.value = '';
}

// row click
function goDetail(row) {
    if (row?.id) router.push(`/evaluation-form-detail/${row.id}`);
}

// ---------- MULTI CRITERIA --------------------------------------------------
const criteriaOptions = ref([
    { id: 101, name: 'Thời gian phản hồi' },
    { id: 102, name: 'Chất lượng giảng dạy' },
    { id: 103, name: 'Cơ sở vật chất' },
]);

const selectedCriteria = ref([]);
const newCriterionName = ref('');

const selectedCriteriaObjs = computed(() =>
    selectedCriteria.value.map((id) => criteriaOptions.value.find((c) => c.id === id))
);

function addNewCriterion() {
    const newId = Date.now(); // tạm
    const newCri = { id: newId, name: newCriterionName.value };
    criteriaOptions.value.push(newCri);
    selectedCriteria.value.push(newId);
    newCriterionName.value = '';
}

function removeCriterion(idx) {
    selectedCriteria.value.splice(idx, 1);
}

function handleSelectData(ids) {
    // …tuỳ logic khác
}
</script>

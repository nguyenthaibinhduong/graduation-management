<template>
    <DataTableCustom title="Danh sách phiếu đánh giá" :data="evaluationForm" :columns="[
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

    ]" :total="evaluationStore?.total" :loading="loading" @fetch="fetchEvaluation" @add="addEvaluation"
        @edit="editEvaluation" @delete="deleteEvaluation" @selectOne="handleSelectData" @selectAll="handleSelectData" />


    <MyDrawer class="w-full" title="phiếu đánh giá" :isEditing="isEditing" :onCancel="cancelForm"
        :onSave="saveEvaluation" :showImport="isImport" v-model:visible="visibleLeft" position="right"
        :closable="false">
        <div class="grid grid-cols-2 mt-5 gap-x-10">
            <div class="flex flex-col gap-4">
                <MyInput v-model="newData.title" title="Tên đợt đăng ký" id="title" required />
                <MyInput v-model="newData.content" title="Nội dung đợt này" id="content" required />
                <MyInput v-model="newData.department_id" title="Khoa" id="department" type="select"
                    :options="departments" optionLabel="name" />
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
import { useEvaluationStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";


const visibleLeft = ref(false);
const evaluationStore = useEvaluationStore();
const evaluationForm = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);

const editedEvaluationId = ref(null);
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
    await evaluationStore.fetchItems();

});
watchEffect(() => {
    evaluationForm.value = evaluationStore.items;


});


const fetchEvaluation = async (newPage, newLimit, newSearch) => {
    await evaluationStore.fetchItems(
        newSearch ? 1 : newPage,
        newSearch ? evaluationStore.total : newLimit,
        newSearch
    );
};
const addEvaluation = () => {
    visibleLeft.value = true;
};

const saveEvaluation = async () => {
    const { course, department, ...dta } = newData.value;
    const data = {
        ...dta,
        course_id: newData.value.course_id?.id || '',
        department_id: newData.value.department_id?.id || ''
    };
    console.log("data", data);
    isEditing.value
        ? await evaluationStore.updateItem(editedEvaluationId.value, data)
        : await evaluationStore.addItem(data);

    cancelForm();
};

const deleteEvaluation = async (ids) => {
    await evaluationStore.deleteItem(ids);
};

const editEvaluation = (dataEdit) => {
    editedEvaluationId.value = dataEdit.id;
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
    editedEvaluationId.value = null;
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
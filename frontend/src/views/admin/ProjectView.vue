<template>
    <div class="w-full flex gap-x-4 p-2 rounded-lg">
        <Button size="small" label="Tất cả" :outlined="statusData !== null"
            :severity="statusData === 'public' ? 'primary' : undefined" @click="statusData = null" />
        <Button size="small" label="Đề tài chưa duyệt" :outlined="statusData !== 'pending'"
            :severity="statusData === 'pending' ? 'primary' : undefined" @click="statusData = 'pending'" />
        <Button size="small" label="Đề tài đã duyệt" :outlined="statusData !== 'approve'"
            :severity="statusData === 'approve' ? 'primary' : undefined" @click="statusData = 'approve'" />
        <Button size="small" label="Đề tài công bố" :outlined="statusData !== 'public'"
            :severity="statusData === 'public' ? 'primary' : undefined" @click="statusData = 'public'" />
    </div>

    <DataTableCustom :block="['toolbar', 'headerBar', 'selectAll', 'action']" title="Danh sách đề tài - Admin"
        :data="projects" :columns="[
            { field: 'title', header: 'Tên đề tài', },
            { field: 'teacher.user.fullname', header: 'Giáo viên tham chiếu' },
            { field: 'student.user.fullname', header: 'Sinh viên đề xuất' },
            { field: 'course.name', header: 'Học kỳ' },
            {
                field: 'status',
                header: 'Trạng thái',
                type: 'status',
                statuses: [
                    { value: 'propose', label: 'Đề xuất', class: 'bg-blue-100 text-blue-700' },
                    { value: 'pending', label: 'Đang chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
                    { value: 'approve', label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
                    { value: 'public', label: 'Đã công bố', class: 'bg-violet-100 text-violet-700' }
                ]
            }
        ]" :total="projectStore?.total" :loading="loading" @fetch="fetchProject" @rowSelect="getDetail" />



</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { useProjectStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import { useRouter } from "vue-router";
import { Button } from "primevue";


const visibleLeft = ref(false);
const projectStore = useProjectStore();
const projects = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);
const statusData = ref(null)

const editedProjectId = ref(null);
const newData = ref({
    title: "",
    description: "",
    content: "",
    max_total_group: ""
});
const maxDate = ref(new Date());


onMounted(async () => {
    await projectStore.fetchItems(statusData.value);
});
watchEffect(() => {
    projects.value = projectStore.items;

});
watch(statusData, async (newSelection) => {
    await projectStore.fetchItems(newSelection);
})




const fetchProject = async (newPage, newLimit, newSearch) => {
    await projectStore.fetchItems(
        statusData.value,
        newSearch ? 1 : newPage,
        newSearch ? projectStore.total : newLimit,
        newSearch
    );
};
const addProject = () => {
    visibleLeft.value = true;
};

const saveProject = async () => {
    console.log("newData.value", newData.value);
    isEditing.value
        ? await projectStore.updateItem(editedProjectId.value, newData.value)
        : await projectStore.addItem(newData.value);

    cancelForm();
};

const deleteProject = async (ids) => {
    await projectStore.deleteItem(ids);
};

const editProject = (dataEdit) => {
    newData.value = dataEdit
    editedProjectId.value = dataEdit.id;
    isEditing.value = true;
    visibleLeft.value = true;
};


const cancelForm = () => {
    visibleLeft.value = false;
    isEditing.value = false;
    editedProjectId.value = null;
    newData.value = {
        title: "",
        description: "",
        content: "",
        max_total_group: ""
    };
};

const router = useRouter()
const getDetail = (data) => {
    if (data?.id) router.push(`/project-detail/${data?.id}`)
}

const handleSelectData = (ids) => {
    selectedIds.value = ids;
};



</script>
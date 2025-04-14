<template>
    <DataTableCustom title="Danh sách đề tài - Sinh viên" :data="projects" :columns="[
        { field: 'title', header: 'Tên đề tài', },
        { field: 'description', header: 'Mô tả' },
        { field: 'teacher.user.fullname', header: 'Giáo viên tham chiếu' },
        { field: 'course.name', header: 'Học kỳ' },
        { field: 'status', header: 'Trạng thái' },
    ]" :total="projectStore?.total" :loading="loading" @fetch="fetchProject" @add="addProject" @edit="editProject"
        @delete="deleteProject" @selectOne="handleSelectData" @selectAll="handleSelectData" />


    <MyDrawer class="w-full" title="đề tài" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveProject"
        :showImport="isImport" v-model:visible="visibleLeft" position="right" :closable="false">
        <div class="grid grid-cols-2 mt-5 gap-x-10">
            <div class="flex flex-col gap-4">
                <MyInput v-model="newData.title" title="Tên đề tài" id="name" required />
                <MyInput v-model="newData.description" title="Mô tả" id="description" required />
                <MyInput v-model="newData.content" title="Nội dung" id="content" required />
                <MyInput v-model="newData.teacher_id" title="Giáo viên tham chiếu" id="teacher" type="select"
                    :options="teachers" optionLabel="user.fullname" />
                <MyInput v-model="newData.max_total_group" title="Số lượng nhóm tham gia" id="max_total_group"
                    required />
            </div>
        </div>
    </MyDrawer>

</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { useProjectStore, useTeacherStore } from "@/stores/store";
import { useAuthStore } from '@/stores/auth'
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";


const visibleLeft = ref(false);
const projectStore = useProjectStore();
const authStore = useAuthStore();
const teacherStore = useTeacherStore()
const projects = ref([]);
const student = ref(null);
const teachers = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);

const editedProjectId = ref(null);
const newData = ref({
    title: "",
    description: "",
    content: "",
    max_total_group: "",
    teacher_id: null,
});
const maxDate = ref(new Date());

onMounted(async () => {
    await authStore.fetchUser();
    await teacherStore.fetchItems();
    if (authStore?.user?.student?.id) {
        await projectStore.fetchItemsForStudent(authStore.user.student.id);
    } else {

    }
});
watchEffect(() => {
    projects.value = authStore.user?.student ? projectStore.items : [];
    student.value = authStore.user?.student || null;
    teachers.value = (teacherStore.items || []).map(teacher => {
        const { user, position, ...rest } = teacher;
        return {
            ...rest,
            user: {
                id: user.id,
                fullname: user.fullname
            }
        };
    });
});



const fetchProject = async (newPage, newLimit, newSearch) => {
    await projectStore.fetchItemsForStudent(
        student.value?.id ?? null,
        newSearch ? 1 : newPage,
        newSearch ? projectStore.total : newLimit,
        newSearch
    );
};
const addProject = () => {
    visibleLeft.value = true;
};

const saveProject = async () => {
    const data = {
        ...newData.value,
        teacher_id: newData.value.teacher_id?.id || ''
    };
    isEditing.value
        ? await projectStore.updateItem(editedProjectId.value, data)
        : await projectStore.addItem(data);

    cancelForm();
};

const deleteProject = async (ids) => {
    await projectStore.deleteItem(ids);
};

const editProject = (dataEdit) => {
    editedProjectId.value = dataEdit.id;
    const clonedData = JSON.parse(JSON.stringify(dataEdit));
    const { teacher_id, ...data } = clonedData;
    newData.value = {
        ...data,
        teacher_id: clonedData.teacher,
    };
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
        max_total_group: "",
        teacher_id: null,
    };
};


const handleSelectData = (ids) => {
    selectedIds.value = ids;
};



</script>
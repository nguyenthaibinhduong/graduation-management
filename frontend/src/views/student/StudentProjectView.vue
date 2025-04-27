<template>
    <div class="w-full flex gap-x-4 p-2 rounded-lg">
        <Button size="small" label="Đề tài có thể đăng ký " :outlined="statusData !== 'public'"
            :severity="statusData === 'public' ? 'primary' : undefined" @click="statusData = 'public'" />
        <Button size="small" label="Đề tài đề xuất" :outlined="statusData == 'public'"
            :severity="statusData === 'public' ? 'primary' : undefined" @click="statusData = null" />
    </div>
    <DataTableCustom :block="statusData == 'public' ? ['toolbar', 'selectAll', 'search'] : []" :title="statusData == 'public'
            ? 'Danh sách đề tài công bố - đăng ký'
            : 'Danh sách đề tài đề xuất'
        " :data="projects" :columns="[
        { field: 'title', header: 'Tên đề tài' },
        { field: 'description', header: 'Mô tả' },
        { field: 'teacher.user.fullname', header: 'Giáo viên tham chiếu' },
        { field: 'course.name', header: 'Học kỳ' },
        {
            field: 'status',
            header: 'Trạng thái',
            type: 'status',
            statuses: [
                { value: 'propose', label: 'Đề xuất', class: 'bg-blue-100 text-blue-700' },
                {
                    value: 'pending',
                    label: 'Đang chờ duyệt',
                    class: 'bg-yellow-100 text-yellow-700',
                },
                { value: 'approve', label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
                {
                    value: 'public',
                    label: 'Đã công bố',
                    class: 'bg-violet-100 text-violet-700',
                },
            ],
        },
    ]" :total="projectStore?.total" :loading="loading" @fetch="fetchProject" @add="addProject" @edit="editProject"
        @delete="deleteProject" @selectOne="handleSelectData" @selectAll="handleSelectData" @rowSelect="getDetail" />

    <MyDrawer class="w-full" title="đề tài đề xuất" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveProject"
        :showImport="isImport" v-model:visible="visibleLeft" position="right" :closable="false">
        <div class="grid grid-cols-2 mt-5 gap-x-10">
            <div class="flex flex-col gap-4">
                <MyInput v-model="newData.title" title="Tên đề tài" id="name" required />
                <MyInput v-model="newData.max_total_group" title="Số lượng nhóm tham gia" id="max_total_group"
                    required />
            </div>
            <div class="flex flex-col gap-4">
                <MyInput v-model="newData.description" title="Mô tả" id="description" required />
                <MyInput v-model="newData.teacher_id" title="Giáo viên tham chiếu" id="teacher_id" type="select"
                    :options="teachers" optionLabel="user.fullname" optionValue="id" />
            </div>
        </div>
        <div class="w-full flex flex-col mt-10">
            <MyInput type="editor" v-model="newData.content" title="Nội dung" id="content" editorStyle="height: 320px"
                required />
        </div>
    </MyDrawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { useProjectStore, useTeacherStore } from "@/stores/store";
import { useAuthStore } from "@/stores/auth";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import MyInput from "@/components/form/MyInput.vue";
import MyDrawer from "@/components/drawer/MyDrawer.vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "primevue";

const visibleLeft = ref(false);
const projectStore = useProjectStore();
const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const projects = ref([]);
const student = ref(null);
const teachers = ref([]);
const loading = ref(false);
const isImport = ref(false);
const isEditing = ref(false);
const statusData = ref("public");

const editedProjectId = ref(null);
const newData = ref({
    title: "",
    description: "",
    content: "",
    max_total_group: "",
    teacher_id: null,
    student_id: null,
});
const maxDate = ref(new Date());

onMounted(async () => {
    await authStore.fetchUser();
    await teacherStore.fetchItems();
    if (authStore?.user?.student?.id) {
        await projectStore.fetchItemsForStudent(statusData.value, authStore.user.student.id);
    } else {
    }
});
watchEffect(() => {
    projects.value = authStore.user?.student ? projectStore.items : [];
    student.value = authStore.user?.student || null;
    newData.value.student_id = authStore.user?.student?.id;
    teachers.value = (teacherStore.items || [])
        .filter((teacher) => teacher?.department?.id == student.value?.department?.id)
        .map((teacher) => {
            const { user, position, ...rest } = teacher;
            return {
                ...rest,
                user: {
                    id: user.id,
                    fullname: user.fullname,
                },
            };
        });
});

watch(statusData, async (newSelection) => {
    await projectStore.fetchItemsForStudent(newSelection, authStore.user.student.id);
});

const fetchProject = async (newPage, newLimit, newSearch) => {
    await projectStore.fetchItemsForStudent(
        statusData.value,
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
    };
    isEditing.value
        ? await projectStore.updateItem(editedProjectId.value, data, "student")
        : await projectStore.addItem(data, "student");

    if (authStore?.user?.student?.id) {
        await projectStore.fetchItemsForStudent(statusData.value, authStore.user.student.id);
    }
    cancelForm();
};

const deleteProject = async (ids) => {
    await projectStore.deleteItem(ids, student.value?.id, "student");
    if (authStore?.user?.student?.id) {
        await projectStore.fetchItemsForStudent(statusData.value, authStore.user.student.id);
    }
};

const editProject = (dataEdit) => {
    editedProjectId.value = dataEdit.id;
    newData.value = {
        teacher_id: dataEdit?.teacher?.id,
        ...dataEdit,
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

const router = useRouter();
const getDetail = (data) => {
    if (data?.id) router.push(`/project-detail/${data?.id}`);
};

const handleSelectData = (ids) => {
    selectedIds.value = ids;
};
</script>

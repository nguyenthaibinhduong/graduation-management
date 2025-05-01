<template>
    <h1 class="w-full py-2 title text-center">Danh sách đề tài được đăng ký của khoa {{ student?.department?.name }}
    </h1>
    <div class="w-full grid grid-cols-3 gap-5 p-2 mt-5">
        <Card v-for="(project, index) in projects" :key="index"
            class="shadow-none border border-gray-400 hover:shadow-xl hover:border-blue-700"
            @click="router.push(`/project-detail/${project?.id}`)">
            <template #title>
                <h2 class="text-sm">Đề tài : {{ project.title || 'Simple Card' }}</h2>
            </template>
            <template #content>
                <div>
                    <h5 class="text-blue-600">GVHD : {{ project?.teacher?.user?.fullname }} </h5>
                    <p class="m-0 text-xs">
                        <span><b>Mô tả:</b> <br /></span> {{ project.description || 'Không có mô tả.' }}
                    </p>
                </div>

            </template>
            <template #footer>
                <Button icon="pi pi-plus" size="small" label="Ghi danh" class="btn-submit w-full mt-2" />
            </template>
        </Card>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { useProjectStore, useTeacherStore } from "@/stores/store";
import { useAuthStore } from "@/stores/auth";
import { Button, Card } from "primevue";
import { useRouter } from "vue-router";


const router = useRouter();

const projectStore = useProjectStore();
const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const projects = ref([]);
const student = ref(null);
const teachers = ref([]);
const statusData = ref("public");




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
    console.log()
});

watch(statusData, async (newSelection) => {
    await projectStore.fetchItemsForStudent(newSelection, authStore.user.student.id);
});



</script>
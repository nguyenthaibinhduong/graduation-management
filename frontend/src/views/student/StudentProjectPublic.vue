<template>
    <h1 class="w-full py-2 title text-center">Danh sách đề tài được đăng ký của khoa {{ student?.department?.name }}
    </h1>
    <!-- Hướng dẫn đăng ký đề tài -->
    <div class="w-full mx-auto mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-900 shadow-sm">
        <h3 class="text-lg font-semibold mb-2">📝 Hướng dẫn đăng ký đề tài</h3>
        <ul class="list-disc list-inside text-sm space-y-1">
            <li>Chỉ những sinh viên đã có nhóm mới được phép đăng ký đề tài.</li>
            <li>Mỗi nhóm chỉ được đăng ký **một đề tài duy nhất**.</li>
            <li>Hãy đọc kỹ mô tả và tên giảng viên hướng dẫn trước khi ghi danh.</li>
            <li>Sau khi bấm “Ghi danh”, hệ thống sẽ ghi nhận đề tài đã chọn và không thể thay đổi.</li>
            <li>Nếu có thắc mắc, vui lòng liên hệ Ban quản lý đề tài của khoa.</li>
        </ul>
    </div>

    <div class="w-full p-4 mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Danh sách đề tài -->
        <div class="lg:col-span-2 space-y-4">
            <Card v-for="(project, index) in projects" :key="index"
                class="shadow-sm border border-gray-300 hover:shadow-md hover:border-blue-600 transition-all cursor-pointer rounded-xl">
                <!-- Tiêu đề + nút thông tin -->
                <template #title>
                    <div class="flex justify-between items-center w-full">
                        <h2 class="text-base font-semibold text-gray-800">
                            📌 Đề tài: {{ project.title || "Chưa có tiêu đề" }}
                        </h2>
                        <Button icon="pi pi-info-circle" aria-label="Chi tiết" class="p-button-rounded p-button-text"
                            @click="router.push(`/project-detail/${project?.id}`)" />
                    </div>
                </template>

                <!-- Nội dung -->
                <template #content>
                    <div class="text-sm text-gray-700 mt-2">
                        <p>
                            <span class="font-medium text-blue-700">GVHD:</span>
                            {{ project?.teacher?.user?.fullname || "Chưa có" }}
                        </p>
                        <p class="mt-2 leading-relaxed">
                            <span class="font-medium">Mô tả:</span><br />
                            {{ project.description || "Không có mô tả." }}
                        </p>
                    </div>
                </template>

                <!-- Footer: Nút ghi danh -->
                <template #footer>
                    <Button icon="pi pi-plus" size="small" label="Ghi danh"
                        class="w-full mt-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                        @click.stop="registerProject(project?.id)" />
                </template>
            </Card>

        </div>

        <!-- Thông tin nhóm -->
        <div class="w-full p-6 bg-white rounded-xl shadow-sm ">
            <h2 class="text-2xl font-semibold mb-4 text-green-700">Nhóm của bạn</h2>
            <div v-if="!group" class="text-gray-500 text-sm w-full flex flex-col items-start">
                <span class="w-full text-center">Bạn hiện chưa có nhóm đăng ký </span>
                <Button class="mt-3 mx-auto bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                    icon="pi pi-plus" size="small" label="Đăng ký nhóm" @click="router.push(`/group-manangerment`)" />
            </div>
            <div v-else class="space-y-2 text-base">
                <div><span class="font-medium">Tên nhóm:</span> {{ group?.name }}</div>
                <div><span class="font-medium">Mã nhóm:</span> {{ group?.code }}</div>
                <div><span class="font-medium">Trưởng nhóm:</span> {{ group?.leader?.user?.fullname }} </div>
                <div>
                    <span class="font-medium">Thành viên:</span>
                    <ul class="list-disc list-inside ml-2">
                        <li v-for="member in group?.students" :key="member.id">
                            {{ member.user?.fullname }} ({{ member.code }})
                        </li>
                    </ul>
                </div>
                <div>
                    <span class="font-medium">Trạng thái:</span>
                    <span :class="statusClass(group?.status)">{{ statusLabel(group?.status) }}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { useGroupStore, useProjectStore, useTeacherStore } from "@/stores/store";
import { useAuthStore } from "@/stores/auth";
import { Button, Card } from "primevue";
import { useRouter } from "vue-router";
import { showToast } from "@/utils/toast";


const router = useRouter();

const projectStore = useProjectStore();
const authStore = useAuthStore();
const teacherStore = useTeacherStore();
const projects = ref([]);
const student = ref(null);
const group = ref(null);
const teachers = ref([]);
const statusData = ref("public");
const groupStore = useGroupStore()




onMounted(async () => {
    await authStore.fetchUser();
    await teacherStore.fetchItems();
    await groupStore.getMyGroup()
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
    group.value = groupStore.group
});

watch(statusData, async (newSelection) => {
    await projectStore.fetchItemsForStudent(newSelection, authStore.user.student.id);
});

const registerProject = (id) => {
    if (group.value?.status != "approved") {
        showToast("Nhóm không được phép đăng ký đề tài", 'info')
    } else {
        router.push(`/project-detail/${id}`)
    }
}

const statusLabel = (status) => {
    const statuses = {
        create: "Đang lập nhóm",
        pending: "Đang chờ duyệt",
        approved: "Đã duyệt",
        reject: "Đã huỷ",
        finding: "Đang ghi danh",
        success: "Thực hiện đề tài"
    };
    return statuses[status] || "Không xác định";
};

const statusClass = (status) => {
    const classes = {
        create: "bg-blue-100 text-blue-700 px-2  py-1 ms-2 text-sm rounded-full",
        pending: "bg-yellow-100 text-yellow-700 px-2  py-1 ms-2 text-sm rounded-full",
        approved: "bg-green-100 text-green-700 px-2  py-1 ms-2 text-sm rounded-full",
        reject: "bg-red-100 text-red-700 px-2  py-1 ms-2 text-sm rounded-full",
        finding: "bg-yellow-300 text-white px-2  py-1 ms-2 text-sm rounded-full",
        success: "bg-green-600 text-white px-2  py-1 ms-2 text-sm rounded-full",
    };
    return classes[status] || "";
};



</script>
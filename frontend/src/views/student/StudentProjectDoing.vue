<template>
    <div class="p-4 space-y-4">
        <!-- Tiêu đề -->
        <div class="text-3xl font-bold text-blue-700 py-2 text-center">Quản lý đề tài đang thực hiện</div>

        <!-- Thông tin đề tài -->
        <div class="w-full grid grid-cols-2 gap-x-4">
            <div v-if="project?.title" class="bg-white p-6 rounded-2xl shadow-sm relative">
                <div class="text-xl font-semibold mb-2">Thông tin đề tài</div>
                <div><strong>Tên đề tài:</strong> {{ project?.title || 'Chưa có' }}</div>
                <div><strong>Mô tả: <br></strong> {{ project?.description || 'Không có mô tả' }}</div>
                <div><strong>Giảng viên hướng dẫn:</strong> {{
                    project?.teacher?.user?.fullname || 'Chưa có' }}</div>
                <div v-if="group?.status == 'finding'" class=" absolute bottom-5 right-5">
                    <Button
                        class="mt-3 mx-auto bg-red-600 text-white hover:bg-red-500 border-red-600 transition-colors duration-300"
                        icon="pi pi-minus" size="small" @click="stopProject" label="Huỷ ghi danh đề tài" />
                </div>
            </div>
            <div v-else class=" bg-white p-6 rounded-2xl shadow-sm w-full flex flex-col items-start">
                <div class="text-xl font-semibold mb-2">Thông tin đề tài</div>
                <span class="text-gray-500 text-sm w-full text-center">Bạn hiện chưa đăng ký đề tài</span>
                <Button class="mt-3 mx-auto bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                    icon="pi pi-plus" size="small" label="Đăng ký đề tài"
                    @click="router.push(`/student-project-public`)" />
            </div>

            <!-- Thành viên nhóm -->
            <div class="bg-white p-6 rounded-2xl shadow-sm">
                <div class="text-xl font-semibold mb-2">Thành viên nhóm</div>
                <div v-if="!group" class="text-gray-500 text-sm w-full flex flex-col items-start">
                    <span class="w-full text-center">Bạn hiện chưa có nhóm đăng ký </span>
                    <Button class="mt-3 mx-auto bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300"
                        icon="pi pi-plus" size="small" label="Đăng ký nhóm"
                        @click="router.push(`/group-manangerment`)" />
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

        <!-- Hội đồng giám khảo -->
        <div class="bg-white p-6 rounded-2xl shadow-sm">
            <div class="text-xl font-semibold mb-2">Hội đồng giám khảo</div>
            <ul class="list-disc list-inside space-y-1">
                <li>TS. Lê Văn E (Chủ tịch hội đồng)</li>
                <li>TS. Mai Thị F (Thành viên)</li>
                <li>ThS. Phạm Văn G (Thư ký)</li>
            </ul>
        </div>
        <!-- Bảng điểm -->
        <div class="bg-white p-6 rounded-2xl shadow-sm">
            <div class="text-xl font-semibold mb-2">Bảng điểm</div>
            <DataTable :value="grades" class="p-datatable-sm">
                <Column field="type" header="Loại đánh giá" />
                <Column field="score" header="Điểm" />
            </DataTable>
        </div>

    </div>
</template>

<script setup>
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useGroupStore, useProjectStore } from '@/stores/store';
import { onMounted, ref, watchEffect } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Button } from 'primevue';
import { showToast } from '@/utils/toast';

const grades = [
    { type: 'Giữa kỳ', score: 8.5 },
    { type: 'Cuối kỳ', score: 9.0 },
    { type: 'Trình bày', score: 8.7 },
]

const groupStore = useGroupStore()
const projectStore = useProjectStore()
const authStore = useAuthStore()
const group = ref()
const project = ref()
const router = useRouter()



onMounted(async () => {
    await fetchData()
});
watchEffect(async () => {
    group.value = groupStore.group
    if (groupStore?.group?.project?.id && authStore?.user?.role == 'student') {
        project.value = projectStore.item
    }

})

const fetchData = async () => {
    await authStore.fetchUser()
    await groupStore.getMyGroup()
    project.value = projectStore.item
    if (groupStore?.group?.project?.id && authStore?.user?.role == 'student') {
        await projectStore.findItem(groupStore?.group?.project?.id, authStore?.user?.student?.id, authStore?.user?.role)
        project.value = projectStore.item
    } else {
        project.value = null
    }
}

const stopProject = async () => {
    if (group.value?.status == 'finding') {
        const param = {
            projectId: project.value?.id,
            groupId: group.value?.id
        }
        await groupStore.stopProject(param)
        await fetchData()
    } else {
        showToast('Bạn không thể rời nhóm !', 'info')
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

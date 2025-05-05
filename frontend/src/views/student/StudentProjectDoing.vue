<template>
    <div class="space-y-4">
        <!-- Tiêu đề -->
        <div class="text-3xl font-bold text-blue-700">Quản lý đề tài đang thực hiện</div>

        <!-- Thông tin đề tài -->
        <div class="w-full grid grid-cols-2 gap-x-4">
            <div class="bg-white p-6 rounded-2xl shadow-sm">
                <div class="text-xl font-semibold mb-2">Thông tin đề tài</div>
                <div><strong>Tên đề tài:</strong> {{ project?.title || 'Chưa có' }}</div>
                <div><strong>Mô tả:</strong> {{ project?.description || 'Không có mô tả' }}</div>
                <div><strong>Giảng viên hướng dẫn:</strong> {{ project?.teacher?.degree + ' ' }} {{
                    project?.teacher?.user?.fullname || 'Chưa có' }}</div>
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
                    <!-- <div>
                        <span class="font-medium">Trạng thái:</span>
                        <span :class="statusClass(group?.status)">{{ statusLabel(group?.status) }}</span>
                    </div> -->
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

onMounted(async () => {
    await authStore.fetchUser()
    await groupStore.getMyGroup()
    if (groupStore?.group?.project?.id && authStore?.user?.role == 'student') {
        await projectStore.findItem(groupStore?.group?.project?.id, authStore?.user?.student?.id, authStore?.user?.role)
    }
});
watchEffect(() => {
    group.value = groupStore.group
    project.value = projectStore.item
})
</script>

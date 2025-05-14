<template>
    <DataTableCustom title="Danh sách Nhóm sinh viên hướng dẫn"
        :block="['toolbar', 'selectAll', 'headerBar', 'selectAll', 'action']" :data="groups" :columns="[
            { field: 'code', header: 'Mã nhóm' },
            { field: 'name', header: 'Tên nhóm' },
            { field: 'total_member', header: 'Số lượng' },
            { field: 'project.title', header: 'Đề tài' },
            { field: 'department.name', header: 'Tên khoa' },
            {
                field: 'status',
                header: 'Trạng thái',
                type: 'status',
                statuses: [
                    {
                        value: 'create',
                        label: 'Đang lập nhóm',
                        class: 'bg-blue-100 text-blue-700',
                    },
                    {
                        value: 'pending',
                        label: 'Đang chờ duyệt',
                        class: 'bg-yellow-100 text-yellow-700',
                    },
                    {
                        value: 'approved',
                        label: 'Đã duyệt',
                        class: 'bg-green-100 text-green-700',
                    },
                    { value: 'rejected', label: 'Đã huỷ', class: 'bg-red-100 text-red-700' },
                    {
                        value: 'finding',
                        label: 'Đã ghi danh',
                        class: 'bg-orange-100 text-orange-700',
                    },
                    {
                        value: 'success',
                        label: 'Thực hiện đề tài',
                        class: 'bg-green-600 text-white',
                    },
                ],
            }

        ]" :total="groups?.length" :loading="loading" @fetch="fetchGroup" @rowSelect="onSelect" />
    <Dialog v-model:visible="open" modal header="Chi tiết nhóm" :style="{ width: '800px' }" @after-hide="reset">
        <div class="w-full">
            <div class="space-y-2 text-base">
                <div><span class="font-medium">Tên nhóm:</span> {{ detail?.name }}</div>
                <div>
                    <span class="font-medium">Mã nhóm:</span> {{ detail?.code }} -
                    {{ detail?.department?.name }}
                </div>
                <div><span class="font-medium">Đề tài:</span> {{ detail?.project?.title }}</div>
                <div>
                    <span class="font-medium">Trưởng nhóm:</span>
                    {{ detail?.leader?.user?.fullname }} ({{ detail?.leader?.code }})
                </div>
                <div>
                    <span class="font-medium">Thành viên:</span>
                    <ul class="list-disc list-inside ml-2">
                        <li v-for="member in detail?.status == 'create'
                            ? detail?.student_attemp
                            : detail.students" :key="member.id">
                            {{ member.user?.fullname }} ({{ member.code }})
                        </li>
                        <li v-if="detail?.status == 'rejected'">
                            {{ detail?.leader?.user?.fullname }} ({{ detail?.leader?.code }})
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </Dialog>
</template>
<script setup>
import DataTableCustom from '@/components/list/DataTableCustom.vue';
import { useGroupStore } from '@/stores/store';
import { Dialog } from 'primevue';
import { onMounted, ref, watchEffect } from 'vue';

const groups = ref()
const detail = ref()
const groupStore = useGroupStore()
const open = ref(false)

onMounted(async () => {
    await fetchGroup()
})

watchEffect(async () => {
    groups.value = groupStore.group
})

const fetchGroup = async () => {
    await groupStore.getMyGroup()
}


const onSelect = async (data) => {
    if (data != null) {
        detail.value = data;
        open.value = true;
    }
};

const reset = () => {
    open.value = false;
};

</script>
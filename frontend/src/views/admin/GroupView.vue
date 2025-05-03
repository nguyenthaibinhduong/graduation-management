<template>
    <div class="p-4 w-full space-y-4">
        <!-- Bộ lọc -->
        <div class="w-full grid grid-cols-5 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
            <!-- Trạng thái -->
            <div class="flex flex-col gap-y-1">
                <label for="status" class="font-medium">Trạng thái</label>
                <MyInput class="w-full" id="status" type="select" v-model="filters.status" :options="[
                    { label: 'Tất cả', value: '' },
                    { label: 'Đang tạo nhóm', value: 'create' },
                    { label: 'Nhóm chờ duyệt', value: 'pending' },
                    { label: 'Nhóm đã duyệt', value: 'approved' },
                    { label: 'Nhóm đã hủy', value: 'rejected' },
                ]" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" />
            </div>

            <!-- Khoa -->
            <div class="flex flex-col gap-y-1">
                <label for="department" class="font-medium">Khoa</label>
                <MyInput class="w-full" id="department" type="select" v-model="filters.department_id"
                    :options="departments" optionLabel="name" optionValue="id" placeholder="Chọn khoa" />
            </div>

            <!-- Sắp xếp -->
            <div class="flex flex-col gap-y-1">
                <label for="order" class="font-medium">Sắp xếp</label>
                <MyInput class="w-full" id="order" type="select" v-model="filters.orderBy" :options="[
                    { label: 'Mới nhất', value: 'desc' },
                    { label: 'Cũ nhất', value: 'asc' }
                ]" optionLabel="label" optionValue="value" placeholder="Chọn thứ tự" />
            </div>

            <!-- Tìm kiếm -->
            <div class="flex flex-col gap-y-1 col-span-2">
                <label for="search" class="font-medium">Tìm kiếm</label>
                <MyInput class="w-full" id="search" v-model="filters.search" placeholder="Nhập tên hoặc mã nhóm"
                    @keyup.enter="fetchGroup(1)" />
            </div>
        </div>


        <!-- Bảng dữ liệu -->
        <DataTableCustom title="Danh sách nhóm" :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="groups"
            :columns="[
                { field: 'code', header: 'Mã nhóm' },
                { field: 'name', header: 'Tên nhóm' },
                { field: 'leader.user.fullname', header: 'Người tạo nhóm' },
                { field: 'total_member', header: 'Số thành viên' },
                { field: 'department.name', header: 'Tên khoa' },
                {
                    field: 'status',
                    header: 'Trạng thái',
                    type: 'status',
                    statuses: [
                        { value: 'create', label: 'Đang lập nhóm', class: 'bg-blue-100 text-blue-700' },
                        { value: 'pending', label: 'Đang chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
                        { value: 'approved', label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
                        { value: 'rejected', label: 'Đã huỷ', class: 'bg-red-100 text-red-700' }
                    ]
                }

            ]" :total="groupStore.total" @fetch="onPaginate" @add="onAdd" @edit="onEdit" @delete="onDelete"
            @selectOne="onSelect" @selectAll="onSelect" @rowSelect="onSelect" />
    </div>
    <Dialog v-model:visible="open" modal header="Chi tiết nhóm" :style="{ width: '500px' }" @after-hide="reset">
        <div class="w-full">

            <div class="space-y-2 text-base">
                <div><span class="font-medium">Tên nhóm:</span> {{ detail?.name }}</div>
                <div><span class="font-medium">Mã nhóm:</span> {{ detail?.code }}</div>
                <div><span class="font-medium">Trưởng nhóm:</span> {{ detail?.leader?.user?.fullname }} ({{
                    detail?.leader?.code }})</div>
                <div>
                    <span class="font-medium">Thành viên:</span>
                    <ul class="list-disc list-inside ml-2">
                        <li v-for="member in (detail?.status == 'create' ? detail?.student_attemp : (detail?.students))"
                            :key="member.id">
                            {{ member.user?.fullname }} ({{ member.code }})
                        </li>
                        <li v-if="detail?.status == 'rejected'">
                            {{ detail?.leader?.user?.fullname }} ({{
                                detail?.leader?.code }})
                        </li>
                    </ul>
                </div>
                <!-- <div>
                    <span class="font-medium">Trạng thái:</span>
                    <span :class="statusClass(detail?.status)">{{ statusLabel(detail?.status) }}</span>
                </div> -->
                <div class="flex">
                    <div class="flex flex-col gap-y-1">
                        <label for="status" class="font-medium">Trạng thái</label>
                        <MyInput class="w-full" id="status" type="select" v-model="update.status" :options="[
                            { label: 'Đang tạo nhóm', value: 'create' },
                            { label: 'Nhóm chờ duyệt', value: 'pending' },
                            { label: 'Nhóm đã duyệt', value: 'approved' },
                            { label: 'Nhóm đã hủy', value: 'rejected' },
                        ]" optionLabel="label" optionValue="value" placeholder="Chọn trạng thái" />
                    </div>

                </div>
                <div class="flex justify-end">
                    <Button v-if="showUpdate" label="Cập nhật" @click="handleUpdatStatus" />
                </div>

            </div>
        </div>
    </Dialog>

</template>

<script setup>
import { ref, watch, onMounted, watchEffect } from 'vue';
import DataTableCustom from '@/components/list/DataTableCustom.vue';
import { useDepartmentStore, useGroupStore } from '@/stores/store';
import { Dialog, Button } from 'primevue';
import MyInput from '@/components/form/MyInput.vue';

const groupStore = useGroupStore();
const departmentsStore = useDepartmentStore();

const showUpdate = ref(false);
const groups = ref([]);
const departments = ref([]);
const loading = ref(false);

const update = ref({ group_id: '', status: '' });
const filters = ref({ status: '', department_id: '', search: '', orderBy: 'asc' });

const fetchGroup = async (page = 1, limit = 10) => {
    loading.value = true;
    await groupStore.fetchItems(page, limit, filters.value.status, filters.value.department_id, filters.value.search, filters.value.orderBy);
    groups.value = groupStore.items;
    loading.value = false;
};

const handleUpdatStatus = async () => {
    if (update.value.group_id && update.value.status) {
        await groupStore.updateStatus(update.value.group_id, update.value.status);
        await fetchGroup();
        reset();
    }
};

const open = ref(false);
const detail = ref({});

// 1) onSelect gán thẳng data
const onSelect = (data) => {
    if (data) {
        detail.value = data;
        open.value = true;
    }
};

// 2) reset chỉ clear modal, không chạm detail
const reset = () => {
    open.value = false;
    showUpdate.value = false;
    update.value.group_id = '';
    update.value.status = '';
};

// 3) watch detail để set update
watch(detail, (data) => {
    if (data && data.id != null && data.status != null) {
        update.value.group_id = data.id;
        update.value.status = data.status;
    }
});

// 4) watch update để bật nút
watch(update, (newVal) => {
    showUpdate.value = newVal.status !== detail.value?.status;
}, { deep: true });

// other logic…
onMounted(async () => {
    await departmentsStore.fetchItems();
    departments.value = departmentsStore.items;
    fetchGroup();
});
watch(filters, () => fetchGroup(), { deep: true });
watchEffect(() => { groups.value = groupStore.items; });

</script>

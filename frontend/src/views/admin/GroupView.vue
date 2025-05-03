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
                    { label: 'Nhóm đề xuất', value: 'pending' }
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
                { field: 'total_member', header: 'Số thành viên' },
                { field: 'department.name', header: 'Tên khoa' },
                {
                    field: 'status',
                    header: 'Trạng thái',
                    type: 'status',
                    statuses: [
                        { value: 'create', label: 'Đang lập nhóm', class: 'bg-blue-100 text-blue-700' },
                        { value: 'pending', label: 'Đang chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
                        { value: 'approve', label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
                        { value: 'reject', label: 'Đã từ chối', class: 'bg-violet-100 text-violet-700' }
                    ]
                }

            ]" :total="groupStore.total" @fetch="onPaginate" @add="onAdd" @edit="onEdit" @delete="onDelete"
            @selectOne="onSelect" @selectAll="onSelect" />
    </div>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect } from 'vue';

import DataTableCustom from '@/components/list/DataTableCustom.vue';
import { useDepartmentStore, useGroupStore } from '@/stores/store';
import MyInput from '@/components/form/MyInput.vue';

const groupStore = useGroupStore();
const departmentsStore = useDepartmentStore();

const groups = ref([]);
const departments = ref([]);
const loading = ref(false);

const filters = ref({
    status: '',
    department_id: '',
    search: '',
    orderBy: 'asc',
});

const fetchGroup = async (page = 1, limit = 10) => {
    loading.value = true;
    await groupStore.fetchItems(
        filters.value.status,
        filters.value.department_id,
        page,
        limit,
        filters.value.search,
        filters.value.orderBy
    );
    groups.value = groupStore.items;
    loading.value = false;
};

const onPaginate = (page, limit, search) => {
    filters.value.search = search;
    fetchGroup(page, limit);
};

const onAdd = () => {
    // xử lý khi nhấn thêm
};

const onEdit = (item) => {
    // xử lý khi nhấn sửa
};

const onDelete = async (ids) => {
    await groupStore.deleteItem(ids);
    fetchGroup();
};

const onSelect = (ids) => {
    // xử lý chọn dòng
};

// Gọi khi trang được tải
onMounted(async () => {
    await departmentsStore.fetchItems();
    departments.value = departmentsStore.items;
    fetchGroup();
});

// Gọi lại khi thay đổi bất kỳ filter nào
watch(filters, () => {
    fetchGroup();
}, { deep: true });

// Đồng bộ khi groupStore thay đổi
watchEffect(() => {
    groups.value = groupStore.items;
});
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Nút chức năng -->
    <div class="flex gap-x-4 p-2 rounded-lg">
      <Button size="small" label="Chấm điểm Hướng dẫn" />
      <Button size="small" label="Chấm điểm hội đồng" />
      <Button size="small" label="Chấm điểm phản biện" />
    </div>

    <!-- Bảng dữ liệu nhóm -->
    <DataTableCustom title="Danh sách nhóm" :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="groups"
      :columns="columns" :total="groups.length" @rowSelect="onSelectGroup" />

    <!-- Drawer hiển thị chi tiết nhóm -->
    <Drawer v-model:visible="drawerVisible" position="right" class="w-1/3" @close="onCancel">
      <template #header>
        <div class="flex justify-between items-center w-full">
          <div class="flex items-center gap-4">
            <Button @click="onCancel" icon="pi pi-arrow-left" variant="text" rounded />
            <h2 class="text-lg font-semibold text-black">
              Chi tiết nhóm
            </h2>
          </div>
          <div class="flex items-center gap-2">
            <Button @click="onCancel" severity="danger">Đóng</Button>
          </div>
        </div>
      </template>

      <div class="mt-5 space-y-4">
        <p><strong>Người tạo nhóm:</strong> {{ selectedGroup?.leader.user.fullname }}</p>
        <p><strong>GVHD:</strong> {{ selectedGroup?.teacher.user.fullname }}</p>
        <p><strong>Khoa:</strong> {{ selectedGroup?.department.name }}</p>

        <h3 class="font-semibold text-base mt-4">Danh sách thành viên</h3>
        <ul class="space-y-3">
          <li v-for="student in selectedGroup?.members" :key="student.id"
            class="p-3 border rounded-md flex justify-between items-center">
            <div>
              <p class="font-medium">{{ student.fullname }}</p>
              <p class="text-sm text-gray-500">MSSV: {{ student.studentId }}</p>
            </div>
            <Button label="Chấm điểm" size="small" icon="pi pi-pencil" @click="scoreStudent(student)" />
          </li>
        </ul>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import DataTableCustom from '@/components/list/DataTableCustom.vue';
import { Button, Drawer } from 'primevue'; // <-- Đây là Drawer bạn đã đưa
import { useRouter } from 'vue-router';

const drawerVisible = ref(false);
const selectedGroup = ref(null);

const groups = ref([
  {
    id: 1,
    code: 'GR001',
    leader: { user: { fullname: 'Nguyễn Văn A' } },
    teacher: { user: { fullname: 'TS. Trần Văn B' } },
    department: { name: 'Khoa CNTT' },
    total_member: 3,
    members: [
      { id: 1, fullname: 'Trần Thị C', studentId: '123456' },
      { id: 2, fullname: 'Lê Văn D', studentId: '123457' },
      { id: 3, fullname: 'Phạm Thị E', studentId: '123458' },
    ],
  },
]);

const columns = [
  { field: 'code', header: 'Mã nhóm' },
  { field: 'leader.user.fullname', header: 'Người tạo nhóm' },
  { field: 'teacher.user.fullname', header: 'GVHD' },
  { field: 'total_member', header: 'Số thành viên' },
  { field: 'department.name', header: 'Tên khoa' },
];

const onSelectGroup = (group) => {
  selectedGroup.value = group;
  drawerVisible.value = true;
};

const onCancel = () => {
  drawerVisible.value = false;
  selectedGroup.value = null;
};
const router = useRouter()
const scoreStudent = (student) => {
  if (student?.id) router.push(`/edit-score/${student?.id}`);
};
</script>

<template>
    <div class="w-full p-4">
        <h1 class="text-2xl font-bold text-blue-800 mb-4">Quản lý chuyên ngành</h1>
        <p class="text-gray-600 mb-6">Danh sách các khoa và chuyên ngành trong hệ thống.</p>

        <div class="overflow-x-auto bg-white shadow rounded-2xl">
            <table class="min-w-full text-sm">
                <thead class="bg-blue-50 text-blue-800 font-semibold">
                    <tr>
                        <th class="text-left px-4 py-2 w-1/3">Tên</th>
                        <th class="text-left px-4 py-2 w-1/3">Mã</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="department in departments" :key="department.id">
                        <!-- Row: Department -->
                        <tr @click="toggleVisibility(department.id)"
                            class="cursor-pointer hover:bg-blue-50 border-b group transition">
                            <td class="px-4 py-2 font-medium text-blue-800 group-hover:underline">
                                <span class="mr-2 pi pi-angle-right" />{{ department.name }}
                            </td>
                            <td class="px-4 py-2 text-gray-700">{{ department.code }}</td>
                        </tr>

                        <!-- Row: Majors (only shown if visible) -->
                        <template v-if="department.isVisible">
                            <tr v-for="major in department.major" :key="major.id" class="border-b ps-5">
                                <td class="px-8 py-2 text-gray-700">{{ major.name }}</td>
                                <td class="px-4 py-2 text-gray-500">{{ major.code }}</td>
                            </tr>
                        </template>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useDepartmentStore } from "@/stores/store";

const departmentsStore = useDepartmentStore();
const departments = ref([]);

onMounted(() => {
    departmentsStore.fetchItems();
});

watchEffect(() => {
    departments.value = departmentsStore.items.map((department) => ({
        ...department,
        isVisible: department.isVisible ?? false,
    }));
});

const toggleVisibility = (departmentId) => {
    const department = departments.value.find(dep => dep.id === departmentId);
    if (department) {
        department.isVisible = !department.isVisible;
    }
};
</script>

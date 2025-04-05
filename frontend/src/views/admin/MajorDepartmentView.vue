<template>
    <div>
        <h1 class="text-2xl font-bold text-blue-800 mb-4">Quản lý chuyên ngành</h1>
        <p class="text-gray-600 mb-6">Danh sách các khoa và chuyên ngành trong hệ thống.</p>
    </div>
    <div class="grid grid-cols-1 gap-4">
        <div v-for="department in departments" :key="department.id"
            class="bg-white rounded-2xl shadow-md p-6 transition duration-300 hover:shadow-xl">
            <div class="flex items-center justify-between cursor-pointer group"
                @click="toggleVisibility(department.id)">
                <h2 class="text-lg font-semibold text-blue-800 group-hover:underline">
                    {{ department.name }}
                </h2>
                <svg :class="[
                    'w-5 h-5 text-blue-600 transition-transform duration-300',
                    department.isVisible ? 'rotate-180' : 'rotate-0'
                ]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            <p class="text-sm text-gray-500 mt-1">Mã khoa: {{ department.code }}</p>

            <!-- Danh sách chuyên ngành -->
            <div v-if="department.isVisible" class="mt-4">
                <DataTable :value="department.major" class="text-sm border rounded-md">
                    <Column field="code" header="Mã chuyên ngành" style="min-width: 120px;" />
                    <Column field="name" header="Tên chuyên ngành" style="min-width: 200px;" />
                </DataTable>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from "vue";
import { useDepartmentStore } from "@/stores/store";
import { Column, DataTable } from "primevue";


const departmentsStore = useDepartmentStore();
const departments = ref([]);

onMounted(() => {

    departmentsStore.fetchItems();
});

watchEffect(() => {

    departments.value = departmentsStore.items.map((department) => ({
        ...department,
        isVisible: department.isVisible ?? false, // đảm bảo có isVisible
    }));
});

const toggleVisibility = (departmentId) => {
    const department = departments.value.find((dep) => dep.id === departmentId);
    if (department) {
        department.isVisible = !department.isVisible;
    }
};
</script>

<style scoped>
/* Custom PrimeVue DataTable spacing */
::v-deep(.p-datatable-tbody > tr) {
    transition: background-color 0.2s;
}

::v-deep(.p-datatable-tbody > tr:hover) {
    background-color: #f3f4f6;
}
</style>

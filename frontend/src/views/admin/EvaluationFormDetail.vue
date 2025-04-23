<template>
    <section class="space-y-3">
        <!-- TIÊU ĐỀ & MÔ TẢ ------------------------------------------------------->
        <h2 class="text-xl font-semibold">{{ form.title }}</h2>
        <p>
            <strong>Mô tả:</strong> {{ form.description }}
            <span :class="form.status === 'active' ? 'text-green-600' : 'text-red-600'" class="ml-2 font-medium">
                {{ form.status === 'active' ? 'Khả dụng' : 'Đã hủy' }}
            </span>
        </p>

        <!-- BẢNG TIÊU CHÍ ---------------------------------------------------------->
        <table class="w-full border-collapse">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border p-2">ID</th>
                    <th class="border p-2">Tên tiêu chí</th>
                    <th class="border p-2">Nội dung</th>
                    <th class="border p-2">Điểm tối đa</th>
                    <th class="border p-2">Bước điểm</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in form.criteria" :key="c.id" class="hover:bg-gray-50">
                    <td class="border p-2 text-center">{{ c.id }}</td>
                    <td class="border p-2">{{ c.name }}</td>
                    <td class="border p-2">{{ c.content }}</td>
                    <td class="border p-2 text-center">{{ c.max_score }}</td>
                    <td class="border p-2 text-center">{{ c.step }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEvaluationStore } from '@/stores/store';

const form = ref({
    title: '',
    description: '',
    status: '',
    criteria: [],
});

// Lấy dữ liệu từ store (Pinia)
const evaluationStore = useEvaluationStore();
const route = useRoute();

onMounted(async () => {
    const id = route.params.id;
    await evaluationStore.findItem(id);
    form.value = evaluationStore.item ?? {};
});
</script>

<style scoped>
table th,
table td {
    border: 1px solid #e5e7eb;
    /* màu xám nhạt */
}
</style>

<template>
    <section class="space-y-6">
        <!-- TIÊU ĐỀ & TRẠNG THÁI -->
        <div class="flex justify-between items-center mb-6 p-4">
            <GoBack />
            <h1 class="text-2xl font-bold ">Chi tiết Phiếu chấm</h1>
        </div>
        <div class="flex items-center justify-between p-4">
            <div>
                <p class="text-sm text-gray-500 mt-1">
                    <strong class="">Mô tả:</strong>
                    <span v-html="safeHtml(form?.description)" />
                </p>
            </div>
            <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                    :class="form?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                    <svg v-if="form?.status === 'active'" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ form?.status === 'active' ? 'Khả dụng' : 'Đã hủy' }}
                </span>
            </div>
        </div>

        <!-- BẢNG TIÊU CHÍ ĐÁNH GIÁ -->
        <DataTableCustom :block="['toolbar', 'action', 'selectAll']" title="Danh sách tiêu chí đánh giá"
            :data="form?.criteria" :columns="[
                { field: 'name', header: 'Tên tiêu chí' },
                { field: 'content', header: 'Nội dung', type: 'html' },
                { field: 'max_score', header: 'Điểm tối đa' },
                { field: 'step', header: 'Bước nhảy' },
                { field: 'weightPercent', header: 'Trọng số (%)' }
            ]" :total="form?.criteria?.length" />
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEvaluationStore } from '@/stores/store';
import DOMPurify from 'dompurify';
import DataTableCustom from '@/components/list/DataTableCustom.vue';
import GoBack from '@/components/button/GoBack.vue';

const form = ref();
const evaluationStore = useEvaluationStore();
const route = useRoute();

const safeHtml = (rawHtml) => DOMPurify.sanitize(rawHtml);

onMounted(async () => {
    const id = route.params.id;
    await evaluationStore.findItem(id);
    form.value = evaluationStore.item ?? {};
});
</script>

<template>
    <Dialog :visible="props.visible" modal header="Import - Export" :style="{ width: '80vw' }"
        @update:visible="val => emit('update:visible', val)" @after-hide="() => emit('hide')">
        <TabView v-model:activeIndex="activeIndex">
            <TabPanel header="Import">
                <div
                    class="w-full mx-auto mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-900 shadow-sm">
                    <h3 class="text-lg font-semibold mb-2">📤 Hướng dẫn Import dữ liệu</h3>
                    <ul class="list-disc list-inside text-sm space-y-1">
                        <ul class="list-disc list-inside ml-4">
                            <li>Chọn đầy đủ các trường bắt buộc như Khoa, Chức vụ, Chuyên ngành, ...</li>
                            <li>Nếu chưa có file mẫu, hãy tải về và điền đúng cấu trúc yêu cầu.</li>
                            <li>Tải file Excel đúng định dạng lên hệ thống. Nếu hợp lệ, dữ liệu sẽ hiển thị; nếu không,
                                hệ thống sẽ báo lỗi theo từng dòng.</li>
                            <li>Nhấn <strong>Import Data</strong> để hoàn tất.</li>
                        </ul>
                        <strong>Lưu ý:</strong> Email không được trùng lặp. Nếu không dùng đến, có thể để trống hoặc
                        loại bỏ khỏi file.
                    </ul>
                </div>

                <div v-if="props.isShowUpload" class="p-4 space-y-4">
                    <FileUpload mode="basic" accept=".xlsx, .xls" @select="onFileSelect" />

                </div>
                <slot name="import">
                    <!-- Default export UI -->

                </slot>
            </TabPanel>

            <TabPanel header="Export">
                <div
                    class="w-full mx-auto mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-md text-blue-900 shadow-sm">
                    <h3 class="text-lg font-semibold mb-2">📤 Hướng dẫn Export dữ liệu</h3>
                    <ul class="list-disc list-inside text-sm space-y-1">
                        <ul class="list-disc list-inside ml-4">
                            <li>Chọn bộ lọc phù hợp theo dữ liệu muốn xuất (Khoa, Chức vụ, v.v.).</li>
                            <li>Chọn số lượng bản ghi hiển thị trên bảng dữ liệu.</li>
                            <li>Nhấn nút <strong>Export</strong> để tải dữ liệu về máy dưới dạng Excel.</li>
                        </ul>

                    </ul>
                </div>

                <slot name="export">
                    <!-- Default export UI -->

                </slot>
                <div class="space-y-4">
                    <Button label="Tải dữ liệu" icon="pi pi-download" class="p-button-info" @click="exportData" />
                </div>
            </TabPanel>
        </TabView>
    </Dialog>
</template>

<script setup>
import { defineProps, defineEmits, watch, ref } from 'vue';
import * as XLSX from 'xlsx';
import { Dialog, TabView, TabPanel, Button, FileUpload } from 'primevue';

const props = defineProps({
    isShowUpload: Boolean,
    visible: Boolean,
    type: {
        type: String,
        default: 'import',
        validator: (v) => ['import', 'export'].includes(v),
    },
    template: []
});
const emit = defineEmits(['update:visible', 'hide', 'import', 'export']);

// Manage active tab based on `type` prop
const activeIndex = ref(props.type === 'export' ? 1 : 0);
watch(() => props.type, (newType) => {
    activeIndex.value = newType === 'export' ? 1 : 0;
});

// Handle file selection and convert to JSON
const onFileSelect = (event) => {
    const file = event.files?.[0]; // Lấy file từ event.files
    if (!file) return;
    emit('import', file);
};

// Trigger export event
function exportData() {
    emit('export');
}
</script>

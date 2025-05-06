<template>
    <Dialog :visible="props.visible" modal header="Import - Export" :style="{ width: '70vw' }"
        @update:visible="val => emit('update:visible', val)" @after-hide="() => emit('hide')">
        <TabView v-model:activeIndex="activeIndex">
            <TabPanel header="Import">
                <div class="p-4 space-y-4">
                    <FileUpload mode="basic" accept=".xlsx, .xls" @select="onFileSelect" />
                    <Button label="Tải file mẫu" icon="pi pi-download" class="p-button-secondary"
                        @click="downloadTemplate" />
                </div>
            </TabPanel>

            <TabPanel header="Export">

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
function onFileSelect(event) {
    const file = event.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        emit('import', data);
    };
    reader.readAsBinaryString(file);
}

// Download a blank template for import
function downloadTemplate(template) {
    const sample = template;
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template.xlsx');
}

// Trigger export event
function exportData() {
    emit('export');
}
</script>

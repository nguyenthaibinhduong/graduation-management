<template>
    <Dialog :visible="props.visible" modal header="Import - Export" :style="{ width: '80vw' }"
        @update:visible="val => emit('update:visible', val)" @after-hide="() => emit('hide')">
        <TabView v-model:activeIndex="activeIndex">
            <TabPanel header="Import">
                <div v-if="props.isShowUpload" class="p-4 space-y-4">
                    <FileUpload mode="basic" accept=".xlsx, .xls" @select="onFileSelect" />

                </div>
                <slot name="import">
                    <!-- Default export UI -->

                </slot>
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

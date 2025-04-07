<template>
    <Drawer class="w-full" v-bind="$attrs">
        <!-- HEADER -->
        <template #header>
            <div class="flex justify-between items-center w-full">
                <div class="flex items-center gap-4">
                    <Button @click="onCancel" icon="pi pi-arrow-left" variant="text" rounded />
                    <div>
                        <h2 class="text-lg font-semibold text-black">
                            {{ formTitle }}
                        </h2>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Button @click="onCancel" severity="danger">Hủy bỏ</Button>
                    <Button v-if="!showImport" @click="onSave" class="btn-submit">Lưu</Button>
                    <Button v-if="showImport" label="Nhập dữ liệu" icon="pi pi-upload" :disabled="importDisabled"
                        @click="onImport" />
                </div>
            </div>
        </template>

        <div class="mt-5">
            <slot />
        </div>
    </Drawer>
</template>

<script setup>
import { Button, Drawer } from 'primevue';
import { computed, defineProps } from 'vue';
const props = defineProps({
    title: {
        type: String,
        default: 'Form Drawer',
    },
    isEditing: Boolean,
    onCancel: Function,
    onSave: Function,
    onImport: Function,
    showImport: Boolean,
    importDisabled: Boolean
})



// Tạo title động tùy vào chế độ
const formTitle = computed(() =>
    props.isEditing ? `Chỉnh sửa ${props.title}` : `Thêm mới ${props.title}`
)
</script>

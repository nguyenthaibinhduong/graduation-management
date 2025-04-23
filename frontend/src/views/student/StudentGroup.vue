<template>
    <div class="p-6 container mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-center">Nhóm Khóa luận</h1>
        <div class="w-full grid grid-cols-1 text-sm gap-6">
            <div class="flex flex-col gap-4 mb-6">
                <label for="student_name"> Tên nhóm</label>
                <MyInput v-model="groupData.name" id="student_name" class="w-full" />
            </div>
        </div>
        <!-- Form thêm/sửa sinh viên -->
        <div class="w-full bg-white p-5 rounded-xl">
            <div class="w-full grid grid-cols-2 text-sm gap-6">
                <div class="flex flex-col gap-4">
                    <h2 class="text-xl font-bold mb-4 text-center">Thông tin sinh viên 1</h2>
                    <MyInput v-model="newStudent1.code" title="Mã sinh viên 1" id="student_code"
                        :disabled="isEditing" />
                    <MyInput v-model="newStudent1.name" title="Tên sinh viên" id="student_name" />
                </div>
                <div class="flex flex-col gap-4 pe-1">
                    <h2 class="text-xl font-bold mb-4 text-center">Thông tin sinh viên 2</h2>
                    <MyInput v-model="newStudent2.code" title="Mã sinh viên 1" id="student_code"
                        :disabled="isEditing" />
                    <MyInput v-model="newStudent2.name" title="Tên sinh viên" id="student_name" />
                </div>
            </div>
        </div>

        <!-- Danh sách sinh viên -->
        <div class="flex justify-end gap-2 mt-6 w-full bg-gray-100 p-4 rounded-xl">
            <Button label="Đăng ký nhóm" icon="pi pi-check" class="p-button-primary" @click="handleCreate" />
        </div>

        <!-- Danh sách sinh viên -->
    </div>
</template>

<script setup>
import { ref } from "vue";
import MyInput from "@/components/form/MyInput.vue";
import { Button, } from "primevue";
import { useGroupStore } from "@/stores/store";
import { showToast } from "@/utils/toast";

const newStudent1 = ref({
    code: "",
    name: "",
});
const newStudent2 = ref({
    code: "",
    name: "",
});

const groupData = ref({
    name: "",
    student_codes: []
})


const groupStore = useGroupStore()
const handleCreate = async () => {
    if (!groupData.value?.name) {
        showToast("Chưa điền tên nhóm đăng ký", "error");
    }
    else if (!newStudent1.value?.code && !newStudent1.value?.code) {
        showToast("Chưa có thông tin sinh viên tham gia", "error");
    }

    else if (!newStudent1.value?.code && newStudent2.value?.code) {
        showToast("Nếu có 1 sinh viên tham gia hãy điền thông sin Sinh viên 1", "Lỗi");
        return
    }
    else {
        groupData.value.student_codes = [
            newStudent1.value?.code || null,
            newStudent2.value?.code || null
        ]
        console.log(groupData.value)
        // await groupStore.create(groupData.value)
    }



}
</script>

<style scoped>
table {
    border-collapse: collapse;
}
</style>

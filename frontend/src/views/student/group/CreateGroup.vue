<template>
    <div class="w-full grid grid-cols-2 gap-x-4">
        <div class="w-full mt-10 mx-auto o p-6 bg-white  rounded-xl shadow-sm">
            <h2 class="text-2xl font-semibold mb-4">Tạo nhóm khóa luận</h2>

            <!-- Tên nhóm -->
            <div class="mb-4">
                <label for="group_name" class="block mb-1 font-medium">Tên nhóm</label>
                <MyInput type="text" id="group_name" v-model="group_name" class="w-full" placeholder="Nhập tên nhóm" />
            </div>

            <!-- Mời thành viên -->
            <div class="mb-4 ">
                <label for="student_code" class="block mb-1 font-medium">Mã sinh viên (thành viên)</label>
                <MyInput type="text" id="student_code" v-model="student_code" class="w-full"
                    placeholder="Mã sinh viên muốn mời (tối đa 1 sinh viên)" />
            </div>

            <!-- Gửi lời mời -->
            <div class="flex justify-end space-x-2">
                <Button label="Tạo nhóm" icon="pi pi-users" @click="createGroup" />
                <Button label="Gửi lời mời" icon="pi pi-send" class="p-button-success" @click="inviteMember" />
            </div>

            <!-- Thông báo -->

        </div>
        <div v-if="group" class="w-full mt-10 p-6 bg-white rounded-xl shadow-sm ">
            <h2 class="text-2xl font-semibold mb-4 text-green-700">Thông tin nhóm của bạn</h2>
            <div v-if="group.length === 0" class="text-gray-500 text-sm">
                Bạn hiện chưa có nhóm
            </div>
            <div v-else class="space-y-2 text-base">
                <div><span class="font-medium">Tên nhóm:</span> {{ group.name }}</div>
                <div><span class="font-medium">Trưởng nhóm:</span> {{ group.students?.[0]?.user?.fullname }} ({{
                    group.students?.[0]?.code
                }})</div>
                <div>
                    <span class="font-medium">Thành viên:</span>
                    <ul class="list-disc list-inside ml-2">
                        <li v-for="member in group.students" :key="member.id">
                            {{ member.user?.fullname }} ({{ member.code }})
                        </li>
                    </ul>
                </div>
                <div><span class="font-medium">Trạng thái:</span> <span class="text-blue-600">{{ group.status }}</span>
                </div>
            </div>
        </div>
    </div>

</template>

<script setup>
import { onMounted, ref, watchEffect } from 'vue'

import Button from 'primevue/button'
import MyInput from '@/components/form/MyInput.vue'
import { useAuthStore } from '@/stores/auth'
import { useGroupStore } from '@/stores/store'
import { showToast } from '@/utils/toast'

const group_name = ref('')
const student_code = ref('')
const message = ref('')
const authStore = useAuthStore();
const student = ref()
const group = ref()
const groupStore = useGroupStore()
onMounted(async () => {
    await authStore.fetchUser();
    await groupStore.getMyGroup()
})
watchEffect(() => {
    student.value = authStore.user?.student
    group.value = groupStore.group
})
// Hàm tạo nhóm (logic bạn tự thêm)
const createGroup = async () => {
    if (!group_name?.value) {
        showToast('Chưa điền tên nhóm', 'info')
    }
    const param = {
        name: group_name.value,
        student_codes: [student.value?.code],
    }

    await groupStore.addItem(param)
    await groupStore.getMyGroup()
    console.log(group.value);

    group_name.value = ''
    student_code.value = ''
}

const inviteMember = async () => {
    if (!group_name?.value) {
        showToast('Chưa điền tên nhóm', 'info')
    }
    if (!student_code?.value) {
        showToast('Chưa điền mã sinh viên thành viên', 'info')
    }
    const param = {
        name: group_name.value,
        student_codes: [student.value?.code, student_code?.value],
    }

    await groupStore.addItem(param)
    await groupStore.getMyGroup()
    console.log(group.value);

    group_name.value = ''
    student_code.value = ''
}



// Hàm gửi lời mời (logic bạn tự thêm)
const sendInvite = () => {
    console.log('Gửi lời mời đến:', memberEmail.value)
    message.value = 'Đã gửi lời mời đến sinh viên (giả lập).'
    // TODO: Gửi lời mời đến email thông qua API
}
</script>

<style scoped>
/* Thêm nếu cần style riêng */
</style>

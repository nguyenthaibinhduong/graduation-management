<template>
    <div class="w-full mx-auto p-6 bg-white rounded-xl shadow-sm mt-6 mb-2">
        <h2 class="text-xl font-semibold mb-4">Lịch sử tạo nhóm</h2>

        <div v-if="invitations.length === 0" class="text-gray-500 text-sm">
            Bạn hiện không có lời mời nào.
        </div>

        <ul v-else class="space-y-3">
            <li v-for="invite in invitations" :key="invite.id"
                class="p-3 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                    <p class="font-medium">Nhóm: {{ invite.groupName }}</p>
                    <p class="text-sm text-gray-600">Mời từ: {{ invite.inviterEmail }}</p>
                </div>
                <div class="flex gap-2">

                    <Button label="Hủy Nhóm" icon="pi pi-times" class="p-button-sm p-button-danger"
                        @click="declineInvite(invite.id)" />


                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Button from 'primevue/button'

// Giả lập danh sách lời mời (sẽ thay bằng API sau)
const invitations = ref([
    {
        id: 1,
        groupName: 'Nhóm KLTN Tài chính',
        inviterEmail: 'sv001@uef.edu.vn',
    },
    {
        id: 2,
        groupName: 'Nhóm Phân tích dữ liệu',
        inviterEmail: 'sv123@uef.edu.vn',
    },
])

// Hàm xử lý chấp nhận
const acceptInvite = (inviteId) => {
    console.log('Đã chấp nhận lời mời:', inviteId)
    // TODO: Gọi API xác nhận lời mời
    invitations.value = invitations.value.filter(i => i.id !== inviteId)
}

// Hàm từ chối
const declineInvite = (inviteId) => {
    console.log('Đã từ chối lời mời:', inviteId)
    // TODO: Gọi API từ chối lời mời
    invitations.value = invitations.value.filter(i => i.id !== inviteId)
}
</script>

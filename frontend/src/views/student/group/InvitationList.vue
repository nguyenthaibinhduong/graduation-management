<template>
    <div class="w-full mx-auto p-6 bg-white rounded-xl shadow-sm mt-6 mb-2">
        <h2 class="text-xl font-semibold mb-4">Lời mời tham gia nhóm</h2>

        <div v-if="invites && invites.length === 0" class="text-gray-500 text-sm">
            Bạn hiện không có lời mời nào.
        </div>

        <ul v-else class="space-y-3">
            <li v-for="invite in invites" :key="invite.id"
                class="p-3 border border-gray-200 rounded-xl flex justify-between items-center">
                <div>
                    <p class="font-medium">Nhóm: {{ invite.name }}</p>
                    <p class="text-sm text-gray-600">Mời từ: {{ invite.leader?.user?.fullname }}</p>
                </div>
                <div class="flex gap-2">
                    <Button label="Chấp nhận" icon="pi pi-check" class="p-button-sm p-button-success"
                        @click="acceptInvite(invite.id)" />
                    <Button label="Từ chối" icon="pi pi-times" class="p-button-sm p-button-danger"
                        @click="declineInvite(invite.id)" />


                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { onMounted, ref, watchEffect } from 'vue'
import Button from 'primevue/button'
import { useGroupStore } from '@/stores/store'

// Giả lập danh sách lời mời (sẽ thay bằng API sau)
const invites = ref(null)
const groupStore = useGroupStore()
onMounted(async () => {
    await groupStore.getMyInvite()
})
watchEffect(() => {
    invites.value = groupStore.invite
    console.log(invites.value);

})

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

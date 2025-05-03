<template>
    <div class="w-full mx-auto p-6 bg-white rounded-xl shadow-sm mt-6 mb-2">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Lời mời tham gia nhóm</h2>
            <Button label="Làm mới" icon="pi pi-refresh" class="p-button-sm p-button-outlined" @click="reset" />
        </div>

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
const acceptInvite = async (groupId) => {
    const param = {
        group_id: groupId
    }
    await groupStore.respondToInvite(param, 'accept')
    await reset()
}

// Hàm từ chối
const declineInvite = async (groupId) => {
    const param = {
        group_id: groupId
    }
    await groupStore.respondToInvite(param, 'reject')
    await reset()

}

const reset = async () => {
    await groupStore.getMyGroup()
    await groupStore.getMyInvite()
}
</script>

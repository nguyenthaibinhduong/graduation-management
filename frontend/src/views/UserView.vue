<template>
  <div class="p-4">
    <DataTable :value="users" paginator :rows="5" class="p-datatable-sm shadow-md">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Danh sách User</span>
          <Button label="Thêm mới" />
        </div>
      </template>
      <Column field="id" header="ID" sortable></Column>
      <Column field="email" header="Email" sortable></Column>
      <Column field="role" header="Vai trò" sortable></Column>
    
    </DataTable>
  </div>
</template>

<script setup>
import { ref ,onMounted} from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { Button } from 'primevue'
import { useUserStore } from '@/stores/users'

const userStore = useUserStore()
const users = ref([])

// Gọi API khi component được mounted
onMounted(async () => {
  await userStore.fetchUsers()
  users.value = userStore.users
})

</script>
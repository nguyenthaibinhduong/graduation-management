<template>
  <DataTableCustom
    title="Danh sách nhóm"
    :block="['toolbar', 'action']"
    :data="groups"
    :columns="[
      { field: 'code', header: 'Mã nhóm' },
      { field: 'leader.user.fullname', header: 'Người tạo nhóm' },
      { field: 'teacher.user.fullname', header: 'GVHD' },
      { field: 'total_member', header: 'Số thành viên' },
      { field: 'department.name', header: 'Tên khoa' },
    ]"
    :total="groupStore.total"
    @fetch="onPaginate"
    @selectOne="onSelect"
    @selectAll="onSelect"
    @rowSelect="onSelect"
  />
</template>
<script setup>
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import { useGroupStore, useStudentStore } from '@/stores/store'
import { ref } from 'vue'
import { watchEffect } from 'vue'
import { watch } from 'vue'
import { onMounted } from 'vue'

const studentStore = useStudentStore()
const groupStore = useGroupStore()

const loading = ref(false)
const filters = ref({ status: '', department_id: '', search: '', orderBy: 'asc' })

const groups = ref([])

onMounted(async () => {
  await fetchGroup()
})

const fetchGroup = async (page = 1, limit = 10) => {
  loading.value = true
  await groupStore.fetchItems(
    page,
    limit,
    filters.value.status,
    filters.value.department_id,
    filters.value.search,
    filters.value.orderBy
  )
  groups.value = groupStore.items
  loading.value = false
}
</script>

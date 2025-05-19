<template>
  <!-- Hiển thị điểm hoặc trạng thái tải/lỗi -->
  <div v-if="scoreLoading">Đang tải điểm...</div>
  <div v-else-if="scoreError" class="text-red-500">{{ scoreError }}</div>
  <div v-else-if="score">
    <DataTable :value="[score]" class="w-full mt-4">
      <Column header="Điểm GVHD">
        <template #body="{ data }">
          {{
            data?.byType?.advisor?.score !== null && data?.byType?.advisor?.score !== undefined
              ? data.byType.advisor.score
              : 'Chưa có điểm'
          }}
        </template>
      </Column>
      <Column header="Điểm phản biện">
        <template #body="{ data }">
          {{
            data?.byType?.reviewer?.score !== null && data?.byType?.reviewer?.score !== undefined
              ? data.byType.reviewer.score
              : 'Chưa có điểm'
          }}
        </template>
      </Column>
      <Column header="Điểm hội đồng">
        <template #body="{ data }">
          {{
            data?.byType?.committee?.score !== null && data?.byType?.committee?.score !== undefined
              ? data.byType.committee.score
              : 'Chưa có điểm'
          }}
        </template>
      </Column>
      <Column field="weightedTotal" header="Tổng điểm (trọng số)" />
      <Column field="isComplete" header="Trạng thái">
        <template #body="{ data }">
          <span :class="data.isComplete ? 'text-green-600' : 'text-red-600'">
            {{ data.isComplete ? 'Hoàn thành' : 'Chưa hoàn thành' }}
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useScoreStore } from '@/stores/store'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { onMounted, ref } from 'vue'

const scoreStore = useScoreStore()
const authStore = useAuthStore()
const score = ref(null)
const scoreLoading = ref(false)
const scoreError = ref('')

onMounted(async () => {
  await fetchScore()
})

const fetchScore = async () => {
  scoreLoading.value = true
  scoreError.value = ''
  try {
    const response = await scoreStore.fetchWeightedTotalScore(authStore?.user?.id)
    score.value = response.data ? response.data : response
  } catch (err) {
    scoreError.value = 'Không thể lấy dữ liệu điểm.'
    score.value = null
  } finally {
    scoreLoading.value = false
  }
}
</script>

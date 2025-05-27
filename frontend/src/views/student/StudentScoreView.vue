<template>
  <div class="w-full p-4">
    <div v-if="scoreLoading">Đang tải điểm...</div>
    <div v-else-if="scoreError" class="text-red-500">{{ scoreError }}</div>
    <div v-else-if="score">
      <DataTable showGridlines :value="[score]" class="w-full mt-4 p-datatable-sm" stripedRows>
        <Column header="Điểm GVHD">
          <template #body="{ data }">
            {{
              data?.advisor_overall !== null && data?.advisor_overall !== undefined
                ? data?.advisor_overall
                : 'Chưa có điểm'
            }}
          </template>
        </Column>
        <Column header="Điểm phản biện">
          <template #body="{ data }">
            {{
              data?.reviewer_overall !== null && data?.reviewer_overall !== undefined
                ? data?.reviewer_overall
                : 'Chưa có điểm'
            }}
          </template>
        </Column>
        <Column header="Điểm hội đồng">
          <template #body="{ data }">
            {{
              data?.committee_overall !== null && data?.committee_overall !== undefined
                ? data?.committee_overall
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

      <!-- Accordion for score by criteria and teacher type -->
      <Accordion class="mt-6">
        <AccordionTab v-for="type in teacherTypes" :key="type" :header="teacherTypeLabel(type)">
          <div v-if="score[type] && score[type].length">
            <DataTable :value="score[type]" class="w-full p-datatable-sm" stripedRows>
              <Column field="criteria.name" header="Tiêu chí" />
              <Column field="criteria.content" header="Nội dung">
                <template #body="{ data }">
                  <span v-html="data.criteria.content"></span>
                </template>
              </Column>
              <Column field="criteria.max_score" header="Điểm tối đa" />
              <Column field="criteria.weightPercent" header="Trọng số (%)" />
              <Column field="scoreValue" header="Điểm" />
              <Column field="comment" header="Nhận xét" />
            </DataTable>
          </div>
          <div v-else class="text-gray-500 italic">Chưa có đánh giá</div>
        </AccordionTab>
      </Accordion>
      <!-- Group score -->
      <div class="mt-8 flex">
        <Card class="w-full border-2 border-blue-400 shadow-lg bg-blue-50">
          <template #content>
            <div class="text-center">
              <div class="text-xl font-semibold text-blue-700 mb-1">Điểm nhóm</div>
              <div class="text-3xl font-bold text-blue-900 my-2">
                {{
                  groupScore?.groupScore !== undefined && groupScore?.groupScore !== null
                    ? groupScore.groupScore
                    : 'Chưa có điểm nhóm'
                }}
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useScoreStore, useStudentStore } from '@/stores/store'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { onMounted, ref } from 'vue'
import Card from 'primevue/card'

const scoreStore = useScoreStore()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const score = ref(null)
const scoreLoading = ref(false)
const scoreError = ref('')
const groupId = ref(null)
const groupScore = ref(null)

const teacherTypes = ['advisor', 'reviewer', 'committee']
const teacherTypeLabel = (type) => {
  if (type === 'advisor') return 'Giảng viên hướng dẫn'
  if (type === 'reviewer') return 'Giảng viên phản biện'
  if (type === 'committee') return 'Hội đồng'
  return type
}

onMounted(async () => {
  await fetchScore()
  await studentStore.findItem(authStore?.user?.student?.id)
  groupId.value = studentStore.item?.group?.id
  if (!groupId.value) {
    scoreError.value = 'Bạn chưa tham gia nhóm nào.'
    return
  }
  groupScore.value = await scoreStore.fetchGroupScore(groupId.value)
})

const fetchScore = async () => {
  scoreLoading.value = true
  scoreError.value = ''
  try {
    const response = await scoreStore.fetchStudentScoreDetails(authStore?.user?.student?.id)
    score.value = response.data ? response.data : response
  } catch (err) {
    scoreError.value = 'Không thể lấy dữ liệu điểm.'
    score.value = null
  } finally {
    scoreLoading.value = false
  }
}
</script>

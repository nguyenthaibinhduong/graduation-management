<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Chọn phiếu đánh giá</h2>
    <Dropdown
      v-model="selectedForm"
      :options="form"
      optionLabel="title"
      placeholder="Chọn phiếu"
      class="w-full mb-4"
    />
    <div v-if="selectedForm">
      <h3 class="text-lg font-semibold mt-4">Bạn đã chọn: {{ selectedForm.title }}</h3>
      <div v-if="criteria && criteria.criteria && criteria.criteria.length">
        <DataTable :value="criteria.criteria" class="mb-4 w-full" responsiveLayout="stack">
          <Column field="name" header="Tên tiêu chí" style="width: 18%" />
          <Column field="content" header="Mô tả" style="width: 28%" />
          <Column
            field="weightPercent"
            header="Trọng số (%)"
            style="width: 12%; text-align: center"
          />
          <Column header="Điểm" style="width: 10%">
            <template #body="{ data }">
              <InputNumber
                v-model="scores[data.id]"
                :min="0"
                :max="data.max_score"
                :step="data.step"
                class="w-full"
                showButtons
                buttonLayout="horizontal"
                incrementButtonIcon="pi pi-plus"
                decrementButtonIcon="pi pi-minus"
              />
            </template>
          </Column>
          <Column header="Nhận xét" style="width: 32%">
            <template #body="{ data }">
              <InputText v-model="comments[data.id]" class="w-full" />
            </template>
          </Column>
        </DataTable>
      </div>
      <div class="text-right">
        <Button
          label="Lưu điểm"
          icon="pi pi-save"
          class="btn-submit"
          @click="submitScores"
          :loading="loading"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useEvaluationStore, useScoreStore, useStudentStore } from '@/stores/store'
import Dropdown from 'primevue/dropdown'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import { Button, InputText } from 'primevue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const evaluationStore = useEvaluationStore()
const scoreStore = useScoreStore()
const authStore = useAuthStore()
const studentStore = useStudentStore()
const route = useRoute()
const router = useRouter()

const studentId = ref(route.params.id)
const studentInfo = ref(null)
const groupId = ref(route.query.groupId)

const form = ref([])
const selectedForm = ref(null)
const criteria = ref([])
const scores = ref({})
const comments = ref({})
const loading = ref(false)

onMounted(async () => {
  await evaluationStore.fetchItems()
  await studentStore.findItem(studentId.value)
  form.value = evaluationStore.items
  studentInfo.value = studentStore.student
})

watch(selectedForm, async (val) => {
  if (val && val.id) {
    await evaluationStore.findItem(val.id)
    criteria.value = evaluationStore.item
    scores.value = {}
    comments.value = {}
    if (criteria.value && criteria.value.criteria) {
      criteria.value.criteria.forEach((c) => {
        scores.value[c.id] = null
        comments.value[c.id] = ''
      })
    }
  } else {
    criteria.value = null
    scores.value = {}
    comments.value = {}
  }
})

const submitScores = async () => {
  if (!studentId.value || !criteria.value || !criteria.value.criteria) return

  loading.value = true
  try {
    // You may need to fetch or determine these IDs/types:
    const teacherId = authStore.user?.teacher?.id
    // Optionally, get teacherType from API if needed:
    let teacherType = null
    if (groupId.value && teacherId) {
      teacherType = await scoreStore.fetchTeacherType(groupId.value, teacherId)
    }

    // You may need to get or create a score_id for this student/group
    // For demo, assume you have score_id (fetch or create as needed)
    // const scoreId = /* fetch or create score_id for this student/group/form */
    const scoreId = null // TODO: Replace with actual logic to fetch or create score_id
    // Submit each score detail
    for (const c of criteria.value.criteria) {
      const scoreValue = scores.value[c.id]
      const comment = comments.value[c.id]
      if (scoreValue === null || scoreValue === undefined) continue

      const scoreDetailData = {
        score_id: scoreId,
        teacher_id: teacherId,
        student_id: studentId.value,
        criteria_id: c.id,
        teacherType: teacherType?.teacherType || teacherType, // e.g. 'advisor'
        scoreValue,
        comment,
      }
      await scoreStore.createScoreDetail(scoreDetailData)
    }
    // Show success message (handled in store)
    router.push({ path: '/score' })
  } catch (err) {
    // Error handled in store, optionally show more feedback here
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Make table fit screen and stack on small screens */
:deep(.p-datatable) {
  width: 100%;
  min-width: unset;
}
:deep(.p-datatable-thead > tr > th),
:deep(.p-datatable-tbody > tr > td) {
  white-space: pre-line;
  vertical-align: middle;
  padding: 0.5rem 0.75rem;
}
@media (max-width: 900px) {
  :deep(.p-datatable) {
    font-size: 0.95rem;
  }
  :deep(.p-datatable-thead > tr > th),
  :deep(.p-datatable-tbody > tr > td) {
    padding: 0.4rem 0.5rem;
  }
}
</style>

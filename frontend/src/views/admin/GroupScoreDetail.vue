<template>
  <div class="pt-4">
    <Card class="w-full mb-6 shadow-lg">
      <template #title>
        <span class="text-2xl font-bold text-blue-700">
          Nhóm: {{ groupScore?.name }} ({{ groupScore?.code }})
        </span>
      </template>

      <template #content>
        <div class="flex flex-wrap items-center gap-3 mb-4 justify-between">
          <div>
            <Tag :value="`Tổng thành viên: ${groupScore?.total_member ?? 0}`" severity="info" class="mr-2" />
            <Tag :value="groupScore?.isComplete === false ? 'Chưa hoàn thành đánh giá' : 'Hoàn thành đánh giá'"
              :severity="groupScore?.isComplete === false ? 'warn' : 'success'" />
          </div>
          <Tag :value="`Điểm nhóm: ${groupScore?.groupScore ?? '...'}`" severity="success"
            class="text-l font-bold px-6 py-3 bg-green-100 border-2 border-green-500 text-green-800 rounded-lg shadow mb-4 mr-4" />
        </div>

        <Divider />
        <h2 class="font-semibold mb-3 text-lg">Danh sách sinh viên</h2>
        <DataTable :value="groupScore?.students" responsiveLayout="scroll"
          class="p-datatable-sm w-full rounded-lg shadow" stripedRows>
          <Column field="code" header="Mã SV" style="width: 120px" />
          <Column header="Tên sinh viên" style="width: 220px">
            <template #body="{ data }">
              <span class="font-medium text-gray-800">
                {{ student[data.id]?.user.fullname || '...' }}
              </span>
            </template>
          </Column>

          <Column header="Thiếu đánh giá từ" style="width: 180px">
            <template #body="{ data }">
              <span class="font-semibold text-blue-700">
                <template v-if="
                  studentScores[data.id]?.missingEvaluations &&
                  studentScores[data.id]?.missingEvaluations.length
                ">
                  {{ studentScores[data.id].missingEvaluations.map(roleLabel).join(', ') }}
                </template>
              </span>
            </template>
          </Column>
          <Column header="Điểm tổng kết" style="width: 140px">
            <template #body="{ data }">
              <span class="font-semibold text-blue-700" v-if="studentScores[data.id]?.isComplete">
                {{ studentScores[data.id]?.weightedTotal }}
              </span>
              <span class=" text-red-400" v-else> Chưa có điểm </span>
            </template>
          </Column>
          <Column header="" style="width: 120px">
            <template #body="{ data }">
              <Button label="Chi tiết" icon="pi pi-list" size="small" @click="openDetailModal(data.id)"
                :class="['p-button-text', 'p-button-info']" />
            </template>
          </Column>
        </DataTable>

        <!-- PrimeVue Dialog for score details -->
        <Dialog v-model:visible="showDetailModal" modal header="Chi tiết đánh giá" :style="{ width: '60vw' }">
          <template v-if="selectedStudentId">
            <TabView>
              <TabPanel v-for="role in ['advisor', 'reviewer', 'committee']" :key="role" :header="roleLabel(role)">
                <div v-if="studentScores[selectedStudentId]?.[role]?.length">

                  <DataTableCustom :block="['toolbar', 'headerBar', 'selectAll', 'action', 'pagginate']"
                    title="Bảng điểm chi tiết" :data="studentScores[selectedStudentId][role]" :columns="[
                      { field: 'criteria.name', header: 'Tiêu chí' },
                      {
                        field: 'criteria.content',
                        header: 'Nội dung',
                        type: 'html'
                      },
                      { field: 'criteria.max_score', header: 'Điểm tối đa' },
                      { field: 'criteria.weightPercent', header: 'Trọng số (%)' },
                      { field: 'scoreValue', header: 'Điểm' },
                      { field: 'comment', header: 'Nhận xét' }
                    ]" :total="studentScores[selectedStudentId][role]?.length" />

                </div>
                <div v-else class="text-gray-500 italic">Chưa có đánh giá</div>
              </TabPanel>
            </TabView>
          </template>
        </Dialog>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { useScoreStore, useStudentStore } from '@/stores/store'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  Card, DataTable, Column, Tag, Divider, Button, Dialog, TabView, TabPanel,
} from 'primevue'
import DOMPurify from 'dompurify';
import DataTableCustom from '@/components/list/DataTableCustom.vue';

const scoreStore = useScoreStore()
const studentStore = useStudentStore()
const route = useRoute()
const groupId = ref(route.params.id)
const safeHtml = (rawHtml) => DOMPurify.sanitize(rawHtml);
const groupScore = ref(null)
const student = ref({})
const studentScores = ref({})
const showDetailModal = ref(false)
const selectedStudentId = ref(null)

const roleLabel = (role) => {
  if (role === 'advisor') return 'Giảng viên hướng dẫn'
  if (role === 'reviewer') return 'Giảng viên phản biện'
  if (role === 'committee') return 'Hội đồng'
  return role
}

const openDetailModal = (id) => {
  selectedStudentId.value = id
  showDetailModal.value = true
}

onMounted(async () => {
  groupScore.value = await scoreStore.fetchGroupScore(groupId.value)
  const students = groupScore.value?.students || []
  const fullnameResults = await Promise.all(
    students.map(async (s) => {
      try {
        await studentStore.findItem(s.id)
        return [s.id, studentStore.item]
      } catch {
        return [s.id, '...']
      }
    })
  )
  student.value = Object.fromEntries(fullnameResults)

  const scoreResults = await Promise.all(
    students.map(async (s) => {
      try {
        const scoreDetail = await scoreStore.fetchStudentScoreDetails(s.id)
        return [s.id, scoreDetail]
      } catch {
        return [s.id, '...']
      }
    })
  )
  studentScores.value = Object.fromEntries(scoreResults)
})
</script>

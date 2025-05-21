<template>
  <div class="w-full space-y-4">
    <!-- Nút chức năng -->
    <SelectGroupButton :options="buttonOptions" />
    <!-- Bảng dữ liệu nhóm -->
    <DataTableCustom title="Danh sách nhóm" :block="['toolbar', 'headerBar', 'selectAll', 'action']" :data="groups"
      :total="groups.length" :columns="dataColumns" @rowSelect="onSelectGroup" />
    <!-- Drawer hiển thị chi tiết nhóm -->
    <Drawer v-model:visible="drawerVisible" position="right" class="w-1/2" @close="onCancel" :dismissable="true"
      :closeOnEscape="true">
      <template #header>
        <div class="flex justify-between items-center w-full">
          <div class="flex items-center gap-4">
            <Button @click="onCancel" icon="pi pi-arrow-left" variant="text" rounded />
            <h2 class="text-lg font-semibold text-black">Chi tiết nhóm</h2>
          </div>
        </div>
      </template>

      <div class="mt-5 space-y-4">
        <p><strong>Người tạo nhóm:</strong> {{ selectedGroup?.leader?.user?.fullname }}</p>
        <p><strong>GVHD:</strong> {{ selectedGroup?.teacher?.user?.fullname }}</p>
        <p><strong>Khoa:</strong> {{ selectedGroup?.department?.name }}</p>

        <h3 class="font-semibold text-base mt-4">Danh sách thành viên</h3>
        <ul class="space-y-3">
          <li v-for="member in selectedGroup?.students" :key="member?.id"
            class="p-3 border rounded-md flex justify-between items-center">
            <div class="w-full">
              <div class="w-full flex justify-between">
                <p class="font-medium">{{ member?.user?.fullname }}</p>
                <!-- Hiển thị nút Chấm điểm hoặc Chỉnh sửa dựa trên trạng thái -->
                <Button v-if="
                  (memberWeightedScores[member.id] &&
                    memberWeightedScores[member.id]?.missingEvaluations &&
                    memberWeightedScores[member.id].missingEvaluations.includes(
                      selectedGroup?.teacherRole
                    )) ||
                  memberWeightedScores[member.id]?.weighted === null
                " label="Chấm điểm" size="small" icon="pi pi-pencil" @click="scoreStudent(member)" />
                <Button v-else label="Chỉnh sửa" size="small" icon="pi pi-pencil" severity="secondary"
                  @click="editScore(member)" />
              </div>

              <p class="text-sm text-gray-500">MSSV: {{ member?.code }}</p>
              <p class="text-sm">
                Trạng thái:
                <span v-if="
                  memberWeightedScores[member.id] !== undefined &&
                  memberWeightedScores[member.id] !== null
                ">
                  <span v-if="memberWeightedScores[member.id]?.missingEvaluations">
                    <span v-if="
                      !memberWeightedScores[member.id].missingEvaluations.includes(
                        selectedGroup?.teacherRole
                      )
                    " class="text-green-500">
                      Đã chấm điểm
                    </span>
                    <span v-else class="text-red-500"> Chưa chấm điểm </span>
                  </span>
                  <span v-else class="text-red-500"> Chưa chấm điểm </span>
                </span>
              </p>
              <!-- Only show score for current teacherRole -->
              <p v-if="memberWeightedScores[member.id]?.byType && selectedGroup?.teacherRole" class="text-sm">
                Điểm:
                <span class="font-semibold">
                  {{
                    memberWeightedScores[member.id].byType[selectedGroup.teacherRole]?.score !==
                      null &&
                      memberWeightedScores[member.id].byType[selectedGroup.teacherRole]?.score !==
                      undefined
                      ? memberWeightedScores[member.id].byType[selectedGroup.teacherRole]?.score
                      : 'Chưa có điểm'
                  }}
                </span>
                (
                <span>{{
                  teacherRoleViMap[selectedGroup.teacherRole] || selectedGroup.teacherRole
                }}</span>)
              </p>

              <!-- Điểm của SV Accordion -->
              <Accordion :activeIndex="null" class="mt-2">
                <AccordionTab header="Xem chi tiết">
                  <div v-if="memberWeightedScores[member.id]">
                    <!-- Only show missingEvaluations and isComplete -->
                    <div v-if="'missingEvaluations' in memberWeightedScores[member.id]">
                      <span class="font-semibold">Điểm còn thiếu: </span>
                      <span>
                        {{
                          Array.isArray(memberWeightedScores[member.id].missingEvaluations)
                            ? memberWeightedScores[member.id].missingEvaluations
                              .map((role) => teacherRoleViMap[role] || role)
                              .join(', ')
                            : teacherRoleViMap[
                            memberWeightedScores[member.id].missingEvaluations
                            ] || memberWeightedScores[member.id].missingEvaluations
                        }}
                      </span>
                    </div>
                    <div v-if="'isComplete' in memberWeightedScores[member.id]">
                      <span class="font-semibold">Tiến độ đánh giá: </span>
                      <span>{{
                        memberWeightedScores[member.id].isComplete
                          ? 'Hoàn thành'
                          : 'Chưa hoàn thành'
                      }}</span>
                    </div>
                    <div v-if="
                      memberWeightedScores[member.id].isComplete &&
                      'weightedTotal' in memberWeightedScores[member.id]
                    ">
                      <span class="font-semibold">weightedTotal:</span>
                      <span>{{ memberWeightedScores[member.id].weightedTotal }}</span>
                    </div>
                  </div>
                  <div v-if="!memberWeightedScores[member.id]?.weightedTotal">
                    <span class="font-semibold">Điểm còn thiếu: </span>
                    <span> Hướng dẫn, Phản biện, Hội đồng </span>
                    <br />
                    <span class="font-semibold">Tiến độ đánh giá: </span>
                    <span>Chưa hoàn thành</span>
                  </div>
                </AccordionTab>
              </Accordion>
            </div>
          </li>
        </ul>
      </div>
    </Drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import { Button, Drawer } from 'primevue'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScoreStore } from '@/stores/store'
import SelectGroupButton from '@/components/button/SelectGroupButton.vue'

const scoreStore = useScoreStore()
const authStore = useAuthStore()
const groups = ref([])

const buttonOptions = [
  { label: 'Tất cả', action: () => filterByRole('all') },
  { label: 'Chấm điểm Hướng dẫn', action: () => filterByRole('advisor') },
  { label: 'Chấm điểm phản biện', action: () => filterByRole('reviewer') },
  { label: 'Chấm điểm hội đồng', action: () => filterByRole('committee') }
];

const teacherId = authStore.user?.teacher?.id

const drawerVisible = ref(false)
const selectedGroup = ref(null)
const activeRole = ref('all')
const memberWeightedScores = ref({}) // { [studentId]: score }

const dataColumns = ref([
  { field: 'name', header: 'Tên nhóm' },
  { field: 'project.title', header: 'Tên đề tài' },
  { field: 'department.name', header: 'Khoa' },
  { field: 'teacherRoleVi', header: 'Vai trò' },
])

const teacherRoleViMap = {
  advisor: 'Hướng dẫn',
  reviewer: 'Phản biện',
  committee: 'Hội đồng',
}

onMounted(async () => {
  await authStore.fetchUser()
  await scoreStore.fetchGroupsByTeacher(teacherId)
})

watchEffect(() => {
  groups.value = scoreStore.teacherGroups.map((g) => ({
    ...g,
    teacherRoleVi: teacherRoleViMap[g.teacherRole] || g.teacherRole,
  }))
})

const filterByRole = (role) => {
  activeRole.value = role
  const queryType = role === 'all' ? null : role
  scoreStore.fetchGroupsByTeacher(teacherId, queryType)
}

const router = useRouter()

const onSelectGroup = async (group) => {
  if (group != null) {
    selectedGroup.value = group
    memberWeightedScores.value = {}
    if (group?.students && group?.students?.length) {
      for (const member of group.students) {
        memberWeightedScores.value[member.id] = null
        scoreStore
          .fetchWeightedTotalScore(member.id)
          .then((score) => {
            memberWeightedScores.value[member.id] = score
          })
          .catch(() => {
            memberWeightedScores.value[member.id] = 'Lỗi'
          })
      }
    }
  }
  drawerVisible.value = true
}

const onCancel = () => {
  drawerVisible.value = false
}

const scoreStudent = (student) => {
  if (student?.id && selectedGroup.value?.id) {
    router.push({
      path: `/create-score-detail/${selectedGroup.value?.teacherRole}/${student.id}/`,
      query: { groupId: selectedGroup.value.id },
    })
  }
}

const editScore = (student, type) => {
  if (student?.id && selectedGroup.value?.id) {
    router.push({ path: `/edit-score/${selectedGroup.value?.teacherRole}/${student.id}`, query: { groupId: selectedGroup.value.id } })
  }
}
</script>

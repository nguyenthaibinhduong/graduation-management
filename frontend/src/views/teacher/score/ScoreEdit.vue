<template>
  <div>
    <Card class="mb-6 shadow-md">
      <template #content>
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex-1">
            <div class="text-lg font-semibold text-blue-700 mb-2">Thông tin sinh viên</div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span class="font-medium text-gray-600">Họ tên:</span>
                <span class="ml-2 text-gray-900">{{ studentInfo?.user?.fullname || '...' }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Mã sinh viên:</span>
                <span class="ml-2 text-gray-900">{{ studentInfo?.code || '...' }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Nhóm:</span>
                <span class="ml-2 text-gray-900">{{ studentInfo?.group?.name || '...' }}</span>
              </div>
              <div>
                <span class="font-medium text-gray-600">Mã nhóm:</span>
                <span class="ml-2 text-gray-900">{{ studentInfo?.group?.code || '...' }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
    <h1>Chi tiết điểm sinh viên</h1>
    <div v-if="loading">Đang tải dữ liệu...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <p><strong>ID Sinh Viên:</strong> {{ scoreDetails?.studentId }}</p>
      <p><strong>Tên Sinh Viên:</strong> {{ scoreDetails?.studentName }}</p>
      <DataTable
        :value="scoreDetails?.scoreDetails"
        class="mb-4 w-full"
        v-if="scoreDetails?.scoreDetails"
      >
        <Column field="criteria.name" header="Tiêu chí" />
        <Column field="content" header="Mô tả" style="width: 28%">
          <template #body="{ data }">
            <span v-html="safeHtml(data?.criteria?.content)" />
          </template>
        </Column>

        <Column header="Điểm">
          <template #body="{ data }">
            <InputNumber
              v-model="editScores[data.id].scoreValue"
              :min="0"
              :max="data.criteria.max_score"
              :step="data.criteria.step"
              showButtons
              buttonLayout="horizontal"
              incrementButtonIcon="pi pi-plus"
              decrementButtonIcon="pi pi-minus"
            />
          </template>
        </Column>
        <Column header="Nhận xét">
          <template #body="{ data }">
            <InputText v-model="editScores[data.id].comment" />
          </template>
        </Column>
      </DataTable>
      <div class="flex gap-2 justify-end">
        <Button
          label="Cập nhật"
          icon="pi pi-save"
          @click="openConfirmModal"
          :loading="loading"
          severity="primary"
        />
      </div>
    </div>
    <!-- Confirmation Modal -->
    <Dialog
      v-model:visible="confirmVisible"
      modal
      header="Xác nhận cập nhật điểm"
      :closable="false"
    >
      <div>
        <p class="mb-2 font-semibold">Bạn có chắc chắn muốn cập nhật các điểm sau?</p>
        <ul class="mb-2">
          <li v-for="detail in scoreDetails?.scoreDetails" :key="detail.id" class="mb-1">
            <span class="font-semibold">{{ detail.criteria.name }}: </span>
            <span>Điểm: {{ editScores[detail.id].scoreValue ?? 'Chưa nhập' }}</span
            >,
            <span>Nhận xét: {{ editScores[detail.id].comment || '...' }}</span>
          </li>
        </ul>
        <div v-if="errorMessage" class="text-red-500 mb-2">{{ errorMessage }}</div>
        <div class="flex justify-end gap-2 mt-4">
          <Button label="Huỷ" @click="confirmVisible = false" severity="secondary" />
          <Button label="Xác nhận" icon="pi pi-check" @click="onSubmit" :loading="loading" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScoreStore, useStudentStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DOMPurify from 'dompurify'
import Card from 'primevue/card'

const scoreStore = useScoreStore()
const authStore = useAuthStore()
const router = useRouter()

const route = useRoute()
const studentId = ref(route.params?.id)
const groupId = ref(route.query?.groupId)
const teacherId = ref(authStore.user?.teacher?.id)
const safeHtml = (rawHtml) => {
  return DOMPurify.sanitize(rawHtml)
}

const scoreDetails = ref({})
const teacherRole = ref({})
const loading = ref(false)
const error = ref('')
const editScores = ref({})
const confirmVisible = ref(false)
const errorMessage = ref('')

//
const studentStore = useStudentStore()
const studentInfo = ref(null)
onMounted(async () => {
  await studentStore.findItem(studentId.value)
  studentInfo.value = studentStore.item
})
//
onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const details = await scoreStore.fetchStudentScoreDetails(studentId.value)
    teacherRole.value = await scoreStore.fetchTeacherType(
      groupId.value,
      teacherId.value,
      route.params.type
    )
    // Lấy đúng chi tiết điểm theo vai trò giáo viên
    const roleDetails = details?.[teacherRole.value.teacherType]
    scoreDetails.value = {
      studentId: details?.studentId,
      studentName: details?.studentName,
      scoreDetails: Array.isArray(roleDetails) ? roleDetails : [],
    }
    // Khởi tạo dữ liệu chỉnh sửa
    scoreDetails.value.scoreDetails.forEach((detail) => {
      editScores.value[detail.id] = {
        scoreValue: detail.scoreValue,
        comment: detail.comment,
      }
    })
  } catch (err) {
    error.value = 'Không thể lấy dữ liệu chi tiết điểm.'
  } finally {
    loading.value = false
  }
})

function openConfirmModal() {
  confirmVisible.value = true
}

const onSubmit = async () => {
  // Validate all scores are filled
  const missing = scoreDetails.value?.scoreDetails?.some(
    (detail) =>
      editScores.value[detail.id].scoreValue === null ||
      editScores.value[detail.id].scoreValue === undefined ||
      editScores.value[detail.id].scoreValue === ''
  )
  if (missing) {
    errorMessage.value = 'Vui lòng nhập đầy đủ điểm cho tất cả tiêu chí.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    for (const detail of scoreDetails.value.scoreDetails) {
      const { scoreValue, comment } = editScores.value[detail.id]
      await scoreStore.updateScoreDetail(
        detail.id,
        {
          scoreValue,
          comment,
        },
        route.params.type
      )
    }
    confirmVisible.value = false
    router.push({ path: '/score' })
  } catch (err) {
    error.value = 'Cập nhật thất bại.'
  } finally {
    loading.value = false
  }
}
</script>

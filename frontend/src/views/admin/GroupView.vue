<template>
  <div class="p-4 w-full space-y-4">
    <!-- Bộ lọc -->
    <div class="w-full grid grid-cols-5 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
      <!-- Trạng thái -->
      <div class="flex flex-col gap-y-1">
        <label for="status" class="font-medium">Trạng thái</label>
        <MyInput
          class="w-full"
          id="status"
          type="select"
          v-model="filters.status"
          :options="[
            { label: 'Tất cả', value: '' },
            { label: 'Đang tạo nhóm', value: 'create' },
            { label: 'Nhóm chờ duyệt', value: 'pending' },
            { label: 'Nhóm đã duyệt', value: 'approved' },
            { label: 'Nhóm đã hủy', value: 'rejected' },
            { label: 'Nhóm đã ghi danh', value: 'finding' },
            { label: 'Nhóm đang làm đề tài', value: 'success' },
          ]"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn trạng thái"
        />
      </div>

      <!-- Khoa -->
      <div class="flex flex-col gap-y-1">
        <label for="department" class="font-medium">Khoa</label>
        <MyInput
          class="w-full"
          id="department"
          type="select"
          v-model="filters.department_id"
          :options="departments"
          optionLabel="name"
          optionValue="id"
          placeholder="Chọn khoa"
        />
      </div>

      <!-- Sắp xếp -->
      <div class="flex flex-col gap-y-1">
        <label for="order" class="font-medium">Sắp xếp</label>
        <MyInput
          class="w-full"
          id="order"
          type="select"
          v-model="filters.orderBy"
          :options="[
            { label: 'Mới nhất', value: 'desc' },
            { label: 'Cũ nhất', value: 'asc' },
          ]"
          optionLabel="label"
          optionValue="value"
          placeholder="Chọn thứ tự"
        />
      </div>

      <!-- Tìm kiếm -->
      <div class="flex flex-col gap-y-1 col-span-2">
        <label for="search" class="font-medium">Tìm kiếm</label>
        <MyInput
          class="w-full"
          id="search"
          v-model="filters.search"
          placeholder="Nhập tên hoặc mã nhóm"
          @keyup.enter="fetchGroup(1)"
        />
      </div>
    </div>

    <!-- Bảng dữ liệu -->
    <DataTableCustom
      title="Danh sách nhóm"
      :block="['toolbar', 'headerBar', 'selectAll', 'action']"
      :data="groups"
      :columns="[
        { field: 'code', header: 'Mã nhóm' },
        { field: 'leader.user.fullname', header: 'Người tạo nhóm' },
        { field: 'teacher.user.fullname', header: 'GVHD' },
        { field: 'total_member', header: 'Số thành viên' },
        { field: 'department.name', header: 'Tên khoa' },
        {
          field: 'status',
          header: 'Trạng thái',
          type: 'status',
          statuses: [
            {
              value: 'create',
              label: 'Đang lập nhóm',
              class: 'bg-blue-100 text-blue-700',
            },
            {
              value: 'pending',
              label: 'Đang chờ duyệt',
              class: 'bg-yellow-100 text-yellow-700',
            },
            {
              value: 'approved',
              label: 'Đã duyệt',
              class: 'bg-green-100 text-green-700',
            },
            { value: 'rejected', label: 'Đã huỷ', class: 'bg-red-100 text-red-700' },
            {
              value: 'finding',
              label: 'Đã ghi danh',
              class: 'bg-orange-100 text-orange-700',
            },
            {
              value: 'success',
              label: 'Thực hiện đề tài',
              class: 'bg-green-600 text-white',
            },
          ],
        },
      ]"
      :total="groupStore.total"
      @fetch="onPaginate"
      @add="onAdd"
      @edit="onEdit"
      @delete="onDelete"
      @selectOne="onSelect"
      @selectAll="onSelect"
      @rowSelect="onSelect"
    />
    <div class="w-full grid grid-cols-5 gap-4 bg-white p-3 rounded-md shadow-sm text-sm">
      <!-- Trạng thái -->

      <!-- Khoa -->
      <div class="flex flex-col gap-y-1 col-span-1 col-start-4">
        <label for="department" class="font-medium">Khoa</label>
        <MyInput
          class="w-full"
          id="department"
          type="select"
          v-model="lockData.department_id"
          :options="departments"
          optionLabel="name"
          optionValue="id"
          placeholder="Chọn khoa"
        />
      </div>
      <div class="flex flex-col justify-end gap-y-1 col-span-1 col-start-5">
        <Button label="Khóa nhóm" @click="handleLockData" />
      </div>
    </div>
  </div>
  <Dialog
    v-model:visible="open"
    modal
    header="Chi tiết nhóm"
    :style="{ width: '500px' }"
    @after-hide="reset"
  >
    <div class="w-full">
      <div class="space-y-2 text-base">
        <div><span class="font-medium">Tên nhóm:</span> {{ detail?.name }}</div>
        <div>
          <span class="font-medium">Mã nhóm:</span> {{ detail?.code }} -
          {{ detail?.department?.name }}
        </div>
        <div><span class="font-medium">Đề tài:</span> {{ detail?.project?.title }}</div>
        <div>
          <span class="font-medium">Trưởng nhóm:</span>
          {{ detail?.leader?.user?.fullname }} ({{ detail?.leader?.code }})
        </div>
        <div>
          <span class="font-medium">Thành viên:</span>
          <ul class="list-disc list-inside ml-2">
            <li
              v-for="member in detail?.status == 'create'
                ? detail?.student_attemp
                : detail.students"
              :key="member.id"
            >
              {{ member.user?.fullname }} ({{ member.code }})
            </li>
            <li v-if="detail?.status == 'rejected'">
              {{ detail?.leader?.user?.fullname }} ({{ detail?.leader?.code }})
            </li>
          </ul>
        </div>
        <!-- <div>
                    <span class="font-medium">Trạng thái:</span>
                    <span :class="statusClass(detail?.status)">{{ statusLabel(detail?.status) }}</span>
                </div> -->
        <div class="">
          <div class="flex flex-col gap-y-1">
            <label for="status" class="font-medium">Trạng thái</label>
            <MyInput
              class="w-full"
              id="status"
              type="select"
              v-model="update.status"
              :options="[
                { label: 'Đang tạo nhóm', value: 'create' },
                { label: 'Chờ duyệt', value: 'pending' },
                { label: 'Duyệt nhóm', value: 'approved' },
                {
                  label: 'Ghi danh đề tài ',
                  value: 'finding',
                },
                { label: 'Chấp nhận ghi danh ', value: 'success' },
                { label: 'Hủy nhóm ', value: 'rejected' },
              ]"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn trạng thái"
            />
          </div>
          <div
            v-if="['finding', 'success'].includes(update.status)"
            class="flex flex-col gap-y-1 mt-2"
          >
            <label for="project" class="font-medium">Đề tài</label>
            <MyInput
              class="w-full"
              id="project"
              type="select"
              v-model="updateProject.project"
              :options="projects"
              optionLabel="title"
              optionValue="id"
              placeholder="Chọn đề tài"
            />
          </div>
          <div v-if="update.status == 'success'" class="flex flex-col gap-y-1 mt-2">
            <label for="status" class="font-medium">Phân công giảng viên hướng dẫn</label>
            <MyInput
              class="w-full"
              id="status"
              type="select"
              v-model="updateTeacher.teacher"
              :options="teachers"
              optionLabel="fullname"
              optionValue="code"
              placeholder="Chọn giảng viên"
            />
          </div>
          <!-- assign reviewer and committee -->
          <div v-if="update.status == 'success'" class="flex flex-col gap-y-1 mt-2">
            <label for="status" class="font-medium">Phân công giảng viên phản biện</label>
            <MyInput
              class="w-full"
              id="status"
              type="select"
              v-model="updateReviewer"
              :options="teachers"
              optionLabel="fullname"
              optionValue="id"
              placeholder="Chọn giảng viên"
            />
          </div>
          <div v-if="update.status == 'success'" class="flex flex-col gap-y-1 mt-2">
            <label for="status" class="font-medium">Phân công hội đồng</label>
            <MyInput
              class="w-full"
              id="status"
              type="select"
              v-model="updateCommittee"
              :options="committees"
              optionLabel="name"
              optionValue="id"
              placeholder="Chọn hội đồng"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <Button label="Cập nhật" @click="handleUpdatStatus" />
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref, watch, onMounted, watchEffect } from 'vue'
import DataTableCustom from '@/components/list/DataTableCustom.vue'
import {
  useCommitteeStore,
  useDepartmentStore,
  useGroupStore,
  useProjectStore,
  useTeacherStore,
} from '@/stores/store'
import { Dialog, Button } from 'primevue'
import MyInput from '@/components/form/MyInput.vue'
import { showToast } from '@/utils/toast'

const groupStore = useGroupStore()
const departmentsStore = useDepartmentStore()

const showUpdate = ref(false)
const groups = ref([])
const departments = ref([])
const loading = ref(false)
const updateTeacher = ref({ teacher: '' })
const updateProject = ref({ project: '' })
const update = ref({ group_id: '', status: '' })
const filters = ref({ status: '', department_id: '', search: '', orderBy: 'asc' })

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

const handleUpdatStatus = async () => {
  if (update.value.group_id && update.value.status) {
    await groupStore.updateStatus(update.value.group_id, update.value.status)

    detail.value.status = update.value.status
  }
  if (updateProject.value.project) {
    await groupStore.registerProject(detail.value?.id, updateProject.value.project)
  }
  if (updateTeacher.value.teacher) {
    await groupStore.changTeacher({
      teacher_code: updateTeacher.value.teacher,
      groupId: detail.value?.id,
    })
  }
  if (updateReviewer.value) {
    await groupStore.assignReviewer({
      groupId: detail.value?.id,
      teacherId: updateReviewer.value,
    })
  }
  if (updateCommittee.value) {
    await groupStore.assignCommittee({
      groupId: detail.value?.id,
      committeeId: updateCommittee.value,
    })
  }
  await fetchGroup()
  reset()
}

const open = ref(false)
const detail = ref({})
const projectStore = useProjectStore()
const projects = ref()
// 1) onSelect gán thẳng data
const onSelect = async (data) => {
  if (data != null) {
    detail.value = data
    await teacherStore.fetchItems(1, null, null, { department_id: data?.department?.id })
    teachers.value = (teacherStore.items || []).map((teacher) => {
      const { user, position, department, created_at, updated_at, ...rest } = teacher
      return {
        ...rest,
        fullname: user.fullname,
      }
    })
    updateTeacher.value.teacher = data?.teacher?.code

    await projectStore.fetchItemsForStudent('public', data?.leader?.id)
    projects.value = projectStore.items.map((project) => {
      const { teacher, course, ...rest } = project
      return {
        ...rest,
      }
    })
    updateProject.value.project = data?.project?.id

    //Assign reviewer and committee
    await committeeStore.fetchItems()
    committees.value = committeeStore.items.filter(
      (committee) => committee?.department?.id === data?.department?.id
    )

    open.value = true
  }
}

// 2) reset chỉ clear modal, không chạm detail
const reset = () => {
  open.value = false
  showUpdate.value = false
  teachers.value = []
  updateTeacher.value.teacher = {}
}

// 3) watch detail để set update
watch(detail, (data) => {
  if (data != null) {
    update.value.group_id = data.id
    update.value.status = data.status
  }
})

// 4) watch update để bật nút

const teachers = ref()
const teacherStore = useTeacherStore()
// other logic…
onMounted(async () => {
  await departmentsStore.fetchItems()

  departments.value = departmentsStore.items
  teachers.value = teacherStore.items
  fetchGroup()
})
watch(filters, () => fetchGroup(), { deep: true })
watchEffect(() => {
  groups.value = groupStore.items
})

const lockData = ref({
  department_id: '',
  group_ids: [],
})

const handleLockData = async () => {
  if (lockData.value?.department_id) {
    const param = {
      department_id: lockData.value?.department_id,
    }
    await groupStore.lockGroup(param)
    await fetchGroup()
  } else {
    showToast('Vui lòng chọn khoa cần khóa nhóm hoặc khóa từng nhóm', 'info')
  }
}

const committeeStore = useCommitteeStore()
const committees = ref()
const updateReviewer = ref()
const updateCommittee = ref()
</script>

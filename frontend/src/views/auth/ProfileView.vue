<template>
  <div class="flex min-h-screen bg-transparent">
    <Card class="w-full">
      <template #title>
        <div class="w-full flex justify-between items-center pb-10">
          <h2 class="text-xl font-bold text-blue-800">Thông tin tài khoản</h2>
          <div class="flex gap-2">
            <Button
              label="Chỉnh sửa"
              icon="pi pi-pencil"
              class="btn-submit"
              @click="openEditForm"
            />
            <Button label="Đổi mật khẩu" icon="pi pi-key" @click="openPasswordForm" />
          </div>
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 gap-4">
          <!-- Personal Information -->
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h3>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Họ và tên:</label>
            <span>{{ authStore.user?.fullname || 'Chưa cập nhật' }}</span>
          </div>
          <!-- User info Teacher/Student-->
          <template v-if="authStore.user?.role === 'student'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Mã số sinh viên:</label>
              <span>{{ authStore.user?.username }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Khoa:</label>
              <span>{{ authStore.user?.student?.department?.name || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Ngành:</label>
              <span>{{ authStore.user?.student?.major?.name || 'Chưa cập nhật' }}</span>
            </div>
          </template>
          <template v-if="authStore.user?.role === 'teacher'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Học vị:</label>
              <span>{{ authStore.user?.teacher?.degree || 'Chưa cập nhật' }}</span>
            </div>
          </template>
          <!--  -->
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày sinh:</label>
            <span>{{
              dayjs(authStore.user?.birth_date).format('MM/DD/YYYY') || 'Chưa cập nhật'
            }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Địa chỉ:</label>
            <span>{{ authStore.user?.address || 'Chưa cập nhật' }}</span>
          </div>

          <!-- Contact Information -->
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Email:</label>
            <span>{{ authStore.user?.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Số điện thoại:</label>
            <span>{{ authStore.user?.phone || 'Chưa cập nhật' }}</span>
          </div>

          <!-- Account Information -->
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Vai trò:</label>
            <span>
              {{
                authStore.user?.role === 'student'
                  ? 'Sinh viên'
                  : authStore.user?.role === 'teacher'
                  ? 'Giảng viên'
                  : 'Quản trị viên'
              }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày tạo:</label>
            <span>{{ dayjs(authStore.user?.created_at).format('MM/DD/YYYY') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày cập nhật:</label>
            <span>{{ dayjs(authStore.user?.updated_at).format('MM/DD/YYYY') }}</span>
          </div>
        </div>
      </template>
    </Card>
  </div>
  <!-- Chinh sua thong tin user -->
  <MyDrawer
    class="w-full"
    title="thông tin cá nhân"
    v-model:visible="visibleEditUser"
    position="right"
    :closable="false"
    :isEditing="isEditing"
    :onCancel="cancelForm"
    :onSave="saveUser"
  >
    <div>
      <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
      <div class="grid md:grid gap-10">
        <MyInput v-model="user.email" title="Email" id="email" />
        <MyInput v-model="user.phone" title="Số điện thoại" id="phone" />
        <MyInput v-model="user.address" title="Địa chỉ" id="address" />
      </div>
    </div>
  </MyDrawer>
  <!-- Doi mat khau -->
  <MyDrawer
    class="w-full"
    title="mật khẩu"
    v-model:visible="visibleEditPassword"
    position="right"
    :closable="false"
    :isEditing="isEditing"
    :onCancel="cancelForm"
    :onSave="savePassword"
  >
    <div class="">
      <div class="grid md:grid gap-6 w-full">
        <MyInput
          v-model="password.oldPassword"
          title="Mật khẩu cũ"
          id="oldPassword"
          type="password"
        />
        <MyInput
          v-model="password.newPassword"
          title="Mật khẩu mới"
          id="newPassword"
          type="password"
        />
        <MyInput
          v-model="password.confirmPassword"
          title="Xác nhận mật khẩu mới"
          id="confirmPassword"
          type="password"
        />
      </div>
    </div>
  </MyDrawer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { Card, Button } from 'primevue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import MyInput from '@/components/form/MyInput.vue'
import { useUserStore } from '@/stores/store'
// Stores
const authStore = useAuthStore()
const userStore = useUserStore()
// Visible state
const visibleEditUser = ref(false)
const visibleEditPassword = ref(false)
const isEditing = ref(true)
// User data
const user = ref({
  email: '',
  phone: '',
  address: '',
})
// Password data
const password = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(() => {
  authStore.fetchUser()
})

const cancelForm = () => {
  visibleEditUser.value = false
  visibleEditPassword.value = false
}
const openEditForm = () => {
  if (authStore.user) {
    user.value = {
      email: authStore.user.email || '',
      phone: authStore.user.phone || '',
      address: authStore.user.address || '',
    }
  }
  visibleEditUser.value = true
}
const openPasswordForm = () => {
  password.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  visibleEditPassword.value = true
}
const saveUser = async () => {
  await userStore.updateItem(userId.value, user.value)
  await authStore.fetchUser()
  visibleEditUser.value = false
}
const savePassword = async () => {
  if (password.value.newPassword !== password.value.confirmPassword) {
    alert('Mật khẩu xác nhận không khớp')
    return
  }
  await authStore.updatePassword(password.value.oldPassword, password.value.newPassword)
  visibleEditPassword.value = false
}
</script>

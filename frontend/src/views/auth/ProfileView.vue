<template>
  <div class="flex min-h-screen bg-transparent">
    <Card class="w-full">
      <template #title>
        <div class="w-full flex justify-between items-center pb-10">
          <h2 class="text-xl font-bold text-blue-800">Thông tin tài khoản</h2>

        </div>
      </template>
      <template #content>
        <div class="w-full flex justify-center">
          <div class="w-1/5 flex justify-center items-center">
            <img v-if="authStore.user?.avatar" :src="authStore.user?.avatar" alt="Avatar"
              class="w-36 h-36 rounded-full object-cover" />
            <img v-else :src="'https://avatar.iran.liara.run/username?username=' + authStore.user?.fullname"
              alt="Default Avatar" class="w-36 h-36 rounded-full object-cover" />

          </div>

        </div>
        <div class="w-full flex justify-center">
          <h1 class="pt-5 text-5xl font-bold">{{ authStore.user?.fullname || 'Chưa cập nhật' }}</h1>

        </div>
        <div class="w-full flex justify-center my-10 ">
          <div class="flex gap-2">
            <Button label="Chỉnh sửa" icon="pi pi-pencil" class="btn-submit" @click="openEditForm" />
            <Button label="Đổi mật khẩu" icon="pi pi-key" @click="openPasswordForm" />
          </div>
        </div>
        <h3 class="text-lg my-10 font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h3>
        <div class="w-full grid grid-cols-2 gap-4">
          <!-- Personal Information -->

          <!-- User info Teacher/Student-->
          <template v-if="user?.role === 'student'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Mã số sinh viên:</label>
              <span>{{ authStore.user?.student?.code }}</span>
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
              <label class="font-semibold text-gray-700">Mã nhân viên:</label>
              <span>{{ authStore.user?.teacher?.code || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Học vị:</label>
              <span>{{ authStore.user?.teacher?.degree || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Khoa</label>
              <span>{{ authStore.user?.teacher?.department?.name || 'Chưa cập nhật' }}</span>
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

        </div>
        <h3 class="text-lg my-10 font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
        <div class="w-full grid grid-cols-2 gap-4"><!-- Contact Information -->

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
  <MyDrawer class="w-full" title="thông tin cá nhân" v-model:visible="visibleEditUser" position="right"
    :closable="false" :isEditing="isEditing" :onCancel="cancelForm" :onSave="saveUser">
    <div class="w-1/2">
      <h3 class="text-lg font-semibold mb-6">Thông tin cá nhân</h3>
      <div class="card flex flex-col items-center gap-6 my-10">
        <img v-if="src || authStore.user?.avatar" :src="src ?? authStore.user?.avatar" alt="Image"
          class="w-36 h-36 rounded-full object-cover" />
        <FileUpload mode="basic" @select="onFileSelect" customUpload auto severity="secondary"
          class="p-button-outlined" />
        <label for=""> Chọn ảnh đại diện</label>

      </div>
      <div class="grid md:grid gap-10">
        <MyInput v-model="user.email" title="Email" id="email" />
        <MyInput v-model="user.phone" title="Số điện thoại" id="phone" />
        <MyInput v-model="user.address" title="Địa chỉ" id="address" />
      </div>
    </div>
  </MyDrawer>
  <!-- Doi mat khau -->
  <MyDrawer class="w-full" title="mật khẩu" v-model:visible="visibleEditPassword" position="right" :closable="false"
    :isEditing="isEditing" :onCancel="cancelForm" :onSave="savePassword">
    <div class="">
      <div class="grid md:grid gap-6 w-full">
        <MyInput v-model="password.oldPassword" title="Mật khẩu cũ" id="oldPassword" type="password" />
        <MyInput v-model="password.newPassword" title="Mật khẩu mới" id="newPassword" type="password" />
        <MyInput v-model="password.confirmPassword" title="Xác nhận mật khẩu mới" id="confirmPassword"
          type="password" />
      </div>
    </div>
  </MyDrawer>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { Card, Button, FileUpload } from 'primevue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
import MyInput from '@/components/form/MyInput.vue'
import { useFileStore } from '@/stores/store'
import { useUserStore } from '@/stores/users'
// Stores
const authStore = useAuthStore()
const userStore = useUserStore()
const fileStore = useFileStore()
// Visible state
const visibleEditUser = ref(false)
const visibleEditPassword = ref(false)
const isEditing = ref(true)
const src = ref(null);
const file = ref(null);
// User data
const user = ref({
  email: '',
  phone: '',
  address: '',
  avatar: '',
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
  user.value = {
    email: '',
    phone: '',
    address: '',
    avatar: '',
  }
  password.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
  src.value = null;
  file.value = null;
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
  if (file.value) {
    if (authStore.user?.avatar) {
      await fileStore.deleteFileItem(authStore.user.avatar);
    }
    const url = await fileStore.uploadFile(file.value, 'avatar');
    user.value.avatar = url;
  }
  const userId = authStore.user?.id
  await userStore.updateItem(userId, user.value)
  await authStore.fetchUser();
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
async function onFileSelect(event) {
  const filedata = event.files[0];

  // Preview ảnh
  const reader = new FileReader();
  reader.onload = (e) => {
    src.value = e.target.result;
  };
  reader.readAsDataURL(filedata);
  file.value = filedata;
}
</script>

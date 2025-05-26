<template>
  <div class="card">
    <Menubar>
      <template #start>
        <router-link to="/">
          <img width="150" height="40" src="/assets/img/Logo_IUH.png" alt="logo" />
        </router-link>
      </template>
      <template #end>
        <div class="flex items-center gap-3">
          <!-- Desktop menu -->
          <div class="hidden md:flex items-center gap-2">
            <Button @click="router.push('/profile')" type="button" aria-label="Profile Menu"
              class="p-button-rounded p-button-text text-blue-800" :title="'Profile Menu'">
              <img v-if="authStore.user?.avatar" :src="authStore.user?.avatar" alt="User Avatar"
                class="w-8 h-8 rounded-full object-cover" />
              <h6 class="font-medium m-0">{{ authStore.user?.fullname }}</h6>
            </Button>
            <Button @click="handleLogout" severity="danger" variant="outlined" icon="pi pi-sign-out"
              aria-label="Logout"></Button>
          </div>
        </div>
      </template>
    </Menubar>
  </div>
  <div class="card">
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu }">
        <router-link v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
          <a v-ripple :href="href" v-bind="props.action" @click="navigate">
            <span>{{ item.label }}</span>
          </a>
        </router-link>
        <a v-else v-ripple :href="item.url" :target="item.target" v-bind="props.action">
          <span :class="item.icon" />
          <span>{{ item.label }}</span>
          <span v-if="hasSubmenu" class="pi pi-fw pi-angle-down" />
        </a>
      </template>
    </Menubar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Button, Menubar } from 'primevue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const items = ref([])
const router = useRouter()

onMounted(async () => {
  await authStore.fetchUser()
  const role = authStore.user?.role
  const is_master = authStore.user?.is_master
  if (role === 'admin') {
    items.value.push(
      is_master ? {
        label: 'Tài khoản',
        route: '/account-manangerment',
      } : {},
      {
        label: 'Sinh viên',
        route: '/student-manangerment',
      },
      {
        label: 'Giảng viên',
        route: '/teacher-manangerment',
      },
      {
        label: 'Học kỳ',
        route: '/course-manangerment',
      },
      {
        label: 'Đợt đăng ký',
        route: '/enrollment-sessions-manangerment',
      },
      {
        label: 'Nhóm đăng ký',
        route: '/group-manangerment-admin',
      },
      {
        label: 'Phiếu đánh giá',
        route: '/evaluation-form-manangerment',
      },
      {
        label: 'Khoa & Ngành',
        route: '/department-major-manangerment',
      },
      {
        label: 'Đề tài',
        route: '/project-manangerment',
      },
      { label: 'Hội đồng', route: '/committee-management' },
      { label: 'Điểm', route: '/score-admin' }
    )
  }

  if (role === 'teacher') {
    items.value.push(
      { label: 'Đề tài', route: '/teacher-project' },
      { label: 'Nhóm hướng dẫn', route: '/teacher-group-advisor' },
      { label: 'Chấm điểm', route: '/score' }
    )
  }

  if (role === 'student') {
    items.value.push(
      { label: 'Đề tài thực hiện', route: '/student-project-doing' },
      { label: 'Đề xuất đề tài', route: '/student-project' },
      { label: 'Đề tài đăng ký', route: '/student-project-public' },
      { label: 'Nhóm khóa luận', route: '/group-manangerment' },
      { label: 'Điểm', route: '/student-score' }
    )
  }
})
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

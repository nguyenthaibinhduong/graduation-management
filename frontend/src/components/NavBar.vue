<script setup>
import { useAuthStore } from '@/stores/auth'
import { Button, Badge, Menu } from 'primevue'
import { onMounted, ref } from 'vue'

// Trạng thái mở/đóng của các menu
const openMenus = ref({
  overview: false,
  fundamentals: false,
  techniques: false,
  security: false,
  graphql: false,
  websockets: false,
})

// Thêm trạng thái đóng/mở của navbar
const isNavbarOpen = ref(true)

// Thêm hàm toggle navbar
const toggleNavbar = () => {
  isNavbarOpen.value = !isNavbarOpen.value
  // Đóng tất cả các menu khi thu gọn navbar
  if (!isNavbarOpen.value) {
    Object.keys(openMenus.value).forEach((key) => {
      openMenus.value[key] = false
    })
  }
}

const authStore = useAuthStore()
const items = ref([])

onMounted(async () => {
  await authStore.fetchUser()
  const role = authStore.user?.role

  if (role === 'admin') {
    items.value.push({
      label: 'Giáo vụ',
      items: [
        {
          label: 'Tài khoản',
          to: '/account-manangerment',
        },
        {
          label: 'Sinh viên',
          to: '/student-manangerment',
        },
        {
          label: 'Giảng viên',
          to: '/teacher-manangerment',
        },
        {
          label: 'Học kỳ',
          to: '/course-manangerment',
        },
        {
          label: 'Đợt đăng ký',
          to: '/enrollment-sessions-manangerment',
        },
        {
          label: 'Nhóm đăng ký',
          to: '/group-manangerment-admin',
        },
        {
          label: 'Phiếu đánh giá',
          to: '/evaluation-form-manangerment',
        },
        {
          label: 'Khoa & Ngành',
          to: '/department-major-manangerment',
        },
        {
          label: 'Đề tài',
          to: '/project-manangerment',
        },
        { label: 'Hội đồng', to: '/committee-management' },
      ],
    })
  }

  if (role === 'teacher') {
    items.value.push({
      label: 'Giảng viên',
      items: [{ label: 'Đề tài', to: '/teacher-project' }],
    })
  }

  if (role === 'student') {
    items.value.push({
      label: 'Sinh viên',
      items: [
        { label: 'Đề tài thực hiện', to: '/student-project-doing' },
        { label: 'Đề xuất đề tài', to: '/student-project' },
        { label: 'Đề tài đăng ký', to: '/student-project-public' },
        { label: 'Nhóm khóa luận', to: '/group-manangerment' },
      ],
    })
  }
})
// const items = ref([
//   {
//     label: 'Giáo vụ',
//     items: [
//       {
//         label: 'Tài khoản',
//         to: '/account-manangerment'

//       },
//       {
//         label: 'Sinh viên',
//         to: '/student-manangerment'
//       },
//       {
//         label: 'Giảng viên',
//         to: '/teacher-manangerment'
//       },
//       {
//         label: 'Học kỳ',
//         to: '/course-manangerment'
//       },
//       {
//         label: 'Đợt đăng ký',
//         to: '/enrollment-sessions-manangerment'
//       },
//       {
//         label: 'Phiếu đánh giá',
//         to: '/evaluation-form-manangerment'
//       },
//       {
//         label: 'Khoa & Ngành',
//         to: '/department-major-manangerment'
//       },
//       {
//         label: 'Đề tài',
//         to: '/project-manangerment'
//       },
//     ]
//   },
//   {
//     label: 'Giảng viên',
//     items: [
//       {
//         label: 'Đề tài',
//         to: '/teacher-project'

//       }
//     ]
//   },
//   {
//     label: 'Sinh viên',
//     items: [
//       {
//         label: 'Đề tài',
//         to: '/student-project'

//       }
//     ]
//   }

// ]);
</script>

<template>
  <div class="relative bg-white" :class="{ 'w-[18vw]': isNavbarOpen, 'w-[0px]': !isNavbarOpen }">
    <!-- Nút toggle -->
    <Button severity="secondary" @click="toggleNavbar" :class="[
      'absolute -right-0 w-[38px] h-[38px] rounded-full top-5 flex items-center justify-center transition-all duration-300 hover:scale-110 text-blue-600',
      {
        'me-2': isNavbarOpen,
        'left-[20px] bg-blue-800 text-white': !isNavbarOpen,
      },
    ]">
      <i :class="isNavbarOpen ? 'pi pi-angle-left' : 'pi pi-bars'" class="text-xl"></i>
    </Button>

    <div class="h-[100%] min-h-[100vh] shadow-[0_0_20px_0_rgba(0,0,0,0.1)] py-5 z-100 pt-5 overflow-hidden">
      <img v-if="!isNavbarOpen" src="/assets/img/iuh_logo-rút gọn.png" alt="logo" class="w-full mt-[50px]" />

      <nav class="px-4">
        <!-- Logo section với animation -->
        <div class="overflow-hidden">
          <router-link to="/" class="block text-3xl font-bold transition-all duration-300 mt-5">
            <img v-if="isNavbarOpen" src="/assets/img/iuh_logo chính thức.png" alt="logo" class="w-full" />
          </router-link>
        </div>
        <div v-if="isNavbarOpen" class="w-full flex justify-center">
          <Menu :model="items" class="w-full">
            <template #item="{ item }">
              <router-link v-ripple :to="item.to" class="flex items-center px-2 py-2 cursor-pointer group">
                <span :class="[item.icon, 'text-primary group-hover:text-inherit']" />
                <span :class="['ml-2', { 'font-semibold': item.items }]">{{ item.label }}</span>
                <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
                <span v-if="item.shortcut"
                  class="ml-auto border border-surface rounded bg-emphasis text-muted-color text-xs p-1">
                  {{ item.shortcut }}
                </span>
              </router-link>
            </template>
          </Menu>
        </div>
      </nav>
    </div>
  </div>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateX(-10px);
}

.slide-enter-to,
.slide-leave-from {
  max-height: 400px;
  opacity: 1;
  transform: translateX(0);
}

.relative {
  transition: width 0.4s ease-in-out;
}

/* Thêm hiệu ứng ripple cho các nút */
a {
  position: relative;
  overflow: hidden;
}

a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #000 10%, transparent 10.01%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: transform 0.5s, opacity 1s;
}

a:active::after {
  transform: scale(0, 0);
  opacity: 0.2;
  transition: 0s;
}

/* Animation cho logo */
router-link {
  transition: all 0.3s ease-in-out;
}
</style>

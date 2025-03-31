<script setup>
import { Button } from 'primevue';
import { ref } from 'vue';

// Trạng thái mở/đóng của các menu
const openMenus = ref({
  overview: false,
  fundamentals: false,
  techniques: false,
  security: false,
  graphql: false,
  websockets: false,
});

// Thêm trạng thái đóng/mở của navbar
const isNavbarOpen = ref(true);

// Hàm toggle menu với khả năng mở rộng navbar
const toggleMenu = (menu) => {
  if (!isNavbarOpen.value) {
    isNavbarOpen.value = true;
    // Đợi một chút để navbar mở ra trước khi mở submenu
    setTimeout(() => {
      openMenus.value[menu] = true;
    }, 300);
  } else {
    openMenus.value[menu] = !openMenus.value[menu];
  }
};

// Thêm hàm toggle navbar
const toggleNavbar = () => {
  isNavbarOpen.value = !isNavbarOpen.value;
  // Đóng tất cả các menu khi thu gọn navbar
  if (!isNavbarOpen.value) {
    Object.keys(openMenus.value).forEach(key => {
      openMenus.value[key] = false;
    });
  }
};

</script>

<template>
  <div class="relative " :class="{ 'w-[250px]': isNavbarOpen, 'w-[50px]': !isNavbarOpen }">
    <!-- Nút toggle -->
    <Button severity="secondary" @click="toggleNavbar" :class="[
      'absolute -right-0 w-[38px] h-[38px] rounded-full top-5 flex items-center justify-center transition-all duration-300 hover:scale-110 text-blue-600',
      {
        'me-2': isNavbarOpen,
        'me-1': !isNavbarOpen
      }
    ]">
      <i :class="isNavbarOpen ? 'pi pi-angle-left' : 'pi pi-angle-right'" class="text-xl"></i>
    </Button>

    <div class="min-h-[100vh] shadow-[0_0_20px_0_rgba(0,0,0,0.1)] py-5  z-100 pt-5 overflow-hidden">
      <img v-if="!isNavbarOpen" src="/assets/img/iuh_logo-rút gọn.png" alt="logo" class="w-full  mt-[50px]">

      <nav class="px-4">
        <!-- Logo section với animation -->
        <div class=" overflow-hidden">
          <router-link to="/" class="block text-3xl font-bold transition-all duration-300  mt-5">
            <img v-if="isNavbarOpen" src="/assets/img/iuh_logo chính thức.png" alt="logo" class="w-full">

          </router-link>
        </div>

        <!-- Menu mở rộng -->
        <ul v-if="isNavbarOpen" class="text-xs mt-5">
          <li class="mb-2">
            <a href="#" @click.prevent="toggleMenu('overview')"
              class="flex justify-between items-center font-bold cursor-pointer p-3 rounded-lg  transition-all duration-300"
              :class="{ 'text-blue-500': openMenus.overview }">
              <div class="flex items-center gap-3 text-blue-500">
                <i class="pi pi-users "></i>
                <span>NGƯỜI DÙNG</span>
              </div>
              <i :class="openMenus.overview ? 'pi pi-angle-up' : 'pi pi-angle-down'"
                class="transition-transform duration-300"></i>
            </a>

            <transition name="slide">
              <ul v-if="true" class=" w-full mt-2 space-y-1 list-none">
                <li class="pl-4 border-l-2 border-blue-500 hover:text-blue-500 "
                  :class="{ 'border-l-2 border-transparent': $route.path !== '/' }">
                  <router-link to="/"
                    class="flex items-center gap-2 p-2   transition-all duration-300 text-gray-600 hover:text-blue-600">
                    <span>Tài khoản</span>
                  </router-link>

                </li>
                <li class="pl-4 border-l-2 border-blue-500 hover:text-blue-500 "
                  :class="{ 'border-l-2 border-transparent': $route.path !== '/student' }">
                  <router-link to="/student"
                    class="flex items-center gap-2 p-2   transition-all duration-300 text-gray-600 hover:text-blue-600">
                    <span>Sinh viên</span>
                  </router-link>

                </li>
                <li class="pl-4 border-l-2 border-blue-500 hover:text-blue-500 "
                  :class="{ 'border-l-2 border-transparent': $route.path !== '/teacher' }">
                  <router-link to="/teacher"
                    class="flex items-center gap-2 p-2   transition-all duration-300 text-gray-600 hover:text-blue-600">
                    <span>Giảng viên</span>
                  </router-link>

                </li>
              </ul>
            </transition>
          </li>

          <li class="mb-2">
            <a href="#" @click.prevent="toggleMenu('fundamentals')"
              class="flex justify-between items-center font-bold cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-all duration-300"
              :class="{ 'bg-blue-50': openMenus.fundamentals }">
              <div class="flex items-center gap-3">
                <i class="pi pi-book text-blue-500"></i>
                <span>FUNDAMENTALS</span>
              </div>
              <i :class="openMenus.fundamentals ? 'pi pi-angle-up' : 'pi pi-angle-down'"
                class="transition-transform duration-300"></i>
            </a>
          </li>
        </ul>

        <!-- Menu thu gọn -->
        <ul v-else class="flex flex-col items-center gap-y-4 mt-4">
          <li>
            <a href="#" @click.prevent="toggleMenu('overview')"
              class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-all duration-300 group"
              :class="{ 'bg-blue-50': openMenus.overview }">
              <i class="pi pi-users text-xl text-gray-600 group-hover:text-blue-500 transition-colors"></i>
            </a>
          </li>
          <li>
            <a href="#" @click.prevent="toggleMenu('fundamentals')"
              class="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-blue-50 transition-all duration-300 group"
              :class="{ 'bg-blue-50': openMenus.fundamentals }">
              <i class="pi pi-book text-xl text-gray-600 group-hover:text-blue-500 transition-colors"></i>
            </a>
          </li>
        </ul>
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
  transition: transform .5s, opacity 1s;
}

a:active::after {
  transform: scale(0, 0);
  opacity: .2;
  transition: 0s;
}

/* Animation cho logo */
router-link {
  transition: all 0.3s ease-in-out;
}
</style>

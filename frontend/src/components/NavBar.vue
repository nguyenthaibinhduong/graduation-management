<script setup>
import { ref } from 'vue';
import SwitchMode from './SwitchMode.vue';

// Trạng thái mở/đóng của các menu
const openMenus = ref({
  overview: false,
  fundamentals: false,
  techniques: false,
  security: false,
  graphql: false,
  websockets: false,
});

// Hàm toggle menu
const toggleMenu = (menu) => {
  openMenus.value[menu] = !openMenus.value[menu];
};
</script>

<template>
  <div class="w-full min-h-screen shadow-lg z-100 pt-5">

    <!-- Navigation Menu -->
    <nav class="px-4">
    <div class="w-2/3 mx-auto h-[80px] "><router-link to="/" class="text-3xl font-bold text-blue-600 py-5 "><h1 class="text-center">My Logo</h1></router-link></div>
    
  
      <ul>

        <!-- Overview (Có danh mục con) -->
        <li class="py-3 text-[1.1rem]">
          <a href="#" @click.prevent="toggleMenu('overview')" class="flex justify-between items-center font-bold cursor-pointer">
            OVERVIEW
            <i :class="openMenus.overview ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>

          <!-- Transition cho hiệu ứng slide -->
          <transition name="slide">
            <ul v-if="openMenus.overview" class="pl-4 mt-2 space-y-2">
              <li><a href="#" class="hover:text-red-500">First steps</a></li>
              <li><a href="#" class="hover:text-red-500">Controllers</a></li>
              <li><a href="#" class="hover:text-red-500">Providers</a></li>
              <li><a href="#" class="hover:text-red-500">Modules</a></li>
              <li><a href="#" class="hover:text-red-500">Middleware</a></li>
              <li><a href="#" class="hover:text-red-500">Exception filters</a></li>
              <li><a href="#" class="hover:text-red-500">Pipes</a></li>
              <li><a href="#" class="hover:text-red-500">Guards</a></li>
              <li><a href="#" class="hover:text-red-500">Interceptors</a></li>
              <li><a href="#" class="hover:text-red-500">Custom decorators</a></li>
            </ul>
          </transition>
        </li>

        <!-- Các menu khác -->
        <li class="py-3 text-[1.1rem]">
          <a href="#" @click.prevent="toggleMenu('fundamentals')" class="flex justify-between items-center font-bold cursor-pointer">
            FUNDAMENTALS
            <i :class="openMenus.fundamentals ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>
        </li>

       
      </ul>
    </nav>
  </div>
</template>

<style>
/* Hiệu ứng slide down */
.slide-enter-active, .slide-leave-active {
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  overflow: hidden;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to, .slide-leave-from {
  max-height: 300px; /* Giá trị lớn hơn để đảm bảo menu hiển thị đủ */
  opacity: 1;
}
</style>

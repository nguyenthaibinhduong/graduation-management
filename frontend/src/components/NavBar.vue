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
  <div class="w-full p-3">
    <!-- Logo -->
    <div class="flex justify-center py-4">
      <i class="pi fas fa-hamburger text-3xl"></i>
    </div>

    <!-- Navigation Menu -->
    <nav class="px-4">
     <SwitchMode />
      <ul>
        <!-- Introduction -->
        <li class="py-2">
          <a href="#" class="font-bold">INTRODUCTION</a>
        </li>

        <!-- Overview (Có danh mục con) -->
        <li class="py-2">
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
        <li class="py-2">
          <a href="#" @click.prevent="toggleMenu('fundamentals')" class="flex justify-between items-center font-bold cursor-pointer">
            FUNDAMENTALS
            <i :class="openMenus.fundamentals ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>
        </li>

        <li class="py-2">
          <a href="#" @click.prevent="toggleMenu('techniques')" class="flex justify-between items-center font-bold cursor-pointer">
            TECHNIQUES
            <i :class="openMenus.techniques ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>
        </li>

        <li class="py-2">
          <a href="#" @click.prevent="toggleMenu('security')" class="flex justify-between items-center font-bold cursor-pointer">
            SECURITY
            <i :class="openMenus.security ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>
        </li>

        <li class="py-2">
          <a href="#" @click.prevent="toggleMenu('graphql')" class="flex justify-between items-center font-bold cursor-pointer">
            GRAPHQL
            <i :class="openMenus.graphql ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
          </a>
        </li>

        <li class="py-2">
          <a href="#" @click.prevent="toggleMenu('websockets')" class="flex justify-between items-center font-bold cursor-pointer">
            WEBSOCKETS
            <i :class="openMenus.websockets ? 'pi pi-angle-up' : 'pi pi-angle-down'"></i>
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

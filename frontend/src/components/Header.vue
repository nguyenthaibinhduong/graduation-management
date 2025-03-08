<template>
  <header class="z-50 w-full">
    <nav class="w-full flex items-center justify-between py-4 px-6">
      <!-- Logo -->

      <SwitchMode />

      <!-- Menu Items (Desktop) -->
      <ul class="hidden md:flex space-x-6 items-center">
        <li><router-link to="/" class="hover:text-blue-600">User</router-link></li>
        <li>
          <router-link to="/student" class="hover:text-blue-600">Student</router-link>
        </li>
        <li>
          <router-link to="/teacher" class="hover:text-blue-600">Teacher</router-link>
        </li>

        <li>
          <Button
            v-if="checkAuth"
            v-on:click="handleLogout"
            label="Đăng xuất"
            severity="danger"
            class="text-white"
          />
        </li>
      </ul>

      <!-- Mobile Menu Button -->
      <button @click="toggleMenu" class="md:hidden">
        <svg
          v-if="!isOpen"
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
        <svg
          v-else
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </nav>

    <!-- Mobile Menu (Dropdown) -->
    <div v-if="isOpen" class="md:hidden bg-white shadow-md">
      <ul class="text-gray-700 text-center py-2">
        <li class="py-2"><router-link to="/" @click="toggleMenu">Home</router-link></li>
        <li class="py-2">
          <router-link to="/about" @click="toggleMenu">About</router-link>
        </li>
        <li class="py-2">
          <router-link to="/services" @click="toggleMenu">Services</router-link>
        </li>
        <li class="py-2">
          <router-link to="/contact" @click="toggleMenu">Contact</router-link>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { Button } from "primevue";
import { ref } from "vue";
import SwitchMode from "./SwitchMode.vue";

const isOpen = ref(false);
const errorMessage = ref("");
const authStore = useAuthStore();
const checkAuth = ref(
  authStore.isAuthenticated || localStorage.getItem("isAuthenticated")
);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
  } catch (error) {
    errorMessage.value = "Đăng xuất thất bại !";
  }
};
</script>

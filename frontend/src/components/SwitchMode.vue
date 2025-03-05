<script setup>
import { ref, onMounted } from "vue";

// Biến reactive để lưu trạng thái Dark Mode
const isDarkMode = ref(false);

// Danh sách các theme sáng và tối của PrimeVue
const lightTheme = "lara-light-blue";
const darkTheme = "lara-dark-blue";

// Hàm chuyển đổi Light/Dark Mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  const theme = isDarkMode.value ? darkTheme : lightTheme;
  
  // Thay đổi file CSS của PrimeVue
  changeTheme(theme);
  
  // Lưu trạng thái vào localStorage
  localStorage.setItem("theme", theme);
};

// Hàm thay đổi theme
const changeTheme = (theme) => {
  const link = document.querySelector("link[href*='theme.css']");
  if (link) {
    link.href = `https://unpkg.com/primevue/resources/themes/${theme}/theme.css`;
  }
};

// Kiểm tra trạng thái đã lưu khi tải trang
onMounted(() => {
  const savedTheme = localStorage.getItem("theme") || lightTheme;
  isDarkMode.value = savedTheme === darkTheme;
  changeTheme(savedTheme);
});
</script>

<template>
  <div class="p-5 flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Light / Dark Mode với PrimeVue</h1>

    <Button @click="toggleDarkMode" class="mt-4">
      <i :class="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'" class="mr-2"></i>
      {{ isDarkMode ? "Light Mode" : "Dark Mode" }}
    </Button>
  </div>
</template>

<style>
/* Chuyển đổi màu mượt mà */
html {
  transition: background-color 0.3s, color 0.3s;
}
</style>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-[24rem] shadow-lg">
      <template #title>
        <h2 class="text-center text-2xl font-semibold py-4">Đăng nhập</h2>
      </template>

      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <FloatLabel class="mb-3">
            <label for="username">Tên đăng nhập</label>
            <InputText id="username" v-model="username" type="username" required class="w-full" />
          </FloatLabel>
          <FloatLabel class="mb-3">
            <label for="password">Mật khẩu</label>
            <InputText id="password" v-model="password" type="password" required class="w-full" />
          </FloatLabel>

          <Button type="submit" label="Đăng nhập" />
        </form>
        <p v-if="errorMessage" class="text-red-600 text-sm text-center mt-2">
          {{ errorMessage }}
        </p>
      </template>
    </Card>
  </div>

</template>
<script setup>
import { useAuthStore } from "@/stores/auth";
import { Card, Button, InputText, FloatLabel } from "primevue";
import { ref } from "vue";
import { useRouter } from "vue-router";
const username = ref("");
const password = ref("");
const errorMessage = ref("");
const authStore = useAuthStore();
const router = useRouter();


const handleLogin = async () => {
  try {
    await authStore.login(username.value, password.value);
    router.push("/student");
  } catch (error) {
    errorMessage.value = "Email hoặc mật khẩu không đúng!";
  }
};
</script>

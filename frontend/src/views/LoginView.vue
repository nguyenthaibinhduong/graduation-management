<template>
  <div class="flex items-center justify-center min-h-screen">
    <Card class="w-[24rem] shadow-lg">
      <template #title>
        <h2 class="text-center text-xl font-semibold">Đăng nhập</h2>
      </template>

      <template #content>
        <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
          <InputText 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            required 
            class="w-full"
          />
           <InputText 
            v-model="password" 
            type="password" 
            placeholder="Mật khẩu" 
            required 
            class="w-full"
          />
          <Button 
            type="submit" 
            label="Đăng nhập"
          />
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
  import { Card, Button,InputText} from "primevue";
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  const email = ref("");
  const password = ref("");
  const errorMessage = ref("");
  const authStore = useAuthStore();
  const router = useRouter();
    
    
  const handleLogin = async () => {
      try {
        // console.log(email.value, password.value);
        await authStore.login(email.value, password.value);
       router.push("/student");
      } catch (error) {
        errorMessage.value = "Email hoặc mật khẩu không đúng!";
      }
  };
</script>




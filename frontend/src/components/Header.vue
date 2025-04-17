<template>
  <div class="z-50 w-full  border-b-[1.5px] border-gray-100 ">
    <nav class="w-full flex items-center justify-end px-6 py-2 ">
      <!-- Left side with logo/switch -->


      <!-- Right side with user profile -->
      <div class="flex items-center gap-3">
        <!-- Desktop menu -->
        <div class="hidden md:flex items-center gap-2">
          <Menu ref="profileMenu" :model="menuItems" :popup="true" />


          <Button type="button" @click="toggleProfileMenu" aria-label="Profile Menu"
            class="p-button-rounded p-button-text text-blue-800" v-tooltip.bottom="'Profile Menu'">
            <img v-if="avatar" :src="avatar" alt="User Avatar" class="w-8 h-8 rounded-full object-cover" />
            <h6 class="font-medium m-0">{{ userName }}</h6>
          </Button>
        </div>

        <!-- Mobile menu button -->
        <button @click="toggleMobileMenu" class="md:hidden p-2">
          <i :class="['pi text-xl', isOpen ? 'pi-times' : 'pi-bars']"></i>
        </button>
      </div>
    </nav>

    <!-- Mobile menu dropdown -->
    <div v-if="isOpen" class="md:hidden bg-white dark:bg-gray-800 shadow-md">
      <!-- User info in mobile menu -->
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-full">
            <i class="pi pi-user text-primary"></i>
          </div>
          <div>
            <h6 class="font-medium m-0">{{ userName }}</h6>
            <p class="text-xs text-gray-500 dark:text-gray-400 m-0">{{ userEmail }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation items -->
      <ul class="text-gray-700 dark:text-gray-300 py-2">
        <li v-for="(group, groupIndex) in navigationGroups" :key="`group-${groupIndex}`">
          <div v-if="group.separator" class="my-2 border-t border-gray-200 dark:border-gray-700"></div>
          <div v-else>
            <div v-if="group.label" class="px-4 py-1 text-xs text-gray-500 dark:text-gray-400">
              {{ group.label }}
            </div>
            <div v-if="group.items">
              <div v-for="(item, itemIndex) in group.items" :key="`item-${itemIndex}`"
                class="py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                @click="navigateTo(item)">
                <i v-if="item.icon" :class="['pi', item.icon]"></i>
                <span>{{ item.label }}</span>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>

</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from 'vue-router';
import Menu from 'primevue/menu';
import Button from 'primevue/button';

// State
const isOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const profileMenu = ref(null);
const windowWidth = ref(window.innerWidth);
onMounted(() => {
  authStore.fetchUser();
});

const userName = computed(() => authStore.user?.fullname || 'User');
const avatar = computed(() => authStore.user?.avatar || 'https://avatar.iran.liara.run/username?username=' + authStore.user?.fullname);

// Create unified navigation items
const menuItems = ref([
  {
    label: 'Navigation',
    items: [
      {
        label: 'Thông tin cá nhân',
        icon: 'pi pi-user',
        command: () => navigateTo({ path: '/profile' })
      },
    ]
  },
  {
    separator: true
  },
  {
    label: 'Account',
    items: [
      {
        label: 'Đăng xuất ',
        icon: 'pi pi-sign-out',
        command: () => handleLogout()
      }
    ]
  }
]);

// Used for mobile menu rendering
const navigationGroups = computed(() => menuItems.value);

// Methods
const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

const toggleProfileMenu = (event) => {
  profileMenu.value.toggle(event);
};

const toggleMobileMenu = () => {
  isOpen.value = !isOpen.value;
};

const navigateTo = (item) => {
  if (item.path) {
    router.push(item.path);
  } else if (item.command) {
    item.command();
  }

  // Close menus
  if (profileMenu.value) {
    profileMenu.value.hide();
  }
  isOpen.value = false;
};

// Lifecycle hooks
onMounted(() => {
  const handleResize = () => {
    windowWidth.value = window.innerWidth;
    if (windowWidth.value >= 768) {
      isOpen.value = false;
    }
  };

  window.addEventListener('resize', handleResize);

  // Clean up
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
});
</script>

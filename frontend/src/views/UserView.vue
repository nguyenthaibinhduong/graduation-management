
<template>
   <DataTableCustom
      title="Danh sách Tài Khoản"
      :data="users"
      :columns="[
        { field: 'email', header: 'Email', sortable: true },
        { field: 'role', header: 'Vai trò', sortable: true },
      ]"
      :total="userStore?.total"
      :loading="loading"
      @fetch="fetchUser"
      @add="addUser"
      @edit="editUser"
      @delete="deleteUser"
    />
  <Drawer class="w-2/5" v-model:visible="visibleLeft" :header="isEditing?'Sửa giảng viên':'Thêm giảng viên'" position="right">
    <div class="grid grid-cols-1 gap-5 w-full">
      <div class="p-field mb-2 mt-2">
        <div class="flex flex-col gap-2">
          <label for="name">Email</label>
          <InputText class="w-full" id="name" v-model="newUser.email" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="password">Mật khẩu</label>
          <InputText class="w-full" id="password" v-model="newUser.password" />
        </div>
      </div>
      <div class="p-field mb-2">
        <div class="flex flex-col gap-2">
          <label for="role">Vai trò</label>
          <InputText class="w-full" id="role" v-model="newUser.role" />
        </div>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-2 mt-10">
      <Button label="Lưu"  @click="saveUser" class="w-full" />
      <Button label="Hủy"  @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>


</template>
  <script setup>
  import { ref, onMounted, watchEffect, watch } from 'vue';
  import { Button, Drawer ,InputText, DatePicker} from 'primevue';
  import { useUserStore } from '@/stores/users';
  import DataTableCustom from '@/components/DataTableCustom.vue';


  const visibleLeft = ref(false);
  const userStore = useUserStore();
  const users = ref([]);
  const loading = ref(false);
  const isEditing = ref(false);
  const editedUserId = ref(null);
  const newUser = ref({ name: '', email: '', role : ''});

  onMounted(() => userStore.fetchItems());
  watchEffect(() => {
    users.value = userStore.items
  });

  const fetchUser = async (newPage, newLimit, newSearch) => {
    await userStore.fetchItems(
      newSearch ? 1 : newPage,
      newSearch ? userStore.total : newLimit,
      newSearch
    );
  }
  const addUser = () => {
    visibleLeft.value = true;
  }
  const saveUser = async () => {
    if (isEditing.value) {
      await userStore.updateItem(editedUserId.value, newUser.value);
    } else {
      await userStore.addItem(newUser.value);
    }
    cancelForm();
};

  const deleteUser = async (id) => {
    await userStore.deleteItem(id);
  }

  const editUser = (user) => {
    editedUserId.value = user.id;
    newUser.value = { ...user };
    isEditing.value = true;
    visibleLeft.value = true;
  };

  const cancelForm = () => {
    visibleLeft.value = false;
    isEditing.value = false;
    editedUserId.value = null;
    Object.keys(newUser.value).forEach((key) => (newUser.value[key] = ''));
  };

  watch(visibleLeft, (newVal) => {
  if (newVal==false) {
    cancelForm();
    }
  });

</script>



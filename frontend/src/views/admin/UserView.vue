<template>
  <DataTableCustom :block="['selectAll', 'import']" title="Danh sách Tài Khoản" :data="users" :columns="optionColumn"
    :total="userStore?.total" :loading="loading" @fetch="fetchUser" @add="addUser" @edit="editUser" @delete="deleteUser"
    @rowSelect="getDetail" @export="exportData" />
  <Drawer class="w-2/5" v-model:visible="visibleLeft" :header="isEditing ? 'Sửa tài khoản' : 'Thêm tài khoản'"
    position="right">
    <div class="grid grid-cols-1 gap-5 w-full">
      <div class="p-field mb-2 mt-2">
        <div class="flex flex-col gap-2">
          <label for="name">Tài khoản </label>
          <InputText class="w-full" id="name" v-model="newUser.username" />
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
          <MyInput type="select" class="w-full" id="role" v-model="newUser.role" :options="optionRole"
            optionLabel="label" optionValue="id" />
        </div>
      </div>
    </div>
    <div class="w-full grid grid-cols-2 gap-2 mt-10">
      <Button label="Lưu" @click="saveUser" class="w-full" />
      <Button label="Hủy" @click="cancelForm" class="w-full bg-red-500 text-white border-red-500" />
    </div>
  </Drawer>
</template>
<script setup>
import { ref, onMounted, watchEffect, watch } from "vue";
import { Button, Drawer, InputText } from "primevue";
import { useUserStore } from "@/stores/store";
import DataTableCustom from "@/components/list/DataTableCustom.vue";
import { useRouter } from "vue-router";
import { useExcelStore } from "@/stores/excel";
import MyInput from "@/components/form/MyInput.vue";
import { showToast } from "@/utils/toast";

const visibleLeft = ref(false);
const userStore = useUserStore();
const users = ref([]);
const loading = ref(false);
const isEditing = ref(false);
const editedUserId = ref(null);
const optionRole = ref([
  { id: 'student', label: "Sinh viên" },
  { id: 'teacher', label: "Giảng viên" },
  { id: 'admin', label: "Giáo vụ - Admin" },

]);
const optionColumn = ref([
  { field: "username", header: "Tên tài khoản", sortable: true },
  { field: "fullname", header: "Tên người dùng", sortable: true },
  { field: "phone", header: "Số điện thoại", sortable: true },
  {
    field: "role",
    header: "Vai trò",
    type: "status",
    sortable: true,
    statuses: [
      { value: "student", label: "Sinh viên", class: "bg-blue-100 text-blue-700" },
      {
        value: "teacher",
        label: "Giảng viên",
        class: "bg-yellow-100 text-yellow-700",
      },
      { value: "approve", label: "Đã duyệt", class: "bg-green-100 text-green-700" },
      {
        value: "admin",
        label: "Giáo vụ - Admin",
        class: "bg-violet-100 text-violet-700",
      },
    ],
  },
]);
const newUser = ref({ username: "", password: "", role: "" });

onMounted(async () => {
  await userStore.fetchItems()
});
watchEffect(() => {
  users.value = userStore.items;
});

const fetchUser = async (newPage, newLimit, newSearch) => {
  await userStore.fetchItems(
    newSearch ? 1 : newPage,
    newSearch ? userStore.total : newLimit,
    newSearch
  );
};
const addUser = () => {
  visibleLeft.value = true;
};
const saveUser = async () => {
  if (!newUser.value.username || !newUser.value.password || !newUser.value.role) {
    showToast("error", "Vui lòng điền đầy đủ thông tin");
    return;
  }
  if (isEditing.value && editedUserId.value === null) {
    showToast("error", "Không tìm thấy ID người dùng để cập nhật");
    return;
  }

  if (newUser.value.role === "") {
    showToast("error", "Vui lòng chọn vai trò");
    return;
  }
  if (newUser.value.username.length < 6) {
    showToast("error", "Tên tài khoản phải có ít nhất 6 ký tự");
    return;
  }
  if (newUser.value.password.length < 6) {
    showToast("error", "Mật khẩu phải có ít nhất 6 ký tự");
    return;
  }
  if (newUser.value.username.length > 20) {
    showToast("error", "Tên tài khoản không được vượt quá 20 ký tự");
    return;
  }
  if (newUser.value.password.length > 20) {
    showToast("error", "Mật khẩu không được vượt quá 20 ký tự");
    return;
  }
  if (newUser.value.username.includes(" ")) {
    showToast("error", "Tên tài khoản không được chứa khoảng trắng");
    return;
  }
  if (newUser.value.password.includes(" ")) {
    showToast("error", "Mật khẩu không được chứa khoảng trắng");
    return;
  }
  if (newUser.value.username.includes("@")) {
    showToast("error", "Tên tài khoản không được chứa ký tự '@'");
    return;
  }
  if (newUser.value.password.includes("@")) {
    showToast("error", "Mật khẩu không được chứa ký tự '@'");
    return;
  }
  if (newUser.value.username.includes("!")) {
    showToast("error", "Tên tài khoản không được chứa ký tự '!'");
    return;
  }
  if (newUser.value.password.includes("!")) {
    showToast("error", "Mật khẩu không được chứa ký tự '!'");
    return;
  }
  if (newUser.value.username.includes("#")) {
    showToast("error", "Tên tài khoản không được chứa ký tự '#'");
    return;
  }
  if (newUser.value.password.includes("#")) {
    showToast("error", "Mật khẩu không được chứa ký tự '#'");
    return;
  }
  if (newUser.value.username.includes("$")) {
    showToast("error", "Tên tài khoản không được chứa ký tự '$'");
    return;
  }
  if (newUser.value.password.includes("$")) {
    showToast("error", "Mật khẩu không được chứa ký tự '$'");
    return;
  }
  if (newUser.value.username.includes("%")) {
    showToast("error", "Tên tài khoản không được chứa ký tự '%'");
    return;
  }
  if (isEditing.value) {
    await userStore.updateItem(editedUserId.value, newUser.value);
  } else {
    await userStore.addItem(newUser.value);
  }
  cancelForm();
};

const deleteUser = async (id) => {
  await userStore.deleteItem(id);
};

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
  Object.keys(newUser.value).forEach((key) => (newUser.value[key] = ""));
};

watch(visibleLeft, (newVal) => {
  if (newVal == false) {
    cancelForm();
  }
});

const router = useRouter();
const getDetail = (data) => {
  if (data?.id) router.push(`/user-detail/${data?.id}`);
};

// ============================== XU LY EXPORT - IMPORT ==============================/ /

const excelStore = useExcelStore();

// EXPORT THEO COLUMN CỦA BẢNG
const exportData = () => {
  excelStore.exportToExcel({
    data: users.value,
    columns: optionColumn.value,
    fileName: "DanhSachTaiKhoan.xlsx",
  });
};
</script>

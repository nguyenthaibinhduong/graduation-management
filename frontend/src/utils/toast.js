import { useToast } from "primevue/usetoast";

let toastInstance = null;

export const initToast = (toast) => {
  toastInstance = toast;
};

export const showToast = (message, severity = "success", life = 3000) => {
  if (toastInstance) {
    toastInstance.add({
      severity, // "success", "info", "warn", "error"
      summary: severity ,
      detail: message,
      life,
    });
  } else {
    console.error("Toast chưa được khởi tạo!");
  }
};

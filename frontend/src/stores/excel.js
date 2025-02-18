import { defineStore } from "pinia";
import * as XLSX from "xlsx";

export const useExcelStore = defineStore("excel", {
  state: () => ({
    excelData: [],
    errors: [],
  }),

  actions: {
    // Xử lý tải file Excel lên
    handleFileUpload(event, fieldMappings, validators) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryString = e.target.result;
        const workbook = XLSX.read(binaryString, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        this.processData(jsonData, fieldMappings, validators);
      };
      reader.readAsBinaryString(file);
    },

    // Xử lý dữ liệu dựa trên fieldMappings & validators
    processData(jsonData, fieldMappings, validators) {
      this.errors = []; // Reset lỗi

      const rawData = jsonData.slice(1);
      this.excelData = rawData.map((row, index) => {
        let item = {};

        // Ánh xạ dữ liệu
        Object.keys(fieldMappings).forEach((key, i) => {
          item[key] = fieldMappings[key](row[i]);
        });

        // Kiểm tra dữ liệu
        Object.keys(validators).forEach((key) => {
          const errorMessage = validators[key](item[key]);
          if (errorMessage) {
            this.errors.push(`Row ${index + 1}: ${errorMessage}`);
          }
        });

        return item;
      });
    },

    // Chuyển đổi ngày tháng từ Excel
    formatDate(excelDate) {
      if (!excelDate) return "";

      let date;
      if (typeof excelDate === "number") {
        date = XLSX.SSF.parse_date_code(excelDate);
        return `${date.d}/${date.m}/${date.y}`;
      } else if (typeof excelDate === "string") {
        const parts = excelDate.split("/");
        if (parts.length === 3) {
          return `${parts[0]}/${parts[1]}/${parts[2]}`;
        }
      }

      return "";
    },
  },
});

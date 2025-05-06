import { defineStore } from "pinia";
import * as XLSX from "xlsx";
import { saveAs } from 'file-saver';
import {  ref } from "vue";

export const useExcelStore = defineStore("excel", () => {
  
  const dataSets = ref({})

  const getValueByPath = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  // Hàm xuất Excel chính
  const exportToExcel = ({ data, columns, fileName = 'export.xlsx' }) => {
    if (!data || !columns) return

    const headers = columns.map(col => col.header)
    const fields = columns.map(col => col.field)

    const excelData = data.map(row => {
      return fields.map(field => getValueByPath(row, field))
    })

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData])
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')
    XLSX.writeFile(workbook, fileName)
  }

  const downloadExcelTemplate = (template=[],name) =>  {
      const headers = template;

      const worksheet = XLSX.utils.json_to_sheet(headers);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, name);
    }
    const importExcel = async (file, config) => {
      try {
        const data = await file.arrayBuffer()
        const workbook = XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet, { defval: "" })

        const result = json.map((row, index) => {
          if (config.validateFn) config.validateFn(row, index)
          return config.mapFn(row)
        })

        dataSets.value[config.key] = result
        return result
      } catch (err) {
        throw new Error(err.message || "Lỗi xử lý file Excel!")
      }
    }
  return {
    exportToExcel,
    downloadExcelTemplate,
    importExcel,
    dataSets
  }
});

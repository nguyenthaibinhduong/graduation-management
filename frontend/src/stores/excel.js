import { defineStore } from "pinia";
import * as XLSX from "xlsx";

export const useExcelStore = defineStore("excel",()=> {
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

  return {
    exportToExcel
  }
});

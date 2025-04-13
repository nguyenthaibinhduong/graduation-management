import fileService from '@/services/fileServices'
import { defineStore } from 'pinia'


export function createFileStore(entity="file") {
  return defineStore(entity, () => {

    const uploadFile = async (file,type) => {
       const uploadResponse = await fileService(type).upload(file)
        if(uploadResponse?.data?.url) return uploadResponse.data.url
    }
    const deleteFileItem = async (url) => {
       return await fileService().deleteFile(url)
    }
    

    return { uploadFile , deleteFileItem}
  })
}

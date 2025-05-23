import api from '@/api/api'
import { generateHeaders } from '@/api/apiKeyEncrypt';
const headersAuth = generateHeaders();
const fileService = (resource) => ({
 upload: async (file) => {
    const payload = new FormData()
    payload.append('file', file)
    return api.post(`/file/upload/${resource}`, payload, {
      
      headers: {
        'Content-Type': 'multipart/form-data',
        ...headersAuth
      },
    })
  },
  deleteFile: async (url) => {
    return api.post(`/file/delete`, { url })
  },
})

export default fileService

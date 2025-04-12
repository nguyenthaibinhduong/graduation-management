import api from '@/api/api'

const baseService = (resource) => ({
  fetchAll: async (page = 1, limit = 10, search = '') => {
    const params = { page, limit }
    if (search) params.search = search
    const { data } = await api.get(`/${resource}`, { params })

    return data.data
  },

  getById: async (id) => {
    if (id) {
      const { data } = await api.get(`/${resource}/${id}`)
    }

    return data.data
  },

  create: async (payload) => {
    return api.post(`/${resource}`, payload)
  },

  update: async (id, payload) => {
    return api.put(`/${resource}/${id}`, payload)
  },

  delete: async (ids) => {
    if (!ids.length) {
      return api.delete(`/${resource}/${ids}`)
    } else {
      return api.post(`/${resource}/remove-multi`, ids)
    }
  },
  upload: async (file) => {
    const payload = new FormData()
    payload.append('file', file)
    return api.post(`/file/upload`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  deleteFile: async (url) => {
    return api.post(`/file/delete`, { url })
  },
})

export default baseService

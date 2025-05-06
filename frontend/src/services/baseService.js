import api from '@/api/api'

const baseService = (resource) => ({
  fetchAll: async (page = 1, limit = 10, search = '', filters = {}) => {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...filters,
    };

    const { data } = await api.get(`/${resource}`, { params });
    return data.data;
  },


  getById: async (id) => {
   const { data } = await api.get(`/${resource}/${id}`)
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

  import: async (items) => {
    if (items.length > 0) {
      return api.post(`/${resource}/import`, items)
    }
  },
  
})

export default baseService

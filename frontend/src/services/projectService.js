import api from '@/api/api'

const projectService = (resource) => ({
  fetchAll: async (teacher_id = null,student_id=null, course_id = null,page = 1, limit = 10, search = '') => {
    const params = {  page, limit }
        if (search) params.search = search
        if (teacher_id) {params.teacher_id = teacher_id}
        if (student_id) params.student_id = student_id
        if (course_id) params.course_id = course_id
    const { data } = await api.get(`/${resource}`, { params })

    return data.data
  },
   create: async (payload,type) => {
    return api.post(`/${resource}/create/${type}`, payload)
  },
   
  update: async (id,payload,type) => {
    return api.put(`/${resource}/update/${type}/${id}`, payload)
  },

  delete: async (type, obj_id, ids) => {
    if (!ids.length) { 

      return  api.delete(`/${resource}/delete/${type}/${ids}/${obj_id}`)
    } else {
      if (type == "student") {
         const body = { ids, student_id:obj_id }
      }
     
      return  api.post(`/${resource}/remove-multi/${type}`,body)
    }
  }
   
})

export default projectService

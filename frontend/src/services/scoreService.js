import api from '@/api/api'

const scoreService = {
  createScoreDetail: async (scoreDetailData) => {
    return await api.post('/score/detail', scoreDetailData)
  },

  getTeacherType: async (groupId, teacherId,type) => {
    const { data } = await api.get(`/score/teacher-type/${groupId}/${teacherId}/${type}`)
    return data.data
  },

  getWeightedTotalScore: async (studentId) => {
    const { data } = await api.get(`/score/student/weighted-total-score/${studentId}`)
    return data.data
  },

  updateScoreDetail: async (scoreDetailId, scoreDetailData,type) => {
    return await api.put(`/score/detail/${scoreDetailId}/${type}`, scoreDetailData)
  },

  deleteScoreDetail: async (scoreDetailId) => {
    return await api.delete(`/score/detail/${scoreDetailId}`)
  },

  getGroupsByTeacher: async (teacherId, teacherType) => {
    const { data } = await api.get(`/score/teacher-groups/${teacherId}?type=${teacherType}`)
    return data.data
  },

  getStudentScoreDetails: async (studentId) => {
    const { data } = await api.get(`/score/student/details/${studentId}`)
    return data.data
  },
}

export default scoreService

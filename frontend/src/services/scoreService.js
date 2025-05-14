import api from '@/api/api'

const scoreService = {
  createScoreDetail: async (scoreDetailData) => {
    return await api.post('/score/detail', scoreDetailData)
  },

  getTeacherType: async (groupId, teacherId) => {
    const { data } = await api.get(`/score/teacher-type/${groupId}/${teacherId}`)
    return data.data
  },

  getWeightedTotalScore: async (studentId) => {
    const { data } = await api.get(`/score/student/weighted-total-score/${studentId}`)
    return data.data
  },

  updateScoreDetail: async (scoreDetailId, scoreDetailData) => {
    return await api.put(`/score/detail/${scoreDetailId}`, scoreDetailData)
  },

  deleteScoreDetail: async (scoreDetailId) => {
    return await api.delete(`/score/detail/${scoreDetailId}`)
  },
}

export default scoreService

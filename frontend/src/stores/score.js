import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showToast } from '@/utils/toast'
import scoreService from '@/services/scoreService'

export function createScoreStore() {
  return defineStore('score', () => {
    // State
    const scoreDetails = ref([])
    const loading = ref(false)
    const error = ref(null)
    const weightedTotalScore = ref(null)
    const teacherGroups = ref([])
    const teacherType = ref(null)

    // Actions
    const createScoreDetail = async (scoreDetailData) => {
      loading.value = true
      error.value = null

      try {
        const response = await scoreService.createScoreDetail(scoreDetailData)
        showToast('Score detail created successfully', 'success')
        return response
      } catch (err) {
        error.value = err.message || 'Failed to create score detail'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const updateScoreDetail = async (scoreDetailId, scoreDetailData, type) => {
      loading.value = true
      error.value = null

      try {
        const response = await scoreService.updateScoreDetail(scoreDetailId, scoreDetailData, type)
        showToast('Score detail updated successfully', 'success')
        return response
      } catch (err) {
        error.value = err.message || 'Failed to update score detail'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const deleteScoreDetail = async (scoreDetailId) => {
      loading.value = true
      error.value = null

      try {
        await scoreService.deleteScoreDetail(scoreDetailId)
        showToast('Score detail deleted successfully', 'success')
      } catch (err) {
        error.value = err.message || 'Failed to delete score detail'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const fetchWeightedTotalScore = async (studentId) => {
      loading.value = true
      error.value = null

      try {
        const data = await scoreService.getWeightedTotalScore(studentId)
        weightedTotalScore.value = data
        return data
      } catch (err) {
        error.value = err.message || 'Failed to fetch weighted total score'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const fetchTeacherType = async (groupId, teacherId, type) => {
      loading.value = true
      error.value = null

      try {
        const data = await scoreService.getTeacherType(groupId, teacherId, type)
        teacherType.value = data
        return data
      } catch (err) {
        error.value = err.message || 'Failed to fetch teacher type'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const fetchGroupsByTeacher = async (teacherId, type = null) => {
      loading.value = true
      error.value = null

      try {
        const urlType = type === null ? '' : type

        const data = await scoreService.getGroupsByTeacher(teacherId, urlType)
        teacherGroups.value = data
        return data
      } catch (err) {
        error.value = err.message || 'Failed to fetch groups by teacher'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const fetchStudentScoreDetails = async (studentId, teacherType = null) => {
      loading.value = true
      error.value = null

      try {
        const data = await scoreService.getStudentScoreDetails(studentId, teacherType)
        scoreDetails.value = data
        return data
      } catch (err) {
        error.value = err.message || 'Failed to fetch student score details'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    const fetchGroupScore = async (groupId) => {
      loading.value = true
      error.value = null

      try {
        return await scoreService.publicScore(groupId)
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const unlockScoreDetail = async (scoreDetailId) => {
      loading.value = true
      error.value = null
      try {
        await scoreService.unlockScoreDetail(scoreDetailId)
        showToast('Score detail unlocked successfully', 'success')
      } catch (err) {
        error.value = err.message || 'Failed to unlock score detail'
        showToast(error.value, 'error')
        throw err
      } finally {
        loading.value = false
      }
    }

    return {
      // State
      scoreDetails,
      loading,
      error,
      weightedTotalScore,
      teacherGroups,
      teacherType,
      // Actions
      createScoreDetail,
      updateScoreDetail,
      deleteScoreDetail,
      fetchWeightedTotalScore,
      fetchTeacherType,
      fetchGroupsByTeacher,
      fetchStudentScoreDetails,
      fetchGroupScore,
      unlockScoreDetail,
    }
  })
}

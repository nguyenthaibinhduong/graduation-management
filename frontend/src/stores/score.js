import { defineStore } from 'pinia'
import scoreService from '../services/scoreService'

export const useScoreStore = defineStore('score', {
  state: () => ({
    scoreDetails: [],
    teacherType: null,
    studentScores: {},
    loading: false,
    error: null,
  }),

  actions: {
    // Create score for a group
    // async createGroupScore(scoreData) {
    //   const notification = useNotification()
    //   this.loading = true
    //   this.error = null

    //   try {
    //     const response = await scoreService.createGroupScore(scoreData)
    //     notification.success('Group score created successfully')
    //     return response.data
    //   } catch (error) {
    //     this.error = error.response?.data?.message || 'Failed to create group score'
    //     notification.error(this.error)
    //     throw error
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // Create score for an individual student
    // async createStudentScore(scoreData) {
    //   const notification = useNotification()
    //   this.loading = true
    //   this.error = null

    //   try {
    //     const response = await scoreService.createStudentScore(scoreData)
    //     notification.success('Student score created successfully')
    //     return response.data
    //   } catch (error) {
    //     this.error = error.response?.data?.message || 'Failed to create student score'
    //     notification.error(this.error)
    //     throw error
    //   } finally {
    //     this.loading = false
    //   }
    // },

    // Create score detail
    async createScoreDetail(scoreDetailData) {
      this.loading = true
      this.error = null

      try {
        const response = await scoreService.createScoreDetail(scoreDetailData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create score detail'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Determine teacher type for scoring
    async determineTeacherType(groupId, teacherId) {
      this.loading = true
      this.error = null

      try {
        const response = await scoreService.determineTeacherType(groupId, teacherId)
        this.teacherType = response.data.data
        return this.teacherType
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to determine teacher type'
        this.teacherType = null
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get weighted total score for a student
    async getWeightedTotalScore(studentId) {
      this.loading = true
      this.error = null

      try {
        const response = await scoreService.getWeightedTotalScore(studentId)
        const scoreData = response.data.data

        // Store in state for easy access
        if (scoreData) {
          this.studentScores[studentId] = scoreData
        }

        return scoreData
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get student scores'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update score detail
    async updateScoreDetail(scoreDetailId, updateData) {
      this.loading = true
      this.error = null

      try {
        const response = await scoreService.updateScoreDetail(scoreDetailId, updateData)
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update score detail'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete score
    async deleteScore(scoreId) {
      this.loading = true
      this.error = null

      try {
        const response = await scoreService.deleteScore(scoreId)

        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete score'

        throw error
      } finally {
        this.loading = false
      }
    },
  },

  getters: {
    // Get loading status
    isLoading: (state) => state.loading,

    // Get teacher type information
    getTeacherType: (state) => state.teacherType,

    // Get student score by ID
    getStudentScore: (state) => (studentId) => state.studentScores[studentId] || null,

    // Check if a teacher evaluation is complete for a student
    isEvaluationComplete: (state) => (studentId) => {
      const scores = state.studentScores[studentId]
      return scores?.isComplete || false
    },
  },
})

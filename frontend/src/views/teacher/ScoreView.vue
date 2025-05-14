<template>
  <div class="score-view container">
    <h1 class="mb-4">Create Score Detail</h1>

    <div class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="mb-3">
          <div class="row g-3">
            <div class="col-md-6 mb-3">
              <label for="score_id" class="form-label">Score ID</label>
              <input
                type="number"
                class="form-control"
                id="score_id"
                v-model="scoreDetail.score_id"
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="student_id" class="form-label">Student ID</label>
              <input
                type="number"
                class="form-control"
                id="student_id"
                v-model="scoreDetail.student_id"
                required
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="teacher_id" class="form-label">Teacher ID</label>
              <input
                type="number"
                class="form-control"
                id="teacher_id"
                v-model="scoreDetail.teacher_id"
                required
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="criteria_id" class="form-label">Criteria ID</label>
              <input
                type="number"
                class="form-control"
                id="criteria_id"
                v-model="scoreDetail.criteria_id"
                required
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="score" class="form-label">Score (0-10)</label>
              <input
                type="number"
                class="form-control"
                id="score"
                v-model="scoreDetail.score"
                min="0"
                max="10"
                step="0.1"
                required
              />
            </div>

            <div class="col-md-6 mb-3">
              <label for="teacherType" class="form-label">Teacher Type</label>
              <select class="form-select" id="teacherType" v-model="scoreDetail.teacherType">
                <option value="advisor">Advisor</option>
                <option value="reviewer">Reviewer</option>
                <option value="committee">Committee</option>
              </select>
            </div>

            <div class="col-12 mb-3">
              <label for="comment" class="form-label">Comment</label>
              <textarea
                class="form-control"
                id="comment"
                v-model="scoreDetail.comment"
                rows="3"
              ></textarea>
            </div>
          </div>

          <div class="d-grid mt-4">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              {{ loading ? 'Submitting...' : 'Submit Score' }}
            </button>
          </div>
        </form>

        <!-- Success message -->
        <div v-if="submissionSuccess" class="alert alert-success mt-3">
          Score detail created successfully!
        </div>

        <!-- Error message -->
        <div v-if="error" class="alert alert-danger mt-3">
          {{ error }}
        </div>

        <!-- Debug information -->
        <div class="mt-4">
          <h5>Debug Information:</h5>
          <pre class="border p-3 bg-light">{{ debugInfo }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScoreStore } from '../../stores/score'

// Initialize the score store
const scoreStore = useScoreStore()

// Form data state
const scoreDetail = ref({
  score_id: '',
  student_id: '',
  teacher_id: '',
  criteria_id: '',
  score: '',
  comment: '',
  teacherType: 'advisor',
})

// UI state
const submissionSuccess = ref(false)
const loading = computed(() => scoreStore.isLoading)
const error = computed(() => scoreStore.error)

// Debug information
const debugInfo = computed(() => {
  return JSON.stringify(
    {
      formData: scoreDetail.value,
      loading: loading.value,
      error: error.value,
      submissionSuccess: submissionSuccess.value,
    },
    null,
    2
  )
})

// Form submission handler
const handleSubmit = async () => {
  try {
    submissionSuccess.value = false

    // Convert relevant fields to numbers
    const scoreData = {
      ...scoreDetail.value,
      score_id: Number(scoreDetail.value.score_id),
      student_id: Number(scoreDetail.value.student_id),
      teacher_id: Number(scoreDetail.value.teacher_id),
      criteria_id: Number(scoreDetail.value.criteria_id),
      score: Number(scoreDetail.value.score),
    }

    // Submit to backend via store
    await scoreStore.createScoreDetail(scoreData)

    // Clear form on success
    scoreDetail.value = {
      score_id: '',
      student_id: '',
      teacher_id: '',
      criteria_id: '',
      score: '',
      comment: '',
      teacherType: 'advisor',
    }

    submissionSuccess.value = true

    // Reset success message after 3 seconds
    setTimeout(() => {
      submissionSuccess.value = false
    }, 3000)
  } catch (err) {
    console.error('Error submitting score:', err)
  }
}
</script>

<style scoped>
.score-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

pre {
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 0.875rem;
}
</style>

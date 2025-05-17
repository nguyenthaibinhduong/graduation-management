import { createBaseStore } from './base'
import { createFileStore } from './files'
import { createGroupStore } from './group'
import { createProjectStore } from './project'
import { createScoreStore } from './score'

export const useDepartmentStore = createBaseStore('departments')

export const useMajorStore = createBaseStore('majors')

export const useTeacherStore = createBaseStore('teachers')

export const useStudentStore = createBaseStore('students')

export const useUserStore = createBaseStore('users')

export const usePositionStore = createBaseStore('positions')

export const useCourseStore = createBaseStore('courses')

export const useEnrollmentStore = createBaseStore('enrollment_sessions')

export const useEvaluationStore = createBaseStore('evaluation-forms')

export const useCriteriaStore = createBaseStore('criterias')

export const useGroupStore = createGroupStore('groups')

export const useProjectStore = createProjectStore()

export const useFileStore = createFileStore()

export const useScoreStore = createScoreStore()

export const useCommitteeStore = createBaseStore('committees')

import { createBaseStore } from './base'
import { createFileStore } from './files'
import { createProjectStore } from './project'

export const useDepartmentStore = createBaseStore('departments')

export const useMajorStore = createBaseStore('majors')

export const useTeacherStore = createBaseStore('teachers')

export const useStudentStore = createBaseStore('students')

export const useUserStore = createBaseStore('users')

export const usePositionStore = createBaseStore('positions')

export const useCourseStore = createBaseStore('courses')

export const useEnrollmentStore = createBaseStore('enrollment_sessions')

export const useProjectStore = createProjectStore();

export const useFileStore = createFileStore()

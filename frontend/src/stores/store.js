import { createBaseStore } from './base'

export const useDepartmentStore = createBaseStore('departments')

export const useMajorStore = createBaseStore('majors')

export const useTeacherStore = createBaseStore('teachers')

export const useStudentStore = createBaseStore('students')

export const useUserStore = createBaseStore('users')

export const usePositionStore = createBaseStore('positions')

export const useCourseStore = createBaseStore('courses')

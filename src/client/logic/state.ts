import { useFetch, createEventHook } from '@vueuse/core'
import { reactive, computed } from 'vue'
import groupBy from 'lodash/groupBy'
import { RouteReport } from '../../types'

export const onRefetchResults = createEventHook<void>()
export const onRefetchStats = createEventHook<void>()

export const fetchedReports = reactive(
  useFetch('http://localhost:3000/__routes/api/reports')
    .get()
    .json<RouteReport[]>(),
)

export const fetchedStats = reactive(
  useFetch('http://localhost:3000/__routes/api/stats')
    .get()
    .json<{ stats: {} }>(),
)

export const stats = computed(() => {
  return fetchedStats.data || {}
})

export const reports = computed(() => {
  const reports = groupBy(fetchedReports.data, report => report.route.name) || []
  console.log(reports)

  return reports
})

export function refetchReports() {
  onRefetchResults.trigger()
  return fetchedReports.execute()
}

export function refetchStats() {
  onRefetchStats.trigger()
  return fetchedStats.execute()
}

import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { ru } from 'date-fns/locale'

// Получить все дни месяца (включая соседние недели)
export const getDaysInMonth = (month, year) => {
  const currentDate = new Date(year, month)
  const firstDayOfMonth = startOfMonth(currentDate)
  const lastDayOfMonth = endOfMonth(currentDate)
  
  const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 })
  const lastDayOfCalendar = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 })

  const days = []
  let currentDay = firstDayOfCalendar

  while (currentDay <= lastDayOfCalendar) {
    days.push(currentDay)
    currentDay = addDays(currentDay, 1)
  }

  return days
}

// Получить название месяца на русском
export const getMonthName = (monthIndex) => {
  const date = new Date(2023, monthIndex)
  return format(date, 'LLLL', { locale: ru })
}
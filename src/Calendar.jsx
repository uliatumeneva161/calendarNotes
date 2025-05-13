import { useState, useEffect } from 'react'
import { format, isSameMonth } from 'date-fns'
import { getDaysInMonth, getMonthName } from './utils'
import './Calendar.css'

// Обновленная цветовая палитра
const COLOR_OPTIONS = [
  { id: 'mint', name: 'Мятный', value: '#a2f2e9' },
  { id: 'lavender', name: 'Лавандовый', value: '#d4b8ff' },
  { id: 'peach', name: 'Персиковый', value: '#ffc8b8' },
  { id: 'sky', name: 'Небесный', value: '#8fd3ff' },
  { id: 'honey', name: 'Медовый', value: '#ffdf8f' },
]

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todos')
    return saved ? JSON.parse(saved) : {}
  })
  const [editingDate, setEditingDate] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  // Сохранение в localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Переключение темной темы
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Переключение месяцев
  const changeMonth = (offset) => {
    const newMonth = currentMonth + offset
    if (newMonth < 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else if (newMonth > 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(newMonth)
    }
  }

  // Обработка клика по дню
  const openNoteModal = (date) => {
    if (!isSameMonth(date, new Date(currentYear, currentMonth))) return
    
    const key = format(date, 'yyyy-MM-dd')
    const dayData = todos[key] || { text: '', color: '#ffffff' }
    
    setEditingDate(date)
    setSelectedColor(dayData.color)
    setIsModalOpen(true)
  }

  // Сохранение заметки
  const saveTodo = () => {
    if (!editingDate) return
    const key = format(editingDate, 'yyyy-MM-dd')
    const text = document.querySelector('.modal-textarea')?.value?.trim()
    
    setTodos(prev => ({
      ...prev,
      [key]: {
        text: text || 'Добавить заметку',
        color: selectedColor
      }
    }))
    
    setIsModalOpen(false)
    setEditingDate(null)
  }

  // Удаление заметки
  const deleteTodo = () => {
    if (!editingDate) return
    const key = format(editingDate, 'yyyy-MM-dd')
    const updated = { ...todos }
    delete updated[key]
    setTodos(updated)
    setIsModalOpen(false)
    setEditingDate(null)
  }

  // Форматирование даты
  const formatDate = (date) => format(date, 'yyyy-MM-dd')
  
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)} className="nav-button">←</button>
        <h2>{getMonthName(currentMonth)} {currentYear}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="nav-button"
            style={{ fontSize: '1em' }}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => changeMonth(1)} className="nav-button">→</button>
        </div>
      </div>

      <div className="week-days">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, i) => (
          <div key={i} className="day-name">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {getDaysInMonth(currentMonth, currentYear).map((day, i) => {
          const key = formatDate(day)
          const isCurrentMonth = isSameMonth(day, new Date(currentYear, currentMonth))
          const dayData = todos[key]
          
          return (
            <div 
              key={i} 
              className={`day-cell ${!isCurrentMonth ? 'other-month' : ''}`} 
              style={{ backgroundColor: dayData?.color }}
              onClick={() => openNoteModal(day)}
            >
              <span className="day-number">{format(day, 'd')}</span>
              {dayData && (
                <div className="todo-preview">
                  {(dayData.text || '').split('\n')[0].slice(0, 15)}
                  {dayData.text && dayData.text.length > 15 ? '...' : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Модальное окно */}
      {isModalOpen && editingDate && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
            
            <div className="modal-header">
              <h3>{format(editingDate, 'd MMM yyyy')}</h3>
            </div>
            
            <textarea 
              className="modal-textarea"
              defaultValue={todos[format(editingDate, 'yyyy-MM-dd')]?.text || ''}
              placeholder="Введите вашу заметку..."
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="modal-color-picker">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color.id}
                  className={`color-option ${selectedColor === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedColor(color.value)
                  }}
                  title={color.name}
                />
              ))}
            </div>

            <div className="modal-actions">
              <button className="action-button save" onClick={saveTodo}>Сохранить</button>
              {todos[format(editingDate, 'yyyy-MM-dd')] && (
                <button className="action-button delete" onClick={deleteTodo}>Удалить</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
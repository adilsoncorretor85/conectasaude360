/**
 * Funções utilitárias para manipulação de datas com timezone America/Sao_Paulo
 * 
 * Nota: Para uso em produção, considere usar bibliotecas como date-fns-tz ou moment-timezone
 * Esta implementação usa uma aproximação para UTC-3 (horário de Brasília)
 */

/**
 * Converte data para timezone de São Paulo (UTC-3)
 * @param {Date} date - Data a converter
 * @returns {Date} - Data no timezone de São Paulo
 */
function toSaoPauloTime(date) {
  // Offset de São Paulo: UTC-3 (180 minutos)
  const saoPauloOffset = -180
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000)
  return new Date(utc + (saoPauloOffset * 60000))
}

/**
 * Obtém o início da semana (segunda-feira) para uma data no timezone de São Paulo
 * @param {Date} date - Data de referência
 * @returns {Date} - Início da semana (segunda-feira 00:00:00)
 */
export function getWeekStart(date = new Date()) {
  const spTime = toSaoPauloTime(date)
  const day = spTime.getDay()
  // Ajusta para segunda-feira (day 1)
  // Se for domingo (day 0), volta 6 dias; caso contrário, volta (day - 1) dias
  const diff = day === 0 ? -6 : 1 - day
  
  const monday = new Date(spTime)
  monday.setDate(spTime.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  
  return monday
}

/**
 * Obtém o fim da semana (domingo) para uma data
 * @param {Date} date - Data de referência
 * @returns {Date} - Fim da semana (domingo 23:59:59)
 */
export function getWeekEnd(date = new Date()) {
  const start = getWeekStart(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

/**
 * Gera array de datas da semana (segunda a domingo) no formato YYYY-MM-DD
 * @param {Date} date - Data de referência
 * @returns {Array<string>} - Array de datas no formato YYYY-MM-DD
 */
export function getWeekDays(date = new Date()) {
  const start = getWeekStart(date)
  const days = []
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    // Formata como YYYY-MM-DD
    const year = day.getFullYear()
    const month = String(day.getMonth() + 1).padStart(2, '0')
    const dayOfMonth = String(day.getDate()).padStart(2, '0')
    days.push(`${year}-${month}-${dayOfMonth}`)
  }
  
  return days
}

/**
 * Formata data para exibição (DD/MM)
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {string} - Data formatada DD/MM
 */
export function formatDateShort(dateStr) {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}`
}

/**
 * Obtém o nome do dia da semana abreviado
 * @param {string} dateStr - Data no formato YYYY-MM-DD
 * @returns {string} - Nome do dia (Seg, Ter, Qua, etc.)
 */
export function getDayName(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  return days[date.getDay()]
}


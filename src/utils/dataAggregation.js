/**
 * Funções puras para agregação de dados de agendamentos
 */

/**
 * Mapeia status para categoria
 * @param {string} status - Status do agendamento
 * @param {boolean} confirmado - Campo confirmado (opcional)
 * @returns {string|null} - Categoria ou null
 */
export function mapStatusToCategory(status, confirmado = false) {
  const statusUpper = status?.toUpperCase() || ''
  
  if (statusUpper === 'CONFIRMADO' || confirmado === true) {
    return 'confirmado'
  }
  if (statusUpper === 'PRESENTE' || statusUpper === 'COMPARECEU') {
    return 'presenca'
  }
  if (statusUpper === 'FALTOU' || statusUpper === 'NO-SHOW') {
    return 'falta'
  }
  if (statusUpper === 'CANCELADO') {
    return 'cancelado'
  }
  
  return null
}

/**
 * Agrupa dados por dia e calcula indicadores
 * @param {Array} data - Array de agendamentos
 * @param {Array<string>} weekDays - Array de datas da semana (YYYY-MM-DD)
 * @returns {Array} - Array com dados agrupados por dia
 */
export function aggregateByDay(data, weekDays) {
  // Inicializa objeto com todos os dias da semana
  const dailyData = {}
  weekDays.forEach(day => {
    dailyData[day] = {
      data: day,
      agendados: 0,
      confirmados: 0,
      presencas: 0,
      faltas: 0,
      cancelados: 0
    }
  })
  
  // Processa cada registro
  data.forEach(item => {
    const date = item.data
    if (!dailyData[date]) return
    
    // Agendados: total do dia
    dailyData[date].agendados++
    
    // Categoriza o status
    const category = mapStatusToCategory(item.status, item.confirmado)
    
    if (category === 'confirmado') {
      dailyData[date].confirmados++
    } else if (category === 'presenca') {
      dailyData[date].presencas++
    } else if (category === 'falta') {
      dailyData[date].faltas++
    } else if (category === 'cancelado') {
      dailyData[date].cancelados++
    }
  })
  
  // Converte para array e ordena por data
  return weekDays.map(day => dailyData[day])
}

/**
 * Calcula totais da semana
 * @param {Array} dailyData - Array de dados diários
 * @returns {Object} - Objeto com totais
 */
export function calculateWeekTotals(dailyData) {
  return dailyData.reduce((totals, day) => {
    totals.agendados += day.agendados
    totals.confirmados += day.confirmados
    totals.presencas += day.presencas
    totals.faltas += day.faltas
    totals.cancelados += day.cancelados
    return totals
  }, {
    agendados: 0,
    confirmados: 0,
    presencas: 0,
    faltas: 0,
    cancelados: 0
  })
}

/**
 * Filtra dados baseado nos filtros aplicados
 * @param {Array} data - Array de agendamentos
 * @param {Object} filters - Objeto com filtros
 * @returns {Array} - Array filtrado
 */
export function filterData(data, filters) {
  return data.filter(item => {
    if (filters.regiao && item.regiao !== filters.regiao) return false
    if (filters.ubs && item.ubs !== filters.ubs) return false
    if (filters.tipo && item.tipo !== filters.tipo) return false
    if (filters.data && item.data !== filters.data) return false
    if (filters.canal_aviso && item.canal_aviso !== filters.canal_aviso) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.busca) {
      const buscaLower = filters.busca.toLowerCase()
      if (!item.paciente?.toLowerCase().includes(buscaLower)) return false
    }
    return true
  })
}


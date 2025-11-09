/**
 * Testes unitários simples para funções de agregação
 * 
 * Para executar: node src/utils/dataAggregation.test.js
 */

import { mapStatusToCategory, aggregateByDay, calculateWeekTotals } from './dataAggregation.js'

// Teste: mapear status → categoria
console.log('=== Teste: mapStatusToCategory ===')

const testCases = [
  { status: 'Confirmado', confirmado: false, expected: 'confirmado' },
  { status: 'Confirmado', confirmado: true, expected: 'confirmado' },
  { status: 'confirmado', confirmado: false, expected: 'confirmado' },
  { status: 'Presente', confirmado: false, expected: 'presenca' },
  { status: 'Compareceu', confirmado: false, expected: 'presenca' },
  { status: 'Faltou', confirmado: false, expected: 'falta' },
  { status: 'No-show', confirmado: false, expected: 'falta' },
  { status: 'Cancelado', confirmado: false, expected: 'cancelado' },
  { status: 'Pendente', confirmado: false, expected: null },
  { status: 'Reagendado', confirmado: false, expected: null }
]

let passed = 0
let failed = 0

testCases.forEach(({ status, confirmado, expected }) => {
  const result = mapStatusToCategory(status, confirmado)
  if (result === expected) {
    console.log(`✅ PASS: "${status}" (confirmado: ${confirmado}) → ${result}`)
    passed++
  } else {
    console.log(`❌ FAIL: "${status}" (confirmado: ${confirmado}) → ${result} (esperado: ${expected})`)
    failed++
  }
})

// Teste: aggregateByDay
console.log('\n=== Teste: aggregateByDay ===')

const mockData = [
  { data: '2025-11-04', status: 'Confirmado', confirmado: true },
  { data: '2025-11-04', status: 'Presente', confirmado: false },
  { data: '2025-11-04', status: 'Cancelado', confirmado: false },
  { data: '2025-11-05', status: 'Faltou', confirmado: false },
  { data: '2025-11-05', status: 'Confirmado', confirmado: true }
]

const weekDays = ['2025-11-04', '2025-11-05', '2025-11-06', '2025-11-07', '2025-11-08', '2025-11-09', '2025-11-10']
const aggregated = aggregateByDay(mockData, weekDays)

// Verifica se todos os dias estão presentes
if (aggregated.length === 7) {
  console.log('✅ PASS: Todos os 7 dias da semana estão presentes')
  passed++
} else {
  console.log(`❌ FAIL: Esperado 7 dias, obtido ${aggregated.length}`)
  failed++
}

// Verifica contagem do dia 2025-11-04
const day1 = aggregated.find(d => d.data === '2025-11-04')
if (day1 && day1.agendados === 3 && day1.confirmados === 1 && day1.presencas === 1 && day1.cancelados === 1) {
  console.log('✅ PASS: Contagem do dia 2025-11-04 está correta')
  passed++
} else {
  console.log(`❌ FAIL: Contagem do dia 2025-11-04 incorreta`, day1)
  failed++
}

// Verifica se dias sem dados têm zeros
const day3 = aggregated.find(d => d.data === '2025-11-06')
if (day3 && day3.agendados === 0 && day3.confirmados === 0) {
  console.log('✅ PASS: Dias sem dados têm zeros')
  passed++
} else {
  console.log('❌ FAIL: Dias sem dados não têm zeros')
  failed++
}

// Teste: calculateWeekTotals
console.log('\n=== Teste: calculateWeekTotals ===')

const totals = calculateWeekTotals(aggregated)
if (totals.agendados === 5 && totals.confirmados === 2 && totals.presencas === 1 && totals.faltas === 1 && totals.cancelados === 1) {
  console.log('✅ PASS: Totais da semana estão corretos')
  passed++
} else {
  console.log(`❌ FAIL: Totais incorretos`, totals)
  failed++
}

// Resumo
console.log('\n=== Resumo ===')
console.log(`✅ Passou: ${passed}`)
console.log(`❌ Falhou: ${failed}`)
console.log(`Total: ${passed + failed}`)


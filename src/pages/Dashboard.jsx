import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import mockData from '../data/mockData.json'
import { getWeekDays, formatDateShort, getDayName } from '../utils/dateUtils'
import { aggregateByDay, calculateWeekTotals, filterData, mapStatusToCategory } from '../utils/dataAggregation'
import KPICard from '../components/KPICard'
import {
  calculateNoShowRate,
  calculateConfirmationRate,
  calculateAttendanceRate,
  filterToday,
  calculateTrend,
  calculateDailyProgression
} from '../utils/kpiCalculations'

function Dashboard() {
  const [viewMode, setViewMode] = useState('hoje') // 'hoje', 'semana', 'semana_passada', 'periodo'
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtros, setFiltros] = useState({
    regiao: '',
    ubs: '',
    tipo: '',
    data: '',
    canal_aviso: '',
    status: ''
  })

  // Calcula a semana baseada no modo de visualização
  const weekDays = useMemo(() => {
    let referenceDate = new Date()

    if (viewMode === 'semana_passada') {
      referenceDate = new Date()
      referenceDate.setDate(referenceDate.getDate() - 7)
    } else if (viewMode === 'semana') {
      referenceDate = new Date()
    }

    return getWeekDays(referenceDate)
  }, [viewMode])

  // Filtra os dados
  const dadosFiltrados = useMemo(() => {
    let filtrado = filterData(mockData, filtros)

    // Se houver filtro de data específico, prioriza esse filtro
    if (filtros.data) {
      // Filtra apenas pela data selecionada no filtro
      filtrado = filtrado.filter(item => item.data === filtros.data)
      return filtrado
    }

    // Se não houver filtro de data, aplica a lógica do modo de visualização
    if (viewMode === 'hoje') {
      const hoje = new Date().toISOString().split('T')[0]
      filtrado = filtrado.filter(item => item.data === hoje)
    } else if (viewMode === 'periodo') {
      // Filtra por período personalizado
      if (dataInicio && dataFim) {
        filtrado = filtrado.filter(item => {
          return item.data >= dataInicio && item.data <= dataFim
        })
      }
    } else {
      // Filtra apenas dados da semana selecionada
      filtrado = filtrado.filter(item => weekDays.includes(item.data))
    }

    return filtrado
  }, [filtros, weekDays, viewMode, dataInicio, dataFim])

  // Agrega dados por dia
  const dadosAgregados = useMemo(() => {
    // Se houver filtro de data específico, mostra apenas aquele dia
    if (filtros.data) {
      return aggregateByDay(dadosFiltrados, [filtros.data])
    }

    if (viewMode === 'periodo' && dataInicio && dataFim) {
      // Para período personalizado, gerar array de datas
      const dates = []
      const start = new Date(dataInicio)
      const end = new Date(dataFim)

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }

      return aggregateByDay(dadosFiltrados, dates)
    }
    
    // Verifica se weekDays está definido e não está vazio
    if (!weekDays || weekDays.length === 0) {
      return []
    }
    
    return aggregateByDay(dadosFiltrados, weekDays)
  }, [dadosFiltrados, weekDays, viewMode, dataInicio, dataFim, filtros.data])

  // Calcula totais da semana ou dia
  const totais = useMemo(() => {
    // Se houver filtro de data específico ou modo "hoje", calcula totais do dia
    if (filtros.data || viewMode === 'hoje') {
      return {
        agendados: dadosFiltrados.length,
        confirmados: dadosFiltrados.filter(
          item => item.confirmado || item.status === 'Confirmado'
        ).length,
        presencas: dadosFiltrados.filter(
          item => item.status === 'Presente' || item.status === 'Compareceu'
        ).length,
        faltas: dadosFiltrados.filter(
          item => item.status === 'Faltou' || item.status === 'No-show'
        ).length,
        cancelados: dadosFiltrados.filter(item => item.status === 'Cancelado')
          .length
      }
    }
    
    // Verifica se dadosAgregados está vazio
    if (!dadosAgregados || dadosAgregados.length === 0) {
      return {
        agendados: 0,
        confirmados: 0,
        presencas: 0,
        faltas: 0,
        cancelados: 0
      }
    }
    
    return calculateWeekTotals(dadosAgregados)
  }, [dadosAgregados, dadosFiltrados, viewMode, filtros.data])

  // Calcula KPIs com percentuais
  const kpis = useMemo(() => {
    const noShowRate = calculateNoShowRate(dadosFiltrados)
    const confirmationRate = calculateConfirmationRate(dadosFiltrados)
    const attendanceRate = calculateAttendanceRate(dadosFiltrados)

    // Calcular tendências comparando com período anterior
    let noShowRatePrev = 0
    let confirmationRatePrev = 0

    if (viewMode === 'semana') {
      const semanaPassada = mockData.filter(item => {
        const dataItem = new Date(item.data)
        const inicioSemanaPassada = new Date()
        inicioSemanaPassada.setDate(inicioSemanaPassada.getDate() - 14)
        const fimSemanaPassada = new Date()
        fimSemanaPassada.setDate(fimSemanaPassada.getDate() - 7)
        return dataItem >= inicioSemanaPassada && dataItem < fimSemanaPassada
      })
      noShowRatePrev = calculateNoShowRate(semanaPassada)
      confirmationRatePrev = calculateConfirmationRate(semanaPassada)
    }

    return {
      noShowRate,
      confirmationRate,
      attendanceRate,
      noShowTrend: calculateTrend(noShowRate, noShowRatePrev),
      confirmationTrend: calculateTrend(confirmationRate, confirmationRatePrev)
    }
  }, [dadosFiltrados, viewMode])

  // Prepara dados para o gráfico de linha (progressão diária)
  const graficoLinhaData = useMemo(() => {
    // Se houver filtro de data específico ou modo "hoje", não mostra gráfico de linha
    if (filtros.data || viewMode === 'hoje') return []

    // Se está no modo período mas não tem datas selecionadas, retorna vazio
    if (viewMode === 'periodo' && (!dataInicio || !dataFim)) return []

    if (!dadosAgregados || dadosAgregados.length === 0) return []

    return dadosAgregados.map(dia => ({
      dia: formatDateShort(dia.data),
      Agendados: dia.agendados || 0,
      Confirmados: dia.confirmados || 0,
      Presenças: dia.presencas || 0,
      Faltas: dia.faltas || 0,
      Cancelados: dia.cancelados || 0
    }))
  }, [dadosAgregados, viewMode, dataInicio, dataFim, filtros.data])
  
  // Cores para cada categoria
  const cores = {
    'Agendados': '#3b82f6',
    'Confirmados': '#10b981',
    'Presenças': '#059669',
    'Faltas': '#ef4444',
    'Cancelados': '#f97316'
  }

  // Opções únicas para os filtros
  const opcoes = useMemo(() => {
    const regioes = [...new Set(mockData.map(item => item.regiao))].sort()
    const ubsList = [...new Set(mockData.map(item => item.ubs))].sort()
    const tipos = [...new Set(mockData.map(item => item.tipo))].sort()
    const canais = [...new Set(mockData.map(item => item.canal_aviso))].sort()
    const statusList = [...new Set(mockData.map(item => item.status))].sort()
    
    return { regioes, ubsList, tipos, canais, statusList }
  }, [])

  const resetarFiltros = () => {
    setFiltros({
      regiao: '',
      ubs: '',
      tipo: '',
      data: '',
      canal_aviso: '',
      status: ''
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode('hoje')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'hoje'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setViewMode('semana')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'semana'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semana Atual
          </button>
          <button
            onClick={() => setViewMode('semana_passada')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'semana_passada'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semana Passada
          </button>
          <button
            onClick={() => setViewMode('periodo')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'periodo'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Período
          </button>
        </div>
      </div>

      {/* Filtro de Período Personalizado */}
      {viewMode === 'periodo' && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            Selecione o Período
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {dataInicio && dataFim && (
            <div className="mt-3 text-sm text-blue-700">
              <strong>{dadosFiltrados.length}</strong> agendamento(s) encontrado(s) no período
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          <button
            onClick={resetarFiltros}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Resetar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Região
            </label>
            <select
              value={filtros.regiao}
              onChange={(e) => setFiltros({ ...filtros, regiao: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {opcoes.regioes.map(regiao => (
                <option key={regiao} value={regiao}>{regiao}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UBS
            </label>
            <select
              value={filtros.ubs}
              onChange={(e) => setFiltros({ ...filtros, ubs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {opcoes.ubsList.map(ubs => (
                <option key={ubs} value={ubs}>{ubs}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {opcoes.tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              type="date"
              value={filtros.data}
              onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Canal de Aviso
            </label>
            <select
              value={filtros.canal_aviso}
              onChange={(e) => setFiltros({ ...filtros, canal_aviso: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {opcoes.canais.map(canal => (
                <option key={canal} value={canal}>{canal}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {opcoes.statusList.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alertas Prioritários - Apenas na visualização "Hoje" */}
      {viewMode === 'hoje' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-bold text-yellow-900 mb-3">
                Ações Prioritárias para Hoje
              </h3>
              <div className="space-y-2 text-sm text-yellow-800">
                {(() => {
                  const hoje = new Date().toISOString().split('T')[0]
                  const agendamentosHoje = dadosFiltrados.filter(
                    item => item.data === hoje
                  )
                  const pendentes = agendamentosHoje.filter(
                    item => item.status === 'Pendente' || !item.confirmado
                  )
                  const naoAvisados = agendamentosHoje.filter(
                    item => !item.avisado
                  )

                  return (
                    <>
                      {pendentes.length > 0 && (
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">⚠️</span>
                          <span>
                            <strong>{pendentes.length}</strong> agendamento(s)
                            pendente(s) de confirmação
                          </span>
                        </div>
                      )}
                      {naoAvisados.length > 0 && (
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">📢</span>
                          <span>
                            <strong>{naoAvisados.length}</strong> paciente(s) não
                            avisado(s)
                          </span>
                        </div>
                      )}
                      {pendentes.length === 0 && naoAvisados.length === 0 && (
                        <div className="flex items-center text-green-700">
                          <span className="font-semibold mr-2">✅</span>
                          <span>Tudo em dia! Sem ações prioritárias.</span>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards de KPI - Com Percentuais e Tendências */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard
          titulo="Agendados"
          valor={totais.agendados}
          cor="blue"
          subtitulo={viewMode === 'hoje' ? 'Agendamentos hoje' : 'Total no período'}
        />
        <KPICard
          titulo="Confirmados"
          valor={totais.confirmados}
          percentual={kpis.confirmationRate}
          tendencia={
            viewMode === 'semana' ? kpis.confirmationTrend : null
          }
          cor="green"
          subtitulo={`${kpis.confirmationRate.toFixed(1)}% de confirmação`}
        />
        <KPICard
          titulo="Presenças"
          valor={totais.presencas}
          percentual={kpis.attendanceRate}
          cor="purple"
          subtitulo={`${kpis.attendanceRate.toFixed(1)}% de presença`}
        />
        <KPICard
          titulo="Faltas"
          valor={totais.faltas}
          percentual={kpis.noShowRate}
          tendencia={
            viewMode === 'semana' && kpis.noShowTrend.trend === 'down'
              ? { trend: 'up', percentage: kpis.noShowTrend.percentage }
              : viewMode === 'semana' && kpis.noShowTrend.trend === 'up'
              ? { trend: 'down', percentage: kpis.noShowTrend.percentage }
              : null
          }
          cor="red"
          subtitulo={`${kpis.noShowRate.toFixed(1)}% de no-show`}
        />
        <KPICard
          titulo="Cancelados"
          valor={totais.cancelados}
          percentual={
            totais.agendados > 0
              ? (totais.cancelados / totais.agendados) * 100
              : 0
          }
          cor="yellow"
          subtitulo="Cancelamentos"
        />
      </div>

      {/* Gráfico de progressão diária */}
      {viewMode !== 'hoje' && !filtros.data && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {viewMode === 'semana'
              ? 'Semana Atual'
              : viewMode === 'semana_passada'
              ? 'Semana Passada'
              : dataInicio && dataFim
              ? `Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} - ${new Date(dataFim).toLocaleDateString('pt-BR')}`
              : 'Período Personalizado'}{' '}
            - Progressão Diária
          </h3>
          {graficoLinhaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={graficoLinhaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Agendados"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Confirmados"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Presenças"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Faltas"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Cancelados"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <p className="text-lg mb-2">
                  {viewMode === 'periodo'
                    ? 'Selecione as datas de início e fim para visualizar os dados'
                    : 'Nenhum dado disponível para o período selecionado'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mensagem para visualização "Hoje" ou filtro de data */}
      {(viewMode === 'hoje' || filtros.data) && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                {filtros.data 
                  ? `Visualização do dia ${new Date(filtros.data + 'T00:00:00').toLocaleDateString('pt-BR')}`
                  : 'Visualização de Hoje'}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  {filtros.data 
                    ? `Você está visualizando apenas os agendamentos do dia ${new Date(filtros.data + 'T00:00:00').toLocaleDateString('pt-BR')}. Para ver a progressão semanal, limpe o filtro de data e selecione "Semana Atual" ou "Semana Passada".`
                    : `Você está visualizando apenas os agendamentos de hoje (${new Date().toLocaleDateString('pt-BR')}). Para ver a progressão semanal, selecione "Semana Atual" ou "Semana Passada".`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

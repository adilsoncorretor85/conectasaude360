import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import mockData from '../data/mockData.json'
import {
  calculateNoShowByUBS,
  calculateNoShowByTipo,
  calculateConfirmationByCanal,
  calculateGeographicDistribution,
  calculateGoalsProgress
} from '../utils/kpiCalculations'

function Relatorios() {
  const [periodo, setPeriodo] = useState('1m') // '1m', '3m', '6m', '1a', 'custom'
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Filtra dados por período
  const dadosFiltrados = useMemo(() => {
    const hoje = new Date()
    let dataMinima = new Date()

    if (periodo === 'custom') {
      if (!dataInicio || !dataFim) return mockData
      return mockData.filter(item => {
        const dataItem = new Date(item.data)
        return dataItem >= new Date(dataInicio) && dataItem <= new Date(dataFim)
      })
    }

    // Calcula data mínima baseada no período
    switch (periodo) {
      case '1m':
        dataMinima.setMonth(dataMinima.getMonth() - 1)
        break
      case '3m':
        dataMinima.setMonth(dataMinima.getMonth() - 3)
        break
      case '6m':
        dataMinima.setMonth(dataMinima.getMonth() - 6)
        break
      case '1a':
        dataMinima.setFullYear(dataMinima.getFullYear() - 1)
        break
      default:
        dataMinima.setMonth(dataMinima.getMonth() - 1)
    }

    return mockData.filter(item => {
      const dataItem = new Date(item.data)
      return dataItem >= dataMinima && dataItem <= hoje
    })
  }, [periodo, dataInicio, dataFim])

  // Calcula análises com dados filtrados
  const noShowPorUBS = useMemo(() => calculateNoShowByUBS(dadosFiltrados), [dadosFiltrados])
  const noShowPorTipo = useMemo(() => calculateNoShowByTipo(dadosFiltrados), [dadosFiltrados])
  const confirmacaoPorCanal = useMemo(
    () => calculateConfirmationByCanal(dadosFiltrados),
    [dadosFiltrados]
  )
  const distribuicaoGeografica = useMemo(
    () => calculateGeographicDistribution(dadosFiltrados),
    [dadosFiltrados]
  )

  // Calcula progresso em relação às metas do MVP
  const metasProgresso = useMemo(() => {
    return calculateGoalsProgress(dadosFiltrados)
  }, [dadosFiltrados])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Relatórios e Análises
        </h2>
        <p className="text-gray-600 mt-1">
          Análises detalhadas e progresso em direção às metas do MVP
        </p>
      </div>

      {/* Filtros de Período */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Período de Análise</h3>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => setPeriodo('1m')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              periodo === '1m'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Mês
          </button>
          <button
            onClick={() => setPeriodo('3m')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              periodo === '3m'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Meses
          </button>
          <button
            onClick={() => setPeriodo('6m')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              periodo === '6m'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            6 Meses
          </button>
          <button
            onClick={() => setPeriodo('1a')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              periodo === '1a'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Ano
          </button>
          <button
            onClick={() => setPeriodo('custom')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              periodo === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Personalizado
          </button>
        </div>

        {periodo === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
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
        )}

        <div className="mt-4 text-sm text-gray-600">
          Total de registros no período: <span className="font-semibold">{dadosFiltrados.length}</span>
        </div>
      </div>

      {/* Progresso das Metas MVP */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Progresso das Metas MVP
        </h3>

        <div className="space-y-6">
          {/* Meta 1: Redução de Faltas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  {metasProgresso.meta1.nome}
                </h4>
                <p className="text-xs text-gray-500">
                  Meta: {metasProgresso.meta1.meta}% de redução
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metasProgresso.meta1.atual.toFixed(1)}%
                </p>
                <p
                  className={`text-sm font-medium ${
                    metasProgresso.meta1.atingida
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {metasProgresso.meta1.atingida ? '✓ Atingida' : 'Em progresso'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  metasProgresso.meta1.atingida ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{
                  width: `${Math.min((metasProgresso.meta1.atual / metasProgresso.meta1.meta) * 100, 100)}%`
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Baseline: {metasProgresso.meta1.baseline.toFixed(1)}% → Atual:{' '}
              {metasProgresso.meta1.current.toFixed(1)}%
            </p>
          </div>

          {/* Meta 2: Taxa de Confirmação */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  {metasProgresso.meta2.nome}
                </h4>
                <p className="text-xs text-gray-500">
                  Meta: ≥{metasProgresso.meta2.meta}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metasProgresso.meta2.atual.toFixed(1)}%
                </p>
                <p
                  className={`text-sm font-medium ${
                    metasProgresso.meta2.atingida
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {metasProgresso.meta2.atingida ? '✓ Atingida' : 'Em progresso'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  metasProgresso.meta2.atingida ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{
                  width: `${Math.min((metasProgresso.meta2.atual / metasProgresso.meta2.meta) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>

          {/* Meta 3: Reaproveitamento de Vagas */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  {metasProgresso.meta3.nome}
                </h4>
                <p className="text-xs text-gray-500">
                  Meta: ≥{metasProgresso.meta3.meta}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {metasProgresso.meta3.atual.toFixed(1)}%
                </p>
                <p
                  className={`text-sm font-medium ${
                    metasProgresso.meta3.atingida
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  {metasProgresso.meta3.atingida ? '✓ Atingida' : 'Em progresso'}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  metasProgresso.meta3.atingida ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{
                  width: `${Math.min((metasProgresso.meta3.atual / metasProgresso.meta3.meta) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* No-show por UBS */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Taxa de No-show por UBS
        </h3>

        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={noShowPorUBS}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ubs" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: 'Taxa (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="noShowRate" fill="#ef4444" name="No-show %">
                {noShowPorUBS.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.noShowRate > 25
                        ? '#dc2626'
                        : entry.noShowRate > 15
                        ? '#f59e0b'
                        : '#10b981'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UBS
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Presenças
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Faltas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taxa No-show
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {noShowPorUBS.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.ubs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    {item.presencas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    {item.faltas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.noShowRate > 25
                          ? 'bg-red-100 text-red-800'
                          : item.noShowRate > 15
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {item.noShowRate.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* No-show por Tipo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Taxa de No-show por Tipo
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={noShowPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="noShowRate" fill="#8b5cf6" name="No-show %" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {noShowPorTipo.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  {item.tipo}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {item.noShowRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.faltas}/{item.faltas + item.presencas})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmação por Canal */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Taxa de Confirmação por Canal
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confirmacaoPorCanal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="canal" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toFixed(1)}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Bar dataKey="confirmationRate" fill="#10b981" name="Confirmação %" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {confirmacaoPorCanal.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-700">
                  {item.canal}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {item.confirmationRate.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({item.confirmados}/{item.total})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Distribuição Geográfica */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Distribuição Geográfica
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distribuicaoGeografica}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="regiao" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Bar dataKey="total" fill="#3b82f6" name="Total" />
            <Bar dataKey="presencas" fill="#10b981" name="Presenças" />
            <Bar dataKey="faltas" fill="#ef4444" name="Faltas" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Região
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Confirmados
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Presenças
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Faltas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  No-show %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {distribuicaoGeografica.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.regiao}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                    {item.confirmados}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    {item.presencas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    {item.faltas}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                    {item.noShowRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Relatorios

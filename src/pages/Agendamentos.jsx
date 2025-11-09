import { useState, useMemo } from 'react'
import mockData from '../data/mockData.json'

function Agendamentos() {
  const [filtros, setFiltros] = useState({
    regiao: '',
    ubs: '',
    tipo: '',
    data: '',
    canal_aviso: '',
    status: '',
    busca: ''
  })

  // Opções únicas para os filtros
  const opcoes = useMemo(() => {
    const regioes = [...new Set(mockData.map(item => item.regiao))].sort()
    const ubsList = [...new Set(mockData.map(item => item.ubs))].sort()
    const tipos = [...new Set(mockData.map(item => item.tipo))].sort()
    const canais = [...new Set(mockData.map(item => item.canal_aviso))].sort()
    const statusList = [...new Set(mockData.map(item => item.status))].sort()
    
    return { regioes, ubsList, tipos, canais, statusList }
  }, [])

  // Filtra e ordena os dados
  const dadosFiltrados = useMemo(() => {
    let filtrado = [...mockData]

    // Aplica filtros
    if (filtros.regiao) {
      filtrado = filtrado.filter(item => item.regiao === filtros.regiao)
    }
    if (filtros.ubs) {
      filtrado = filtrado.filter(item => item.ubs === filtros.ubs)
    }
    if (filtros.tipo) {
      filtrado = filtrado.filter(item => item.tipo === filtros.tipo)
    }
    if (filtros.data) {
      filtrado = filtrado.filter(item => item.data === filtros.data)
    }
    if (filtros.canal_aviso) {
      filtrado = filtrado.filter(item => item.canal_aviso === filtros.canal_aviso)
    }
    if (filtros.status) {
      filtrado = filtrado.filter(item => item.status === filtros.status)
    }
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase()
      filtrado = filtrado.filter(item =>
        item.paciente.toLowerCase().includes(buscaLower)
      )
    }

    // Ordena: hoje → próximos dias
    const hoje = new Date().toISOString().split('T')[0]
    filtrado.sort((a, b) => {
      // Primeiro ordena por data
      if (a.data !== b.data) {
        return a.data.localeCompare(b.data)
      }
      // Depois por hora
      return a.hora.localeCompare(b.hora)
    })

    return filtrado
  }, [filtros])

  // Função para resetar filtros
  const resetarFiltros = () => {
    setFiltros({
      regiao: '',
      ubs: '',
      tipo: '',
      data: '',
      canal_aviso: '',
      status: '',
      busca: ''
    })
  }

  // Função para exportar CSV
  const exportarCSV = () => {
    const headers = ['ID', 'Data', 'Hora', 'Região', 'UBS', 'Tipo', 'Paciente', 'Contato', 'Canal Aviso', 'Avisado', 'Confirmado', 'Status']
    const rows = dadosFiltrados.map(item => [
      item.id,
      item.data,
      item.hora,
      item.regiao,
      item.ubs,
      item.tipo,
      item.paciente,
      item.contato,
      item.canal_aviso,
      item.avisado ? 'Sim' : 'Não',
      item.confirmado ? 'Sim' : 'Não',
      item.status
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `agendamentos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Filtros rápidos
  const aplicarFiltroRapido = (tipo) => {
    const hoje = new Date().toISOString().split('T')[0]
    const amanha = new Date()
    amanha.setDate(amanha.getDate() + 1)
    const dataAmanha = amanha.toISOString().split('T')[0]

    const doisDias = new Date()
    doisDias.setDate(doisDias.getDate() + 2)
    const dataDoisDias = doisDias.toISOString().split('T')[0]

    resetarFiltros()

    if (tipo === 'hoje') {
      setFiltros(prev => ({ ...prev, data: hoje }))
    } else if (tipo === 'amanha') {
      setFiltros(prev => ({ ...prev, data: dataAmanha }))
    } else if (tipo === 'pendentes') {
      setFiltros(prev => ({ ...prev, status: 'Pendente' }))
    } else if (tipo === 'nao_confirmados') {
      // Este será aplicado no filtro
    }
  }

  // Verificar se uma notificação foi enviada
  const verificarNotificacao = (notificacoes, tipo) => {
    if (!notificacoes || !Array.isArray(notificacoes)) return false
    const notif = notificacoes.find(n => n.tipo === tipo)
    return notif && notif.enviado
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={resetarFiltros}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Resetar Filtros
          </button>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Filtros Rápidos</h3>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => aplicarFiltroRapido('hoje')}
            className="px-4 py-2 bg-white text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
          >
            📅 Hoje
          </button>
          <button
            onClick={() => aplicarFiltroRapido('amanha')}
            className="px-4 py-2 bg-white text-blue-700 border-2 border-blue-300 rounded-lg hover:bg-blue-100 transition font-medium text-sm"
          >
            🗓️ Amanhã
          </button>
          <button
            onClick={() => aplicarFiltroRapido('pendentes')}
            className="px-4 py-2 bg-white text-yellow-700 border-2 border-yellow-300 rounded-lg hover:bg-yellow-100 transition font-medium text-sm"
          >
            ⏳ Pendentes
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Busca por nome */}
          <div className="xl:col-span-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar por nome
            </label>
            <input
              type="text"
              value={filtros.busca}
              onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              placeholder="Digite o nome do paciente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Região */}
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

          {/* UBS */}
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

          {/* Tipo */}
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

          {/* Data */}
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

          {/* Canal de Aviso */}
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

          {/* Status */}
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

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UBS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Canal
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notificações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Nenhum agendamento encontrado
                  </td>
                </tr>
              ) : (
                dadosFiltrados.map((item) => {
                  const d3Enviado = verificarNotificacao(item.notificacoes, 'D-3')
                  const d1Enviado = verificarNotificacao(item.notificacoes, 'D-1')
                  const d0Enviado = verificarNotificacao(item.notificacoes, 'D0')

                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="font-medium">
                          {item.data.split('-').reverse().join('/')}
                        </div>
                        <div className="text-gray-500">{item.hora}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.paciente}
                        </div>
                        <div className="text-xs text-gray-500">{item.regiao}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{item.ubs}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {item.tipo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.canal_aviso === 'WhatsApp'
                            ? 'bg-green-100 text-green-800'
                            : item.canal_aviso === 'SMS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {item.canal_aviso}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex justify-center gap-1">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              d3Enviado
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                            title={d3Enviado ? 'D-3 enviado' : 'D-3 não enviado'}
                          >
                            D-3
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              d1Enviado
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                            title={d1Enviado ? 'D-1 enviado' : 'D-1 não enviado'}
                          >
                            D-1
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              d0Enviado
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                            title={d0Enviado ? 'D0 enviado' : 'D0 não enviado'}
                          >
                            D0
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Confirmado'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Presente' || item.status === 'Compareceu'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Faltou' || item.status === 'No-show'
                            ? 'bg-red-100 text-red-800'
                            : item.status === 'Cancelado'
                            ? 'bg-orange-100 text-orange-800'
                            : item.status === 'Reagendado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : item.status === 'Pendente'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Total: <span className="font-semibold">{dadosFiltrados.length}</span> agendamento(s)
          </p>
        </div>
      </div>
    </div>
  )
}

export default Agendamentos


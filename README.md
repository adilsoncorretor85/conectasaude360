# Conecta Saúde - Dashboard MVP

Dashboard web em React + Tailwind CSS (Vite) para gerenciamento de agendamentos de saúde.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Recharts** - Biblioteca de gráficos para React

## 📦 Instalação

```bash
npm install
```

## 🏃 Executar

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3001`

## 📋 Funcionalidades

### Dashboard
- **KPIs em cards:**
  - Agendados (total da semana/dia)
  - Confirmados
  - Presenças
  - Faltas
  - Cancelados
- **Gráfico de pizza:** Distribuição dos indicadores da semana
- **Gráfico de linha:** Progressão diária (quando visualizando semana/período)
- **Filtros:** Região, UBS, Tipo, Data, Canal de Aviso, Status
- **Modos de visualização:**
  - Hoje
  - Semana Atual
  - Semana Passada
  - Período Personalizado

### Agendamentos
- **Tabela ordenada:** Hoje → próximos dias
- **Filtros:**
  - Região
  - UBS
  - Tipo (Consulta/Exame/Procedimento)
  - Data
  - Canal de aviso (WhatsApp/SMS/Ligação/Outro)
  - Status (Confirmado/Cancelado/Reagendado/Pendente/Não avisado)
- **Busca por nome do paciente**
- **Exportar CSV** da tabela filtrada
- **Resetar filtros**

## 📁 Estrutura do Projeto

```
conectasaude/
├── .github/
│   ├── workflows/          # GitHub Actions
│   ├── ISSUE_TEMPLATE/     # Templates de issues
│   └── dependabot.yml     # Atualizações automáticas
├── src/
│   ├── components/
│   │   └── KPICard.jsx     # Componente de card de KPI
│   ├── data/
│   │   └── mockData.json   # Dados mockados (120+ registros)
│   ├── pages/
│   │   ├── Dashboard.jsx   # Página do dashboard
│   │   ├── Agendamentos.jsx # Página de agendamentos
│   │   └── Relatorios.jsx  # Página de relatórios
│   ├── utils/
│   │   ├── dataAggregation.js  # Funções de agregação
│   │   ├── dateUtils.js        # Utilitários de data
│   │   └── kpiCalculations.js  # Cálculos de KPIs
│   ├── App.jsx             # Componente principal com tabs
│   ├── main.jsx            # Entry point
│   └── index.css           # Estilos globais
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔄 Próximos Passos

Para integrar com API real:

1. Substituir import do `mockData.json` por chamadas de API
2. Criar serviço de API (ex: `src/services/api.js`)
3. Usar hooks como `useState` e `useEffect` para buscar dados
4. Adicionar tratamento de erros e loading states

## 📝 Notas

- Os dados são calculados em tempo real a partir do mockdata
- A data "hoje" é determinada pela data local do navegador
- O CSV exportado inclui BOM (Byte Order Mark) para compatibilidade com Excel
- Timezone usado: America/Sao_Paulo (UTC-3)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

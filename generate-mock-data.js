// Script para gerar mock data aprimorado para Conecta Saúde
// Executar com: node generate-mock-data.js

import fs from 'fs';

// Configurações
const NUM_REGISTROS = 600;
const DATA_INICIO = new Date('2025-10-14'); // início de outubro
const DATA_FIM = new Date('2025-11-30'); // até fim de novembro

// Dados base - Distritos Sanitários e UBS reais de Joinville
const regioes = ['Centro', 'Norte', 'Sul'];
const ubs = {
  'Centro': [
    'Aventureiro I',
    'Aventureiro II',
    'Bakhita',
    'Bucarein',
    'CAIC Vila Paranaense',
    'Comasa',
    'Cubatão',
    'Itaum',
    'Parque Joinville',
    'Saguaçu'
  ],
  'Norte': [
    'Bom Retiro',
    'Canela',
    'Costa e Silva',
    'Glória',
    'Jardim Paraíso',
    'Jardim Sofia',
    'Morro do Meio',
    'Nova Brasília',
    'Pirabeiraba',
    'Rio Bonito',
    'São Marcos',
    'Vila Nova',
    'Vila Nova I'
  ],
  'Sul': [
    'Adhemar Garcia',
    'Boehmerwald',
    'Edla Jordan',
    'Estevão de Matos',
    'Fátima',
    'Floresta',
    'Itinga',
    'Jardim Edilene',
    'Jarivatuba',
    'Ulysses Guimarães'
  ]
};
const tipos = ['Consulta', 'Exame', 'Procedimento'];
const canais = ['WhatsApp', 'SMS', 'Ligação'];
const status = ['Confirmado', 'Presente', 'Faltou', 'Cancelado', 'Pendente', 'Reagendado'];
// Horários das 7h às 18h (UBS funcionam seg-sex)
const horarios = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

const primeiroNomes = ['Ana', 'Maria', 'José', 'João', 'Paulo', 'Carlos', 'Marcos', 'Lucas', 'Pedro', 'Rafael',
                       'Juliana', 'Fernanda', 'Carla', 'Beatriz', 'Patrícia', 'Rodrigo', 'Bruno', 'Felipe',
                       'Gabriel', 'Mariana', 'Larissa', 'Camila', 'Renata', 'Thiago', 'Diego', 'Mateus',
                       'Amanda', 'Vanessa', 'Tatiana', 'Wagner', 'Roberto', 'Antônio', 'Francisco', 'Luiz'];

const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira',
                    'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Rocha', 'Almeida',
                    'Nascimento', 'Araújo', 'Melo', 'Barbosa', 'Cardoso', 'Correia', 'Dias', 'Teixeira'];

// Funções auxiliares
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(inicio, fim) {
  let randomTime;
  let date;

  // Gera datas até encontrar um dia útil (seg-sex)
  do {
    const diff = fim.getTime() - inicio.getTime();
    randomTime = inicio.getTime() + Math.random() * diff;
    date = new Date(randomTime);
  } while (date.getDay() === 0 || date.getDay() === 6); // 0 = domingo, 6 = sábado

  return date;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function generatePhone() {
  const prefixo = Math.floor(90000 + Math.random() * 10000);
  const sufixo = Math.floor(100 + Math.random() * 900);
  return `(47) ${prefixo}-${sufixo}`;
}

function generateNome() {
  return `${randomItem(primeiroNomes)} ${randomItem(sobrenomes)}`;
}

// Lógica para determinar status baseado na data
function getStatusForDate(dataAgendamento, hoje = new Date()) {
  const diffDays = Math.floor((dataAgendamento - hoje) / (1000 * 60 * 60 * 24));

  if (diffDays > 3) {
    // Agendamentos futuros distantes
    return Math.random() < 0.3 ? 'Confirmado' : 'Pendente';
  } else if (diffDays >= 0) {
    // Hoje ou próximos dias
    if (Math.random() < 0.7) return 'Confirmado';
    if (Math.random() < 0.8) return 'Pendente';
    return 'Cancelado';
  } else if (diffDays === -1 || diffDays === -2) {
    // Ontem ou anteontem
    const rand = Math.random();
    if (rand < 0.65) return 'Presente';
    if (rand < 0.85) return 'Faltou';
    return 'Cancelado';
  } else {
    // Passado mais distante
    const rand = Math.random();
    if (rand < 0.70) return 'Presente';
    if (rand < 0.88) return 'Faltou';
    if (rand < 0.95) return 'Cancelado';
    return 'Reagendado';
  }
}

// Taxa de no-show varia por UBS (para simular realidade)
const noShowRates = {
  // Distrito Centro
  'Aventureiro I': 0.18,
  'Aventureiro II': 0.16,
  'Bakhita': 0.14,
  'Bucarein': 0.20,
  'CAIC Vila Paranaense': 0.22,
  'Comasa': 0.17,
  'Cubatão': 0.19,
  'Itaum': 0.15,
  'Parque Joinville': 0.21,
  'Saguaçu': 0.16,
  // Distrito Norte
  'Bom Retiro': 0.23,
  'Canela': 0.18,
  'Costa e Silva': 0.20,
  'Glória': 0.19,
  'Jardim Paraíso': 0.24,
  'Jardim Sofia': 0.21,
  'Morro do Meio': 0.26,
  'Nova Brasília': 0.22,
  'Pirabeiraba': 0.17,
  'Rio Bonito': 0.19,
  'São Marcos': 0.20,
  'Vila Nova': 0.18,
  'Vila Nova I': 0.19,
  // Distrito Sul
  'Adhemar Garcia': 0.15,
  'Boehmerwald': 0.14,
  'Edla Jordan': 0.16,
  'Estevão de Matos': 0.18,
  'Fátima': 0.17,
  'Floresta': 0.19,
  'Itinga': 0.20,
  'Jardim Edilene': 0.22,
  'Jarivatuba': 0.21,
  'Ulysses Guimarães': 0.16
};

function shouldBeNoShow(ubsName) {
  const rate = noShowRates[ubsName] || 0.20;
  return Math.random() < rate;
}

// Gerar notificações baseadas na data do agendamento
function generateNotificacoes(dataAgendamento, dataCriacao, canal, statusFinal) {
  const notifs = [];
  const hoje = new Date();

  // D-3
  const d3 = addDays(dataAgendamento, -3);
  if (d3 >= dataCriacao && d3 <= hoje) {
    notifs.push({
      tipo: 'D-3',
      data: formatDate(d3),
      hora: '10:00',
      canal: canal,
      enviado: true,
      respondido: statusFinal === 'Confirmado' || statusFinal === 'Presente'
    });
  }

  // D-1
  const d1 = addDays(dataAgendamento, -1);
  if (d1 >= dataCriacao && d1 <= hoje) {
    notifs.push({
      tipo: 'D-1',
      data: formatDate(d1),
      hora: '14:00',
      canal: canal,
      enviado: Math.random() < 0.95, // 95% enviado
      respondido: statusFinal === 'Confirmado' || statusFinal === 'Presente'
    });
  }

  // D0 (dia do agendamento)
  if (dataAgendamento <= hoje) {
    notifs.push({
      tipo: 'D0',
      data: formatDate(dataAgendamento),
      hora: '08:00',
      canal: canal === 'WhatsApp' ? 'WhatsApp' : 'SMS',
      enviado: Math.random() < 0.90, // 90% enviado
      respondido: false
    });
  }

  return notifs;
}

// Gerar os dados
function generateMockData() {
  const dados = [];
  const hoje = new Date('2025-11-09'); // data de referência

  for (let i = 1; i <= NUM_REGISTROS; i++) {
    const dataAgendamento = randomDate(DATA_INICIO, DATA_FIM);
    const regiao = randomItem(regioes);
    const ubsName = randomItem(ubs[regiao]);
    const tipo = randomItem(tipos);
    const canal = randomItem(canais);

    // Data de criação: 7-14 dias antes do agendamento
    const diasAntes = Math.floor(7 + Math.random() * 7);
    const dataCriacao = addDays(dataAgendamento, -diasAntes);

    // Determinar status
    let statusFinal = getStatusForDate(dataAgendamento, hoje);

    // Ajustar para no-show realista por UBS
    if (statusFinal === 'Presente' && shouldBeNoShow(ubsName)) {
      statusFinal = 'Faltou';
    }

    // Origem: 90% direto, 10% fila de espera
    const origem = Math.random() < 0.90 ? 'Agendamento direto' : 'Fila de espera';

    // Confirmação
    const confirmado = statusFinal === 'Confirmado' || statusFinal === 'Presente';
    const dataConfirmacao = confirmado ?
      formatDate(addDays(dataAgendamento, -Math.floor(1 + Math.random() * 3))) :
      null;

    // Cancelamento
    const dataCancelamento = statusFinal === 'Cancelado' ?
      formatDate(addDays(dataAgendamento, -Math.floor(1 + Math.random() * 5))) :
      null;

    // Reagendamento
    const tempoReagendamentoDias = statusFinal === 'Reagendado' ?
      Math.floor(3 + Math.random() * 10) :
      null;

    // Notificações
    const notificacoes = generateNotificacoes(dataAgendamento, dataCriacao, canal, statusFinal);

    // Avisado se tem pelo menos uma notificação enviada
    const avisado = notificacoes.some(n => n.enviado);

    const registro = {
      id: i,
      data: formatDate(dataAgendamento),
      hora: randomItem(horarios),
      regiao: regiao,
      ubs: ubsName,
      tipo: tipo,
      paciente: generateNome(),
      contato: generatePhone(),
      canal_aviso: canal,
      avisado: avisado,
      confirmado: confirmado,
      status: statusFinal,

      // Novos campos
      data_criacao: formatDate(dataCriacao),
      data_confirmacao: dataConfirmacao,
      data_cancelamento: dataCancelamento,
      tempo_reagendamento_dias: tempoReagendamentoDias,
      notificacoes: notificacoes,
      origem: origem,
      substituiu_agendamento_id: origem === 'Fila de espera' && i > 50 ?
        Math.floor(Math.random() * (i - 1)) + 1 : null,
      motivo_cancelamento: statusFinal === 'Cancelado' ?
        randomItem(['Paciente desistiu', 'Remarcado pelo paciente', 'Erro no agendamento', 'Outros']) :
        null
    };

    dados.push(registro);
  }

  // Ordenar por data e hora
  dados.sort((a, b) => {
    if (a.data !== b.data) return a.data.localeCompare(b.data);
    return a.hora.localeCompare(b.hora);
  });

  return dados;
}

// Gerar e salvar
const mockData = generateMockData();

// Estatísticas
const stats = {
  total: mockData.length,
  por_status: {},
  por_regiao: {},
  por_tipo: {},
  por_canal: {},
  taxa_no_show: 0,
  taxa_confirmacao: 0
};

mockData.forEach(r => {
  stats.por_status[r.status] = (stats.por_status[r.status] || 0) + 1;
  stats.por_regiao[r.regiao] = (stats.por_regiao[r.regiao] || 0) + 1;
  stats.por_tipo[r.tipo] = (stats.por_tipo[r.tipo] || 0) + 1;
  stats.por_canal[r.canal_aviso] = (stats.por_canal[r.canal_aviso] || 0) + 1;
});

const passados = mockData.filter(r => new Date(r.data) < new Date('2025-11-09'));
const faltas = passados.filter(r => r.status === 'Faltou').length;
const presentes = passados.filter(r => r.status === 'Presente').length;
const confirmados = mockData.filter(r => r.confirmado).length;

stats.taxa_no_show = ((faltas / (faltas + presentes)) * 100).toFixed(2);
stats.taxa_confirmacao = ((confirmados / mockData.length) * 100).toFixed(2);

console.log('Mock Data gerado com sucesso!');
console.log(`Total de registros: ${stats.total}`);
console.log(`\nDistribuição por status:`);
Object.entries(stats.por_status).forEach(([k, v]) => {
  console.log(`  ${k}: ${v} (${((v/stats.total)*100).toFixed(1)}%)`);
});
console.log(`\nTaxa de No-show: ${stats.taxa_no_show}%`);
console.log(`Taxa de Confirmação: ${stats.taxa_confirmacao}%`);

// Salvar arquivo
fs.writeFileSync(
  './src/data/mockData.json',
  JSON.stringify(mockData, null, 2),
  'utf-8'
);

console.log('\nArquivo salvo em: ./src/data/mockData.json');

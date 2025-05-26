const API_BASE_URL = 'http://localhost:8080/api'; // Seu backend futuro

// Flag para usar dados mockados (mude para false quando o backend estiver pronto)
const USE_MOCK_DATA = true;

// Dados simulados para desenvolvimento
const MOCK_EVENTOS: Evento[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    tipo: 'Medição',
    descricao: 'pH da água medido automaticamente',
    valor: '7.2'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min atrás
    tipo: 'Alerta',
    descricao: 'Turbidez alta detectada nos sensores',
    valor: '15 NTU'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min atrás
    tipo: 'Sistema',
    descricao: 'Bomba de água ligada automaticamente'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    tipo: 'Medição',
    descricao: 'Temperatura da água coletada',
    valor: '23.5°C'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    tipo: 'Manutenção',
    descricao: 'Limpeza automática dos sensores concluída'
  }
];

export interface Evento {
  id: string;
  timestamp: string;
  tipo: string;
  descricao: string;
  valor?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Função para simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para buscar histórico de eventos
export async function getHistoricoEventos(): Promise<Evento[]> {
  // Se usar dados mockados
  if (USE_MOCK_DATA) {
    await delay(1000); // Simula delay de 1 segundo
    return MOCK_EVENTOS;
  }

  // Código real para o backend (quando estiver pronto)
  try {
    const response = await fetch(`${API_BASE_URL}/historico/eventos`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Evento[]> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao buscar histórico');
    }
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
}

// Função para buscar dados de monitoramento
export interface DadosMonitoramento {
  qualidadeAgua: number;
  temperatura: number;
  ph: number;
  turbidez: number;
  ultimaAtualizacao: string;
}

export async function getDadosMonitoramento(): Promise<DadosMonitoramento> {
  if (USE_MOCK_DATA) {
    await delay(800);
    return {
      qualidadeAgua: Math.floor(Math.random() * 30 + 70), // 70-100
      temperatura: parseFloat((Math.random() * 10 + 20).toFixed(1)), // 20-30°C
      ph: parseFloat((Math.random() * 2 + 6).toFixed(1)), // 6-8
      turbidez: Math.floor(Math.random() * 20 + 5), // 5-25 NTU
      ultimaAtualizacao: new Date().toISOString()
    };
  }

  // Código real para o backend
  try {
    const response = await fetch(`${API_BASE_URL}/monitoramento/dados-atuais`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<DadosMonitoramento> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao buscar dados de monitoramento');
    }
  } catch (error) {
    console.error('Erro ao buscar dados de monitoramento:', error);
    throw error;
  }
}

// Função para buscar alertas
export interface Alerta {
  id: string;
  tipo: 'critico' | 'aviso' | 'info';
  titulo: string;
  descricao: string;
  timestamp: string;
}

export async function getAlertas(): Promise<Alerta[]> {
  if (USE_MOCK_DATA) {
    await delay(600);
    return [
      {
        id: '1',
        tipo: 'critico',
        titulo: 'pH Crítico',
        descricao: 'pH da água está abaixo do limite seguro (5.2)',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString()
      },
      {
        id: '2',
        tipo: 'aviso',
        titulo: 'Turbidez Alta',
        descricao: 'Turbidez acima do normal detectada',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString()
      },
      {
        id: '3',
        tipo: 'info',
        titulo: 'Manutenção Programada',
        descricao: 'Limpeza dos sensores agendada para amanhã',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString()
      }
    ];
  }

  // Código real para o backend
  try {
    const response = await fetch(`${API_BASE_URL}/alertas`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<Alerta[]> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao buscar alertas');
    }
  } catch (error) {
    console.error('Erro ao buscar alertas:', error);
    throw error;
  }
}
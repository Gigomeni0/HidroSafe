const API_BASE_URL = 'http://localhost:8080/api'; // Seu backend futuro

// Flag para usar dados mockados (mude para false quando o backend estiver pronto)
const USE_MOCK_DATA = true;

// Variável para simular o estado dos controles (para mock)
let mockControleState: ControlesSistema = {
  bombaLigada: true,
  filtroAutomatico: true,
  alertasAtivos: true
};

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

// ===== INTERFACES =====
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

export interface DadosMonitoramento {
  qualidadeAgua: number;
  temperatura: number;
  ph: number;
  turbidez: number;
  ultimaAtualizacao: string;
}

export interface Alerta {
  id: string;
  tipo: 'critico' | 'aviso' | 'info';
  titulo: string;
  descricao: string;
  timestamp: string;
}

export interface ControlesSistema {
  bombaLigada: boolean;
  filtroAutomatico: boolean;
  alertasAtivos: boolean;
}

export interface ComandoControle {
  tipo: 'bomba' | 'filtro' | 'alertas' | 'emergencia';
  valor: boolean;
}

// ===== UTILITÁRIOS =====
// Função para simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== FUNÇÕES DA API =====

// Função para buscar histórico de eventos
export async function getHistoricoEventos(): Promise<Evento[]> {
  if (USE_MOCK_DATA) {
    await delay(1000); // Simula delay de 1 segundo
    return MOCK_EVENTOS;
  }

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

// Função para buscar estado atual dos controles
export async function getControlesSistema(): Promise<ControlesSistema> {
  if (USE_MOCK_DATA) {
    await delay(500);
    // Retorna o estado atual simulado
    return { ...mockControleState };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/controles/estado`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<ControlesSistema> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao buscar controles');
    }
  } catch (error) {
    console.error('Erro ao buscar controles:', error);
    throw error;
  }
}

// Função para executar comando de controle
export async function executarComandoControle(comando: ComandoControle): Promise<boolean> {
  if (USE_MOCK_DATA) {
    await delay(800);
    
    // Simula sucesso na maioria das vezes
    if (Math.random() > 0.1) {
      // Atualiza o estado mock
      switch (comando.tipo) {
        case 'bomba':
          mockControleState.bombaLigada = comando.valor;
          break;
        case 'filtro':
          mockControleState.filtroAutomatico = comando.valor;
          break;
        case 'alertas':
          mockControleState.alertasAtivos = comando.valor;
          break;
      }
      return true;
    } else {
      throw new Error('Falha na comunicação com o sistema');
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}/controles/comando`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comando),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<boolean> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao executar comando');
    }
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    throw error;
  }
}

// Função para parada de emergência
export async function paradaEmergencia(): Promise<boolean> {
  if (USE_MOCK_DATA) {
    await delay(1200);
    
    // Simula a parada de emergência desligando tudo
    mockControleState = {
      bombaLigada: false,
      filtroAutomatico: false,
      alertasAtivos: false
    };
    
    console.log('🚨 PARADA DE EMERGÊNCIA EXECUTADA - Todos os sistemas desligados');
    return true; // Sempre sucesso para emergência
  }

  try {
    const response = await fetch(`${API_BASE_URL}/controles/emergencia`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<boolean> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro na parada de emergência');
    }
  } catch (error) {
    console.error('Erro na parada de emergência:', error);
    throw error;
  }
}

// Função para reinicializar sistema após emergência
export async function reinicializarSistema(): Promise<boolean> {
  if (USE_MOCK_DATA) {
    await delay(1500);
    
    // Restaura configurações padrão
    mockControleState = {
      bombaLigada: true,
      filtroAutomatico: true,
      alertasAtivos: true
    };
    
    console.log('🔄 SISTEMA REINICIALIZADO - Configurações restauradas');
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/controles/reinicializar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result: ApiResponse<boolean> = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message || 'Erro ao reinicializar sistema');
    }
  } catch (error) {
    console.error('Erro ao reinicializar sistema:', error);
    throw error;
  }
}
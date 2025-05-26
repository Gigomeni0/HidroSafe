const API_BASE_URL = 'http://localhost:8080/api'; // Seu backend futuro

// Flag para usar dados mockados (mude para false quando o backend estiver pronto)
const USE_MOCK_DATA = true;

// Variável para simular o estado dos controles (para mock)
let mockControleState: ControlesSistema = {
  bombasDrenagem: true,
  comportasAbertas: false,
  alertasAtivos: true
};

// Dados simulados para desenvolvimento
const MOCK_EVENTOS: Evento[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    tipo: 'Medição',
    descricao: 'Nível do rio medido automaticamente',
    valor: '2.1m'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min atrás
    tipo: 'Alerta',
    descricao: 'Precipitação intensa detectada',
    valor: '45mm/h'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(), // 10 min atrás
    tipo: 'Sistema',
    descricao: 'Bomba de drenagem ativada automaticamente'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    tipo: 'Controle',
    descricao: 'Comporta de contenção fechada',
    valor: 'Setor A'
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    tipo: 'Manutenção',
    descricao: 'Verificação dos sensores de nível concluída'
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
  nivelRio: number; // em metros
  precipitacao: number; // mm/h
  risco: 'baixo' | 'medio' | 'alto' | 'critico';
  temperatura: number; // para contexto
  localizacao: string;
  sensorId: string;
  ultimaAtualizacao: string;
}

export interface Alerta {
  id: string;
  tipo: 'critico' | 'aviso' | 'info';
  titulo: string;
  descricao: string;
  timestamp: string;
  area?: string;
  resolvido?: boolean;
}

export interface ControlesSistema {
  bombasDrenagem: boolean;
  comportasAbertas: boolean;
  alertasAtivos: boolean;
}

export interface ComandoControle {
  tipo: 'bombas' | 'comportas' | 'alertas' | 'emergencia';
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
    
    const nivelRio = parseFloat((Math.random() * 3 + 1).toFixed(1)); // 1-4m
    let risco: 'baixo' | 'medio' | 'alto' | 'critico';
    
    if (nivelRio < 2) risco = 'baixo';
    else if (nivelRio < 2.5) risco = 'medio';
    else if (nivelRio < 3) risco = 'alto';
    else risco = 'critico';
    
    return {
      nivelRio,
      precipitacao: parseFloat((Math.random() * 60).toFixed(1)), // 0-60mm/h
      risco,
      temperatura: parseFloat((Math.random() * 10 + 18).toFixed(1)), // 18-28°C
      localizacao: 'Centro - Rio Principal',
      sensorId: 'HIDRO-001',
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
        titulo: 'Risco de Enchente',
        descricao: 'Nível do rio atingiu 3.2m - evacuação recomendada',
        timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
        area: 'Centro'
      },
      {
        id: '2',
        tipo: 'aviso',
        titulo: 'Precipitação Intensa',
        descricao: 'Chuva forte detectada - monitoramento ativo',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        area: 'Zona Norte'
      },
      {
        id: '3',
        tipo: 'info',
        titulo: 'Sistema Normalizado',
        descricao: 'Bombas de drenagem funcionando corretamente',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString()
      },
      {
        id: '4',
        tipo: 'aviso',
        titulo: 'Comporta Ativada',
        descricao: 'Comporta do setor B fechada preventivamente',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        area: 'Setor B'
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
        case 'bombas':
          mockControleState.bombasDrenagem = comando.valor;
          break;
        case 'comportas':
          mockControleState.comportasAbertas = comando.valor;
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
    
    // Simula a parada de emergência ativando todas as medidas de contenção
    mockControleState = {
      bombasDrenagem: true, // Ativa bombas para máxima drenagem
      comportasAbertas: false, // Fecha comportas para contenção
      alertasAtivos: true // Mantém alertas ativos
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
      bombasDrenagem: true,
      comportasAbertas: false, // Mantém comportas fechadas por segurança
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
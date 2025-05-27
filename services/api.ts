import { Platform } from 'react-native';

// Configura host de API, protegendo window em ambientes sem DOM (SSR)
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const HOST = Platform.OS === 'web' && typeof window !== 'undefined'
  ? window.location.hostname
  : DEFAULT_HOST;
const API_BASE_URL = `http://${HOST}:8080/api`; // Base genérica para endpoints (alertas, controle, histórico)
// Base específica para API de monitoramento (conforme backend exige /api/monitoramento)
const API_MONITORAMENTO_URL = `http://${HOST}:8080/api/monitoramento`;

// Flag para usar dados mockados (mude para false quando o backend estiver pronto)
const USE_MOCK_DATA = false;

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

// Dados simulados para alertas
const MOCK_ALERTAS: Alerta[] = [
  {
    id: '1',
    tipo: 'critico',
    titulo: 'Risco de Enchente',
    descricao: 'Nível do rio atingiu 3.2m - evacuação recomendada',
    timestamp: new Date().toISOString(),
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
  nivelRio: number;           // em metros
  vazao: number;              // vazão do rio
  risco: 'baixo' | 'medio' | 'alto' | 'critico';
  pressao: number;            // pressão do sistema
  localizacao: string;
  sensorId: string;
  ultimaAtualizacao: string;
  id?: number; // identifica o registro, usado para ordenar e validar novidade
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
  if (USE_MOCK_DATA) { await delay(1000); return MOCK_EVENTOS; }

  try {
    const response = await fetch(`${API_BASE_URL}/historico/eventos`);
    if (!response.ok) throw new Error(`Erro ${response.status} ao buscar histórico.`);
    const data: Evento[] = await response.json();
    return data;
  } catch (error: any) {
    console.error('getHistoricoEventos:', error);
    throw new Error(`Não foi possível carregar o histórico. ${error.message}`);
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
      vazao: parseFloat((Math.random() * 60).toFixed(1)), // 0-60mm/h
      risco,
      pressao: parseFloat((Math.random() * 10 + 18).toFixed(1)), // 18-28°C
      localizacao: 'Centro - Rio Principal',
      sensorId: 'HIDRO-001',
      ultimaAtualizacao: new Date().toISOString()
    };
  }

  try {
    const url = `${API_MONITORAMENTO_URL}/dados-atuais`;
    console.log('getDadosMonitoramento: fetching', url);
    // Configura opções de fetch: headers sempre, mode somente no web
    const fetchOptions: any = { headers: { 'Accept': 'application/json' } };
    if (Platform.OS === 'web') {
      fetchOptions.mode = 'cors';
    }
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      const msg = response.status === 404
        ? 'Dados de monitoramento não encontrados.'
        : `Erro ${response.status} ao buscar dados de monitoramento.`;
      throw new Error(msg);
    }
    const raw: any = await response.json();
    console.log('getDadosMonitoramento raw response:', raw);
    // Normaliza campos do backend para formato esperado
    const nivelRaw = raw.nivelAgua;
    const nivelRio = typeof nivelRaw === 'number' ? parseFloat((nivelRaw).toFixed(2)) : 0;
    const vazao = typeof raw.vazao === 'number' ? parseFloat(raw.vazao.toFixed(1)) : 0;
    const pressao = typeof raw.pressao === 'number' ? parseFloat(raw.pressao.toFixed(1)) : 0;
    const risco: 'baixo' | 'medio' | 'alto' | 'critico' =
      nivelRio < 2 ? 'baixo' : nivelRio < 2.5 ? 'medio' : nivelRio < 3 ? 'alto' : 'critico';
    const normalized: DadosMonitoramento = {
      nivelRio,
      vazao,
      pressao,
      risco,
      localizacao: raw.localizacao ?? '',
      sensorId: String(raw.id ?? ''),
      ultimaAtualizacao: raw.timestamp,
      id: typeof raw.id === 'number' ? raw.id : parseInt(raw.id, 10) || undefined
    };
    console.log('getDadosMonitoramento normalized:', normalized);
    return normalized;
  } catch (error: any) {
    console.error('getDadosMonitoramento:', error);
    throw new Error(`Não foi possível carregar os dados de monitoramento. ${error.message}`);
  }
}

export async function getAlertas(): Promise<Alerta[]> {
  if (USE_MOCK_DATA) {
    await delay(600);
    return MOCK_ALERTAS;
  }

  try {
    const url = `${API_BASE_URL}/alertas`;
    console.log('getAlertas: fetching', url);
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      const msg = response.status === 404
        ? 'Nenhum alerta encontrado.'
        : `Erro ${response.status} ao buscar alertas.`;
      throw new Error(msg);
    }
    // Recebe diretamente um array de Alertas
    const data: Alerta[] = await response.json();
    return data;
  } catch (error: any) {
    console.error('getAlertas:', error);
    throw new Error(`Não foi possível carregar os alertas. ${error.message}`);
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
    const url = `${API_BASE_URL}/controles/estado`;
    console.log('getControlesSistema: fetching', url);
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!response.ok) {
      throw new Error(`Erro ${response.status} ao buscar controles.`);
    }
    const data: ControlesSistema = await response.json();
    return data;
  } catch (error: any) {
    console.error('getControlesSistema:', error);
    throw new Error(`Não foi possível carregar os controles. ${error.message}`);
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
    
    // Verifica status da resposta e captura mensagem de erro do backend
    if (!response.ok) {
      let errorMsg: string;
      try {
        const errJson = await response.json();
        errorMsg = errJson.message || JSON.stringify(errJson);
      } catch {
        errorMsg = `HTTP error! status: ${response.status}`;
      }
      throw new Error(`Erro ${response.status} ao executar comando de controle. ${errorMsg}`);
    }

    // Parse o JSON puro (boolean) retornado pelo backend
    const data: boolean = await response.json();
    return data;
  } catch (error: any) {
    console.error('executarComandoControle:', error);
    throw new Error(`Erro ao executar comando de controle. ${error.message}`);
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
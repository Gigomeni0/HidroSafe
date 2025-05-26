const API_BASE_URL = 'http://localhost:8080/api'; // Ajuste para seu backend

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

// Função para buscar histórico de eventos
export async function getHistoricoEventos(): Promise<Evento[]> {
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

// Outras funções da API...
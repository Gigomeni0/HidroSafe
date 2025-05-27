import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getHistoricoEventos, Evento } from '@/services/api';

export default function HistoricoScreen() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados do backend
  const fetchEventos = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const data = await getHistoricoEventos();
      // Ordena por ID (numérico) decrescente para mostrar o último evento primeiro
      const sorted = data.slice().sort((a, b) => parseInt(b.id, 10) - parseInt(a.id, 10));
      setEventos(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar histórico:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchEventos();
  }, []);

  // Função de refresh (puxar para atualizar)
  const onRefresh = () => {
    fetchEventos(true);
  };
  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'Alerta': 
      case 'ALERTA':
        return { 
          color: '#FF6B6B', 
          bgColor: '#FFE8E8',
          icon: '🚨',
          textColor: '#D63031'
        };
      case 'Medição': 
      case 'MEDICAO':
        return { 
          color: '#4ECDC4', 
          bgColor: '#E8F4FD',
          icon: '📊',
          textColor: '#00B894'
        };
      case 'Sistema': 
      case 'SISTEMA':
        return { 
          color: '#45B7D1', 
          bgColor: '#E8F4FD',
          icon: '⚙️',
          textColor: '#0984E3'
        };
      case 'Controle': 
      case 'CONTROLE':
        return { 
          color: '#9B59B6', 
          bgColor: '#F4E8FF',
          icon: '🎛️',
          textColor: '#8E44AD'
        };
      case 'Manutenção': 
      case 'MANUTENCAO':
        return { 
          color: '#FFA726', 
          bgColor: '#FFF4E6',
          icon: '🔧',
          textColor: '#E17000'
        };
      default: 
        return { 
          color: '#74B9FF', 
          bgColor: '#F0F8FF',
          icon: '📋',
          textColor: '#636E72'
        };
    }
  };

  const renderEvento = ({ item }: { item: Evento }) => {
    const config = getTipoConfig(item.tipo);
    
    return (
      <View style={[styles.eventoCard, { backgroundColor: config.bgColor }]}>
        <View style={[styles.tipoIndicator, { backgroundColor: config.color }]} />
        
        <View style={styles.eventoContent}>
          <View style={styles.eventoHeader}>
            <View style={styles.tipoContainer}>
              <ThemedText style={styles.tipoIcon}>{config.icon}</ThemedText>
              <ThemedText style={[styles.tipo, { color: config.textColor }]}>
                {item.tipo}
              </ThemedText>
            </View>
            <ThemedText style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleString('pt-BR')}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.descricao}>{item.descricao}</ThemedText>
          
          {item.valor && (
            <View style={[styles.valorContainer, { backgroundColor: config.color + '20' }]}>
              <ThemedText style={[styles.valorLabel, { color: config.textColor }]}>
                Valor:
              </ThemedText>
              <ThemedText style={[styles.valor, { color: config.textColor }]}>
                {item.valor}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Componente de loading
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
        <ThemedText style={styles.loadingText}>Carregando histórico...</ThemedText>
      </ThemedView>
    );
  }

  // Componente de erro
  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
        <ThemedText 
          style={styles.retryText} 
          onPress={() => fetchEventos()}
        >
          Tentar novamente
        </ThemedText>
      </ThemedView>
    );
  }

  // Lista vazia
  if (eventos.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.emptyText}>📋 Nenhum evento encontrado</ThemedText>
        <ThemedText 
          style={styles.retryText} 
          onPress={() => fetchEventos()}
        >
          Atualizar
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Histórico do Sistema</ThemedText>
        <ThemedText style={styles.subtitle}>
          Eventos do sistema de prevenção de enchentes ({eventos.length} registros)
        </ThemedText>
      </View>
      
      <FlatList
        data={eventos}
        renderItem={renderEvento}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0984E3']}
            tintColor="#0984E3"
          />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    textAlign: 'center',
    marginBottom: 5,
    color: '#1A202C',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    color: '#64748B',
    fontWeight: '400',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
  },
  errorText: {
    color: '#D63031',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    color: '#64748B',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  retryText: {
    color: '#0984E3',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
    paddingBottom: 100,
  },
  eventoCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  tipoIndicator: {
    width: 6,
  },
  eventoContent: {
    flex: 1,
    padding: 16,
  },
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipo: {
    fontWeight: '600',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  descricao: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  valorLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  valor: {
    fontSize: 13,
    fontWeight: '700',
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAlertas, type Alerta } from '@/services/api';

export default function AlertasScreen() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'critico' | 'aviso' | 'info'>('todos');

  const carregarAlertas = async () => {
    try {
      const alertasData = await getAlertas();
      setAlertas(alertasData);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os alertas');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarAlertas();
    setRefreshing(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await carregarAlertas();
      setLoading(false);
    };

    initializeData();

    // Atualizar alertas a cada 10 segundos
    const interval = setInterval(carregarAlertas, 10000);

    return () => clearInterval(interval);
  }, []);
  const getAlertaConfig = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return {
          icon: '🚨',
          color: '#F44336',
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336'
        };
      case 'aviso':
        return {
          icon: '⚠️',
          color: '#FF9800',
          backgroundColor: '#FFF8E1',
          borderColor: '#FF9800'
        };
      case 'info':
        return {
          icon: 'ℹ️',
          color: '#2196F3',
          backgroundColor: '#E3F2FD',
          borderColor: '#2196F3'
        };
      default:
        return {
          icon: '📋',
          color: '#757575',
          backgroundColor: '#F5F5F5',
          borderColor: '#757575'
        };
    }
  };

  const formatarTempo = (timestamp: string) => {
    const agora = new Date();
    const dataAlerta = new Date(timestamp);
    const diffMs = agora.getTime() - dataAlerta.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
    return `${Math.floor(diffMins / 1440)}d atrás`;
  };

  const alertasFiltrados = filtroTipo === 'todos' 
    ? alertas 
    : alertas.filter(alerta => alerta.tipo === filtroTipo);
  const contadores = {
    critico: alertas.filter(a => a.tipo === 'critico').length,
    aviso: alertas.filter(a => a.tipo === 'aviso').length,
    info: alertas.filter(a => a.tipo === 'info').length,
    total: alertas.length
  };

  if (loading && alertas.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Carregando alertas...</ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Alertas</ThemedText>
          <ThemedText style={styles.subtitle}>
            {contadores.total} alertas • {contadores.critico} críticos
          </ThemedText>
        </ThemedView>

        {/* Resumo */}
        <ThemedView style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>Resumo de Alertas</ThemedText>
          <ThemedView style={styles.summaryGrid}>
            <ThemedView style={[styles.summaryItem, { backgroundColor: '#FFEBEE' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#F44336' }]}>
                {contadores.critico}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Críticos</ThemedText>
            </ThemedView>            <ThemedView style={[styles.summaryItem, { backgroundColor: '#FFF8E1' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#FF9800' }]}>
                {contadores.aviso}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Avisos</ThemedText>
            </ThemedView>
            <ThemedView style={[styles.summaryItem, { backgroundColor: '#E3F2FD' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#2196F3' }]}>
                {contadores.info}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Informativos</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Filtros */}
        <ThemedView style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroTipo === 'todos' && styles.filterButtonActive
              ]}
              onPress={() => setFiltroTipo('todos')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                filtroTipo === 'todos' && styles.filterButtonTextActive
              ]}>
                Todos ({contadores.total})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroTipo === 'critico' && styles.filterButtonActive
              ]}
              onPress={() => setFiltroTipo('critico')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                filtroTipo === 'critico' && styles.filterButtonTextActive
              ]}>
                Críticos ({contadores.critico})
              </ThemedText>
            </TouchableOpacity>            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroTipo === 'aviso' && styles.filterButtonActive
              ]}
              onPress={() => setFiltroTipo('aviso')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                filtroTipo === 'aviso' && styles.filterButtonTextActive
              ]}>
                Avisos ({contadores.aviso})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                filtroTipo === 'info' && styles.filterButtonActive
              ]}
              onPress={() => setFiltroTipo('info')}
            >
              <ThemedText style={[
                styles.filterButtonText,
                filtroTipo === 'info' && styles.filterButtonTextActive
              ]}>
                Info ({contadores.info})
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>

        {/* Lista de Alertas */}
        <ThemedView style={styles.alertsList}>
          {alertasFiltrados.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                {filtroTipo === 'todos' 
                  ? 'Nenhum alerta encontrado'
                  : `Nenhum alerta do tipo "${filtroTipo}" encontrado`
                }
              </ThemedText>
            </ThemedView>
          ) : (
            alertasFiltrados.map((alerta) => {
              const config = getAlertaConfig(alerta.tipo);
              return (
                <TouchableOpacity
                  key={alerta.id}
                  style={[
                    styles.alertaCard,
                    {
                      backgroundColor: config.backgroundColor,
                      borderLeftColor: config.borderColor
                    }
                  ]}
                  onPress={() => {
                    Alert.alert(
                      alerta.titulo,
                      `${alerta.descricao}\n\nData: ${new Date(alerta.timestamp).toLocaleString('pt-BR')}`,
                      [{ text: 'OK' }]
                    );
                  }}
                >
                  <ThemedView style={styles.alertaHeader}>
                    <ThemedView style={styles.alertaTitleContainer}>
                      <ThemedText style={styles.alertaIcon}>{config.icon}</ThemedText>
                      <ThemedText style={[styles.alertaTitulo, { color: config.color }]}>
                        {alerta.titulo}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.alertaTempo}>
                      {formatarTempo(alerta.timestamp)}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.alertaDescricao}>
                    {alerta.descricao}
                  </ThemedText>
                  <ThemedView style={styles.alertaFooter}>
                    <ThemedText style={styles.alertaTipo}>
                      {alerta.tipo.toUpperCase()}
                    </ThemedText>
                    {alerta.resolvido && (
                      <ThemedText style={styles.alertaResolvido}>
                        ✓ Resolvido
                      </ThemedText>
                    )}
                  </ThemedView>
                </TouchableOpacity>
              );
            })
          )}
        </ThemedView>

        {/* Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  alertsList: {
    gap: 12,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  alertaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertaTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertaIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  alertaTempo: {
    fontSize: 12,
    color: '#999',
  },
  alertaDescricao: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  alertaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertaTipo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertaResolvido: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
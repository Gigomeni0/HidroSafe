import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, ActivityIndicator, View } from 'react-native';
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
  };  if (loading && alertas.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
        <ThemedText style={styles.loadingText}>Carregando alertas...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Alertas do Sistema</ThemedText>
        <ThemedText style={styles.subtitle}>
          {contadores.total} alertas • {contadores.critico} críticos
        </ThemedText>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0984E3']} tintColor="#0984E3" />}
        contentContainerStyle={styles.content}
      >
        {/* Resumo */}
        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>📊 Resumo de Alertas</ThemedText>
          <View style={styles.summaryGrid}>
            <View style={[styles.summaryItem, { backgroundColor: '#FFEBEE' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#F44336' }]}>
                {contadores.critico}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Críticos</ThemedText>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: '#FFF8E1' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#FF9800' }]}>
                {contadores.aviso}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Avisos</ThemedText>
            </View>
            <View style={[styles.summaryItem, { backgroundColor: '#E3F2FD' }]}>
              <ThemedText style={[styles.summaryNumber, { color: '#2196F3' }]}>
                {contadores.info}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Informativos</ThemedText>
            </View>
          </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
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
            </TouchableOpacity>
            <TouchableOpacity
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
        </View>

        {/* Lista de Alertas */}
        <View style={styles.alertsList}>
          {alertasFiltrados.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                {filtroTipo === 'todos' 
                  ? 'Nenhum alerta encontrado'
                  : `Nenhum alerta do tipo "${filtroTipo}" encontrado`
                }
              </ThemedText>
            </View>
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
                  <View style={styles.alertaHeader}>
                    <View style={styles.alertaTitleContainer}>
                      <ThemedText style={styles.alertaIcon}>{config.icon}</ThemedText>
                      <ThemedText style={[styles.alertaTitulo, { color: config.color }]}>
                        {alerta.titulo}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.alertaTempo}>
                      {formatarTempo(alerta.timestamp)}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.alertaDescricao}>
                    {alerta.descricao}
                  </ThemedText>
                  <View style={styles.alertaFooter}>
                    <ThemedText style={styles.alertaTipo}>
                      {alerta.tipo.toUpperCase()}
                    </ThemedText>
                    {alerta.resolvido && (
                      <ThemedText style={styles.alertaResolvido}>
                        ✓ Resolvido
                      </ThemedText>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        {/* Footer */}
        <View style={styles.footer}>
           <ThemedText style={styles.footerText}>
             Última atualização: {new Date().toLocaleTimeString('pt-BR')}
           </ThemedText>
        </View>
       </ScrollView>
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
  },  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A202C',
    textAlign: 'center',
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
    borderRadius: 12,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    marginTop: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  filterButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterButtonActive: {
    backgroundColor: '#0984E3',
    borderColor: '#0984E3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },  alertsList: {
    margin: 16,
    marginTop: 0,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  alertaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
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
  },  alertaTitulo: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  alertaTempo: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  alertaDescricao: {
    fontSize: 14,
    color: '#374151',
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
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertaResolvido: {
    fontSize: 12,
    color: '#00B894',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
  },
  content: {
    paddingBottom: 20,
  },
});
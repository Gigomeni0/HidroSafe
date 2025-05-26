import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getDadosMonitoramento, getAlertas, getControlesSistema, type DadosMonitoramento, type Alerta, type ControlesSistema } from '@/services/api';

export default function HomeScreen() {
  const [dadosMonitoramento, setDadosMonitoramento] = useState<DadosMonitoramento | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [controles, setControles] = useState<ControlesSistema | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const [dadosResponse, alertasResponse, controlesResponse] = await Promise.all([
        getDadosMonitoramento(),
        getAlertas(),
        getControlesSistema()
      ]);

      setDadosMonitoramento(dadosResponse);
      setAlertas(alertasResponse);
      setControles(controlesResponse);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do dashboard');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await carregarDados();
      setLoading(false);
    };

    initializeData();

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(carregarDados, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRiscoStatus = (risco: string) => {
    switch (risco) {
      case 'baixo': return { texto: 'Baixo', cor: '#4CAF50' };
      case 'medio': return { texto: 'Médio', cor: '#FF9800' };
      case 'alto': return { texto: 'Alto', cor: '#F44336' };
      case 'critico': return { texto: 'Crítico', cor: '#D32F2F' };
      default: return { texto: 'Desconhecido', cor: '#757575' };
    }
  };

  const getNivelStatus = (nivel: number) => {
    if (nivel < 2) return { texto: 'Normal', cor: '#4CAF50' };
    if (nivel < 2.5) return { texto: 'Atenção', cor: '#FF9800' };
    if (nivel < 3) return { texto: 'Alerta', cor: '#F44336' };
    return { texto: 'Crítico', cor: '#D32F2F' };
  };

  const alertasCriticos = alertas.filter(a => a.tipo === 'critico');

  if (loading && !dadosMonitoramento) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Carregando dashboard...</ThemedText>
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
          <ThemedText type="title">HidroSafe</ThemedText>
          <ThemedText style={styles.subtitle}>Sistema de Prevenção de Enchentes</ThemedText>
        </ThemedView>

        {/* Alertas Críticos */}
        {alertasCriticos.length > 0 && (
          <ThemedView style={styles.alertSection}>
            <ThemedText style={styles.alertTitle}>⚠️ Alertas Críticos</ThemedText>
            {alertasCriticos.map(alerta => (
              <TouchableOpacity key={alerta.id} style={styles.alertCard}>
                <ThemedText style={styles.alertCardTitle}>{alerta.titulo}</ThemedText>
                <ThemedText style={styles.alertCardDesc}>{alerta.descricao}</ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        )}

        {/* Nível de Risco */}
        {dadosMonitoramento && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Nível de Risco Atual</ThemedText>
            <ThemedView style={styles.qualidadeCard}>
              <ThemedText style={styles.qualidadeValor}>{dadosMonitoramento.nivelRio}m</ThemedText>
              <ThemedText style={[
                styles.qualidadeStatus,
                { color: getRiscoStatus(dadosMonitoramento.risco).cor }
              ]}>
                Risco {getRiscoStatus(dadosMonitoramento.risco).texto}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {/* Métricas */}
        {dadosMonitoramento && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Parâmetros Atuais</ThemedText>
            <ThemedView style={styles.metricsContainer}>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Nível do Rio</ThemedText>
                <ThemedText style={[
                  styles.metricValue,
                  { color: getNivelStatus(dadosMonitoramento.nivelRio).cor }
                ]}>
                  {dadosMonitoramento.nivelRio}m
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Precipitação</ThemedText>
                <ThemedText style={styles.metricValue}>{dadosMonitoramento.precipitacao} mm/h</ThemedText>
              </ThemedView>
              <ThemedView style={styles.metricCard}>
                <ThemedText style={styles.metricLabel}>Temperatura</ThemedText>
                <ThemedText style={styles.metricValue}>{dadosMonitoramento.temperatura}°C</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Status do Sistema */}
        {controles && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Status do Sistema</ThemedText>
            <ThemedView style={styles.statusContainer}>
              <ThemedView style={styles.statusItem}>
                <ThemedText style={styles.statusLabel}>Bombas de Drenagem</ThemedText>
                <ThemedText style={[
                  styles.statusValue,
                  { color: controles.bombasDrenagem ? '#4CAF50' : '#F44336' }
                ]}>
                  {controles.bombasDrenagem ? 'Ativas' : 'Inativas'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statusItem}>
                <ThemedText style={styles.statusLabel}>Comportas</ThemedText>
                <ThemedText style={[
                  styles.statusValue,
                  { color: controles.comportasAbertas ? '#FF9800' : '#4CAF50' }
                ]}>
                  {controles.comportasAbertas ? 'Abertas' : 'Fechadas'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statusItem}>
                <ThemedText style={styles.statusLabel}>Alertas</ThemedText>
                <ThemedText style={[
                  styles.statusValue,
                  { color: controles.alertasAtivos ? '#4CAF50' : '#F44336' }
                ]}>
                  {controles.alertasAtivos ? 'Ativos' : 'Desativados'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {/* Última Atualização */}
        {dadosMonitoramento && (
          <ThemedView style={styles.footer}>
            <ThemedText style={styles.lastUpdate}>
              Última atualização: {new Date(dadosMonitoramento.ultimaAtualizacao).toLocaleTimeString('pt-BR')}
            </ThemedText>
          </ThemedView>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertSection: {
    marginBottom: 20,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 12,
  },
  alertCard: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertCardTitle: {
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 4,
  },
  alertCardDesc: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  qualidadeCard: {
    alignItems: 'center',
    padding: 20,
  },
  qualidadeValor: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  qualidadeStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  lastUpdate: {
    fontSize: 12,
    color: '#999',
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getDadosMonitoramento, type DadosMonitoramento } from '@/services/api';

const { width } = Dimensions.get('window');

export default function MonitoramentoScreen() {
  const [dadosMonitoramento, setDadosMonitoramento] = useState<DadosMonitoramento | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      const dados = await getDadosMonitoramento();
      setDadosMonitoramento(dados);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados de monitoramento');
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

    // Atualizar dados a cada 5 segundos para monitoramento em tempo real
    const interval = setInterval(carregarDados, 5000);

    return () => clearInterval(interval);
  }, []);
  const getParameterStatus = (value: number, min: number, max: number) => {
    if (value < min || value > max) {
      return { status: 'Crítico', color: '#F44336' };
    } else if (value <= min + (max - min) * 0.1 || value >= max - (max - min) * 0.1) {
      return { status: 'Atenção', color: '#FF9800' };
    }
    return { status: 'Normal', color: '#4CAF50' };
  };

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return '#4CAF50';
      case 'medio': return '#FF9800';
      case 'alto': return '#F44336';
      case 'critico': return '#D32F2F';
      default: return '#757575';
    }
  };

  const getNivelStatus = (nivel: number) => getParameterStatus(nivel, 0.5, 2.0);
  const getPrecipitacaoStatus = (prec: number) => getParameterStatus(prec, 0, 30);
  const getTemperaturaStatus = (temp: number) => getParameterStatus(temp, 15, 35);

  if (loading && !dadosMonitoramento) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText>Carregando dados de monitoramento...</ThemedText>
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
      <ThemedView style={styles.content}>        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title">Monitoramento</ThemedText>
          <ThemedText style={styles.subtitle}>Sistema de Prevenção de Enchentes</ThemedText>
          {dadosMonitoramento && (
            <ThemedText style={styles.timestamp}>
              Última atualização: {new Date(dadosMonitoramento.ultimaAtualizacao).toLocaleTimeString('pt-BR')}
            </ThemedText>
          )}
        </ThemedView>        {dadosMonitoramento && (
          <>
            {/* Nível de Risco */}
            <ThemedView style={styles.qualityCard}>
              <ThemedText style={styles.cardTitle}>Nível de Risco</ThemedText>
              <ThemedView style={styles.qualityDisplay}>
                <ThemedText style={[
                  styles.qualityValue,
                  { color: getRiscoColor(dadosMonitoramento.risco) }
                ]}>
                  {dadosMonitoramento.risco.toUpperCase()}
                </ThemedText>
                <ThemedText style={styles.qualityStatus}>
                  Nível do Rio: {dadosMonitoramento.nivelRio}m
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Parâmetros Principais */}
            <ThemedView style={styles.parametersGrid}>
              {/* Nível do Rio */}
              <ThemedView style={styles.parameterCard}>
                <ThemedText style={styles.parameterTitle}>Nível do Rio</ThemedText>
                <ThemedText style={styles.parameterValue}>{dadosMonitoramento.nivelRio}m</ThemedText>
                <ThemedText style={[
                  styles.parameterStatus,
                  { color: getNivelStatus(dadosMonitoramento.nivelRio).color }
                ]}>
                  {getNivelStatus(dadosMonitoramento.nivelRio).status}
                </ThemedText>
                <ThemedText style={styles.parameterRange}>Normal: 0.5 - 2.0m</ThemedText>
              </ThemedView>

              {/* Precipitação */}
              <ThemedView style={styles.parameterCard}>
                <ThemedText style={styles.parameterTitle}>Precipitação</ThemedText>
                <ThemedText style={styles.parameterValue}>{dadosMonitoramento.precipitacao} mm/h</ThemedText>
                <ThemedText style={[
                  styles.parameterStatus,
                  { color: getPrecipitacaoStatus(dadosMonitoramento.precipitacao).color }
                ]}>
                  {getPrecipitacaoStatus(dadosMonitoramento.precipitacao).status}
                </ThemedText>
                <ThemedText style={styles.parameterRange}>Normal: 0 - 30 mm/h</ThemedText>
              </ThemedView>

              {/* Temperatura */}
              <ThemedView style={styles.parameterCard}>
                <ThemedText style={styles.parameterTitle}>Temperatura</ThemedText>
                <ThemedText style={styles.parameterValue}>{dadosMonitoramento.temperatura}°C</ThemedText>
                <ThemedText style={[
                  styles.parameterStatus,
                  { color: getTemperaturaStatus(dadosMonitoramento.temperatura).color }
                ]}>
                  {getTemperaturaStatus(dadosMonitoramento.temperatura).status}
                </ThemedText>
                <ThemedText style={styles.parameterRange}>Normal: 15 - 35°C</ThemedText>
              </ThemedView>

              {/* Status Geral */}
              <ThemedView style={styles.parameterCard}>
                <ThemedText style={styles.parameterTitle}>Status Geral</ThemedText>
                <ThemedText style={[
                  styles.parameterValue,
                  { color: getRiscoColor(dadosMonitoramento.risco), fontSize: 16 }
                ]}>
                  {dadosMonitoramento.risco === 'baixo' ? '✓ Seguro' :
                   dadosMonitoramento.risco === 'medio' ? '⚠ Atenção' :
                   dadosMonitoramento.risco === 'alto' ? '⚠ Alerta' : '🚨 Emergência'}
                </ThemedText>
                <ThemedText style={[
                  styles.parameterStatus,
                  { color: getRiscoColor(dadosMonitoramento.risco) }
                ]}>
                  {dadosMonitoramento.risco === 'critico' ? 'EVACUAÇÃO' : 'Monitorando'}
                </ThemedText>
                <ThemedText style={styles.parameterRange}>Sistema ativo</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Informações Adicionais */}
            <ThemedView style={styles.infoCard}>
              <ThemedText style={styles.cardTitle}>Informações do Sistema</ThemedText>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Localização:</ThemedText>
                <ThemedText style={styles.infoValue}>{dadosMonitoramento.localizacao}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Sensor ID:</ThemedText>
                <ThemedText style={styles.infoValue}>{dadosMonitoramento.sensorId}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Status:</ThemedText>
                <ThemedText style={[
                  styles.infoValue,
                  { color: '#4CAF50' }
                ]}>
                  Online
                </ThemedText>
              </ThemedView>
            </ThemedView>            {/* Tendências Simples */}
            <ThemedView style={styles.trendsCard}>
              <ThemedText style={styles.cardTitle}>Tendências (24h)</ThemedText>
              <ThemedView style={styles.trendItem}>
                <ThemedText style={styles.trendLabel}>Nível do Rio</ThemedText>
                <ThemedText style={[styles.trendValue, { color: dadosMonitoramento.nivelRio > 1.5 ? '#F44336' : '#4CAF50' }]}>
                  {dadosMonitoramento.nivelRio > 1.5 ? '↗ Subindo' : '↘ Estável'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.trendItem}>
                <ThemedText style={styles.trendLabel}>Precipitação</ThemedText>
                <ThemedText style={[styles.trendValue, { color: dadosMonitoramento.precipitacao > 20 ? '#FF9800' : '#4CAF50' }]}>
                  {dadosMonitoramento.precipitacao > 20 ? '↗ Intensificando' : '↘ Diminuindo'}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.trendItem}>
                <ThemedText style={styles.trendLabel}>Risco Geral</ThemedText>
                <ThemedText style={[styles.trendValue, { color: getRiscoColor(dadosMonitoramento.risco) }]}>
                  {dadosMonitoramento.risco === 'baixo' ? '↘ Controlado' :
                   dadosMonitoramento.risco === 'medio' ? '→ Monitorando' : '↗ Aumentando'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </>
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
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  qualityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  qualityDisplay: {
    alignItems: 'center',
  },
  qualityValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  qualityStatus: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  parametersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  parameterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: (width - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  parameterTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  parameterStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  parameterRange: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  trendsCard: {
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
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trendLabel: {
    fontSize: 14,
    color: '#666',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
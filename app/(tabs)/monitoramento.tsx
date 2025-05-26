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
      return { status: 'CRÍTICO', color: '#F44336', backgroundColor: '#FFEBEE' };
    } else if (value <= min + (max - min) * 0.1 || value >= max - (max - min) * 0.1) {
      return { status: 'ATENÇÃO', color: '#FF9800', backgroundColor: '#FFF3E0' };
    }
    return { status: 'NORMAL', color: '#4CAF50', backgroundColor: '#E8F5E8' };
  };

  const getRiscoInfo = (risco: string) => {
    switch (risco) {
      case 'baixo': 
        return { 
          color: '#4CAF50', 
          backgroundColor: '#E8F5E8',
          icon: '🟢',
          description: 'Sistema operando dentro dos parâmetros normais'
        };
      case 'medio': 
        return { 
          color: '#FF9800', 
          backgroundColor: '#FFF3E0',
          icon: '🟡',
          description: 'Monitoramento contínuo necessário'
        };
      case 'alto': 
        return { 
          color: '#F44336', 
          backgroundColor: '#FFEBEE',
          icon: '🟠',
          description: 'Condições adversas detectadas'
        };
      case 'critico': 
        return { 
          color: '#D32F2F', 
          backgroundColor: '#FFCDD2',
          icon: '🔴',
          description: 'Situação de emergência ativa'
        };
      default: 
        return { 
          color: '#757575', 
          backgroundColor: '#F5F5F5',
          icon: '⚫',
          description: 'Status indefinido'
        };
    }
  };

  const getRiscoColor = (risco: string) => getRiscoInfo(risco).color;

  const getNivelStatus = (nivel: number) => getParameterStatus(nivel, 0.5, 2.0);
  const getPrecipitacaoStatus = (prec: number) => getParameterStatus(prec, 0, 30);
  const getTemperaturaStatus = (temp: number) => getParameterStatus(temp, 15, 35);
  if (loading && !dadosMonitoramento) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>⚡ Sincronizando dados técnicos...</ThemedText>
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
        {/* Header Técnico */}
        <ThemedView style={styles.technicalHeader}>
          <ThemedText style={styles.headerTitle}>🖥️ MONITORAMENTO TÉCNICO</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Sistema de Prevenção de Enchentes - SisPE v2.1</ThemedText>
          {dadosMonitoramento && (
            <ThemedView style={styles.timestampContainer}>
              <ThemedText style={styles.timestampLabel}>ÚLTIMA SINCRONIZAÇÃO</ThemedText>
              <ThemedText style={styles.timestamp}>
                {new Date(dadosMonitoramento.ultimaAtualizacao).toLocaleString('pt-BR')}
              </ThemedText>
              <ThemedText style={styles.location}>📍 {dadosMonitoramento.localizacao}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {dadosMonitoramento && (
          <>
            {/* Status de Risco Principal */}
            <ThemedView style={[
              styles.riskStatusCard,
              { backgroundColor: getRiscoInfo(dadosMonitoramento.risco).backgroundColor }
            ]}>
              <ThemedView style={styles.riskHeader}>
                <ThemedText style={styles.riskIcon}>
                  {getRiscoInfo(dadosMonitoramento.risco).icon}
                </ThemedText>
                <ThemedView style={styles.riskInfo}>
                  <ThemedText style={styles.riskLabel}>NÍVEL DE RISCO</ThemedText>
                  <ThemedText style={[
                    styles.riskValue,
                    { color: getRiscoInfo(dadosMonitoramento.risco).color }
                  ]}>
                    {dadosMonitoramento.risco.toUpperCase()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedText style={styles.riskDescription}>
                {getRiscoInfo(dadosMonitoramento.risco).description}
              </ThemedText>
            </ThemedView>

            {/* Grid de Parâmetros Técnicos */}
            <ThemedView style={styles.parametersSection}>
              <ThemedText style={styles.sectionTitle}>📊 PARÂMETROS DE MONITORAMENTO</ThemedText>
              
              {/* Nível do Rio */}
              <ThemedView style={[
                styles.parameterCard,
                { backgroundColor: getNivelStatus(dadosMonitoramento.nivelRio).backgroundColor }
              ]}>
                <ThemedView style={styles.parameterHeader}>
                  <ThemedText style={styles.parameterIcon}>🌊</ThemedText>
                  <ThemedView style={styles.parameterInfo}>
                    <ThemedText style={styles.parameterTitle}>NÍVEL HIDROMÉTRICO</ThemedText>
                    <ThemedText style={styles.parameterValue}>{dadosMonitoramento.nivelRio} m</ThemedText>
                  </ThemedView>
                  <ThemedText style={[
                    styles.parameterStatus,
                    { color: getNivelStatus(dadosMonitoramento.nivelRio).color }
                  ]}>
                    {getNivelStatus(dadosMonitoramento.nivelRio).status}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.parameterDetails}>
                  <ThemedText style={styles.parameterRange}>Faixa normal: 0.5 - 2.0 m</ThemedText>
                  <ThemedText style={styles.parameterTrend}>
                    {dadosMonitoramento.nivelRio > 1.5 ? '📈 Tendência de subida' : '📉 Estável/Descendo'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Precipitação */}
              <ThemedView style={[
                styles.parameterCard,
                { backgroundColor: getPrecipitacaoStatus(dadosMonitoramento.precipitacao).backgroundColor }
              ]}>
                <ThemedView style={styles.parameterHeader}>
                  <ThemedText style={styles.parameterIcon}>🌧️</ThemedText>
                  <ThemedView style={styles.parameterInfo}>
                    <ThemedText style={styles.parameterTitle}>ÍNDICE PLUVIOMÉTRICO</ThemedText>
                    <ThemedText style={styles.parameterValue}>{dadosMonitoramento.precipitacao} mm/h</ThemedText>
                  </ThemedView>
                  <ThemedText style={[
                    styles.parameterStatus,
                    { color: getPrecipitacaoStatus(dadosMonitoramento.precipitacao).color }
                  ]}>
                    {getPrecipitacaoStatus(dadosMonitoramento.precipitacao).status}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.parameterDetails}>
                  <ThemedText style={styles.parameterRange}>Limite seguro: 0 - 30 mm/h</ThemedText>
                  <ThemedText style={styles.parameterTrend}>
                    {dadosMonitoramento.precipitacao > 15 ? '⚠️ Chuva intensa' : '☁️ Precipitação normal'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Temperatura */}
              <ThemedView style={[
                styles.parameterCard,
                { backgroundColor: getTemperaturaStatus(dadosMonitoramento.temperatura).backgroundColor }
              ]}>
                <ThemedView style={styles.parameterHeader}>
                  <ThemedText style={styles.parameterIcon}>🌡️</ThemedText>
                  <ThemedView style={styles.parameterInfo}>
                    <ThemedText style={styles.parameterTitle}>TEMPERATURA AMBIENTE</ThemedText>
                    <ThemedText style={styles.parameterValue}>{dadosMonitoramento.temperatura}°C</ThemedText>
                  </ThemedView>
                  <ThemedText style={[
                    styles.parameterStatus,
                    { color: getTemperaturaStatus(dadosMonitoramento.temperatura).color }
                  ]}>
                    {getTemperaturaStatus(dadosMonitoramento.temperatura).status}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.parameterDetails}>
                  <ThemedText style={styles.parameterRange}>Faixa operacional: 15 - 35°C</ThemedText>
                  <ThemedText style={styles.parameterTrend}>
                    🌡️ Condições térmicas estáveis
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Análise Técnica */}
            <ThemedView style={styles.analysisSection}>
              <ThemedText style={styles.sectionTitle}>🔬 ANÁLISE TÉCNICA</ThemedText>
              <ThemedView style={styles.analysisGrid}>
                <ThemedView style={styles.analysisItem}>
                  <ThemedText style={styles.analysisLabel}>Capacidade de Drenagem</ThemedText>
                  <ThemedText style={styles.analysisValue}>
                    {dadosMonitoramento.precipitacao > 20 ? '78%' : '95%'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.analysisItem}>
                  <ThemedText style={styles.analysisLabel}>Vazão Estimada</ThemedText>
                  <ThemedText style={styles.analysisValue}>
                    {(dadosMonitoramento.nivelRio * 1.5).toFixed(1)} m³/s
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.analysisItem}>
                  <ThemedText style={styles.analysisLabel}>Pressão Atmosférica</ThemedText>
                  <ThemedText style={styles.analysisValue}>1013 hPa</ThemedText>
                </ThemedView>
                <ThemedView style={styles.analysisItem}>
                  <ThemedText style={styles.analysisLabel}>Humidade Relativa</ThemedText>
                  <ThemedText style={styles.analysisValue}>
                    {Math.min(95, Math.max(30, 45 + dadosMonitoramento.precipitacao * 2))}%
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>

            {/* Tendências */}
            <ThemedView style={styles.trendsSection}>
              <ThemedText style={styles.sectionTitle}>📈 TENDÊNCIAS (24h)</ThemedText>
              <ThemedView style={styles.trendGrid}>
                <ThemedView style={styles.trendItem}>
                  <ThemedText style={styles.trendLabel}>Nível do Rio</ThemedText>
                  <ThemedText style={[
                    styles.trendValue,
                    { color: dadosMonitoramento.nivelRio > 1.5 ? '#F44336' : '#4CAF50' }
                  ]}>
                    {dadosMonitoramento.nivelRio > 1.5 ? '+15cm' : '-3cm'}
                  </ThemedText>
                  <ThemedText style={styles.trendIndicator}>
                    {dadosMonitoramento.nivelRio > 1.5 ? '↗️' : '↘️'}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.trendItem}>
                  <ThemedText style={styles.trendLabel}>Precipitação</ThemedText>
                  <ThemedText style={[
                    styles.trendValue,
                    { color: dadosMonitoramento.precipitacao > 15 ? '#F44336' : '#4CAF50' }
                  ]}>
                    {dadosMonitoramento.precipitacao > 15 ? '+12mm' : '-2mm'}
                  </ThemedText>
                  <ThemedText style={styles.trendIndicator}>
                    {dadosMonitoramento.precipitacao > 15 ? '↗️' : '↘️'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </>
        )}

        {/* Footer Técnico */}
        <ThemedView style={styles.technicalFooter}>
          <ThemedText style={styles.footerText}>
            🔧 Sistema de Monitoramento Automatizado
          </ThemedText>
          <ThemedText style={styles.footerDetails}>
            Atualização automática a cada 5 segundos | Precisão: ±0.01m
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    fontSize: 16,
    color: '#00ff88',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  
  // Header Técnico
  technicalHeader: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#66b3ff',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  timestampContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
  },
  timestampLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    color: '#00ff88',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: '#66b3ff',
    fontFamily: 'monospace',
  },

  // Status de Risco
  riskStatusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#333',
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  riskInfo: {
    flex: 1,
  },
  riskLabel: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  riskValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  riskDescription: {
    fontSize: 14,
    color: '#ccc',
    fontStyle: 'italic',
    lineHeight: 20,
  },

  // Seções
  parametersSection: {
    marginBottom: 16,
  },
  analysisSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  trendsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    fontFamily: 'monospace',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Cards de Parâmetros
  parameterCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  parameterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  parameterInfo: {
    flex: 1,
  },
  parameterTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  parameterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'monospace',
  },
  parameterStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  parameterDetails: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 12,
  },
  parameterRange: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  parameterTrend: {
    fontSize: 12,
    color: '#66b3ff',
    fontFamily: 'monospace',
  },

  // Análise Técnica
  analysisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analysisItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    width: (width - 56) / 2,
    borderWidth: 1,
    borderColor: '#444',
  },
  analysisLabel: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  analysisValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ff88',
    fontFamily: 'monospace',
  },

  // Tendências
  trendGrid: {
    gap: 12,
  },
  trendItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#444',
  },
  trendLabel: {
    fontSize: 13,
    color: '#ccc',
    fontFamily: 'monospace',
    flex: 1,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginRight: 8,
  },
  trendIndicator: {
    fontSize: 16,
  },

  // Footer
  technicalFooter: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#00ff88',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  footerDetails: {
    fontSize: 11,
    color: '#888',
    fontFamily: 'monospace',
    textAlign: 'center',
  },

  // Estilos legados mantidos para compatibilidade
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
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, Alert, Dimensions, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDadosMonitoramento, type DadosMonitoramento } from '@/services/api';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function MonitoramentoScreen() {
  const [dadosMonitoramento, setDadosMonitoramento] = useState<DadosMonitoramento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    setError(false);
    try {
      const dados = await getDadosMonitoramento();
      console.log('Monitoramento data received:', dados);
      setDadosMonitoramento(dados);
      setError(false);
    } catch (error) {
      console.error('Erro ao carregar dados de monitoramento:', error);
      setError(true);
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

    // Atualizar dados a cada 30 segundos
    const interval = setInterval(carregarDados, 30000);

    return () => clearInterval(interval);
  }, []);

  // Atualizar dados ao focar aba
  useFocusEffect(
    React.useCallback(() => {
      carregarDados();
    }, [])
  );

  const getStatusColor = (valor: number, limite: number) => {
    if (valor > limite) return '#EF4444';
    if (valor > limite * 0.8) return '#F59E0B';
    return '#10B981';
  };

  const getRiscoInfo = (risco: string) => {
    switch (risco) {
      case 'baixo': 
        return { cor: '#10B981', texto: 'Baixo', emoji: '🟢' };
      case 'medio': 
        return { cor: '#F59E0B', texto: 'Médio', emoji: '🟡' };
      case 'alto': 
        return { cor: '#EF4444', texto: 'Alto', emoji: '🟠' };
      case 'critico': 
        return { cor: '#DC2626', texto: 'Crítico', emoji: '🔴' };
      default: 
        return { cor: '#6B7280', texto: 'Indefinido', emoji: '⚪' };
    }
  };
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
        <ThemedText style={styles.loadingText}>Carregando dados...</ThemedText>
      </ThemedView>
    );
  }
  if (!loading && error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText style={styles.loadingText}>Falha ao carregar dados</ThemedText>
        <TouchableOpacity onPress={() => { setLoading(true); carregarDados().finally(() => setLoading(false)); }}>
          <ThemedText style={{ color: '#0984E3', marginTop: 16 }}>Tentar novamente</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0984E3"]} tintColor="#0984E3" />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Monitoramento</ThemedText>
          <ThemedText style={styles.subtitle}>Dados em tempo real do sistema</ThemedText>
        </View>

        {dadosMonitoramento && (
          <> 
            {/* Status de Risco */}
            <View style={styles.riskCard}>
              <ThemedText style={styles.cardTitle}>⚠️ Nível de Risco</ThemedText>
              <View style={styles.riskDisplay}>
                <ThemedText style={styles.riskEmoji}>
                  {getRiscoInfo(dadosMonitoramento.risco).emoji}
                </ThemedText>
                <ThemedText style={[
                  styles.riskText,
                  { color: getRiscoInfo(dadosMonitoramento.risco).cor }
                ]}>
                  {getRiscoInfo(dadosMonitoramento.risco).texto}
                </ThemedText>
              </View>
              <ThemedText style={styles.lastUpdate}>
                Última atualização: {
                  (() => {
                    const dt = new Date(dadosMonitoramento.ultimaAtualizacao);
                    return isNaN(dt.getTime())
                      ? String(dadosMonitoramento.ultimaAtualizacao || '—')
                      : dt.toLocaleTimeString('pt-BR');
                  })()
                }
              </ThemedText>
            </View>

            {/* Parâmetros Principais */}
            <View style={styles.parametersCard}>
              <ThemedText style={styles.cardTitle}>📊 Parâmetros Principais</ThemedText>
              
              <View style={styles.parameterItem}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>🌊 Nível do Rio</ThemedText>
                  <ThemedText style={styles.parameterValue}>{dadosMonitoramento.nivelRio} m</ThemedText>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(dadosMonitoramento.nivelRio, 2.0) }
                ]} />
              </View>

              <View style={styles.parameterItem}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>🚰 Vazão</ThemedText>
                  <ThemedText style={styles.parameterValue}>{dadosMonitoramento.vazao} m³/s</ThemedText>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(dadosMonitoramento.vazao, 100) }
                ]} />
              </View>

              <View style={styles.parameterItem}>
                <View style={styles.parameterInfo}>
                  <ThemedText style={styles.parameterLabel}>🔧 Pressão</ThemedText>
                  <ThemedText style={styles.parameterValue}>{dadosMonitoramento.pressao} bar</ThemedText>
                </View>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(dadosMonitoramento.pressao, 5) }
                ]} />
              </View>
            </View>

            {/* Informações Técnicas */}
            <View style={styles.technicalCard}>
              <ThemedText style={styles.cardTitle}>🔧 Informações Técnicas</ThemedText>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>Vazão Estimada</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {(dadosMonitoramento.nivelRio * 1.5).toFixed(1)} m³/s
                  </ThemedText>
                </View>
                
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>Capacidade Sistema</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {dadosMonitoramento.vazao > 20 ? '78%' : '95%'}
                  </ThemedText>
                </View>
                
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>Localização</ThemedText>
                  <ThemedText style={styles.infoValue}>{dadosMonitoramento.localizacao}</ThemedText>
                </View>
                
                <View style={styles.infoItem}>
                  <ThemedText style={styles.infoLabel}>Status Sistema</ThemedText>
                  <ThemedText style={[styles.infoValue, { color: '#10B981' }]}>Operacional</ThemedText>
                </View>
              </View>
            </View>

            {/* Tendências */}
            <View style={styles.trendsCard}>
              <ThemedText style={styles.cardTitle}>📈 Tendências (24h)</ThemedText>
              
              <View style={styles.trendItem}>
                <ThemedText style={styles.trendLabel}>Nível do Rio</ThemedText>
                <ThemedText style={[
                  styles.trendValue,
                  { color: dadosMonitoramento.nivelRio > 2 ? '#EF4444' : '#10B981' }
                ]}>
                  {dadosMonitoramento.nivelRio > 2 ? '+15cm ↗️' : '-3cm ↘️'}
                </ThemedText>
              </View>
              
              <View style={styles.trendItem}>
                <ThemedText style={styles.trendLabel}>Vazão</ThemedText>
                <ThemedText style={[
                  styles.trendValue,
                  { color: dadosMonitoramento.vazao > 100 ? '#EF4444' : '#10B981' }
                ]}>
                  {dadosMonitoramento.vazao > 100 ? '+12m³/s ↗️' : '-2m³/s ↘️'}
                </ThemedText>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },

  // Cards
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  parametersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  technicalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  trendsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
    textAlign: 'center',
  },

  // Risk Display
  riskDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  riskText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  lastUpdate: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },

  // Parameters
  parameterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  parameterInfo: {
    flex: 1,
  },
  parameterLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  parameterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },

  // Technical Info
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    width: (width - 56) / 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // Trends
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  trendLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
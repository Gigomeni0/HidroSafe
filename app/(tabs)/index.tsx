import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert, Dimensions, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { getDadosMonitoramento, getAlertas, getControlesSistema, type DadosMonitoramento, type Alerta, type ControlesSistema } from '@/services/api';

const { width } = Dimensions.get('window');

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

  const getRiscoInfo = (risco: string) => {
    switch (risco) {
      case 'baixo': 
        return { 
          titulo: 'Tudo Tranquilo! 😊', 
          descricao: 'A situação está controlada e segura.',
          cor: '#4CAF50',
          emoji: '✅'
        };
      case 'medio': 
        return { 
          titulo: 'Atenção Moderada ⚠️', 
          descricao: 'Monitorando de perto, mas ainda seguro.',
          cor: '#FF9800',
          emoji: '👀'
        };
      case 'alto': 
        return { 
          titulo: 'Alerta Ativo! 🚨', 
          descricao: 'Situação requer atenção especial.',
          cor: '#F44336',
          emoji: '⚠️'
        };
      case 'critico': 
        return { 
          titulo: 'EMERGÊNCIA! 🆘', 
          descricao: 'Ação imediata necessária.',
          cor: '#D32F2F',
          emoji: '🚨'
        };
      default: 
        return { 
          titulo: 'Conectando...', 
          descricao: 'Verificando status do sistema.',
          cor: '#757575',
          emoji: '📡'
        };
    }
  };

  const alertasImportantes = alertas.filter(a => a.tipo === 'critico' || a.tipo === 'aviso');

  if (loading && !dadosMonitoramento) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
        <ThemedText style={styles.loadingText}>🌊 Carregando HidroSafe...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0984E3"]} tintColor="#0984E3" />}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>🛡️ HidroSafe</ThemedText>
          <ThemedText style={styles.subtitle}>Protegendo nossa comunidade</ThemedText>
          <ThemedText style={styles.subtitle}>
            {new Date().toLocaleString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </ThemedText>
        </View>

        {/* Status Principal */}
        {dadosMonitoramento && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📋 Status Principal</ThemedText>
            <View style={[styles.statusCard, { borderLeftColor: getRiscoInfo(dadosMonitoramento.risco).cor }]}>
              <ThemedText style={styles.statusEmoji}>
                {getRiscoInfo(dadosMonitoramento.risco).emoji}
              </ThemedText>
              <ThemedText style={styles.statusTitulo}>
                {getRiscoInfo(dadosMonitoramento.risco).titulo}
              </ThemedText>
              <ThemedText style={styles.statusDescricao}>
                {getRiscoInfo(dadosMonitoramento.risco).descricao}
              </ThemedText>
              <ThemedText style={styles.statusLocal}>
                📍 {dadosMonitoramento.localizacao}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Alertas Importantes */}
        {alertasImportantes.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📢 Informações Importantes</ThemedText>
            {alertasImportantes.slice(0, 3).map(alerta => (
              <TouchableOpacity key={alerta.id} style={styles.alertaCard}>
                <ThemedText style={styles.alertaIcon}>
                  {alerta.tipo === 'critico' ? '🚨' : '⚠️'}
                </ThemedText>
                <View style={styles.alertaContent}>
                  <ThemedText style={styles.alertaTitulo}>{alerta.titulo}</ThemedText>
                  <ThemedText style={styles.alertaDescricao} numberOfLines={2}>
                    {alerta.descricao}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Informações Rápidas */}
        {dadosMonitoramento && controles && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>📊 Situação Atual</ThemedText>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoEmoji}>🌊</ThemedText>
                <ThemedText style={styles.infoValor}>{dadosMonitoramento.nivelRio}m</ThemedText>
                <ThemedText style={styles.infoLabel}>Nível do Rio</ThemedText>
              </View>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoEmoji}>🌧️</ThemedText>
                <ThemedText style={styles.infoValor}>{dadosMonitoramento.precipitacao}mm</ThemedText>
                <ThemedText style={styles.infoLabel}>Chuva/Hora</ThemedText>
              </View>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoEmoji}>🚰</ThemedText>
                <ThemedText style={[styles.infoValor, { color: controles.bombasDrenagem ? '#4CAF50' : '#F44336' }]}>
                  {controles.bombasDrenagem ? 'Ativas' : 'Inativas'}
                </ThemedText>
                <ThemedText style={styles.infoLabel}>Bombas</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Dicas de Segurança */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>💡 Dicas de Segurança</ThemedText>
          <View style={styles.dicaCard}>
            <ThemedText style={styles.dicaTexto}>
              🏠 Mantenha-se informado sobre as condições climáticas
            </ThemedText>
          </View>
          <View style={styles.dicaCard}>
            <ThemedText style={styles.dicaTexto}>
              📱 Tenha sempre um plano de evacuação preparado
            </ThemedText>
          </View>
          <View style={styles.dicaCard}>
            <ThemedText style={styles.dicaTexto}>
              ⛈️ Evite áreas alagadas durante chuvas intensas
            </ThemedText>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            💙 Juntos protegemos nossa comunidade
          </ThemedText>
          <ThemedText style={styles.footerSubtext}>
            Sistema atualizado há poucos instantes
          </ThemedText>
        </View>
      </ScrollView>
    </View>
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
    marginBottom: 4,
  },
  section: {
    marginVertical: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  statusEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  statusTitulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescricao: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusLocal: {
    fontSize: 14,
    color: '#999',
  },
  alertasSection: {
    marginBottom: 20,
  },
  alertaCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertaIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertaContent: {
    flex: 1,
  },
  alertaTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  alertaDescricao: {
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  infoValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dicasSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dicaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dicaTexto: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#999',
  },
});

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getControlesSistema, executarComandoControle, paradaEmergencia, reinicializarSistema, ControlesSistema, ComandoControle } from '@/services/api';

export default function ControleScreen() {
  const [controles, setControles] = useState<ControlesSistema>({
    bombaLigada: false,
    filtroAutomatico: false,
    alertasAtivos: false
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [executandoComando, setExecutandoComando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar estado dos controles
  const fetchControles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError(null);
      const data = await getControlesSistema();
      setControles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao carregar controles:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Carregar dados quando o componente montar
  useEffect(() => {
    fetchControles();
  }, []);

  // Função de refresh
  const onRefresh = () => {
    fetchControles(true);
  };

  // Função para executar comando
  const handleComando = async (comando: ComandoControle) => {
    setExecutandoComando(comando.tipo);
    
    try {
      await executarComandoControle(comando);
      
      // Atualiza o estado local imediatamente
      setControles(prev => ({
        ...prev,
        [comando.tipo === 'bomba' ? 'bombaLigada' : 
         comando.tipo === 'filtro' ? 'filtroAutomatico' : 'alertasAtivos']: comando.valor
      }));

      Alert.alert(
        'Sucesso',
        `${comando.tipo === 'bomba' ? 'Bomba' : 
          comando.tipo === 'filtro' ? 'Filtro' : 'Alertas'} ${comando.valor ? 'ligado(s)' : 'desligado(s)'} com sucesso!`
      );
      
    } catch (err) {
      Alert.alert(
        'Erro',
        err instanceof Error ? err.message : 'Erro ao executar comando'
      );
    } finally {
      setExecutandoComando(null);
    }
  };

  // Função para desligar todos os sistemas (DEBUG com API)
  const handleDesligarTodos = async () => {
    setExecutandoComando('desligar_todos');
    
    try {
      // Executa comandos individuais via API
      await Promise.all([
        executarComandoControle({ tipo: 'bomba', valor: false }),
        executarComandoControle({ tipo: 'filtro', valor: false }),
        executarComandoControle({ tipo: 'alertas', valor: false })
      ]);
      
      setControles({
        bombaLigada: false,
        filtroAutomatico: false,
        alertasAtivos: false
      });
      
      Alert.alert('✅ Sucesso', 'Todos os sistemas desligados via API!');
      
    } catch (err) {
      Alert.alert('Erro', 'Falha ao desligar sistemas');
    } finally {
      setExecutandoComando(null);
    }
  };

  // Função para ligar todos os sistemas (DEBUG com API)
  const handleLigarTodos = async () => {
    setExecutandoComando('ligar_todos');
    
    try {
      // Executa comandos individuais via API
      await Promise.all([
        executarComandoControle({ tipo: 'bomba', valor: true }),
        executarComandoControle({ tipo: 'filtro', valor: true }),
        executarComandoControle({ tipo: 'alertas', valor: true })
      ]);
      
      setControles({
        bombaLigada: true,
        filtroAutomatico: true,
        alertasAtivos: true
      });
      
    } catch (err) {
      Alert.alert('Erro', 'Falha ao ligar sistemas');
    } finally {
      setExecutandoComando(null);
    }
  };

  // Componente de loading
  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0984E3" />
        <ThemedText style={styles.loadingText}>Carregando controles...</ThemedText>
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
          onPress={() => fetchControles()}
        >
          Tentar novamente
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0984E3']}
            tintColor="#0984E3"
          />
        }
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Controle do Sistema</ThemedText>
          <ThemedText style={styles.subtitle}>
            Gerencie os componentes do sistema de monitoramento
          </ThemedText>
        </View>
        
        {/* Controles dos Sistemas */}
        <View style={styles.controlesContainer}>
          {/* Controle da Bomba */}
          <View style={styles.controleItem}>
            <View style={styles.controleInfo}>
              <ThemedText type="subtitle" style={styles.controleNome}>
                💧 Bomba de Água
              </ThemedText>
              <ThemedText style={styles.controleDescricao}>
                Sistema de bombeamento principal
              </ThemedText>
            </View>
            <View style={styles.controleAction}>
              {executandoComando === 'bomba' ? (
                <ActivityIndicator size="small" color="#0984E3" />
              ) : (
                <TouchableOpacity 
                  onPress={() => handleComando({ tipo: 'bomba', valor: !controles.bombaLigada })}
                  style={[
                    styles.customSwitch,
                    { backgroundColor: controles.bombaLigada ? '#00B894' : '#D63031' }
                  ]}
                >
                  <ThemedText style={styles.customSwitchText}>
                    {controles.bombaLigada ? 'ON' : 'OFF'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Controle do Filtro */}
          <View style={styles.controleItem}>
            <View style={styles.controleInfo}>
              <ThemedText type="subtitle" style={styles.controleNome}>
                🔄 Filtro Automático
              </ThemedText>
              <ThemedText style={styles.controleDescricao}>
                Sistema de filtragem automatizada
              </ThemedText>
            </View>
            <View style={styles.controleAction}>
              {executandoComando === 'filtro' ? (
                <ActivityIndicator size="small" color="#0984E3" />
              ) : (
                <TouchableOpacity 
                  onPress={() => handleComando({ tipo: 'filtro', valor: !controles.filtroAutomatico })}
                  style={[
                    styles.customSwitch,
                    { backgroundColor: controles.filtroAutomatico ? '#00B894' : '#D63031' }
                  ]}
                >
                  <ThemedText style={styles.customSwitchText}>
                    {controles.filtroAutomatico ? 'ON' : 'OFF'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Controle dos Alertas */}
          <View style={styles.controleItem}>
            <View style={styles.controleInfo}>
              <ThemedText type="subtitle" style={styles.controleNome}>
                🔔 Alertas Ativos
              </ThemedText>
              <ThemedText style={styles.controleDescricao}>
                Sistema de notificações e alertas
              </ThemedText>
            </View>
            <View style={styles.controleAction}>
              {executandoComando === 'alertas' ? (
                <ActivityIndicator size="small" color="#0984E3" />
              ) : (
                <TouchableOpacity 
                  onPress={() => handleComando({ tipo: 'alertas', valor: !controles.alertasAtivos })}
                  style={[
                    styles.customSwitch,
                    { backgroundColor: controles.alertasAtivos ? '#00B894' : '#D63031' }
                  ]}
                >
                  <ThemedText style={styles.customSwitchText}>
                    {controles.alertasAtivos ? 'ON' : 'OFF'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Controles Gerais */}
        <View style={styles.controlesGeraisContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎛️ Controles Gerais
          </ThemedText>
          
          {/* Botões de Controle Geral */}
          <View style={styles.botoesContainer}>
            <TouchableOpacity 
              style={[styles.botaoGeral, styles.botaoDesligar]}
              onPress={handleDesligarTodos}
              disabled={executandoComando === 'desligar_todos'}
            >
              {executandoComando === 'desligar_todos' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <ThemedText style={styles.textoBotaoGeral}>🔴 DESLIGAR TODOS</ThemedText>
                  <ThemedText style={styles.subtextoBotao}>Via API</ThemedText>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.botaoGeral, styles.botaoLigar]}
              onPress={handleLigarTodos}
              disabled={executandoComando === 'ligar_todos'}
            >
              {executandoComando === 'ligar_todos' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <ThemedText style={styles.textoBotaoGeral}>🟢 LIGAR TODOS</ThemedText>
                  <ThemedText style={styles.subtextoBotao}>Via API</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </View>

    
        </View>
        {/* Status Resumido */}
        <View style={styles.statusContainer}>
          <ThemedText type="subtitle" style={styles.statusTitulo}>
            📊 Status dos Sistemas
          </ThemedText>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusCard}>
              <ThemedText style={styles.statusIcon}>💧</ThemedText>
              <ThemedText style={styles.statusLabel}>Bomba</ThemedText>
              <ThemedText style={[
                styles.statusValue,
                { color: controles.bombaLigada ? '#00B894' : '#D63031' }
              ]}>
                {controles.bombaLigada ? 'ON' : 'OFF'}
              </ThemedText>
            </View>
            
            <View style={styles.statusCard}>
              <ThemedText style={styles.statusIcon}>🔄</ThemedText>
              <ThemedText style={styles.statusLabel}>Filtro</ThemedText>
              <ThemedText style={[
                styles.statusValue,
                { color: controles.filtroAutomatico ? '#00B894' : '#D63031' }
              ]}>
                {controles.filtroAutomatico ? 'ON' : 'OFF'}
              </ThemedText>
            </View>
            
            <View style={styles.statusCard}>
              <ThemedText style={styles.statusIcon}>🔔</ThemedText>
              <ThemedText style={styles.statusLabel}>Alertas</ThemedText>
              <ThemedText style={[
                styles.statusValue,
                { color: controles.alertasAtivos ? '#00B894' : '#D63031' }
              ]}>
                {controles.alertasAtivos ? 'ON' : 'OFF'}
              </ThemedText>
            </View>
          </View>
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
  },
  errorText: {
    color: '#D63031',
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
  controlesContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  controleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  controleInfo: {
    flex: 1,
  },
  controleNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  controleDescricao: {
    fontSize: 12,
    color: '#64748B',
  },
  controleAction: {
    marginLeft: 16,
  },
  customSwitch: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  customSwitchText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  controlesGeraisContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  botaoGeral: {
    flex: 0.48,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botaoDesligar: {
    backgroundColor: '#D63031',
  },
  botaoLigar: {
    backgroundColor: '#00B894',
  },
  textoBotaoGeral: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  subtextoBotao: {
    color: 'white',
    fontSize: 10,
    opacity: 0.8,
    marginTop: 2,
  },
  botaoEmergencia: {
    backgroundColor: '#DC2626',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  botaoEmergenciaDisabled: {
    backgroundColor: '#9CA3AF',
  },
  botaoReinicializar: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  botaoReinicializarDisabled: {
    backgroundColor: '#9CA3AF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textoEmergencia: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  textoReinicializar: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  statusContainer: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statusTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusCard: {
    flex: 0.3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
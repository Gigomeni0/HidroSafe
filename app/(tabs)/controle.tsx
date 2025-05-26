import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getControlesSistema, executarComandoControle, paradaEmergencia, ControlesSistema, ComandoControle } from '@/services/api';

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

      // Mostra feedback de sucesso
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

  // Função para parada de emergência
  const handleEmergencia = () => {
    Alert.alert(
      'Parada de Emergência',
      'Tem certeza que deseja parar todos os sistemas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'PARAR', 
          style: 'destructive',
          onPress: async () => {
            setExecutandoComando('emergencia');
            
            try {
              await paradaEmergencia();
              
              // Atualiza todos os controles para desligado
              setControles({
                bombaLigada: false,
                filtroAutomatico: false,
                alertasAtivos: false
              });
              
              Alert.alert(
                'Parada de Emergência Executada',
                'Todos os sistemas foram desligados com sucesso!'
              );
            } catch (err) {
              Alert.alert(
                'Erro na Parada de Emergência',
                err instanceof Error ? err.message : 'Erro desconhecido'
              );
            } finally {
              setExecutandoComando(null);
            }
          }
        }
      ]
    );
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
                <Switch
                  value={controles.bombaLigada}
                  onValueChange={(valor) => handleComando({ tipo: 'bomba', valor })}
                  trackColor={{ false: '#E2E8F0', true: '#81b0ff' }}
                  thumbColor={controles.bombaLigada ? '#0984E3' : '#CBD5E0'}
                />
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
                <Switch
                  value={controles.filtroAutomatico}
                  onValueChange={(valor) => handleComando({ tipo: 'filtro', valor })}
                  trackColor={{ false: '#E2E8F0', true: '#81b0ff' }}
                  thumbColor={controles.filtroAutomatico ? '#0984E3' : '#CBD5E0'}
                />
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
                <Switch
                  value={controles.alertasAtivos}
                  onValueChange={(valor) => handleComando({ tipo: 'alertas', valor })}
                  trackColor={{ false: '#E2E8F0', true: '#81b0ff' }}
                  thumbColor={controles.alertasAtivos ? '#0984E3' : '#CBD5E0'}
                />
              )}
            </View>
          </View>
        </View>

        {/* Botão de Emergência */}
        <TouchableOpacity 
          style={[
            styles.botaoEmergencia,
            executandoComando === 'emergencia' && styles.botaoEmergenciaDisabled
          ]} 
          onPress={handleEmergencia}
          disabled={executandoComando === 'emergencia'}
        >
          {executandoComando === 'emergencia' ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <ThemedText style={styles.textoEmergencia}>🚨 PARADA DE EMERGÊNCIA</ThemedText>
          )}
        </TouchableOpacity>

        {/* Status dos Sistemas */}
        <View style={styles.statusContainer}>
          <ThemedText type="subtitle" style={styles.statusTitulo}>
            📊 Status dos Sistemas
          </ThemedText>
          
          <View style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Bomba:</ThemedText>
            <ThemedText style={[
              styles.statusValue,
              { color: controles.bombaLigada ? '#00B894' : '#D63031' }
            ]}>
              {controles.bombaLigada ? '🟢 Ligada' : '🔴 Desligada'}
            </ThemedText>
          </View>
          
          <View style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Filtro:</ThemedText>
            <ThemedText style={[
              styles.statusValue,
              { color: controles.filtroAutomatico ? '#00B894' : '#D63031' }
            ]}>
              {controles.filtroAutomatico ? '🟢 Automático' : '🔴 Manual'}
            </ThemedText>
          </View>
          
          <View style={styles.statusItem}>
            <ThemedText style={styles.statusLabel}>Alertas:</ThemedText>
            <ThemedText style={[
              styles.statusValue,
              { color: controles.alertasAtivos ? '#00B894' : '#D63031' }
            ]}>
              {controles.alertasAtivos ? '🟢 Ativos' : '🔴 Desativados'}
            </ThemedText>
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
  botaoEmergencia: {
    backgroundColor: '#DC2626',
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  botaoEmergenciaDisabled: {
    backgroundColor: '#9CA3AF',
  },
  textoEmergencia: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  statusContainer: {
    margin: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
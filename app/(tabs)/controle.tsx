import React, { useState } from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function ControleScreen() {
  const [bombaLigada, setBombaLigada] = useState(false);
  const [filtroAutomatico, setFiltroAutomatico] = useState(true);
  const [alertasAtivos, setAlertasAtivos] = useState(true);

  const handleEmergencia = () => {
    Alert.alert(
      'Parada de Emergência',
      'Tem certeza que deseja parar todos os sistemas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Parar', 
          style: 'destructive',
          onPress: () => {
            setBombaLigada(false);
            setFiltroAutomatico(false);
            Alert.alert('Sistemas parados', 'Todos os sistemas foram desligados');
          }
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Controle do Sistema</ThemedText>
      
      <View style={styles.controlesContainer}>
        <View style={styles.controleItem}>
          <ThemedText type="subtitle">Bomba de Água</ThemedText>
          <Switch
            value={bombaLigada}
            onValueChange={setBombaLigada}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={bombaLigada ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.controleItem}>
          <ThemedText type="subtitle">Filtro Automático</ThemedText>
          <Switch
            value={filtroAutomatico}
            onValueChange={setFiltroAutomatico}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={filtroAutomatico ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.controleItem}>
          <ThemedText type="subtitle">Alertas Ativos</ThemedText>
          <Switch
            value={alertasAtivos}
            onValueChange={setAlertasAtivos}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={alertasAtivos ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.botaoEmergencia} onPress={handleEmergencia}>
        <ThemedText style={styles.textoEmergencia}>PARADA DE EMERGÊNCIA</ThemedText>
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <ThemedText type="subtitle">Status dos Sistemas:</ThemedText>
        <ThemedText style={styles.status}>
          Bomba: {bombaLigada ? '🟢 Ligada' : '🔴 Desligada'}
        </ThemedText>
        <ThemedText style={styles.status}>
          Filtro: {filtroAutomatico ? '🟢 Automático' : '🔴 Manual'}
        </ThemedText>
        <ThemedText style={styles.status}>
          Alertas: {alertasAtivos ? '🟢 Ativos' : '🔴 Desativados'}
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  controlesContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  controleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  botaoEmergencia: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  textoEmergencia: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
  },
  status: {
    marginTop: 5,
    fontSize: 14,
  },
});
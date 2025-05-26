import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

interface Evento {
  id: string;
  timestamp: string;
  tipo: string;
  descricao: string;
  valor?: string;
}

export default function HistoricoScreen() {
  const [eventos] = useState<Evento[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30',
      tipo: 'Medição',
      descricao: 'pH da água',
      valor: '7.2'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25',
      tipo: 'Alerta',
      descricao: 'Turbidez alta detectada',
      valor: '15 NTU'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20',
      tipo: 'Sistema',
      descricao: 'Bomba ligada automaticamente'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15',
      tipo: 'Medição',
      descricao: 'Temperatura da água',
      valor: '23.5°C'
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:10',
      tipo: 'Manutenção',
      descricao: 'Limpeza dos sensores concluída'
    }
  ]);

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Alerta': return '#ff4444';
      case 'Medição': return '#0099ff';
      case 'Sistema': return '#00aa00';
      case 'Manutenção': return '#ffaa00';
      default: return '#666';
    }
  };

  const renderEvento = ({ item }: { item: Evento }) => (
    <View style={styles.eventoCard}>
      <View style={[styles.tipoIndicator, { backgroundColor: getTipoColor(item.tipo) }]} />
      <View style={styles.eventoContent}>
        <View style={styles.eventoHeader}>
          <ThemedText style={styles.tipo}>{item.tipo}</ThemedText>
          <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
        </View>
        <ThemedText style={styles.descricao}>{item.descricao}</ThemedText>
        {item.valor && (
          <ThemedText style={styles.valor}>Valor: {item.valor}</ThemedText>
        )}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Histórico do Sistema</ThemedText>
      
      <FlatList
        data={eventos}
        renderItem={renderEvento}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
      />
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
    marginBottom: 20,
  },
  lista: {
    flex: 1,
  },
  eventoCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  tipoIndicator: {
    width: 5,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  eventoContent: {
    flex: 1,
    padding: 15,
  },
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  tipo: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  descricao: {
    fontSize: 14,
    marginBottom: 5,
  },
  valor: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.8,
  },
});
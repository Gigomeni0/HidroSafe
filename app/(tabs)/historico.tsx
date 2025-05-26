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

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'Alerta': 
        return { 
          color: '#FF6B6B', 
          bgColor: '#FFE8E8',
          icon: '⚠️',
          textColor: '#D63031'
        };
      case 'Medição': 
        return { 
          color: '#4ECDC4', 
          bgColor: '#E8F8F7',
          icon: '📊',
          textColor: '#00B894'
        };
      case 'Sistema': 
        return { 
          color: '#45B7D1', 
          bgColor: '#E8F4FD',
          icon: '⚙️',
          textColor: '#0984E3'
        };
      case 'Manutenção': 
        return { 
          color: '#FFA726', 
          bgColor: '#FFF4E6',
          icon: '🔧',
          textColor: '#E17000'
        };
      default: 
        return { 
          color: '#74B9FF', 
          bgColor: '#F0F8FF',
          icon: '📋',
          textColor: '#636E72'
        };
    }
  };

  const renderEvento = ({ item }: { item: Evento }) => {
    const config = getTipoConfig(item.tipo);
    
    return (
      <View style={[styles.eventoCard, { backgroundColor: config.bgColor }]}>
        <View style={[styles.tipoIndicator, { backgroundColor: config.color }]} />
        
        <View style={styles.eventoContent}>
          <View style={styles.eventoHeader}>
            <View style={styles.tipoContainer}>
              <ThemedText style={styles.tipoIcon}>{config.icon}</ThemedText>
              <ThemedText style={[styles.tipo, { color: config.textColor }]}>
                {item.tipo}
              </ThemedText>
            </View>
            <ThemedText style={styles.timestamp}>{item.timestamp}</ThemedText>
          </View>
          
          <ThemedText style={styles.descricao}>{item.descricao}</ThemedText>
          
          {item.valor && (
            <View style={[styles.valorContainer, { backgroundColor: config.color + '20' }]}>
              <ThemedText style={[styles.valorLabel, { color: config.textColor }]}>
                Valor:
              </ThemedText>
              <ThemedText style={[styles.valor, { color: config.textColor }]}>
                {item.valor}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Histórico do Sistema</ThemedText>
        <ThemedText style={styles.subtitle}>
          Últimas atividades e medições
        </ThemedText>
      </View>
      
      <FlatList
        data={eventos}
        renderItem={renderEvento}
        keyExtractor={(item) => item.id}
        style={styles.lista}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listaContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
  lista: {
    flex: 1,
  },
  listaContent: {
    padding: 16,
    paddingBottom: 100, // espaço extra no final
  },
  eventoCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  tipoIndicator: {
    width: 6,
  },
  eventoContent: {
    flex: 1,
    padding: 16,
  },
  eventoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipo: {
    fontWeight: '600',
    fontSize: 15,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  descricao: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  valorLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  valor: {
    fontSize: 13,
    fontWeight: '700',
  },
});
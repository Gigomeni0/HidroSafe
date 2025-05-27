import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Alert, View, Linking } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ExploreScreen() {
  const githubFrontUrl = 'https://github.com/Gigomeni0/HidroSafe';
  const githubBackUrl = 'https://github.com/Gigomeni0/HidroSafe';
  const recursos = [
    {
      id: '1',
      titulo: '📱 Documentação do App',
      descricao: 'Guia completo de uso do HidroSafe',
      icone: '📚',
      acao: () => Linking.openURL(githubFrontUrl)
    },
    {
      id: '2',
      titulo: '🌊 Sistema de Monitoramento',
      descricao: 'Como funciona o sistema de prevenção',
      icone: '⚙️',
      acao: () => Linking.openURL(githubBackUrl)
    },
    {
      id: '3',
      titulo: '📊 Relatórios e Dados',
      descricao: 'Acesse relatórios detalhados',
      icone: '📈',
      acao: () => Alert.alert('Relatórios', 'Funcionalidade em breve!')
    },
    {
      id: '4',
      titulo: '🚨 Configurar Alertas',
      descricao: 'Personalize suas notificações',
      icone: '🔔',
      acao: () => Alert.alert('Configurações', 'Configurações avançadas em desenvolvimento')
    }
  ];

  const contatos = [
    {
      id: '1',
      titulo: 'Suporte Técnico',
      info: '(11) 9999-8888',
      icone: '🔧'
    },
    {
      id: '2',
      titulo: 'Emergências',
      info: '199 - Defesa Civil',
      icone: '🚨'
    },
    {
      id: '3',
      titulo: 'Email',
      info: 'suporte@hidrosafe.com',
      icone: '📧'
    }
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Explorar</ThemedText>
        <ThemedText style={styles.subtitle}>
          Recursos e informações do HidroSafe
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Recursos */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🔍 Recursos Disponíveis</ThemedText>
          {recursos.map((recurso) => (
            <TouchableOpacity
              key={recurso.id}
              style={styles.card}
              onPress={recurso.acao}
            >
              <View style={styles.cardContent}>
                <ThemedText style={styles.cardIcon}>{recurso.icone}</ThemedText>
                <View style={styles.cardText}>
                  <ThemedText style={styles.cardTitle}>{recurso.titulo}</ThemedText>
                  <ThemedText style={styles.cardDescription}>{recurso.descricao}</ThemedText>
                </View>
                <ThemedText style={styles.cardArrow}>›</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Contatos */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>📞 Contatos Importantes</ThemedText>
          {contatos.map((contato) => (
            <View key={contato.id} style={styles.contactCard}>
              <ThemedText style={styles.contactIcon}>{contato.icone}</ThemedText>
              <View style={styles.contactText}>
                <ThemedText style={styles.contactTitle}>{contato.titulo}</ThemedText>
                <ThemedText style={styles.contactInfo}>{contato.info}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Informações do App */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>ℹ️ Sobre o HidroSafe</ThemedText>
          <View style={styles.infoCard}>
            <ThemedText style={styles.infoText}>
              O HidroSafe é um sistema inteligente de prevenção de enchentes que monitora 
              continuamente os níveis de água e condições meteorológicas para proteger 
              nossa comunidade.
            </ThemedText>
            <View style={styles.infoStats}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>24/7</ThemedText>
                <ThemedText style={styles.statLabel}>Monitoramento</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>v1.0</ThemedText>
                <ThemedText style={styles.statLabel}>Versão</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statNumber}>2025</ThemedText>
                <ThemedText style={styles.statLabel}>Ano</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            HidroSafe - Sistema de Prevenção de Enchentes
          </ThemedText>
          <ThemedText style={styles.footerText}>
            Desenvolvido para a segurança da comunidade
          </ThemedText>
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
  content: {
    padding: 16,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  cardArrow: {
    fontSize: 20,
    color: '#94A3B8',
    marginLeft: 8,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  contactIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 2,
  },
  contactInfo: {
    fontSize: 14,
    color: '#64748B',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0984E3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 4,
  },
});

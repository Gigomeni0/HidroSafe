import {ThemedView} from '@/components/ThemedView';
import {ThemedText} from '@/components/ThemedText';
export default function ControleScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ThemedText type="title">Tela de Ação e Controle</ThemedText>
    </ThemedView>
  );
}
import { GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList, KeyboardAvoidingView, Platform,
    StyleSheet, Text,
    TextInput, TouchableOpacity,
    View
} from 'react-native';
import { db } from '../../firebaseConfig';

// Inicializa o SDK
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export default function App() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Carregar o histórico do Firebase
  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChatHistory(msgs);
    });
    return unsubscribe;
  }, []);

  const sendMessage = async () => {
    if (message.trim() === '') return;
    const userText = message;
    setMessage('');
    setIsLoading(true);

    try {
      // 2. Salvar pergunta do usuário
      await addDoc(collection(db, 'chats'), {
        text: userText,
        sender: 'user',
        createdAt: new Date()
      });

     // 3. Consultar o Gemini via SDK
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash", // <-- Mude de 1.5 para 2.5 aqui!
        systemInstruction: "Você é um Especialista Sênior em Segurança Ofensiva e Operações de Red Team..."
      });

      const result = await model.generateContent(userText);
      const aiText = result.response.text();
      
      // 4. Salvar resposta da IA
      await addDoc(collection(db, 'chats'), {
        text: aiText,
        sender: 'ai',
        createdAt: new Date()
      });

    } catch (error) {
      console.error("Erro no processamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={item.sender === 'user' ? styles.userText : styles.aiText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Agente Red Team</Text>
      </View>
      <FlatList
        data={chatHistory}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Descreva o log, processo ou desafio..."
          value={message}
          onChangeText={setMessage}
          editable={!isLoading}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Enviar</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingTop: 60, paddingBottom: 20, backgroundColor: '#1e293b', alignItems: 'center' },
  headerText: { color: '#10b981', fontSize: 20, fontWeight: 'bold' },
  chatContainer: { padding: 15, paddingBottom: 30 },
  messageBubble: { maxWidth: '85%', padding: 15, borderRadius: 12, marginBottom: 15 },
  userBubble: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
  aiBubble: { backgroundColor: '#334155', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
  userText: { color: '#fff', fontSize: 15 },
  aiText: { color: '#10b981', fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#1e293b', borderTopWidth: 1, borderColor: '#334155', paddingBottom: Platform.OS === 'ios' ? 25 : 10 },
  input: { flex: 1, height: 50, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 20, marginRight: 10, fontSize: 15, color: '#fff' },
  sendButton: { backgroundColor: '#10b981', borderRadius: 10, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  sendButtonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 16 },
});
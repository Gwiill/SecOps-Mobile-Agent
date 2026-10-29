import { router } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform,
  StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../firebaseConfig'; // Ajuste o caminho conforme sua estrutura

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Sucesso', 'Conta criada com sucesso!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.replace('/'); // Vai direto para o Chat
    } catch (error: any) {
      Alert.alert('Erro de Autenticação', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>SECOPS AGENT</Text>
        <Text style={styles.subtitle}>
          {isRegistering ? 'Criar nova credencial de acesso' : 'Autenticação de Operador'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail corporativo / pessoal"
          placeholderTextColor="#64748b"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha de segurança"
          placeholderTextColor="#64748b"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleAuth} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0f172a" />
          ) : (
            <Text style={styles.buttonText}>
              {isRegistering ? 'REGISTRAR ACESSO' : 'ACESSAR SISTEMA'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setIsRegistering(!isRegistering)} 
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>
            {isRegistering ? 'Já possui acesso? Faça login' : 'Não tem conta? Crie uma agora'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e293b', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  title: { color: '#10b981', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 5, letterSpacing: 1 },
  subtitle: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 25 },
  input: { height: 50, backgroundColor: '#0f172a', borderRadius: 8, paddingHorizontal: 15, color: '#fff', marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  button: { backgroundColor: '#10b981', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#0f172a', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  switchButton: { marginTop: 20, alignItems: 'center' },
  switchText: { color: '#3b82f6', fontSize: 14 }
});
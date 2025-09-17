import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';

type AuthMode = 'signin' | 'signup';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, signUp, isLoading } = useAuthStore();
  
  // Form state
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  
  // Validation
  const validateForm = () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return false;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    
    if (!validateForm()) return;
    
    try {
      let result;
      
      if (mode === 'signin') {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password);
      }
      
      if (result.success) {
        if (mode === 'signup') {
          Alert.alert(
            'Account Created!',
            'Please check your email to verify your account. You can start using the app right away.'
          );
        }
        navigation.navigate('Projects' as never);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    }
  };
  
  
  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    try {
      await authService.resetPassword(forgotPasswordEmail);
      setForgotPasswordSent(true);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      );
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotPasswordSent(false);
        setForgotPasswordEmail('');
      }, 3000);
    } catch (error) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };
  
  // Switch between sign in and sign up
  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-parchment-100"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-8 py-12">
          {/* Logo/Title */}
          <View className="items-center mb-8">
            <Text className="text-4xl font-bold font-cinzel text-metals-gold">
              Fantasy Element Builder
            </Text>
            <Text className="text-ink-secondary mt-2 text-center">
              Build Your Fictional Worlds
            </Text>
          </View>
          
          {/* Main Form Card */}
          <View className="bg-parchment-300 rounded-lg shadow-lg p-6">
            {/* Tab Switcher */}
            <View className="flex-row mb-6 bg-parchment-200 rounded-lg p-1">
              <TouchableOpacity
                className={`flex-1 py-2 px-4 rounded-md ${
                  mode === 'signin' ? 'bg-parchment-400' : ''
                }`}
                onPress={() => mode !== 'signin' && switchMode()}
              >
                <Text className={`text-center font-medium ${
                  mode === 'signin' ? 'text-ink-primary' : 'text-ink-secondary'
                }`}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2 px-4 rounded-md ${
                  mode === 'signup' ? 'bg-parchment-400' : ''
                }`}
                onPress={() => mode !== 'signup' && switchMode()}
              >
                <Text className={`text-center font-medium ${
                  mode === 'signup' ? 'text-ink-primary' : 'text-ink-secondary'
                }`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Error Display */}
            {error && (
              <View className="bg-dragonfire-100/20 border border-dragonfire-700/50 rounded-lg p-3 mb-4 flex-row items-center">
                <Icon name="error-outline" size={16} color="#991b1b" />
                <Text className="text-dragonfire text-sm ml-2 flex-1">{error}</Text>
              </View>
            )}
            
            {/* Forgot Password Modal */}
            {showForgotPassword ? (
              <View>
                <TouchableOpacity
                  className="self-end mb-4"
                  onPress={() => setShowForgotPassword(false)}
                >
                  <Icon name="close" size={24} color="#4A3C30" />
                </TouchableOpacity>
                
                <Text className="text-lg font-semibold text-ink-primary mb-4">
                  Reset Password
                </Text>
                
                <View className="mb-4">
                  <View className="flex-row items-center bg-parchment-100 rounded-lg px-4 py-3 border border-parchment-400">
                    <Icon name="mail-outline" size={20} color="#4A3C30" />
                    <TextInput
                      className="flex-1 ml-3 text-ink-primary"
                      placeholder="Enter your email"
                      placeholderTextColor="#5C4A3A"
                      value={forgotPasswordEmail}
                      onChangeText={setForgotPasswordEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                
                <TouchableOpacity
                  className={`bg-might rounded-lg py-4 ${
                    forgotPasswordSent ? 'opacity-50' : ''
                  }`}
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordSent || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold font-cinzel">
                      {forgotPasswordSent ? 'Email Sent!' : 'Send Reset Link'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Email Input */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-parchment-100 rounded-lg px-4 py-3 border border-parchment-400">
                    <Icon name="mail-outline" size={20} color="#4A3C30" />
                    <TextInput
                      className="flex-1 ml-3 text-ink-primary"
                      placeholder="Email"
                      placeholderTextColor="#5C4A3A"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
                
                {/* Password Input */}
                <View className="mb-4">
                  <View className="flex-row items-center bg-parchment-100 rounded-lg px-4 py-3 border border-parchment-400">
                    <Icon name="lock-outline" size={20} color="#4A3C30" />
                    <TextInput
                      className="flex-1 ml-3 text-ink-primary"
                      placeholder="Password"
                      placeholderTextColor="#5C4A3A"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>
                
                {/* Confirm Password (Sign Up only) */}
                {mode === 'signup' && (
                  <View className="mb-4">
                    <View className="flex-row items-center bg-parchment-100 rounded-lg px-4 py-3 border border-parchment-400">
                      <Icon name="lock-outline" size={20} color="#4A3C30" />
                      <TextInput
                        className="flex-1 ml-3 text-ink-primary"
                        placeholder="Confirm Password"
                        placeholderTextColor="#5C4A3A"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                      />
                    </View>
                  </View>
                )}
                
                {/* Remember Me & Forgot Password */}
                {mode === 'signin' && (
                  <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                      <Switch
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: '#E8DCC0', true: '#A31C1C' }}
                        thumbColor={rememberMe ? '#fff' : '#f4f3f4'}
                      />
                      <Text className="text-ink-secondary ml-2">Remember me</Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
                      <Text className="text-metals-gold">Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Submit Button */}
                <TouchableOpacity
                  className="bg-might rounded-lg py-3 px-4 mb-4"
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <Icon 
                        name={mode === 'signin' ? 'login' : 'person-add'} 
                        size={20} 
                        color="white" 
                      />
                      <Text className="text-white text-center font-semibold font-cinzel ml-2">
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
              </>
            )}
          </View>
          
          {/* Benefits Message */}
          <View className="mt-8 items-center">
            <Text className="text-sm text-ink-secondary">Create an account to:</Text>
            <View className="mt-2">
              <Text className="text-sm text-ink-secondary">• Save your worlds in the cloud</Text>
              <Text className="text-sm text-ink-secondary">• Access from any device</Text>
              <Text className="text-sm text-ink-secondary">• Collaborate with others</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
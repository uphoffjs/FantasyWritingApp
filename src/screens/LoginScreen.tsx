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
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth';
import { fantasyTomeColors } from '../constants/fantasyTomeColors';

type AuthMode = 'signin' | 'signup';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, signUp, isLoading } = useAuthStore();
  
  // * Form state
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
  
  // * Handle form submission
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
  
  
  // ! SECURITY: * Handle forgot password
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
    } catch (err) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
    }
  };
  
  // * Switch between sign in and sign up
  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Logo/Title */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoTitle}>
              Fantasy Element Builder
            </Text>
            <Text style={styles.logoSubtitle}>
              Build Your Fictional Worlds
            </Text>
          </View>
          
          {/* Main Form Card */}
          <View style={styles.formCard}>
            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                testID="signin-tab-button"
                style={[
                  styles.tabButton,
                  mode === 'signin' && styles.tabButtonActive
                ]}
                onPress={() => mode !== 'signin' && switchMode()}
              >
                <Text style={[
                  styles.tabButtonText,
                  mode === 'signin' && styles.tabButtonTextActive
                ]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="signup-tab-button"
                style={[
                  styles.tabButton,
                  mode === 'signup' && styles.tabButtonActive
                ]}
                onPress={() => mode !== 'signup' && switchMode()}
              >
                <Text style={[
                  styles.tabButtonText,
                  mode === 'signup' && styles.tabButtonTextActive
                ]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Error Display */}
            {error && (
              <View testID="error-container" style={styles.errorContainer}>
                <Icon name="error-outline" size={16} color="#991b1b" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {/* Forgot Password Modal */}
            {showForgotPassword ? (
              <View>
                <TouchableOpacity
                  testID="close-forgot-password-button"
                  style={styles.closeButton}
                  onPress={() => setShowForgotPassword(false)}
                >
                  <Icon name="close" size={24} color="#4A3C30" />
                </TouchableOpacity>

                <Text style={styles.resetPasswordTitle}>
                  Reset Password
                </Text>

                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={20} color="#4A3C30" />
                    <TextInput
                      testID="forgot-password-email-input"
                      style={styles.input}
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
                  testID="send-reset-link-button"
                  style={[
                    styles.submitButton,
                    forgotPasswordSent && styles.buttonDisabled
                  ]}
                  onPress={handleForgotPassword}
                  disabled={forgotPasswordSent || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      {forgotPasswordSent ? 'Email Sent!' : 'Send Reset Link'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Email Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Icon name="mail-outline" size={20} color="#4A3C30" />
                    <TextInput
                      testID="email-input"
                      style={styles.input}
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
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Icon name="lock-outline" size={20} color="#4A3C30" />
                    <TextInput
                      testID="password-input"
                      style={styles.input}
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
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                      <Icon name="lock-outline" size={20} color="#4A3C30" />
                      <TextInput
                        testID="confirm-password-input"
                        style={styles.input}
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
                  <View style={styles.rememberMeContainer}>
                    <View style={styles.rememberMeLeft}>
                      <Switch
                        testID="remember-me-switch"
                        value={rememberMe}
                        onValueChange={setRememberMe}
                        trackColor={{ false: '#E8DCC0', true: fantasyTomeColors.semantic.error }}
                        thumbColor={rememberMe ? '#fff' : '#f4f3f4'}
                      />
                      <Text style={styles.rememberMeText}>Remember me</Text>
                    </View>
                    <TouchableOpacity testID="forgot-password-link" onPress={() => setShowForgotPassword(true)}>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {/* Submit Button */}
                <TouchableOpacity
                  testID="submit-button"
                  style={styles.submitButtonMain}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View style={styles.submitButtonContent}>
                      <Icon
                        name={mode === 'signin' ? 'login' : 'person-add'}
                        size={20}
                        color="white"
                      />
                      <Text style={styles.submitButtonMainText}>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
              </>
            )}
          </View>
          
          {/* Benefits Message */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Create an account to:</Text>
            <View style={styles.benefitsList}>
              <Text style={styles.benefitsText}>• Save your worlds in the cloud</Text>
              <Text style={styles.benefitsText}>• Access from any device</Text>
              <Text style={styles.benefitsText}>• Collaborate with others</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fantasyTomeColors.parchment.aged, // parchment-100
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: fantasyTomeColors.metals.gold, // metals-gold
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', // font-cinzel replacement
  },
  logoSubtitle: {
    color: fantasyTomeColors.ink.light, // ink-secondary
    marginTop: 8,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#F2E8D8', // parchment-300
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F7EFDF', // parchment-200
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#E8DCC0', // parchment-400
  },
  tabButtonText: {
    textAlign: 'center',
    fontWeight: '500',
    color: fantasyTomeColors.ink.light, // ink-secondary
  },
  tabButtonTextActive: {
    color: fantasyTomeColors.ink.faded, // ink-primary
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)', // dragonfire-100/20
    borderWidth: 1,
    borderColor: 'rgba(153, 27, 27, 0.5)', // dragonfire-700/50
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: fantasyTomeColors.semantic.error, // dragonfire
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  resetPasswordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: fantasyTomeColors.ink.faded, // ink-primary
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: fantasyTomeColors.parchment.aged, // parchment-100
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DCC0', // parchment-400
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: fantasyTomeColors.ink.faded, // ink-primary
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: fantasyTomeColors.semantic.error, // might
    borderRadius: 8,
    paddingVertical: 16,
  },
  submitButtonMain: {
    backgroundColor: fantasyTomeColors.semantic.error, // might
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: fantasyTomeColors.parchment.vellum,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  submitButtonMainText: {
    color: fantasyTomeColors.parchment.vellum,
    textAlign: 'center',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    color: fantasyTomeColors.ink.light, // ink-secondary
    marginLeft: 8,
  },
  forgotPasswordText: {
    color: fantasyTomeColors.metals.gold, // metals-gold
  },
  benefitsContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  benefitsTitle: {
    fontSize: 14,
    color: fantasyTomeColors.ink.light, // ink-secondary
  },
  benefitsList: {
    marginTop: 8,
  },
  benefitsText: {
    fontSize: 14,
    color: fantasyTomeColors.ink.light, // ink-secondary
  },
});
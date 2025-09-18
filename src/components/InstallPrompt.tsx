import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // * Only run on web platform
    if (Platform.OS !== 'web') return;

    // * Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // * Check if running as PWA
    if (window.navigator && (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      // * Prevent the default browser install prompt
      event.preventDefault();
      
      // * Store the event for later use
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      
      // * Check if user has previously dismissed
      const dismissed = // ! SECURITY: Using localStorage
      localStorage.getItem('pwa-install-dismissed');
      const dismissedTime = dismissed ? parseInt(dismissed, 10) : 0;
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // ? * Show prompt if not recently dismissed (wait 7 days)
      if (!dismissed || daysSinceDismissed > 7) {
        setShowInstallPrompt(true);
        // * Animate in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    // * Listen for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [fadeAnim]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      // ? * Show the browser install prompt
      await deferredPrompt.prompt();
      
      // * Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // * Clear the deferred prompt
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
        handleDismiss();
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    // * Store dismissal time
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    
    // * Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowInstallPrompt(false);
    });
  };

  const handleRemindLater = () => {
    // * Store a shorter dismissal time (1 day instead of 7)
    const oneDayFromNow = Date.now() - (6 * 24 * 60 * 60 * 1000); // 6 days ago = remind in 1 day
    localStorage.setItem('pwa-install-dismissed', oneDayFromNow.toString());
    
    // * Animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowInstallPrompt(false);
    });
  };

  // ? Don't show on non-web platforms or if already installed
  if (Platform.OS !== 'web' || isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📱</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install Fantasy Writing App</Text>
          <Text style={styles.description}>
            Install the app for a better experience with offline access and faster performance
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, styles.dismissButton]}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissButtonText}>Not Now</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.remindButton]}
            onPress={handleRemindLater}
          >
            <Text style={styles.remindButtonText}>Remind Later</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.installButton]}
            onPress={handleInstall}
          >
            <Text style={styles.installButtonText}>Install</Text>
          </Pressable>
        </View>

        <Pressable style={styles.closeButton} onPress={handleDismiss}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      {/* iOS-specific instructions */}
      {Platform.OS === 'web' && /iPhone|iPad|iPod/.test(navigator.userAgent) && (
        <View style={styles.iosInstructions}>
          <Text style={styles.iosInstructionsText}>
            To install: Tap the share button {'  '} in Safari and select "Add to Home Screen"
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ? * Standalone component for showing install status
export function InstallStatus() {
  const [installStatus, setInstallStatus] = useState<'prompt' | 'installing' | 'installed' | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // * Check current status
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstallStatus('installed');
    }

    // * Listen for status changes
    const handleBeforeInstall = () => setInstallStatus('prompt');
    const handleInstalling = () => setInstallStatus('installing');
    const handleInstalled = () => setInstallStatus('installed');

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  if (!installStatus || Platform.OS !== 'web') return null;

  return (
    <View style={styles.statusContainer}>
      {installStatus === 'installed' && (
        <Text style={styles.statusText}>✅ Running as installed app</Text>
      )}
      {installStatus === 'installing' && (
        <Text style={styles.statusText}>⏳ Installing...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxWidth: 480,
    alignSelf: 'center',
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  content: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  textContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#4B5563',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  remindButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
  },
  remindButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#D1D5DB',
  },
  installButton: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#6366F1',
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
  },
  closeIcon: {
    fontSize: 20,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  iosInstructions: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    padding: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderTopColor: '#4B5563',
  },
  iosInstructionsText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  statusContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
  },
  statusText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
});
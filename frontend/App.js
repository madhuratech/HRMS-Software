import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

export default function App() {
  // Point to the live Vercel deployment
  const webViewUrl = 'https://madhura-hrm-gamma.vercel.app/';

  const injectedJavaScript = `
    setTimeout(function() {
      var meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'viewport');
        document.getElementsByTagName('head')[0].appendChild(meta);
      }
      // Use device-width so Tailwind correctly sees this as a mobile screen (e.g. 390px) instead of raw pixels (e.g. 1080px)
      meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      
      // Ensure no overflow forces a desktop width
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      
      window.alert = function(message) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'alert', message: message }));
      };
    }, 100);
    true;
  `;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <WebView 
          source={{ uri: webViewUrl }} 
          style={{ flex: 1 }}
          bounces={false}
          cacheEnabled={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          textZoom={100}
          injectedJavaScript={injectedJavaScript}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data.type === 'alert') {
                Alert.alert('Alert', data.message);
              }
            } catch(e) {}
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

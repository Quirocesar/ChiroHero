import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      message: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'Unknown runtime error',
    };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === 'function') {
      this.props.onError(error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Error de aplicacion</Text>
        <Text style={styles.body}>
          Se produjo un error inesperado. Puedes reiniciar la sesion y continuar jugando.
        </Text>
        {this.state.message ? <Text style={styles.errorText}>{this.state.message}</Text> : null}
        <Pressable onPress={this.handleReset} style={styles.button}>
          <Text style={styles.buttonText}>Reiniciar juego</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#f2f2ff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    color: '#c8c8d9',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#ff9f9f',
    fontSize: 13,
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5b7cfa',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

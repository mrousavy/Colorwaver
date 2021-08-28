import React from 'react'
import { StyleSheet, Text, View } from "react-native";



export function App() {
  console.log('re-rendering App.')

  return (<View style={styles.container}>
<Text>Hello!</Text>
  </View>)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red'
  }
})

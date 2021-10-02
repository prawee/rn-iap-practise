import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, Alert, View, SafeAreaView, Button, Platform } from 'react-native';

import IAP from 'react-native-iap';

const items = Platform.select({
  ios: ['rt_699_1m'],
  android: [''],
});

export default function App() {

  const [purchased, setPurchase] = useState(false);
  const [products, setProducts] = useState({});

  useEffect(() => {
    IAP.initConnection().catch(() => {
      console.log('error connection to store');
    }).then(() => {
      console.log('connected to store...');
      IAP.getSubscriptions(items).catch(() => {
        console.log('error finding purchases');
      }).then((res) => {
        console.log('got products');
        setProducts(res);
        console.log(products);
      });
    });
  }, []);

  return (
    <View>
      <Text>I hate programing</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

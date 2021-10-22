import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  SafeAreaView,
  Platform,
  ScrollView,
  Button,
} from 'react-native';
import RNIap, {
  purchaseUpdatedListener,
  finishTransaction,
  purchaseErrorListener,
} from 'react-native-iap';

const items = Platform.select({
  ios: ['rt_699_1m', 'VinvestorTest001', 'VinvestorTest01', 'c01', 'uc02'],
  android: ['rt_699_1m', 'VinvestorTest001', 'VinvestorTest01', 'c01', 'uc02'],
});

export default function App() {
  const [productLists, setProductLists] = useState();
  const [receipt, setReceipt] = useState('');
  const [availableItemsMessage, setAvailableItemsMessage] = useState('');

  let purchaseUpdateSubscription;
  let purchaseErrorSubscription;

  const initialMount = async () => {
    try {
      await RNIap.initConnection().then(async () => {
        console.log('connected to store...');
        await RNIap.clearTransactionIOS();
      });
      await getItems();
    } catch (err) {
      console.warn(err.code, err.message);
    }

    purchaseUpdateSubscription = purchaseUpdatedListener(async purchase => {
      console.info('purchase', purchase);
      const _receipt = purchase.transactionReceipt
        ? purchase.transactionReceipt
        : purchase.originalJson;
      console.info(_receipt);

      if (_receipt) {
        try {
          const ackResult = await finishTransaction(purchase);
          console.info('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }
        setReceipt(_receipt);
      }
    });

    purchaseErrorSubscription = purchaseErrorListener(error => {
      console.log('purchaseErrorListener', error);
      Alert.alert('purchase error', JSON.stringify(error));
    });

    RNIap.purchaseUpdatedListener(purchase => {
      console.log('purchase2 ', purchase); // undefined
    });
  };

  const getItems = async () => {
    try {
      const products = await RNIap.getProducts(items);
      console.log('getItems(ok) ', products);
      setProductLists(products);
    } catch (err) {
      console.warn('getItems(err) ', err.code, err.message);
    }
  };

  const getSubscriptions = async () => {
    try {
      const subscriptions = await RNIap.getSubscriptions(items);
      console.log('getSubscriptions(ok) ', subscriptions);
      setProductLists(subscriptions);
    } catch (err) {
      console.warn('getSubscriptions(err) ', err.code, err.message);
    }
  };

  const getAvailablePurchases = async () => {
    try {
      console.info(
        'Get available purchases (non-consumable or unconsumed consumable)',
      );
      const purchases = await RNIap.getAvailablePurchases();
      console.info('getAvailablePurchases(ok) ', purchases);
      if (purchases && purchases.length > 0) {
        setAvailableItemsMessage(`Got ${purchases.length} items.`);
        setReceipt(purchases[0].transactionReceipt);
      }
    } catch (err) {
      console.warn('getAvailablePurchases(err) ', err.code, err.message);
      Alert.alert(err.message);
    }
  };

  const requestPurchase = async sku => {
    try {
      RNIap.requestPurchase(sku);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  const requestSubscription = async sku => {
    try {
      RNIap.requestSubscription(sku);
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  const willUnmount = () => {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    RNIap.endConnection();
  };

  useEffect(() => {
    // initialIAP();
    initialMount();

    return () => willUnmount();
  }, []);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTxt}>RNIap Test</Text>
        </View>
        <View>
          <ScrollView>
            <Button
              onPress={() => getAvailablePurchases()}
              title="Get available purchases"
            />

            <Text>{availableItemsMessage}</Text>

            <Text>{receipt && receipt.substring(0, 100)}</Text>

            <Button onPress={() => getItems()} title="Get Products" />
            <Button
              onPress={() => getSubscriptions()}
              title="Get Subscriptions"
            />
            <Text>{productLists && productLists.length}</Text>
            {productLists &&
              productLists.map((product, i) => {
                return (
                  <View key={i}>
                    <Text>{JSON.stringify(product)}</Text>
                    <Button
                      // onPress={(): void => this.requestPurchase(product.productId)}
                      onPress={() => requestSubscription(product.productId)}
                      title="Request subscription for above product"
                    />
                    <Button
                      onPress={() => requestPurchase(product.productId)}
                      // onPress={() => requestSubscription(product.productId)}
                      title="Request purchase for above product"
                    />
                  </View>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: Platform.select({
    //   ios: 0,
    //   android: 24,
    // }),
    // paddingTop: Platform.select({
    //   ios: 0,
    //   android: 24,
    // }),
    // backgroundColor: 'green',
  },
  header: {
    flex: 20,
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTxt: {
    fontSize: 26,
    color: 'green',
  },
  content: {
    flex: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  btn: {
    height: 48,
    width: 240,
    alignSelf: 'center',
    backgroundColor: '#00c40f',
    borderRadius: 0,
    borderWidth: 0,
  },
  txt: {
    fontSize: 16,
    color: 'white',
  },
});

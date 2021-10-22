/**
 * with Euan Morgan
 * https://www.youtube.com/watch?v=4JLHRV2kiCU
 */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  Alert,
  View,
  Button,
  Platform,
  Image,
} from 'react-native';

import IAP from 'react-native-iap';

const items = Platform.select({
  // ios: ['com.vinvestor.iaptest99'],
  ios: ['VinvestorTest001', 'VinvestorTest01'],
  android: [''],
});

// eslint-disable-next-line no-unused-vars
let purchaseUpdatedListener;
// eslint-disable-next-line no-unused-vars
let purchaseErrorListener;

export default function App() {
  const [purchased, setPurchased] = useState(false);
  const [products, setProducts] = useState({});
  const [checking, setChecking] = useState(false);

  const validate = async receipt => {
    setChecking(true);
    const receiptBody = {
      'receipt-data': receipt,
      password: '200749475c574baaace440f831e48469',
    };
    const result = await IAP.validateReceiptIos(receiptBody, true)
      .catch()
      .then(receiptValidate => {
        try {
          // console.log(receiptValidate);
          const renewalHistory = receiptValidate.latest_receipt_info;
          // console.log('renewWalHistory ', renewWalHistory);
          const expiration =
            renewalHistory[renewalHistory.length - 1].expires_date_ms;
          let expired = Date.new() > expiration;
          if (!expired) {
            setPurchased(true);
          } else {
            Alert.alert(
              'Purchase Expired',
              'Your subscription has expired, please resubscribe to continue using app',
            );
          }
          setChecking(false);
        } catch (error) {
          console.log('validateReceiptIos failed.');
        }
      });
  };

  useEffect(() => {
    IAP.initConnection()
      .catch(() => {
        console.log('error connecting to store');
      })
      .then(() => {
        console.log('connected to store...');
        IAP.getSubscriptions(items)
          .catch(() => {
            console.log('error finding purchases');
          })
          .then(res => {
            console.log('got products ', res);
            setProducts(res);
            console.log(products);
          });

        IAP.getPurchaseHistory()
          .catch(() => {
            console.log('nothing getPurchaseHistory');
            setChecking(false);
          })
          .then(res => {
            console.log('getPurchaseHistory ', res);
            const receipt = res[res.length - 1].transactionReceipt;
            if (receipt) {
              validate(receipt);
            }
          });
      });

    purchaseErrorListener = IAP.purchaseErrorListener(error => {
      if (error.responseCode === '2') {
        // user cancelled
      } else {
        Alert.alert(
          'Error',
          'There has been an error with your purchase, error code =' +
            error.code,
        );
      }
    });

    purchaseUpdatedListener = IAP.purchaseUpdatedListener(purchase => {
      try {
        const receipt = purchase.transactionReceipt;
        // console.log(receipt);
        // setPurchased(true);
        // validate receipt
        if (receipt) {
          validate(receipt);
        }
      } catch (error) {
        // test
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking for previous purchase...</Text>
      </View>
    );
  } else {
    if (purchased) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Welcome to the app</Text>
          <Image style={styles.image} source={require('./dog.jpeg')} />
        </View>
      );
    } else {
      if (products.length > 0) {
        return (
          <View style={styles.container}>
            <Text style={styles.text}>{products[0].title}</Text>
            <Text style={styles.text}>1 Month {products[0].localizedPrice}</Text>
            <View style={styles.divine} />
            <View style={styles.features}>
              <Text style={styles.text}>Features:</Text>
              <Text style={styles.smallText}>
                {'\u2B24'} Ad-free access to the entire app {'\n'}
                {'\u2B24'} 1000 wizard tokens {'\n'}
                {'\u2B24'} legendary dragon skin {'\n'}
              </Text>
            </View>
            <Button
              title="Purchase"
              onPress={() => {
                console.log('Pressed');
                IAP.requestSubscription(products[0].productId);
              }}
            />
          </View>
        );
      } else {
        return (
          <View style={styles.container}>
            <Text style={styles.text}>Fetching products please wait...</Text>
          </View>
        );
      } // end products
    } // end purchased
  } // end checking
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 30,
    paddingBottom: 10,
  },
  smallText: {
    color: 'white',
    fontSize: 16,
  },
  features: {
    backgroundColor: 'rgba(150, 150, 150, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginTop: 13,
  },
  divine: {
    height: 4,
    width: 50,
    backgroundColor: 'white',
  },
  image: {
    with: 150,
    // resizeMode: 'center',
  },
});

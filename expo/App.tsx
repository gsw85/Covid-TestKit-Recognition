// ref: https://github.com/Pigrabbit/rn-object-detection/blob/main/App.tsx
// ref: repos/tfjs-yolov5-example

import * as tf from '@tensorflow/tfjs';
import { loadGraphModel } from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg, fetch } from '@tensorflow/tfjs-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Modal, Pressable, SafeAreaView, StatusBar, StyleSheet, View, Text } from 'react-native';
// import { RNCamera } from 'react-native-camera';
import {Camera} from 'expo-camera';
import {
  getModel,
  convertBase64ToTensor,
  startPrediction,
} from './helpers/tensor-helper';
import {cropPicture} from './helpers/image-helper';
// import { CameraContainer } from './src/CameraContainer';
// import { classesDir, threshold, windowWidth } from './src/constants';
// import { ControlPanel } from './src/ControlPanel';
// import { DetectedBox } from './src/DetectedBox';
// import { Header } from './src/Header';
// import { DetectedObject, Prediction } from './src/types';

declare const global: { HermesInternal: null | {} };


const RESULT_MAPPING = ['Triangle', 'Circle', 'Square'];


const App = () => {
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [presentedShape, setPresentedShape] = useState('');

  const handleImageCapture = async () => {
    setIsProcessing(true);
    const imageData = await cameraRef.current.takePictureAsync({
      base64: true,
    });
    processImagePrediction(imageData);
  };

  const processImagePrediction = async (base64Image: any) => {
    const croppedData = await cropPicture(base64Image, 300);
    const model = await getModel();
    const tensor = await convertBase64ToTensor(croppedData.base64);

    const prediction = await startPrediction(model, tensor);

    const highestPrediction = prediction.indexOf(
      Math.max.apply(null, prediction),
    );
    setPresentedShape(RESULT_MAPPING[highestPrediction]);
  };

  return (
    <View style={styles.container}>
      <Modal visible={isProcessing} transparent={true} animationType="slide">
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text>Your current shape is {presentedShape}</Text>
            {presentedShape === '' && <ActivityIndicator size="large" />}
            <Pressable
              style={styles.dismissButton}
              onPress={() => {
                setPresentedShape('');
                setIsProcessing(false);
              }}>
              <Text>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        autoFocus={true}
        whiteBalance={Camera.Constants.WhiteBalance.auto}></Camera>
      <Pressable
        onPress={() => handleImageCapture()}
        style={styles.captureButton}></Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  captureButton: {
    position: 'absolute',
    left: Dimensions.get('screen').width / 2 - 50,
    bottom: 40,
    width: 100,
    zIndex: 100,
    height: 100,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  modal: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    borderRadius: 24,
    backgroundColor: 'gray',
  },
  dismissButton: {
    width: 150,
    height: 50,
    marginTop: 60,
    borderRadius: 24,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'red',
  },
});

export default App;
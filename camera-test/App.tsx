import {StatusBar} from 'expo-status-bar'
import React, {useEffect} from 'react'
import {StyleSheet, Text, View, TouchableOpacity, Alert, ImageBackground, Image} from 'react-native'
import {Camera} from 'expo-camera'
import * as FileSystem from "expo-file-system"
import * as tf from "@tensorflow/tfjs"
import {bundleResourceIO, decodeJpeg} from "@tensorflow/tfjs-react-native"
import * as ImageManipulator from "expo-image-manipulator"
import { loadGraphModel } from '@tensorflow/tfjs'
import {modelJSON, modelWeights} from "./src/constants/metrics"
import {Prediction} from "./src/types/inference"

let camera: Camera
export default function App() {
  const [startCamera, setStartCamera] = React.useState(false)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [capturedImage, setCapturedImage] = React.useState<any>(null)
  const [cameraType, setCameraType] = React.useState(Camera.Constants.Type.back)
  const [flashMode, setFlashMode] = React.useState('off')
  const [isTfReady, setIsTfReady] = React.useState(false);
  const [model, setModel] = React.useState<tf.GraphModel | null>(null);
  const [predictedResult, setPredictedResult] = React.useState<Prediction>({
    boxes: [[[]]],
    scores: [[]],
    classes: new Int32Array(),
  });


  const inference = async(imageTensor: tf.Tensor3D) => {
    // console.log("imgTensor", imageTensor)
    // console.log("model", model)
    if(!model) return;
    if (!imageTensor) return;
    // console.log("model", model)
    // console.log('imgTensor', imageTensor)
    try {
      tf.engine().startScope();
      console.log('inference begin');
      const startTime = new Date().getTime();
      const predictions: tf.Tensor<tf.Rank>[] = (await model.executeAsync(
        tf.cast(imageTensor.transpose([0, 1, 2]).expandDims(), "float32"),
      )) as tf.Tensor<tf.Rank>[];
      const endTime = new Date().getTime();
      console.log(`inference end, ETC: ${endTime - startTime}ms`);

      console.log("predictions", predictions)

      // const boxes = predictions[5].arraySync() as number[][][];
      // const scores = predictions[1].arraySync() as number[][];
      // const classes = predictions[0].dataSync<'int32'>();
      // console.log({ boxes, scores, classes })
      // setPredictedResult({ boxes, scores, classes });
    } catch (error) {
      console.log(error)
    } finally {
      tf.engine().endScope();
    }
  }

  const __startCamera = async () => {
    const {status} = await Camera.requestCameraPermissionsAsync();
    console.log(status)
    if (status === 'granted') {
      setStartCamera(true)
    } else {
      Alert.alert('Access denied')
    }
  }
  const __takePicture = async () => {
    const photo: any = await camera.takePictureAsync({quality: 0.8, base64:false, exif: false, skipProcessing: false})
    const resized_photo = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 640, height: 640 } }])
    const imageUri = resized_photo.uri
    const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer)  
    const imageTensor = decodeJpeg(raw);
    await inference(imageTensor) 
    setPreviewVisible(true)
    //setStartCamera(false)
    setCapturedImage(resized_photo)
  }

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        setIsTfReady(true)
        const loadedModel = await loadGraphModel(bundleResourceIO(modelJSON, modelWeights));
        setModel(loadedModel);
        if(loadedModel){
          console.log("model is loaded")
        }
      } catch (error) {
        Alert.alert('', error, [{ text: 'close', onPress: () => null }]);
      }
    };

    loadModel();
  }, []);

  const __savePhoto = () => {}
  const __retakePicture = () => {
    setCapturedImage(null)
    setPreviewVisible(false)
    __startCamera()
  }
  const __handleFlashMode = () => {
    if (flashMode === 'on') {
      setFlashMode('off')
    } else if (flashMode === 'off') {
      setFlashMode('on')
    } else {
      setFlashMode('auto')
    }
  }
  const __switchCamera = () => {
    if (cameraType === 'back') {
      setCameraType('front')
    } else {
      setCameraType('back')
    }
  }
  return (
    <View style={styles.container}>
      {startCamera ? (
        <View
          style={{
            flex: 1,
            width: '100%'
          }}
        >
          {previewVisible && capturedImage ? (
            <CameraPreview photo={capturedImage} savePhoto={__savePhoto} retakePicture={__retakePicture} />
          ) : (
            <Camera
              type={cameraType}
              flashMode={flashMode}
              style={{flex: 1}}
              ref={(r) => {
                camera = r
              }}
            >
              <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: 'transparent',
                  flexDirection: 'row'
                }}
              >
                <View
                  style={{
                    position: 'absolute',
                    left: '5%',
                    top: '10%',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <TouchableOpacity
                    onPress={__handleFlashMode}
                    style={{
                      backgroundColor: flashMode === 'off' ? '#000' : '#fff',
                      // borderRadius: '50%',
                      height: 25,
                      width: 25
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      ⚡️
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={__switchCamera}
                    style={{
                      marginTop: 20,
                      // borderRadius: '50%',
                      height: 25,
                      width: 25
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20
                      }}
                    >
                      {cameraType === 'front' ? '🤳' : '📷'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    flexDirection: 'row',
                    flex: 1,
                    width: '100%',
                    padding: 20,
                    justifyContent: 'space-between'
                  }}
                >
                  <View
                    style={{
                      alignSelf: 'center',
                      flex: 1,
                      alignItems: 'center'
                    }}
                  >
                    <TouchableOpacity
                      onPress={__takePicture}
                      style={{
                        width: 70,
                        height: 70,
                        bottom: 0,
                        borderRadius: 50,
                        backgroundColor: '#fff'
                      }}
                    />
                  </View>
                </View>
              </View>
            </Camera>
          )}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <TouchableOpacity
            onPress={__startCamera}
            style={{
              width: 130,
              borderRadius: 4,
              backgroundColor: '#14274e',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              height: 40
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
            >
              Take picture
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

const CameraPreview = ({photo, retakePicture, savePhoto}: any) => {
  console.log('Preview image', photo)
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        flex: 1,
        width: '100%',
        height: '100%'
      }}
    >
      <ImageBackground
        source={{uri: photo && photo.uri}}
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            padding: 15,
            justifyContent: 'flex-end'
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}
          >
            <TouchableOpacity
              onPress={retakePicture}
              style={{
                width: 130,
                height: 40,

                alignItems: 'center',
                // borderRadius: 4
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                Re-take
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                width: 130,
                height: 40,

                alignItems: 'center',
                // borderRadius: 4
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20
                }}
              >
                save photo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  )
}
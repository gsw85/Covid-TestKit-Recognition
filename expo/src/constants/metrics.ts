import { Dimensions } from 'react-native';
import { LabelMap } from '../types';

// export const modelJSON = require('../../assets/model/model.json');
// export const modelWeights = [
//   require('../../assets/model/group1-shard1of7.bin'),
//   require('../../assets/model/group1-shard2of7.bin'),
//   require('../../assets/model/group1-shard3of7.bin'),
//   require('../../assets/model/group1-shard4of7.bin'),
//   require('../../assets/model/group1-shard5of7.bin'),
//   require('../../assets/model/group1-shard6of7.bin'),
//   require('../../assets/model/group1-shard7of7.bin'),
// ];

export const threshold = 0.5;
export const classesDir: Record<number, LabelMap> = {
  1: {
    name: 'Positive',
    id: 1,
  },
  2: {
    name: 'Negative',
    id: 2,
  },
  3: {
    name: 'Invalid-empty',
    id: 3,
  },
  4: {
    name: 'Invalid-smudge',
    id: 4,
  },
};

export const windowWidth = Dimensions.get('window').width;

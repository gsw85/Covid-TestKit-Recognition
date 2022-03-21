export interface DetectedObject {
  bbox: number[];
  class: number;
  label: 'Positive' | 'Negative' | 'Invalid-empty' | 'Invalid-smudge';
  score: string;
}

export interface Prediction {
  boxes: number[][][];
  scores: number[][];
  classes: Int32Array;
}

export interface LabelMap {
  name: 'Positive' | 'Negative' | 'Invalid-empty' | 'Invalid-smudge';
  id: number;
}

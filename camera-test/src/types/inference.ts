export interface DetectedObject {
  bbox: number[];
  class: number;
  label: 'Postive' | 'Negative' | 'Invalid-Empty' | 'Invalid-Smudge';
  score: string;
}

export interface Prediction {
  boxes: number[][][];
  scores: number[][];
  classes: Int32Array;
}

export interface LabelMap {
  name: 'Postive' | 'Negative' | 'Invalid-Empty' | 'Invalid-Smudge';
  id: number;
}

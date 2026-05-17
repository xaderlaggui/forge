export interface SetRow {
  id: number;
  prev: string;
  weight: string;
  reps: string;
  done: boolean;
}

export interface ExerciseState {
  name: string;
  sets: SetRow[];
}

export type NumpadTarget = { 
  exIdx: number; 
  setIdx: number; 
  field: 'weight' | 'reps'; 
} | null;

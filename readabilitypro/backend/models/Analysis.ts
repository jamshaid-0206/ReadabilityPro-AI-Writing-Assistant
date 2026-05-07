import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalysis extends Document {
  userId: string;
  documentName: string;
  originalText: string;
  metrics: {
    fleschKincaid: number;
    readingTime: number;
    wordCount: number;
    sentenceCount: number;
    difficultWords: number;
  };
  createdAt: Date;
}

const AnalysisSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  documentName: { type: String, default: 'Untitled Document' },
  originalText: { type: String, required: true },
  metrics: {
    fleschKincaid: { type: Number, required: true },
    readingTime: { type: Number, required: true },
    wordCount: { type: Number, required: true },
    sentenceCount: { type: Number, required: true },
    difficultWords: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now }
});

export const Analysis = mongoose.model<IAnalysis>('Analysis', AnalysisSchema);

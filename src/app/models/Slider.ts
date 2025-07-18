import mongoose, { Schema, Document } from 'mongoose';

export interface ISlide {
  image: string;  // Local image path
  title: string;
  description: string;
  link: string;  // Custom route/link for the button
}

export interface ISlider extends Document {
  slides: ISlide[];
  isActive: boolean;
}

const slideSchema = new Schema<ISlide>({
  image: { type: String, required: true },
  title: { type: String, required: false },
  description: { type: String, required: false },
  link: { type: String, required: false }
});

const sliderSchema = new Schema<ISlider>({
  slides: [slideSchema],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Ensure only one active slider exists
sliderSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model<ISlider>('Slider').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', sliderSchema); 
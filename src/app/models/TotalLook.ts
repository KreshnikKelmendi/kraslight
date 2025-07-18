import { Schema, models, model } from 'mongoose';

const TotalLookSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

export const TotalLook = models.TotalLook || model('TotalLook', TotalLookSchema); 
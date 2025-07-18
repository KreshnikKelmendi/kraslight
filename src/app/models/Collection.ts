import { Schema, models, model } from 'mongoose';

const CollectionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String, required: true },
    categories: [{ type: String }],
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

export const Collection = models.Collection || model('Collection', CollectionSchema); 
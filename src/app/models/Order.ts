import { Schema, model, models } from 'mongoose';

const OrderSchema = new Schema(
  {
    email: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String },
    postalCode: { type: String, required: true },
    notes: { type: String },
    paymentMethod: { type: String, required: true, default: 'cash' },
    items: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        originalPrice: { type: Number },
        discountPercentage: { type: Number },
        image: { type: String },
        quantity: { type: Number, required: true },
        brand: { type: String },
        size: { type: String },
        category: { type: String },
        gender: { type: String },
        stock: { type: Number },
        description: { type: String },
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
  },
  { timestamps: true }
);

export const Order = models.Order || model('Order', OrderSchema); 
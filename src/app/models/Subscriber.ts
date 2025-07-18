import { Schema, models, model } from 'mongoose';

const SubscriberSchema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    subscribedAt: { 
      type: Date, 
      default: Date.now 
    },
    lastEmailSent: { 
      type: Date 
    },
    emailCount: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

// Add index for email field for faster queries
SubscriberSchema.index({ email: 1 });

export const Subscriber = models.Subscriber || model('Subscriber', SubscriberSchema); 
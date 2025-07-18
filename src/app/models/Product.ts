import { Schema, models, model } from 'mongoose';

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number }, // Store original price when discount is applied
    discountPercentage: { type: Number, min: 0, max: 100 }, // Store discount percentage
    image: { type: String }, // Legacy single image field
    images: [{ type: String }], // Array of image paths
    mainImage: { type: String }, // Primary image path
    description: { type: String }, // Product description
    stock: { type: Number, required: true, default: 0, min: 0 },
    brand: { type: String, required: true },
    brandLogo: { type: String }, // Optional logo path for the brand
    sizes: { type: String, default: '' }, // Store sizes as comma-separated string (optional with default)
    subcategory: { type: String, default: '' }, // Nenkategoria e produktit
    gender: { 
      type: String, 
      required: true, 
      enum: ['Meshkuj', 'Femra', 'Të Gjitha'],
      default: 'Të Gjitha'
    },
    category: { 
      type: String, 
      required: true,
      default: 'Të tjera'
    },
    isNewArrival: { 
      type: Boolean, 
      default: false 
    }, // Track if product is a new arrival
    characteristics: [{
      key: { type: String, required: true },
      value: { type: String, required: true }
    }], // Product characteristics as key-value pairs
  },
  { timestamps: true }
);

// Add a pre-save middleware to calculate discounted price
ProductSchema.pre('save', function(next) {
  if (this.isModified('discountPercentage') || this.isModified('price')) {
    if (this.discountPercentage && this.discountPercentage > 0) {
      // If discount is being applied, store original price
      if (!this.originalPrice) {
        this.originalPrice = this.price;
      }
      // Calculate new price based on discount
      this.price = this.originalPrice * (1 - this.discountPercentage / 100);
    } else {
      // If no discount, clear original price and reset price to original
      if (this.originalPrice) {
        this.price = this.originalPrice;
        this.originalPrice = undefined;
      }
      // Clear discount percentage completely
      this.discountPercentage = undefined;
    }
  }
  
  next();
});

// Clear any existing model to ensure fresh schema
if (models.Product) {
  delete models.Product;
}

export const Product = model('Product', ProductSchema);

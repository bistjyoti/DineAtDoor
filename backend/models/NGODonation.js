import mongoose from 'mongoose';

const NGODonationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodItems: {
    type: String,
    required: true
  },
  quantity: {
    type: String,
    required: true
  },
  expiryTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Available', 'Claimed', 'Delivered'],
    default: 'Available'
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Check if the model already exists to avoid OverwriteModelError
const NGODonation = mongoose.models.NGODonation || mongoose.model('NGODonation', NGODonationSchema);

export default NGODonation;
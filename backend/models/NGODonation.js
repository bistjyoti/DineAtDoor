import mongoose from 'mongoose';

const NGODonationSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant', 
    required: true
  },

  restaurantName: {
    type: String,
    default: ""
  },

  restaurantAddress: {
    type: String,
    default: ""
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

const NGODonation = mongoose.models.NGODonation || mongoose.model('NGODonation', NGODonationSchema);

export default NGODonation;
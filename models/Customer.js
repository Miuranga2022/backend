import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  mobile1: { type: String, required: true },
  mobile2: { type: String }
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);

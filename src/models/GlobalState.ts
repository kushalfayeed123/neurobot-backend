import mongoose from 'mongoose';

const globalStateSchema = new mongoose.Schema({
  totalCapital: { type: Number, default: 0 },
  totalPnL: { type: Number, default: 0 },
  lastTradeTime: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('GlobalState', globalStateSchema);

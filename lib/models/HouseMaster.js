import mongoose from 'mongoose';

const HouseMasterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    motivation: {
      type: String,
      required: [true, 'Please provide your motivation for leading'],
      trim: true,
      maxlength: [2000, 'Motivation cannot be more than 2000 characters'],
    },
    answers: {
      type: Map,
      of: String,
      required: [true, 'Please provide answers to the leadership questions'],
    },
    house: {
      type: String,
      enum: {
        values: ['Ashmoor', 'Ravenscar', 'Valemont', 'Thornvale', null],
        message: '{VALUE} is not a valid house',
      },
      default: null,
    },
    aiReasoning: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Assigned', 'Rejected'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Sparse unique index: ensures no two masters share a house.
// "sparse" means documents with house=null are excluded from the unique constraint,
// allowing multiple unassigned masters to exist.
HouseMasterSchema.index({ house: 1 }, { unique: true, sparse: true });

// Prevent model recompilation in development (HMR)
delete mongoose.models.HouseMaster;
const HouseMaster = mongoose.model('HouseMaster', HouseMasterSchema);

export default HouseMaster;

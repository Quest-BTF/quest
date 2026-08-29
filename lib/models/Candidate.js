import mongoose from 'mongoose';

const CandidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 20;
        },
        message: 'Cannot have more than 20 skills',
      },
    },
    answers: {
      type: Map,
      of: String,
      required: [true, 'Please provide answers to the behavioral questions'],
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
        values: ['Unsorted', 'Pending Review', 'Approved', 'Eliminated'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Unsorted',
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development (HMR) but ensure latest schema is used
delete mongoose.models.Candidate;
const Candidate = mongoose.model('Candidate', CandidateSchema);

export default Candidate;

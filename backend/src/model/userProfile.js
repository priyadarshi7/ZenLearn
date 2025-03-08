import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  personalInfo: {
    name: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "https://via.placeholder.com/150" },
    interests: [{ type: String }],
    occupation: { type: String, default: "" },
    location: { type: String, default: "" }
  },
  learningPreferences: {
    preferredSubjects: [{ type: String }],
    learningStyle: { 
      type: String, 
      enum: ['visual', 'auditory', 'reading/writing', 'kinesthetic', 'mixed'],
      default: 'mixed'
    },
    difficultyPreference: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'adaptive'],
      default: 'adaptive'
    },
    dailyLearningGoal: { type: Number, default: 30 }, // in minutes
  },
  progress: {
    experiencePoints: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    badgesEarned: [{
      name: { type: String },
      description: { type: String },
      icon: { type: String },
      dateEarned: { type: Date, default: Date.now }
    }],
    completedChallenges: [{ 
      challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
      completedDate: { type: Date, default: Date.now },
      rating: { type: Number, min: 1, max: 5 }
    }]
  },
  wellbeing: {
    stressLevel: { type: Number, min: 1, max: 10, default: 5 },
    moodTracker: [{
      date: { type: Date, default: Date.now },
      mood: { type: String, enum: ['excellent', 'good', 'neutral', 'stressed', 'overwhelmed'] },
      notes: { type: String }
    }],
    mindfulnessMinutes: { type: Number, default: 0 },
    sleepHours: { type: Number, default: 7 }
  },
  social: {
    mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    studyGroups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'StudyGroup' }],
    attendedMeetups: [{ type: Date }],
    publicSpeakingTasks: [{
      title: { type: String },
      date: { type: Date },
      duration: { type: Number }, // in minutes
      confidence: { type: Number, min: 1, max: 10 }
    }]
  },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      challenges: { type: Boolean, default: true },
      socialUpdates: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { 
        type: String, 
        enum: ['public', 'friends', 'private'],
        default: 'public'
      },
      showProgress: { type: Boolean, default: true },
      showActivity: { type: Boolean, default: true }
    },
    theme: { 
      type: String, 
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: { type: String, default: 'en' }
  }
}, { timestamps: true });

const UserProfile = mongoose.model("UserProfile", UserProfileSchema);

export default UserProfile;
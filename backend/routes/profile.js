import express from "express";
import UserProfile from "../src/model/userProfile.js";

const router = express.Router();

// Simplified auth middleware that extracts user ID from the request
const extractUserInfo = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Authorization header required" });
  }
  
  try {
    // Add user info to request
    req.user = {
      sub: req.headers['x-auth0-user-id'] || 'default-user-id',
    };
    next();
  } catch (error) {
    console.error("Auth extraction error:", error);
    return res.status(500).json({ message: "Server error during authentication" });
  }
};

// Apply auth middleware to all routes
router.use(extractUserInfo);

// CREATE - Create new user profile
router.post("/", async (req, res) => {
  try {
    // Check if profile already exists
    const existingProfile = await UserProfile.findOne({ userId: req.user.sub });
    
    if (existingProfile) {
      return res.status(409).json({ message: "Profile already exists" });
    }
    
    // Create new profile with data from request body
    const newProfile = new UserProfile({
      userId: req.user.sub,
      ...req.body
    });
    
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// READ - Get user profile
router.get("/", async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user.sub });
    
    // If profile doesn't exist, create one with default values
    if (!profile) {
      profile = new UserProfile({
        userId: req.user.sub,
      });
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE - Update entire profile
router.put("/", async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      req.body,
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE - Update specific section of profile
router.patch("/:section", async (req, res) => {
  try {
    const section = req.params.section;
    const validSections = [
      "personalInfo", 
      "learningPreferences", 
      "progress", 
      "wellbeing", 
      "social",
      "settings"
    ];
    
    if (!validSections.includes(section)) {
      return res.status(400).json({ message: "Invalid section" });
    }
    
    const updateData = {};
    updateData[section] = req.body;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { $set: updateData },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating profile section:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE - Delete user profile
router.delete("/", async (req, res) => {
  try {
    await UserProfile.findOneAndDelete({ userId: req.user.sub });
    res.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// MOOD TRACKING

// Add mood entry
router.post("/mood", async (req, res) => {
  try {
    const { mood, notes } = req.body;
    
    if (!mood) {
      return res.status(400).json({ message: "Mood is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $push: { 
          "wellbeing.moodTracker": {
            date: new Date(),
            mood,
            notes
          } 
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error adding mood entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get mood entries
router.get("/mood", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.sub });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Return mood entries, optionally filtered by date range
    const { from, to } = req.query;
    let moodEntries = profile.wellbeing.moodTracker || [];
    
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? new Date(to) : new Date();
      
      moodEntries = moodEntries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= fromDate && entryDate <= toDate;
      });
    }
    
    res.json(moodEntries);
  } catch (error) {
    console.error("Error getting mood entries:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete mood entry
router.delete("/mood/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $pull: { 
          "wellbeing.moodTracker": { _id: entryId } 
        } 
      },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// MEDITATION TRACKING

// Update mindfulness minutes
router.post("/mindfulness", async (req, res) => {
  try {
    const { minutes, date = new Date() } = req.body;
    
    if (!minutes || isNaN(minutes) || minutes <= 0) {
      return res.status(400).json({ message: "Valid minutes are required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $inc: { "wellbeing.mindfulnessMinutes": minutes },
        $push: { 
          "wellbeing.mindfulnessSessions": {
            date,
            duration: minutes
          } 
        }
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating mindfulness minutes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// BADGES & PROGRESS

// Add badge to user
router.post("/badges", async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: "Badge name is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $push: { 
          "progress.badgesEarned": {
            name,
            description,
            icon,
            dateEarned: new Date()
          } 
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error adding badge:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update XP and level
router.post("/progress/xp", async (req, res) => {
  try {
    const { xp } = req.body;
    
    if (!xp || isNaN(xp)) {
      return res.status(400).json({ message: "Valid XP amount is required" });
    }
    
    // Get current profile
    const profile = await UserProfile.findOne({ userId: req.user.sub });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    // Update XP
    let newXP = (profile.progress.experiencePoints || 0) + parseInt(xp);
    
    // Calculate new level (simple algorithm: level = 1 + floor(sqrt(XP/100)))
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newXP / 100)) + 1);
    
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $set: { 
          "progress.experiencePoints": newXP,
          "progress.level": newLevel
        } 
      },
      { new: true }
    );
    
    res.json(updatedProfile);
  } catch (error) {
    console.error("Error updating XP:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update streak
router.post("/progress/streak", async (req, res) => {
  try {
    const { increase = true } = req.body;
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $inc: { 
          "progress.streak": increase ? 1 : -1
        } 
      },
      { new: true, upsert: true }
    );
    
    // Ensure streak doesn't go below 0
    if (profile.progress.streak < 0) {
      profile.progress.streak = 0;
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating streak:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reset streak (for missed days)
router.post("/progress/reset-streak", async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { $set: { "progress.streak": 0 } },
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error resetting streak:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CHALLENGES

// Complete a challenge
router.post("/challenges/complete", async (req, res) => {
  try {
    const { challengeId, rating } = req.body;
    
    if (!challengeId) {
      return res.status(400).json({ message: "Challenge ID is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $push: { 
          "progress.completedChallenges": {
            challengeId,
            completedDate: new Date(),
            rating: rating || 5
          } 
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error completing challenge:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUBLIC SPEAKING

// Add public speaking task
router.post("/speaking", async (req, res) => {
  try {
    const { title, date, duration, confidence } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $push: { 
          "social.publicSpeakingTasks": {
            title,
            date: date || new Date(),
            duration: duration || 0,
            confidence: confidence || 1
          } 
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error adding speaking task:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get speaking tasks
router.get("/speaking", async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.sub });
    
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    const speakingTasks = profile.social.publicSpeakingTasks || [];
    res.json(speakingTasks);
  } catch (error) {
    console.error("Error getting speaking tasks:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// STUDY GROUPS & SOCIAL

// Join study group
router.post("/social/groups/join", async (req, res) => {
  try {
    const { groupId } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { 
        userId: req.user.sub,
        "social.studyGroups": { $ne: groupId } // Prevent duplicates
      },
      { 
        $push: { 
          "social.studyGroups": groupId
        } 
      },
      { new: true }
    );
    
    if (!profile) {
      // User might already be in the group
      return res.status(400).json({ message: "Already in this group or profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error joining study group:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Leave study group
router.post("/social/groups/leave", async (req, res) => {
  try {
    const { groupId } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $pull: { 
          "social.studyGroups": groupId
        } 
      },
      { new: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error leaving study group:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add mentor relationship
router.post("/social/mentors", async (req, res) => {
  try {
    const { mentorId } = req.body;
    
    if (!mentorId) {
      return res.status(400).json({ message: "Mentor ID is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { 
        userId: req.user.sub,
        "social.mentors": { $ne: mentorId } // Prevent duplicates
      },
      { 
        $push: { 
          "social.mentors": mentorId
        } 
      },
      { new: true }
    );
    
    if (!profile) {
      return res.status(400).json({ message: "Already has this mentor or profile not found" });
    }
    
    res.json(profile);
  } catch (error) {
    console.error("Error adding mentor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// SETTINGS

// Update notification settings
router.patch("/settings/notifications", async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $set: { 
          "settings.notifications": req.body
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating notification settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update privacy settings
router.patch("/settings/privacy", async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $set: { 
          "settings.privacy": req.body
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update theme settings
router.patch("/settings/theme", async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme || !['light', 'dark', 'system'].includes(theme)) {
      return res.status(400).json({ message: "Valid theme is required" });
    }
    
    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user.sub },
      { 
        $set: { 
          "settings.theme": theme
        } 
      },
      { new: true, upsert: true }
    );
    
    res.json(profile);
  } catch (error) {
    console.error("Error updating theme settings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
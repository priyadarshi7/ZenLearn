"use client"

import { useState, useEffect } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Tab } from "@headlessui/react"
import {
  PencilIcon,
//   CheckBadgeIcon,
  ChartBarIcon,
  UserIcon,
  CogIcon,
  HeartIcon,
  UsersIcon,
  CheckBadgeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import axios from "axios"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const ProfilePage = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [formData, setFormData] = useState({})

  // Tabs for profile sections
  const tabs = [
    { name: "Personal", icon: UserIcon },
    { name: "Learning", icon: ChartBarIcon },
    { name: "Progress", icon: CheckBadgeIcon },
    { name: "Wellbeing", icon: HeartIcon },
    { name: "Social", icon: UsersIcon },
    { name: "Settings", icon: CogIcon },
  ]

  // API base URL from environment variable
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const token = await getAccessTokenSilently()

        // Set up headers with Auth0 token and user ID
        const headers = {
          Authorization: `Bearer ${token}`,
          "x-auth0-user-id": user?.sub, // Add user ID for the backend middleware
        }

        const response = await axios.get(`${API_URL}/api/profile`, { headers })
        setProfile(response.data)
        setFormData(response.data)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated && user?.sub) {
      fetchProfile()
    }
  }, [getAccessTokenSilently, isAuthenticated, user?.sub, API_URL])

  const handleInputChange = (section, field, value) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    })
  }

  const handleArrayInputChange = (section, field, value) => {
    // Split comma-separated values into an array
    const valueArray = value.split(",").map((item) => item.trim())
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: valueArray,
      },
    })
  }

  const saveChanges = async (section) => {
    try {
      const token = await getAccessTokenSilently()

      // Set up headers with Auth0 token and user ID
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.patch(`${API_URL}/api/profile/${section}`, formData[section], { headers })

      setProfile(response.data)
      setEditMode(false)
    } catch (error) {
      console.error("Error saving profile:", error)
      setError("Failed to save profile changes")
    }
  }

  const addMoodEntry = async (mood, notes) => {
    try {
      const token = await getAccessTokenSilently()

      // Set up headers with Auth0 token and user ID
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(`${API_URL}/api/profile/mood`, { mood, notes }, { headers })

      setProfile(response.data)
    } catch (error) {
      console.error("Error adding mood entry:", error)
    }
  }

  const addSpeakingTask = async (title, duration, confidence) => {
    try {
      const token = await getAccessTokenSilently()

      // Set up headers with Auth0 token and user ID
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(
        `${API_URL}/api/profile/speaking`,
        {
          title,
          duration: Number.parseInt(duration),
          confidence: Number.parseInt(confidence),
          date: new Date(),
        },
        { headers },
      )

      setProfile(response.data)
    } catch (error) {
      console.error("Error adding speaking task:", error)
    }
  }

  const updateMindfulnessMinutes = async (minutes) => {
    try {
      const token = await getAccessTokenSilently()

      // Set up headers with Auth0 token and user ID
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(
        `${API_URL}/api/profile/mindfulness`,
        { minutes: Number.parseInt(minutes) },
        { headers },
      )

      setProfile(response.data)
    } catch (error) {
      console.error("Error updating mindfulness minutes:", error)
    }
  }

  const joinStudyGroup = async (groupId) => {
    try {
      const token = await getAccessTokenSilently()

      // Set up headers with Auth0 token and user ID
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(`${API_URL}/api/profile/social/groups/join`, { groupId }, { headers })

      setProfile(response.data)
    } catch (error) {
      console.error("Error joining study group:", error)
    }
  }

  const updateStreak = async (increase = true) => {
    try {
      const token = await getAccessTokenSilently()

      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(`${API_URL}/api/profile/progress/streak`, { increase }, { headers })

      setProfile(response.data)
    } catch (error) {
      console.error("Error updating streak:", error)
    }
  }

  const completeChallenge = async (rating) => {
    try {
      const token = await getAccessTokenSilently()

      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const challengeId = `challenge-${Date.now()}`

      const response = await axios.post(
        `${API_URL}/api/profile/challenges/complete`,
        {
          challengeId,
          rating,
        },
        { headers },
      )

      setProfile(response.data)
    } catch (error) {
      console.error("Error completing challenge:", error)
    }
  }

  const addBadge = async (name, description) => {
    try {
      const token = await getAccessTokenSilently()

      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(
        `${API_URL}/api/profile/badges`,
        {
          name,
          description,
          icon: "badge",
        },
        { headers },
      )

      setProfile(response.data)
    } catch (error) {
      console.error("Error adding badge:", error)
    }
  }

  const updateXP = async (xp) => {
    try {
      const token = await getAccessTokenSilently()

      const headers = {
        Authorization: `Bearer ${token}`,
        "x-auth0-user-id": user?.sub,
      }

      const response = await axios.post(`${API_URL}/api/profile/progress/xp`, { xp }, { headers })

      setProfile(response.data)
    } catch (error) {
      console.error("Error updating XP:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to view your profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className=" mt-16 container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 mb-8 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center">
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <img
              src={ user?.picture || `/placeholder.svg?height=96&width=96`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-white object-cover"
              onError={(e) => {
                e.currentTarget.src = `/placeholder.svg?height=96&width=96`
                e.currentTarget.onerror = null
              }}
            />
            <div className="absolute bottom-0 right-0 bg-green-400 rounded-full w-5 h-5 border-2 border-white"></div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile?.personalInfo?.name || user?.name}</h1>
            <p className="text-indigo-100">{profile?.personalInfo?.occupation || "Student"}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <div className="flex items-center">
                <CheckBadgeIcon className="h-5 w-5 text-yellow-300 mr-1" />
                <span>Level {profile?.progress?.level || 1}</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center">
                <span>{profile?.progress?.experiencePoints || 0} XP</span>
              </div>
              <span className="hidden md:inline">•</span>
              <div className="flex items-center">
                <span>{profile?.progress?.streak || 0} Day Streak</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="mt-4 md:mt-0 px-4 py-2 bg-white text-indigo-600 rounded-full font-medium flex items-center hover:bg-indigo-100 transition-colors shadow-sm"
          >
            <PencilIcon className="h-4 w-4 mr-1" /> {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tab.Group
        onChange={(index) => {
          setCurrentTab(index)
          if (editMode) setEditMode(false)
        }}
      >
        <Tab.List className="flex p-1 space-x-1 bg-indigo-100 rounded-xl mb-8">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  "w-full py-3 text-sm leading-5 font-medium rounded-lg transition",
                  "flex justify-center items-center",
                  selected
                    ? "bg-white text-indigo-700 shadow"
                    : "text-indigo-500 hover:bg-white/[0.5] hover:text-indigo-700",
                )
              }
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2">
          {/* Personal Info Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            {editMode ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Edit Personal Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.name || ""}
                    onChange={(e) => handleInputChange("personalInfo", "name", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.bio || ""}
                    onChange={(e) => handleInputChange("personalInfo", "bio", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.avatar || ""}
                    onChange={(e) => handleInputChange("personalInfo", "avatar", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.occupation || ""}
                    onChange={(e) => handleInputChange("personalInfo", "occupation", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.location || ""}
                    onChange={(e) => handleInputChange("personalInfo", "location", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Interests (comma-separated)</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.personalInfo?.interests?.join(", ") || ""}
                    onChange={(e) => handleArrayInputChange("personalInfo", "interests", e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => saveChanges("personalInfo")}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <button className="text-indigo-600 hover:text-indigo-800" onClick={() => setEditMode(true)}>
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                    <p className="mt-1 text-gray-900">{profile?.personalInfo?.bio || "No bio added yet."}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Occupation</h3>
                    <p className="mt-1 text-gray-900">{profile?.personalInfo?.occupation || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1 text-gray-900">{profile?.personalInfo?.location || "Not specified"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Interests</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile?.personalInfo?.interests?.length > 0 ? (
                        profile.personalInfo.interests.map((interest, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            {interest}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No interests added yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Tab.Panel>

          {/* Learning Preferences Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            {editMode ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Edit Learning Preferences</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.learningPreferences?.preferredSubjects?.join(", ") || ""}
                    onChange={(e) => handleArrayInputChange("learningPreferences", "preferredSubjects", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Learning Style</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.learningPreferences?.learningStyle || "mixed"}
                    onChange={(e) => handleInputChange("learningPreferences", "learningStyle", e.target.value)}
                  >
                    <option value="visual">Visual</option>
                    <option value="auditory">Auditory</option>
                    <option value="reading/writing">Reading/Writing</option>
                    <option value="kinesthetic">Kinesthetic</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty Preference</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.learningPreferences?.difficultyPreference || "adaptive"}
                    onChange={(e) => handleInputChange("learningPreferences", "difficultyPreference", e.target.value)}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="adaptive">Adaptive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Daily Learning Goal (minutes)</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.learningPreferences?.dailyLearningGoal || 30}
                    onChange={(e) =>
                      handleInputChange("learningPreferences", "dailyLearningGoal", Number.parseInt(e.target.value))
                    }
                    min="1"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => saveChanges("learningPreferences")}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Learning Preferences</h2>
                  <button className="text-indigo-600 hover:text-indigo-800" onClick={() => setEditMode(true)}>
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Preferred Subjects</h3>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile?.learningPreferences?.preferredSubjects?.length > 0 ? (
                        profile.learningPreferences.preferredSubjects.map((subject, index) => (
                          <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No preferred subjects added yet.</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Learning Style</h3>
                      <p className="mt-1 text-gray-900 capitalize">
                        {profile?.learningPreferences?.learningStyle || "Mixed"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Difficulty Preference</h3>
                      <p className="mt-1 text-gray-900 capitalize">
                        {profile?.learningPreferences?.difficultyPreference || "Adaptive"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Daily Learning Goal</h3>
                      <p className="mt-1 text-gray-900">
                        {profile?.learningPreferences?.dailyLearningGoal || 30} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Tab.Panel>

          {/* Progress Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Your Progress</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateStreak(true)}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Streak
                </button>
                <button
                  onClick={() => {
                    const xp = prompt("How many XP would you like to add?")
                    if (xp && !isNaN(Number.parseInt(xp))) {
                      updateXP(Number.parseInt(xp))
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> XP
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{profile?.progress?.level || 1}</div>
                <div className="text-sm text-gray-500">Current Level</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {profile?.progress?.experiencePoints || 0}
                </div>
                <div className="text-sm text-gray-500">Experience Points</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
                <div className="text-4xl font-bold text-indigo-600 mb-2">{profile?.progress?.streak || 0}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Badges Earned</h3>
                <button
                  onClick={() => {
                    const name = prompt("Enter badge name:")
                    const description = prompt("Enter badge description:")
                    if (name && description) {
                      addBadge(name, description)
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
                >
                  Add Badge
                </button>
              </div>
              {profile?.progress?.badgesEarned?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {profile.progress.badgesEarned.map((badge, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-16 w-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
                        <CheckBadgeIcon className="h-10 w-10 text-indigo-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-center">{badge.name}</h4>
                      <p className="text-xs text-gray-500 text-center mt-1">{badge.description}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(badge.dateEarned).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <CheckBadgeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No badges yet</h3>
                  <p className="text-gray-500">Complete challenges to earn your first badge!</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Recent Challenges</h3>
                <button
                  onClick={() => {
                    const rating = prompt("Rate this challenge (1-5):")
                    if (
                      rating &&
                      !isNaN(Number.parseInt(rating)) &&
                      Number.parseInt(rating) >= 1 &&
                      Number.parseInt(rating) <= 5
                    ) {
                      completeChallenge(Number.parseInt(rating))
                    }
                  }}
                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
                >
                  Complete Challenge
                </button>
              </div>
              {profile?.progress?.completedChallenges?.length > 0 ? (
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Challenge
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {profile.progress.completedChallenges.map((challenge, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            Challenge {challenge.challengeId || index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(challenge.completedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-5 w-5 ${i < challenge.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No challenges completed</h3>
                  <p className="text-gray-500">Your completed challenges will appear here</p>
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Wellbeing Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            {editMode ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Edit Wellbeing</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Stress Level (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    className="mt-1 block w-full accent-indigo-600"
                    value={formData.wellbeing?.stressLevel || 5}
                    onChange={(e) => handleInputChange("wellbeing", "stressLevel", Number.parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low Stress (1)</span>
                    <span>High Stress (10)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mindfulness Minutes</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.wellbeing?.mindfulnessMinutes || 0}
                    onChange={(e) =>
                      handleInputChange("wellbeing", "mindfulnessMinutes", Number.parseInt(e.target.value))
                    }
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sleep Hours</label>
                  <input
                    type="number"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={formData.wellbeing?.sleepHours || 7}
                    onChange={(e) => handleInputChange("wellbeing", "sleepHours", Number.parseFloat(e.target.value))}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    onClick={() => saveChanges("wellbeing")}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Wellbeing Tracker</h2>
                  <button
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                    onClick={() => setEditMode(true)}
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Current Stress Level</h3>
                    <div className="mt-3">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            (profile?.wellbeing?.stressLevel || 5) < 4
                              ? "bg-green-500"
                              : (profile?.wellbeing?.stressLevel || 5) < 7
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${((profile?.wellbeing?.stressLevel || 5) / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-center font-medium">{profile?.wellbeing?.stressLevel || 5}/10</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Mindfulness Minutes</h3>
                    <div className="mt-1 text-3xl font-bold text-indigo-600 text-center">
                      {profile?.wellbeing?.mindfulnessMinutes || 0}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">minutes practiced</p>
                    <button
                      onClick={() => {
                        const minutes = prompt("How many mindfulness minutes would you like to add?")
                        if (minutes && !isNaN(Number.parseInt(minutes))) {
                          updateMindfulnessMinutes(minutes)
                        }
                      }}
                      className="mt-3 w-full text-xs py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      Add Minutes
                    </button>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg shadow-sm">
                    <h3 className="text-sm font-medium text-gray-500">Sleep Hours</h3>
                    <div className="mt-1 text-3xl font-bold text-indigo-600 text-center">
                      {profile?.wellbeing?.sleepHours || 7}
                    </div>
                    <p className="text-xs text-center text-gray-500 mt-1">hours per night</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Mood Tracker</h3>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      onClick={() => {
                        const moods = ["excellent", "good", "neutral", "stressed", "overwhelmed"]
                        const selectedMood = prompt(`How are you feeling today? (${moods.join(", ")})`)
                        if (selectedMood && moods.includes(selectedMood.toLowerCase())) {
                          const notes = prompt("Any notes about your mood today?")
                          addMoodEntry(selectedMood.toLowerCase(), notes || "")
                        } else if (selectedMood) {
                          alert(`Please select one of the following moods: ${moods.join(", ")}`)
                        }
                      }}
                    >
                      Add Mood
                    </button>
                  </div>

                  {profile?.wellbeing?.moodTracker?.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mood
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {profile.wellbeing.moodTracker
                            .slice()
                            .reverse()
                            .map((entry, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      entry.mood === "excellent"
                                        ? "bg-green-100 text-green-800"
                                        : entry.mood === "good"
                                          ? "bg-blue-100 text-blue-800"
                                          : entry.mood === "neutral"
                                            ? "bg-gray-100 text-gray-800"
                                            : entry.mood === "stressed"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {entry.mood}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{entry.notes || "-"}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-8 rounded-lg text-center">
                      <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No mood entries yet</h3>
                      <p className="text-gray-500">Start tracking your mood to see the history here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Tab.Panel>
          {/* Social Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            <h2 className="text-xl font-semibold mb-6">Social Connections</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <UsersIcon className="h-5 w-5 mr-2 text-indigo-500" />
                  Mentors & Study Groups
                </h3>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Mentors</h4>
                    {profile?.social?.mentors?.length > 0 ? (
                      <div className="space-y-2">
                        {profile.social.mentors.map((mentor, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center mr-3">
                              <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <p className="font-medium">Mentor {mentor}</p>
                              <p className="text-xs text-gray-500">Subject Expert</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No mentors yet. Connect with experts to get guidance!</p>
                    )}
                    <button
                      onClick={async () => {
                        const mentorId = prompt("Enter the ID of the mentor you want to add:")
                        if (mentorId) {
                          try {
                            const token = await getAccessTokenSilently()
                            const headers = {
                              Authorization: `Bearer ${token}`,
                              "x-auth0-user-id": user?.sub,
                            }

                            const response = await axios.post(
                              `${API_URL}/api/profile/social/mentors`,
                              { mentorId },
                              { headers },
                            )

                            setProfile(response.data)
                          } catch (error) {
                            console.error("Error adding mentor:", error)
                          }
                        }
                      }}
                      className="mt-3 w-full text-xs py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      Add Mentor
                    </button>
                  </div>

                  <div className="border rounded-lg p-4 shadow-sm">
                    <h4 className="font-medium text-gray-900 mb-2">Study Groups</h4>
                    {profile?.social?.studyGroups?.length > 0 ? (
                      <div className="space-y-2">
                        {profile.social.studyGroups.map((group, index) => (
                          <div
                            key={index}
                            className="flex items-center p-2 hover:bg-gray-50 rounded-md transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center mr-3">
                              <UsersIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Study Group {group}</p>
                              <p className="text-xs text-gray-500">Active Members: 5</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm("Are you sure you want to leave this group?")) {
                                  try {
                                    const token = await getAccessTokenSilently()
                                    const headers = {
                                      Authorization: `Bearer ${token}`,
                                      "x-auth0-user-id": user?.sub,
                                    }

                                    const response = await axios.post(
                                      `${API_URL}/api/profile/social/groups/leave`,
                                      { groupId: group },
                                      { headers },
                                    )

                                    setProfile(response.data)
                                  } catch (error) {
                                    console.error("Error leaving study group:", error)
                                  }
                                }
                              }}
                              className="ml-auto text-xs py-1 px-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              Leave
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No study groups yet. Join a group to learn together!</p>
                    )}
                    <button
                      onClick={() => {
                        const groupId = prompt("Enter the ID of the study group you want to join:")
                        if (groupId) joinStudyGroup(groupId)
                      }}
                      className="mt-3 w-full text-xs py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                    >
                      Join a Group
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Public Speaking Progress</h3>

                {profile?.social?.publicSpeakingTasks?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Confidence
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {profile.social.publicSpeakingTasks.map((task, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {task.title}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {new Date(task.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{task.duration} min</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{ width: `${(task.confidence / 10) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="ml-2 text-xs">{task.confidence}/10</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center h-full flex flex-col justify-center">
                    <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No speaking tasks yet</h3>
                    <p className="text-gray-500">Track your public speaking activities to build confidence</p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mx-auto transition-colors"
                      onClick={() => {
                        const title = prompt("What was your speaking task about?")
                        const duration = prompt("How many minutes did you speak?")
                        const confidence = prompt("Rate your confidence level (1-10):")
                        if (title && duration && confidence) {
                          addSpeakingTask(title, duration, confidence)
                        }
                      }}
                    >
                      Add Speaking Task
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">Community Meetups</h3>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-lg shadow-sm">
                <div className="text-center mb-6">
                  <p className="text-gray-500">
                    Attended {profile?.social?.attendedMeetups?.length || 0} community events
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Q&A Session: Mastering Productivity</h4>
                        <p className="text-sm text-gray-500 mt-1">Tomorrow, 3:00 PM - 4:30 PM</p>
                        <div className="mt-2 flex items-center">
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Beginner Friendly
                          </span>
                          <span className="ml-2 text-xs text-gray-500">15 Attendees</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
                        Join
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">Webinar: Growth Mindset Workshop</h4>
                        <p className="text-sm text-gray-500 mt-1">March 12, 2025, 5:00 PM - 6:30 PM</p>
                        <div className="mt-2 flex items-center">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Interactive</span>
                          <span className="ml-2 text-xs text-gray-500">28 Attendees</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Tab.Panel>
          {/* Settings Tab */}
          <Tab.Panel className="bg-white rounded-xl p-6 shadow">
            {editMode ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Edit Settings</h2>

                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-700">Notification Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Email Notifications</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.settings?.notifications?.email}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                notifications: {
                                  ...formData.settings?.notifications,
                                  email: e.target.checked,
                                },
                              },
                            })
                          }}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Push Notifications</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.settings?.notifications?.push}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                notifications: {
                                  ...formData.settings?.notifications,
                                  push: e.target.checked,
                                },
                              },
                            })
                          }}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Challenge Notifications</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.settings?.notifications?.challenges}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                notifications: {
                                  ...formData.settings?.notifications,
                                  challenges: e.target.checked,
                                },
                              },
                            })
                          }}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-700">Privacy Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Profile Visibility</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.settings?.privacy?.profileVisibility || "public"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              privacy: {
                                ...formData.settings?.privacy,
                                profileVisibility: e.target.value,
                              },
                            },
                          })
                        }}
                      >
                        <option value="public">Public</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700">Show Progress to Others</label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={formData.settings?.privacy?.showProgress}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              settings: {
                                ...formData.settings,
                                privacy: {
                                  ...formData.settings?.privacy,
                                  showProgress: e.target.checked,
                                },
                              },
                            })
                          }}
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-indigo-600 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-700">Display Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Theme</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.settings?.theme || "system"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              theme: e.target.value,
                            },
                          })
                        }}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Language</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={formData.settings?.language || "en"}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              language: e.target.value,
                            },
                          })
                        }}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    onClick={() => saveChanges("settings")}
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Settings</h2>
                  <button className="text-indigo-600 hover:text-indigo-800" onClick={() => setEditMode(true)}>
                    <PencilIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Email Notifications</span>
                        <span className={profile?.settings?.notifications?.email ? "text-green-600" : "text-red-600"}>
                          {profile?.settings?.notifications?.email ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Push Notifications</span>
                        <span className={profile?.settings?.notifications?.push ? "text-green-600" : "text-red-600"}>
                          {profile?.settings?.notifications?.push ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Challenge Notifications</span>
                        <span
                          className={profile?.settings?.notifications?.challenges ? "text-green-600" : "text-red-600"}
                        >
                          {profile?.settings?.notifications?.challenges ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Social Updates</span>
                        <span
                          className={
                            profile?.settings?.notifications?.socialUpdates ? "text-green-600" : "text-red-600"
                          }
                        >
                          {profile?.settings?.notifications?.socialUpdates ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Profile Visibility</span>
                        <span className="capitalize">{profile?.settings?.privacy?.profileVisibility || "Public"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Show Progress</span>
                        <span className={profile?.settings?.privacy?.showProgress ? "text-green-600" : "text-red-600"}>
                          {profile?.settings?.privacy?.showProgress ? "Visible" : "Hidden"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Show Activity</span>
                        <span className={profile?.settings?.privacy?.showActivity ? "text-green-600" : "text-red-600"}>
                          {profile?.settings?.privacy?.showActivity ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Display Settings</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Theme</span>
                        <span className="capitalize">{profile?.settings?.theme || "System"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Language</span>
                        <span>
                          {profile?.settings?.language === "en"
                            ? "English"
                            : profile?.settings?.language === "es"
                              ? "Spanish"
                              : profile?.settings?.language === "fr"
                                ? "French"
                                : profile?.settings?.language === "de"
                                  ? "German"
                                  : profile?.settings?.language === "zh"
                                    ? "Chinese"
                                    : "English"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <button
                      className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                      onClick={async () => {
                        if (
                          window.confirm("Are you sure you want to delete your account? This action cannot be undone.")
                        ) {
                          try {
                            const token = await getAccessTokenSilently()
                            await axios.delete(`${API_URL}/api/profile`, {
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "x-auth0-user-id": user?.sub,
                              },
                            })
                            alert("Your account has been deleted successfully.")
                            // Redirect to home or logout
                          } catch (error) {
                            console.error("Error deleting account:", error)
                            alert("Failed to delete account. Please try again.")
                          }
                        }
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default ProfilePage

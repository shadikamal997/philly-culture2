"use client";

import { useState } from "react";
import { auth } from "@/firebase/firebaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

export default function CreateProgram() {
  const router = useRouter();
  
  // Basic Info
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [price, setPrice] = useState("");
  const [programType, setProgramType] = useState<"intensive" | "weekly" | "professional">("intensive");
  const [totalHours, setTotalHours] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [category, setCategory] = useState("culinary");
  const [difficultyLevel, setDifficultyLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [language, setLanguage] = useState("en");
  
  // Image URLs (up to 5)
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  
  // Additional Fields
  const [prerequisites, setPrerequisites] = useState("");
  const [learningObjectives, setLearningObjectives] = useState("");
  const [tags, setTags] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  
  // Settings
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [certificateEnabled, setCertificateEnabled] = useState(true);
  
  // 🔥 UNLOCK & ACCESS CONTROL
  const [unlockType, setUnlockType] = useState<"instant" | "drip" | "scheduled">("instant");
  const [accessDuration, setAccessDuration] = useState("0"); // 0 = lifetime
  const [dripInterval, setDripInterval] = useState("1"); // days between lessons
  const [isCohort, setIsCohort] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleAddImageUrl = () => {
    if (imageUrls.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length === 1) {
      setImageUrls(['']);
    } else {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading('Creating program...');

    try {
      // ✅ FRONTEND VALIDATION
      const errors: string[] = [];
      
      if (!title || title.trim().length < 3) {
        errors.push('Title must be at least 3 characters');
      }
      
      if (!shortDescription || shortDescription.trim().length < 10) {
        errors.push('Short description must be at least 10 characters');
      }
      
      if (!instructorName || instructorName.trim().length < 2) {
        errors.push('Instructor name must be at least 2 characters');
      }
      
      if (!price || Number(price) < 0) {
        errors.push('Please enter a valid price (0 or higher)');
      }
      
      if (!totalHours || Number(totalHours) < 1) {
        errors.push('Total hours must be at least 1');
      }
      
      if (errors.length > 0) {
        toast.error(`Please fix the following:\n• ${errors.join('\n• ')}`, { 
          id: loadingToast,
          duration: 6000,
        });
        setLoading(false);
        return;
      }

      // 🖼️ STEP 1: Process image URLs
      setUploadProgress(10);
      const validImageUrls = imageUrls.filter(url => url && url.trim().length > 0);
      
      // Use thumbnail URL or first image URL or default
      const finalThumbnailUrl = thumbnailUrl.trim() || validImageUrls[0] || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800";
      const finalImages = validImageUrls.length > 0 ? validImageUrls : [finalThumbnailUrl];
      
      // 🔑 STEP 2: Get authentication token
      setUploadProgress(50);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      
      const idToken = await user.getIdToken();

      // 📦 STEP 3: Prepare program data
      const programData = {
        title,
        shortDescription: shortDescription || "Learn professional cooking techniques",
        fullDescription: fullDescription || shortDescription || "Comprehensive culinary program",
        instructorName: instructorName || "Chef Instructor",
        thumbnail: finalThumbnailUrl,
        images: finalImages,
        programType,
        category,
        difficultyLevel,
        language,
        totalHours: Number(totalHours) || 2,
        basePrice: Number(price),
        published,
        featured,
        certificateEnabled,
        
        // Additional fields
        prerequisites: prerequisites ? prerequisites.split("\n").filter(p => p.trim()) : [],
        learningObjectives: learningObjectives ? learningObjectives.split("\n").filter(o => o.trim()) : [],
        tags: tags ? tags.split(",").map(t => t.trim()).filter(t => t) : [],
        maxStudents: maxStudents ? Number(maxStudents) : null,
        
        // 🔥 UNLOCK & ACCESS CONTROL
        unlockType,
        accessDuration: Number(accessDuration),
        dripInterval: unlockType === "drip" ? Number(dripInterval) : null,
        isCohort,
        startDate: isCohort && startDate ? startDate : null,
        enrollmentDeadline: isCohort && enrollmentDeadline ? enrollmentDeadline : null,
      };
      
      // 🚀 STEP 4: Call backend API
      setUploadProgress(70);
      const response = await fetch('/api/admin/programs/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(programData),
      });

      setUploadProgress(90);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors (array of error messages)
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessage = errorData.details.join('\n• ');
          throw new Error(`Validation failed:\n• ${errorMessage}`);
        }
        
        throw new Error(errorData.error || 'Failed to create program');
      }

      const result = await response.json();
      
      setUploadProgress(100);
      toast.success(`✅ ${result.message}`, { id: loadingToast });
      
      // Redirect to admin panel
      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1000);

    } catch (error: any) {
      console.error("Error creating program:", error);
      toast.error(error.message || "❌ Failed to create program", { id: loadingToast });
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Program</h1>
          <p className="text-gray-600 dark:text-gray-400">Fill in the details below to create a new educational program</p>
        </div>

        {/* Required Fields Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Required Fields</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Fields marked with <span className="text-red-600">*</span> are required:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• Program Title (min. 3 characters)</li>
                <li>• Short Description (min. 10 characters)</li>
                <li>• Instructor Name (min. 2 characters)</li>
                <li>• Base Price ($0 or higher for free programs)</li>
                <li>• Total Hours (min. 1 hour)</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* BASIC INFORMATION */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">📚</span> Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Program Title *</label>
              <input
                type="text"
                placeholder="e.g., Professional Italian Cooking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Short Description *</label>
              <textarea
                placeholder="Brief description (shown in program cards)"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={2}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Description</label>
              <textarea
                placeholder="Detailed description of the program (shown on program detail page)"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={5}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="culinary">Culinary Arts</option>
                  <option value="baking">Baking & Pastry</option>
                  <option value="business">Restaurant Business</option>
                  <option value="beverage">Beverage & Wine</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Level *</label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="it">Italian</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="italian, pasta, cooking, chef"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>
        </div>

        {/* IMAGE URLS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🖼️</span> Program Images (URLs)
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail URL (Optional)</label>
              <input
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <p className="text-xs text-gray-500 mt-1">If empty, first image URL below will be used</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Image URLs ({imageUrls.filter(u => u.trim()).length}/5)
              </label>
              <div className="space-y-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        placeholder={`Image ${index + 1} URL ${index === 0 ? '(used as thumbnail if no thumbnail URL)' : ''}`}
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImageUrl(index)}
                        className="px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {imageUrls.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  ➕ Add Another Image URL
                </button>
              )}
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Paste image URLs from Unsplash, ImgBB, Imgur, or any image hosting service
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Free image hosting: <a href="https://imgbb.com" target="_blank" className="underline">ImgBB</a> • <a href="https://unsplash.com" target="_blank" className="underline">Unsplash</a>
              </p>
            </div>

            {/* Image Preview */}
            {(thumbnailUrl.trim() || imageUrls.some(u => u.trim())) && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {thumbnailUrl.trim() && (
                    <div>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-red-500">
                        <img
                          src={thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'; }}
                        />
                        <div className="absolute top-1 left-1 bg-red-600 text-white text-xs px-2 py-1 rounded">
                          Thumbnail
                        </div>
                      </div>
                    </div>
                  )}
                  {imageUrls.filter(u => u.trim()).map((url, index) => (
                    <div key={index}>
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+URL'; }}
                        />
                        {index === 0 && !thumbnailUrl.trim() && (
                          <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Auto Thumbnail
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INSTRUCTOR & PRICING */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">👨‍🍳</span> Instructor & Pricing
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instructor Name *</label>
              <input
                type="text"
                placeholder="Chef Name"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Base Price (USD) *</label>
              <input
                type="number"
                placeholder="99.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Program Type *</label>
              <select
                value={programType}
                onChange={(e) => setProgramType(e.target.value as any)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
              >
                <option value="intensive">Intensive (Full-time immersion)</option>
                <option value="weekly">Weekly (Part-time classes)</option>
                <option value="professional">Professional (Career track)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Total Hours *</label>
              <input
                type="number"
                placeholder="e.g., 20"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                required
                min="1"
              />
            </div>
          </div>
        </div>

        {/* LEARNING DETAILS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Learning Details
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prerequisites (one per line)</label>
              <textarea
                placeholder="Basic knife skills&#10;Understanding of kitchen safety&#10;Passion for cooking"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">What students should know before starting</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Learning Objectives (one per line)</label>
              <textarea
                placeholder="Master Italian pasta-making techniques&#10;Understand regional Italian cuisines&#10;Create authentic Italian sauces"
                value={learningObjectives}
                onChange={(e) => setLearningObjectives(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">What students will learn by the end</p>
            </div>
          </div>
        </div>

        {/* 🔥 ACCESS & UNLOCK CONTROL */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">🔓</span> Access & Unlock Settings
          </h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Unlock Type *</label>
                <select
                  value={unlockType}
                  onChange={(e) => setUnlockType(e.target.value as any)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="instant">⚡ Instant - All lessons available immediately</option>
                  <option value="drip">💧 Drip - Unlock lessons over time</option>
                  <option value="scheduled">📅 Scheduled - Cohort-based with start date</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Access Duration (days)</label>
                <input
                  type="number"
                  placeholder="0 = Lifetime access"
                  value={accessDuration}
                  onChange={(e) => setAccessDuration(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">0 = Lifetime, e.g., 365 = 1 year</p>
              </div>
            </div>

            {unlockType === "drip" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <label className="block text-sm font-medium mb-2">Drip Interval (days between lessons)</label>
                <input
                  type="number"
                  placeholder="1"
                  value={dripInterval}
                  onChange={(e) => setDripInterval(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                  min="1"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Students will unlock one new lesson every {dripInterval || 1} day(s)
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <input
                  type="checkbox"
                  checked={isCohort}
                  onChange={(e) => setIsCohort(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-600"
                />
                <div>
                  <span className="text-sm font-medium">👥 This is a cohort-based program</span>
                  <p className="text-xs text-gray-500">Students start together on a specific date</p>
                </div>
              </label>
            </div>

            {isCohort && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Program Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Enrollment Deadline</label>
                    <input
                      type="date"
                      value={enrollmentDeadline}
                      onChange={(e) => setEnrollmentDeadline(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Max Students (Optional)</label>
                  <input
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-600"
                    min="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of students allowed to enroll</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROGRAM SETTINGS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-2xl">⚙️</span> Program Settings
          </h2>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-600"
              />
              <div>
                <span className="text-sm font-medium">✅ Published</span>
                <p className="text-xs text-gray-500">Make this program visible to students</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-600"
              />
              <div>
                <span className="text-sm font-medium">⭐ Featured</span>
                <p className="text-xs text-gray-500">Show this program on the homepage</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <input
                type="checkbox"
                checked={certificateEnabled}
                onChange={(e) => setCertificateEnabled(e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-600"
              />
              <div>
                <span className="text-sm font-medium">🎓 Certificate Enabled</span>
                <p className="text-xs text-gray-500">Students can earn a certificate upon completion</p>
              </div>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTONS */}
        <div className="flex gap-4 items-center pt-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {uploadProgress > 0 && uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : 'Creating Program...'}
              </>
            ) : (
              <>
                <span>✨</span> Create Program
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => router.push("/admin")}
            disabled={loading}
            className="border border-gray-300 dark:border-gray-700 px-8 py-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          {loading && (
            <span className="text-sm text-gray-500">Please wait, uploading image and creating program...</span>
          )}
        </div>
      </form>
    </main>
    </>
  );
}

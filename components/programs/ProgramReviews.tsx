"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebase/firebaseClient";
import toast from "react-hot-toast";

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string | null;
  userId: string;
  userEmail: string;
}

interface Props {
  programId: string;
  programTitle: string;
}

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={readonly ? "button" : "button"}
          disabled={readonly}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => !readonly && onChange?.(star)}
          className={`text-2xl transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer"
          } ${
            star <= (hovered || value)
              ? "text-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProgramReviews({ programId, programTitle }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/programs/${programId}/reviews`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check admin role via token claims
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role as string | undefined;
        setIsAdmin(["admin", "superadmin", "owner"].includes(role || ""));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Mark if current user already reviewed
  useEffect(() => {
    if (currentUser && reviews.length > 0) {
      setHasReviewed(reviews.some((r) => r.userId === currentUser.uid));
    } else {
      setHasReviewed(false);
    }
  }, [currentUser, reviews]);

  useEffect(() => {
    fetchReviews();
  }, [programId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please log in to leave a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`/api/programs/${programId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment, displayName }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit review");
        return;
      }

      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      setDisplayName("");
      fetchReviews();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    if (!currentUser) return;

    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(
        `/api/programs/${programId}/reviews?reviewId=${reviewId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete review");
        return;
      }

      toast.success("Review deleted");
      fetchReviews();
    } catch {
      toast.error("Failed to delete review");
    }
  };

  // Compute average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  // Rating distribution
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      reviews.length > 0
        ? Math.round(
            (reviews.filter((r) => r.rating === star).length / reviews.length) *
              100
          )
        : 0,
  }));

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        <span>⭐</span> Student Reviews
      </h2>

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 mb-10 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl p-6">
          <div className="flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">
              {avgRating.toFixed(1)}
            </span>
            <StarRating value={Math.round(avgRating)} readonly />
            <span className="text-sm text-gray-500 mt-1">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex-1 space-y-2">
            {distribution.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-gray-600 dark:text-gray-400 text-right">{star}</span>
                <span className="text-yellow-400">★</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-gray-500 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {currentUser && !hasReviewed && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Rating *
              </label>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Defaults to your account name"
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                maxLength={60}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Review *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this program... (min 10 characters)"
                rows={4}
                maxLength={1000}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                required
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {comment.length}/1000
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Already reviewed notice */}
      {currentUser && hasReviewed && (
        <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl px-5 py-3 mb-8 text-sm text-green-700 dark:text-green-400">
          ✅ You've already reviewed this program. Thank you!
        </div>
      )}

      {/* Not logged in notice */}
      {!currentUser && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 mb-8 text-sm text-gray-600 dark:text-gray-400">
          <a href="/login" className="text-red-600 font-medium hover:underline">
            Log in
          </a>{" "}
          and enroll to leave a review.
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm">Be the first to review this program!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-sm">
                    {review.reviewerName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {review.reviewerName}
                    </p>
                    <StarRating value={review.rating} readonly />
                    <p className="text-xs text-gray-400 mt-1">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : ""}
                    </p>
                  </div>
                </div>

                {/* Delete button — own review or admin */}
                {currentUser &&
                  (currentUser.uid === review.userId || isAdmin) && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors text-sm ml-4 flex-shrink-0"
                      title="Delete review"
                    >
                      🗑️
                    </button>
                  )}
              </div>

              <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

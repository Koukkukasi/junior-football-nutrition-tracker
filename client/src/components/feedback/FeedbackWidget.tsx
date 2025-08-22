import React, { useState } from 'react';
import { MessageSquare, X, Send, Bug, Lightbulb, Heart, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

type FeedbackType = 'bug' | 'feature' | 'general' | 'praise';

interface FeedbackData {
  type: FeedbackType;
  message: string;
  rating?: number;
  userAgent: string;
  url: string;
  timestamp: string;
}

export default function FeedbackWidget() {
  useAuth(); // For authentication check
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    const feedbackData: FeedbackData = {
      type: feedbackType,
      message: message.trim(),
      rating: rating || undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };
    
    try {
      // Send feedback to backend
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify(feedbackData)
      });
      
      if (response.ok) {
        setShowSuccess(true);
        setMessage('');
        setRating(0);
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          setIsOpen(false);
          setShowSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      // For now, store in localStorage as backup
      const existingFeedback = JSON.parse(localStorage.getItem('pendingFeedback') || '[]');
      existingFeedback.push(feedbackData);
      localStorage.setItem('pendingFeedback', JSON.stringify(existingFeedback));
      
      setShowSuccess(true);
      setMessage('');
      setRating(0);
      
      setTimeout(() => {
        setIsOpen(false);
        setShowSuccess(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-600' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'praise', label: 'Praise', icon: Heart, color: 'text-pink-600' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-50"
        aria-label="Open feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-4 flex justify-between items-center">
        <h3 className="font-semibold text-lg">Send Feedback</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-white/20 p-1 rounded transition-colors"
          aria-label="Close feedback"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {showSuccess ? (
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-lg font-semibold mb-2">Thank you!</h4>
          <p className="text-gray-600">Your feedback helps us improve the app for everyone.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Feedback Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackTypes.map(({ value, label, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFeedbackType(value as FeedbackType)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    feedbackType === value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${color} mx-auto mb-1`} />
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How's your experience? (optional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-2xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'bug'
                  ? "Describe the issue you're experiencing..."
                  : feedbackType === 'feature'
                  ? "What feature would you like to see?"
                  : feedbackType === 'praise'
                  ? "What do you love about the app?"
                  : "Share your thoughts with us..."
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Beta Tester Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-blue-800">
                As a beta tester, your feedback is invaluable in shaping the future of this app!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              isSubmitting || !message.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:shadow-lg'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Feedback
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import api from '../../api/apiClient';
import DashboardLayout from '../../layout/DashboardLayout';
import './Feedback.css';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    rating: 0,
    comment: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const categories = [
    { value: 'SERVICE', label: 'Service', icon: '👨‍💼' },
    { value: 'FOOD_QUALITY', label: 'Food Quality', icon: '🍕' },
    { value: 'AMBIENCE', label: 'Ambience', icon: '🏪' },
    { value: 'CLEANLINESS', label: 'Cleanliness', icon: '✨' },
    { value: 'PRICING', label: 'Pricing', icon: '💰' },
    { value: 'DELIVERY', label: 'Delivery', icon: '🚚' },
    { value: 'OTHER', label: 'Other', icon: '💬' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0 || !formData.category) {
      setMessage('Please provide rating and category');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('📤 Submitting feedback:', formData);
      
      const response = await api.post('/feedback', {
        orderId: formData.orderId || null,
        rating: formData.rating,
        comment: formData.comment,
        category: formData.category
      });

      console.log('✅ Feedback response:', response.data);
      setMessage('Feedback submitted successfully!');
      setFormData({ orderId: '', rating: 0, comment: '', category: '' });
      
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Show detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to submit feedback. Please try again.';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <DashboardLayout title="Give Feedback">
      <div className="feedback-form-container">
        <div className="feedback-form">
          <div className="form-header">
            <h2>Share Your Experience</h2>
            <p>We value your feedback to improve our service</p>
          </div>

          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Order ID (Optional) */}
            <div className="form-group">
              <label htmlFor="orderId">Order ID (Optional)</label>
              <input
                type="number"
                id="orderId"
                value={formData.orderId}
                onChange={(e) => setFormData(prev => ({ ...prev, orderId: e.target.value }))}
                placeholder="Enter your order number if applicable"
              />
            </div>

            {/* Rating */}
            <div className="form-group">
              <label>Your Rating *</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${star <= formData.rating ? 'active' : ''}`}
                    onClick={() => handleRatingClick(star)}
                  >
                    {star <= formData.rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
              <div className="rating-labels">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>Category *</label>
              <div className="category-grid">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="form-group">
              <label htmlFor="comment">Your Comments</label>
              <textarea
                id="comment"
                rows="4"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Tell us about your experience... (Optional)"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading || formData.rating === 0 || !formData.category}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackForm;
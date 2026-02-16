// src/components/customer/FeedbackHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';
import DashboardLayout from "../../layout/DashboardLayout";

const FeedbackHistory = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await api.get('/feedback/customer');
      setFeedback(response.data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'REVIEWED': return '#17a2b8';
      case 'RESOLVED': return '#28a745';
      case 'REJECTED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <DashboardLayout title="My Feedback">
        <div className="loading-container">
          <div className="spinner"></div>
          Loading your feedback...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Feedback">
        <div className="error-container">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Feedback">
      <div className="feedback-history">
        <div className="history-header">
          <h2>Your Feedback History</h2>
          <p>View all your submitted feedback and their status</p>
        </div>

        {feedback.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No Feedback Yet</h3>
            <p>You haven't submitted any feedback yet. Share your experience with us!</p>
          </div>
        ) : (
          <div className="feedback-list">
            {feedback.map((item) => (
              <div key={item.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="rating">
                    <span className="stars">{getRatingStars(item.rating)}</span>
                    <span className="rating-number">({item.rating}/5)</span>
                  </div>
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </div>
                </div>

                <div className="feedback-details">
                  <div className="category">
                    <strong>Category:</strong> {item.category?.replace('_', ' ') || 'Unknown'}
                  </div>
                  {item.orderId && (
                    <div className="order-id">
                      <strong>Order:</strong> #{item.orderId}
                    </div>
                  )}
                  <div className="date">
                    <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {item.comment && (
                  <div className="comment">
                    <strong>Your comment:</strong>
                    <p>"{item.comment}"</p>
                  </div>
                )}

                {item.adminNotes && (
                  <div className="admin-notes">
                    <strong>Admin Response:</strong>
                    <p>{item.adminNotes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <style jsx>{`
          .feedback-history {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }

          .history-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .history-header h2 {
            color: #8B4513;
            margin-bottom: 8px;
            font-size: 2rem;
          }

          .history-header p {
            color: #666;
            font-size: 1.1rem;
          }

          .loading-container {
            text-align: center;
            padding: 60px;
            color: #666;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e0e0e0;
            border-top: 4px solid #8B4513;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .error-container {
            text-align: center;
            padding: 40px;
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            margin: 20px;
          }

          .empty-state {
            text-align: center;
            padding: 80px 20px;
            color: #666;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .empty-state h3 {
            color: #8B4513;
            margin-bottom: 12px;
          }

          .feedback-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }

          .feedback-card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
            border-left: 4px solid #8B4513;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .feedback-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          }

          .feedback-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 16px;
          }

          .rating {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .stars {
            color: #ffc107;
            font-size: 20px;
          }

          .rating-number {
            color: #666;
            font-size: 14px;
            font-weight: 600;
          }

          .status-badge {
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .feedback-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-bottom: 16px;
            font-size: 14px;
          }

          .feedback-details div {
            padding: 8px 0;
          }

          .comment, .admin-notes {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid #e0e0e0;
          }

          .comment strong, .admin-notes strong {
            color: #8B4513;
          }

          .comment p, .admin-notes p {
            margin: 8px 0 0 0;
            color: #555;
            font-style: italic;
            line-height: 1.5;
          }

          .admin-notes {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            border-left: 3px solid #17a2b8;
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .feedback-history {
              padding: 16px;
            }

            .history-header h2 {
              font-size: 1.5rem;
            }

            .feedback-header {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }

            .feedback-details {
              grid-template-columns: 1fr;
              gap: 8px;
            }

            .feedback-card {
              padding: 20px;
            }
          }

          @media (max-width: 480px) {
            .feedback-history {
              padding: 12px;
            }

            .history-header h2 {
              font-size: 1.3rem;
            }

            .feedback-card {
              padding: 16px;
            }

            .empty-state {
              padding: 40px 20px;
            }

            .empty-icon {
              font-size: 48px;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default FeedbackHistory;
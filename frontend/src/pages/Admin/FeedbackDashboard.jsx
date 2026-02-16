// src/pages/Admin/FeedbackDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../api/apiClient';
import DashboardLayout from '../../layout/DashboardLayout';

const FeedbackDashboard = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Try to get stats (we know this works)
      const statsRes = await api.get('/feedback/admin/stats');
      setStats(statsRes.data);
      console.log('✅ Stats loaded:', statsRes.data);
      
      // Try to get feedback list - this might fail
      try {
        const feedbackRes = await api.get('/feedback/admin', { params: filters });
        setFeedback(feedbackRes.data);
        console.log('✅ Feedback list loaded:', feedbackRes.data.length, 'items');
      } catch (feedbackError) {
        console.error('❌ Failed to load feedback list:', feedbackError);
        setError('Unable to load feedback list, but stats are available');
        setFeedback([]); // Set empty array as fallback
      }
      
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same...
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'REVIEWED', label: 'Reviewed' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'REJECTED', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'FOOD_QUALITY', label: 'Food Quality' },
    { value: 'AMBIENCE', label: 'Ambience' },
    { value: 'CLEANLINESS', label: 'Cleanliness' },
    { value: 'PRICING', label: 'Pricing' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'OTHER', label: 'Other' }
  ];

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
      <DashboardLayout title="Customer Feedback">
        <div className="loading-container">
          <div className="spinner"></div>
          Loading feedback dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Customer Feedback">
      <div className="feedback-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Customer Feedback</h1>
          <p>Manage and review customer feedback</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Statistics - This should work */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.totalFeedback || 0}</div>
              <div className="stat-label">Total Feedback</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.averageRating?.toFixed(1) || '0.0'}/5</div>
              <div className="stat-label">Average Rating</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.pendingCount || 0}</div>
              <div className="stat-label">Pending Review</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.resolvedCount || 0}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Feedback List */}
        <div className="feedback-list">
          {feedback.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Feedback Available</h3>
              <p>{error ? 'Unable to load feedback data' : 'No feedback has been submitted yet'}</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div key={item.id} className="feedback-item">
                <div className="feedback-main">
                  <div className="customer-info">
                    <strong>{item.customerName}</strong>
                    <span>{item.customerEmail}</span>
                    {item.orderId && <span>Order: #{item.orderId}</span>}
                  </div>

                  <div className="rating-category">
                    <div className="rating">
                      <span className="stars">{getRatingStars(item.rating)}</span>
                      <span>({item.rating}/5)</span>
                    </div>
                    <div className="category">{item.category?.replace('_', ' ') || 'Unknown'}</div>
                  </div>

                  <div 
                    className="status"
                    style={{ color: getStatusColor(item.status) }}
                  >
                    {item.status}
                  </div>
                </div>

                {item.comment && (
                  <div className="comment">
                    "{item.comment}"
                  </div>
                )}

                <div className="feedback-meta">
                  Submitted: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        .feedback-dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 30px;
        }

        .dashboard-header h1 {
          color: #8B4513;
          margin-bottom: 8px;
        }

        .error-message {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border-left: 4px solid #8B4513;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #8B4513;
          margin-bottom: 8px;
        }

        .stat-label {
          color: #666;
          font-size: 14px;
        }

        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
        }

        .filters select {
          padding: 8px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          background: white;
        }

        .feedback-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feedback-item {
          background: white;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }

        .feedback-main {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 16px;
          align-items: center;
          margin-bottom: 12px;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-info span {
          font-size: 12px;
          color: #666;
        }

        .rating-category {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .stars {
          color: #ffc107;
        }

        .category {
          font-size: 12px;
          color: #666;
          text-transform: capitalize;
        }

        .status {
          font-weight: 600;
          text-transform: uppercase;
          font-size: 12px;
          text-align: right;
        }

        .comment {
          font-style: italic;
          color: #555;
          margin-bottom: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .feedback-meta {
          font-size: 11px;
          color: #999;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .loading-container {
          text-align: center;
          padding: 40px;
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
      `}</style>
    </DashboardLayout>
  );
};

export default FeedbackDashboard;
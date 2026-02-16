import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import DashboardLayout from '../../layout/DashboardLayout';
import api from '../../api/apiClient';

const WaiterProfile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const stats = {
    ordersServed: 124,
    tablesServed: 89,
    rating: 4.8,
    todayOrders: 12
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setMessage('Password updated successfully');
      e.target.reset();
    } catch (error) {
      setMessage('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="My Profile">
      <div className="waiter-profile">
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar">👨‍💼</div>
            <div className="profile-info">
              <h1>{user?.name || 'Waiter'}</h1>
              <p>{user?.email}</p>
              <span className="role-badge">Waiter</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat">
              <h3>{stats.ordersServed}</h3>
              <p>Orders Served</p>
            </div>
            <div className="stat">
              <h3>{stats.tablesServed}</h3>
              <p>Tables Served</p>
            </div>
            <div className="stat">
              <h3>{stats.rating}/5</h3>
              <p>Customer Rating</p>
            </div>
            <div className="stat">
              <h3>{stats.todayOrders}</h3>
              <p>Today's Orders</p>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Information
            </button>
            <button 
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Change Password
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'profile' && (
              <div className="profile-info">
                <div className="info-card">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Full Name</label>
                      <p>{user?.name || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>Email</label>
                      <p>{user?.email}</p>
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      <p>{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="info-item">
                      <label>Role</label>
                      <p>Waiter</p>
                    </div>
                    <div className="info-item">
                      <label>Member Since</label>
                      <p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="info-card">
                  <h3>Performance Summary</h3>
                  <div className="performance-stats">
                    <div className="performance-item">
                      <span className="label">Average Service Time</span>
                      <span className="value">8.2 min</span>
                    </div>
                    <div className="performance-item">
                      <span className="label">Customer Satisfaction</span>
                      <span className="value">96%</span>
                    </div>
                    <div className="performance-item">
                      <span className="label">This Month's Orders</span>
                      <span className="value">45</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="password-change">
                <div className="info-card">
                  <h3>Change Password</h3>
                  {message && (
                    <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
                      {message}
                    </div>
                  )}
                  <form onSubmit={handlePasswordChange}>
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        minLength="6"
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="submit-btn"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .waiter-profile {
            padding: 20px;
            max-width: 1000px;
            margin: 0 auto;
          }

          .profile-header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 40px;
          }

          .profile-avatar {
            display: flex;
            align-items: center;
            gap: 20px;
          }

          .avatar {
            font-size: 4rem;
          }

          .profile-info h1 {
            margin: 0 0 8px 0;
            color: #1f2937;
          }

          .profile-info p {
            margin: 0 0 12px 0;
            color: #6b7280;
          }

          .role-badge {
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.875rem;
            font-weight: 500;
          }

          .profile-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .stat {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
          }

          .stat h3 {
            margin: 0 0 8px 0;
            font-size: 1.5rem;
            color: #1f2937;
          }

          .stat p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .tabs {
            display: flex;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 30px;
          }

          .tab {
            background: none;
            border: none;
            padding: 12px 24px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            color: #6b7280;
            font-weight: 500;
            transition: all 0.2s;
          }

          .tab.active {
            color: #3b82f6;
            border-bottom-color: #3b82f6;
          }

          .info-card {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }

          .info-card h3 {
            margin: 0 0 20px 0;
            color: #1f2937;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }

          .info-item label {
            display: block;
            margin-bottom: 4px;
            color: #6b7280;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .info-item p {
            margin: 0;
            color: #1f2937;
            font-weight: 500;
          }

          .performance-stats {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .performance-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
          }

          .performance-item:last-child {
            border-bottom: none;
          }

          .performance-item .label {
            color: #6b7280;
          }

          .performance-item .value {
            color: #1f2937;
            font-weight: 600;
          }

          .form-group {
            margin-bottom: 20px;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
          }

          .form-group input {
            width: 100%;
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            box-sizing: border-box;
          }

          .form-group input:focus {
            outline: none;
            border-color: #3b82f6;
          }

          .submit-btn {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }

          .submit-btn:hover:not(:disabled) {
            background: #2563eb;
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .message {
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
          }

          .message.success {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
          }

          .message.error {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fecaca;
          }

          @media (max-width: 768px) {
            .profile-header {
              flex-direction: column;
              text-align: center;
            }

            .profile-avatar {
              flex-direction: column;
            }

            .profile-stats {
              grid-template-columns: 1fr;
            }

            .tabs {
              flex-direction: column;
            }

            .info-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default WaiterProfile;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import DashboardLayout from '../../layout/DashboardLayout.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';

// 🔥 FIX: Create a config object with your Razorpay key
const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_Rj72tWzqfWE52r'
};

// CSS Styles
const styles = `
.payment-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.payment-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  border: 2px solid rgba(139, 69, 19, 0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid rgba(139, 69, 19, 0.1);
  padding-bottom: 20px;
}

.payment-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.payment-header h1 {
  color: #8B4513;
  margin-bottom: 10px;
  font-size: 2.2rem;
}

.payment-header p {
  color: #666;
  font-size: 1.1rem;
}

.order-summary-section {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.order-summary-section h3 {
  color: #8B4513;
  margin-bottom: 15px;
}

.order-details {
  color: #333;
}

.order-id {
  font-size: 1.1rem;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.order-items {
  margin-bottom: 15px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  color: #555;
  flex: 1;
}

.item-price {
  color: #8B4513;
  font-weight: 600;
}

.special-instructions {
  background: #fff8f0;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
  border-left: 4px solid #8B4513;
}

.special-instructions strong {
  color: #8B4513;
}

.special-instructions p {
  margin: 5px 0 0 0;
  color: #666;
  font-style: italic;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 2px solid #ddd;
  font-size: 1.2rem;
  font-weight: 600;
}

.total-amount {
  color: #8B4513;
  font-size: 1.4rem;
}

.payment-methods {
  margin-bottom: 25px;
}

.payment-methods h3 {
  color: #8B4513;
  margin-bottom: 15px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #8B4513;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff8f0, #f5ebe0);
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-option.active {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
}

.payment-option.active .payment-method-info h4,
.payment-option.active .payment-method-info p {
  color: white;
}

.payment-method-icon {
  font-size: 32px;
  margin-right: 15px;
}

.payment-method-info h4 {
  color: #8B4513;
  margin: 0 0 5px 0;
  font-size: 1.1rem;
}

.payment-method-info p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.payment-success {
  background: linear-gradient(135deg, #d4edda, #c3e6cb);
  border: 2px solid #28a745;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out;
}

.payment-error-message {
  background: linear-gradient(135deg, #f8d7da, #f5c6cb);
  border: 2px solid #dc3545;
  border-radius: 12px;
  padding: 25px;
  text-align: center;
  margin-bottom: 20px;
  animation: slideIn 0.5s ease-out;
}

.success-icon, .error-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.payment-success h3 {
  color: #155724;
  margin-bottom: 10px;
}

.payment-error-message h3 {
  color: #721c24;
  margin-bottom: 10px;
}

.payment-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  padding: 15px 25px;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-pay-now {
  background: linear-gradient(135deg, #8B4513, #A0522D);
  color: white;
  font-size: 1.2rem;
}

.btn-pay-now:hover:not(:disabled) {
  background: linear-gradient(135deg, #A0522D, #8B4513);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3);
}

.btn-retry {
  background: linear-gradient(135deg, #dc3545, #c82333);
  color: white;
}

.btn-retry:hover:not(:disabled) {
  background: linear-gradient(135deg, #c82333, #dc3545);
  transform: translateY(-2px);
}

.btn-cancel {
  background: transparent;
  color: #8B4513;
  border: 2px solid #8B4513;
}

.btn-cancel:hover:not(:disabled) {
  background: #8B4513;
  color: white;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.lock-icon {
  font-size: 20px;
}

.security-notice p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  text-align: center;
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .payment-container {
    padding: 10px;
  }
  
  .payment-card {
    padding: 25px;
    margin: 10px;
  }
  
  .payment-header h1 {
    font-size: 1.8rem;
  }
  
  .order-summary-section {
    padding: 20px;
  }
  
  .btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
}

/* Error state styling */
.payment-error {
  text-align: center;
  padding: 40px;
}

.payment-error .error-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #dc3545;
}

.payment-error h2 {
  color: #dc3545;
  margin-bottom: 15px;
}

.payment-error p {
  color: #666;
  margin-bottom: 25px;
  font-size: 1.1rem;
}
`;

const PaymentPage = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, getToken } = useAuth();

  // Add CSS to head
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const razorpayKey = RAZORPAY_CONFIG.keyId;

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const orderData = location.state?.orderData;
        
        if (!orderData) {
          navigate('/menu');
          return;
        }

        setOrder(orderData);
        
      } catch (error) {
        console.error('Error initializing payment:', error);
        setPaymentError('Failed to initialize payment. Please try again.');
      }
    };

    initializePayment();
  }, [location, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay SDK loaded successfully');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async () => {
    try {
      setLoading(true);
      setPaymentError('');

      const token = getToken();
      if (!token) {
        setPaymentError('Please log in first');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      console.log('=== INITIATING PAYMENT ===');
      console.log('Order ID:', order.id);
      console.log('Amount:', order.totalAmount);

      if (!razorpayKey || razorpayKey.includes('xxxxxxxxxxxxxx')) {
        throw new Error('Razorpay key not configured.');
      }

      const paymentRequest = {
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'INR'
      };

      console.log('Sending payment request:', paymentRequest);
      
      const response = await api.post('/payment/create-razorpay-order', paymentRequest);
      
      console.log('Payment API response:', response.data);

      if (response.data.success) {
        console.log('✅ Razorpay order created successfully');
        
        const razorpayLoaded = await loadRazorpay();
        if (!razorpayLoaded) {
          throw new Error('Failed to load payment gateway');
        }

        openRazorpayCheckout(response.data);
      } else {
        throw new Error(response.data.message || 'Failed to create payment order');
      }
    } catch (error) {
      console.error('❌ Payment initialization failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Payment failed. Please try again.';
      
      setPaymentError(errorMessage);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const openRazorpayCheckout = (paymentData) => {
    const options = {
      key: razorpayKey,
      amount: paymentData.amount * 100,
      currency: paymentData.currency || 'INR',
      name: 'JavaBite Coffee Shop',
      description: `Order #${order.id}`,
      order_id: paymentData.razorpayOrderId,
      handler: async function (response) {
        console.log('Payment response:', response);
        await verifyPayment(response);
      },
      prefill: {
        name: user?.name || 'JavaBite Customer',
        email: user?.email || 'customer@javabite.com',
        contact: user?.phone || '9999999999'
      },
      theme: {
        color: '#8B4513'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
          setLoading(false);
        }
      },
      notes: {
        order_id: order.id.toString(),
        customer_id: user?.id?.toString()
      }
    };

    console.log('Razorpay options configured');

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
      
      rzp.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setPaymentError(response.error.description || 'Payment failed');
        setPaymentStatus('failed');
      });
      
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      setPaymentError('Error opening payment gateway');
      setPaymentStatus('failed');
    }
  };

  const verifyPayment = async (razorpayResponse) => {
    try {
      setLoading(true);
      
      const verificationRequest = {
        razorpayOrderId: razorpayResponse.razorpay_order_id,
        razorpayPaymentId: razorpayResponse.razorpay_payment_id,
        razorpaySignature: razorpayResponse.razorpay_signature,
        orderId: order.id
      };

      console.log('Verifying payment:', verificationRequest);
      
      const response = await api.post('/payment/verify-razorpay', verificationRequest);
      
      if (response.data.success) {
        console.log('✅ Payment verified successfully:', response.data);
        setPaymentStatus('success');
        
        setTimeout(() => {
          navigate('/order-success', { 
            state: { 
              paymentId: razorpayResponse.razorpay_payment_id,
              orderId: order.id,
              amount: order.totalAmount,
              orderData: order
            }
          });
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Payment verification failed';
      
      setPaymentError(errorMessage);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <DashboardLayout title="Payment - JavaBite">
        <div className="payment-container">
          <div className="payment-error">
            <div className="error-icon">❌</div>
            <h2>No Order Found</h2>
            <p>Please place an order first.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/menu')}
            >
              Back to Menu
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Secure Payment - JavaBite">
      <div className="payment-container">
        <div className="payment-card">
          <div className="payment-header">
            <div className="payment-icon">💳</div>
            <h1>Secure Payment</h1>
            <p>Complete your order payment securely</p>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h3>Order Summary</h3>
            <div className="order-details">
              <div className="order-id">Order #: <strong>{order.id}</strong></div>
              
              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span className="item-name">{item.name} × {item.qty}</span>
                    <span className="item-price">₹{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {order.specialInstructions && (
                <div className="special-instructions">
                  <strong>Special Instructions:</strong>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
              
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-amount">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            <div className="payment-option active">
              <div className="payment-method-icon">💳</div>
              <div className="payment-method-info">
                <h4>Credit/Debit Card</h4>
                <p>Pay securely with your card via Razorpay</p>
              </div>
            </div>
          </div>

          {/* Payment Status Messages */}
          {paymentStatus === 'success' && (
            <div className="payment-success">
              <div className="success-icon">✅</div>
              <h3>Payment Successful!</h3>
              <p>Your payment has been processed successfully. Redirecting to order confirmation...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="payment-error-message">
              <div className="error-icon">❌</div>
              <h3>Payment Failed</h3>
              <p>{paymentError || 'Something went wrong with your payment. Please try again.'}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="payment-actions">
            {!paymentStatus && (
              <button 
                className="btn btn-pay-now"
                onClick={initiatePayment}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  `Pay Now ₹${order.totalAmount?.toFixed(2)}`
                )}
              </button>
            )}
            
            {paymentStatus === 'failed' && (
              <button 
                className="btn btn-retry"
                onClick={initiatePayment}
                disabled={loading}
              >
                {loading ? 'Retrying...' : 'Retry Payment'}
              </button>
            )}

            <button 
              className="btn btn-cancel"
              onClick={() => navigate('/menu')}
              disabled={loading}
            >
              Cancel Payment
            </button>
          </div>

          {/* Security Notice */}
          <div className="security-notice">
            <div className="lock-icon">🔒</div>
            <p>Your payment is secure and encrypted. We do not store your card details.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentPage;
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layout/DashboardLayout.jsx';
import api from '../../api/apiClient';

// Coffee-themed CSS Styles
const styles = `
.order-success-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #F4A460 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  overflow: hidden;
}

.order-success-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(210, 105, 30, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(244, 164, 96, 0.15) 0%, transparent 50%);
  pointer-events: none;
}

.order-success-card {
  background: rgba(255, 248, 240, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 
    0 25px 50px -12px rgba(139, 69, 19, 0.3),
    0 0 0 1px rgba(139, 69, 19, 0.1);
  width: 100%;
  max-width: 680px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(210, 105, 30, 0.2);
}

.order-success-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8B4513, #D2691E, #F4A460);
}

.success-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.success-icon {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #8B4513, #D2691E);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  box-shadow: 0 10px 25px rgba(139, 69, 19, 0.4);
  animation: bounceIn 0.8s ease-out;
  position: relative;
}

.success-icon::before {
  content: '☕';
  font-size: 48px;
  color: #FFF8F0;
  font-weight: bold;
}

.success-icon::after {
  content: '✓';
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.success-header h1 {
  color: #5D4037;
  margin-bottom: 12px;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #5D4037, #8B4513);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.success-header p {
  color: #8D6E63;
  font-size: 1.2rem;
  margin: 0;
  font-weight: 500;
}

.receipt-content {
  background: linear-gradient(135deg, #FFF8F0, #F5E6D3);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 2px solid #D7CCC8;
  box-shadow: 
    0 4px 6px -1px rgba(139, 69, 19, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
}

.receipt-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #8B4513, #D2691E, #F4A460);
  border-radius: 16px 16px 0 0;
}

.receipt-header {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #D7CCC8;
  position: relative;
}

.receipt-header h2 {
  color: #5D4037;
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.receipt-header p {
  color: #8D6E63;
  margin: 0;
  font-weight: 500;
}

.order-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid #8B4513;
  box-shadow: 0 2px 4px rgba(139, 69, 19, 0.1);
  transition: transform 0.2s ease;
}

.detail-card:hover {
  transform: translateY(-2px);
}

.detail-label {
  font-size: 0.875rem;
  color: #8D6E63;
  font-weight: 500;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 1rem;
  color: #5D4037;
  font-weight: 600;
}

.items-section {
  margin-top: 24px;
}

.section-title {
  color: #5D4037;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '📋';
  font-size: 1.2rem;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(139, 69, 19, 0.1);
  border: 1px solid #D7CCC8;
}

.items-table th {
  background: linear-gradient(135deg, #8B4513, #D2691E);
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #FFF8F0;
  border-bottom: 1px solid #8B4513;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-table td {
  padding: 16px;
  border-bottom: 1px solid #F5E6D3;
  color: #5D4037;
}

.items-table tbody tr:hover {
  background: #F5E6D3;
}

.items-table tfoot tr {
  background: linear-gradient(135deg, #F5E6D3, #E8D5C4);
  border-top: 2px solid #8B4513;
}

.items-table tfoot td {
  padding: 16px;
  font-weight: 700;
  color: #5D4037;
  font-size: 1.125rem;
}

.thank-you {
  text-align: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px dashed #D7CCC8;
  color: #8D6E63;
  font-style: italic;
  font-size: 1rem;
  font-weight: 500;
}

.success-message {
  background: linear-gradient(135deg, #E8F5E8, #C8E6C9);
  color: #2E7D32;
  border: 2px solid #A5D6A7;
  border-radius: 12px;
  padding: 16px 20px;
  margin: 20px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.error-message {
  background: linear-gradient(135deg, #FFEBEE, #FFCDD2);
  color: #C62828;
  border: 2px solid #EF9A9A;
  border-radius: 12px;
  padding: 16px 20px;
  margin: 20px 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.btn {
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
  font-family: inherit;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: linear-gradient(135deg, #8B4513, #D2691E);
  color: #FFF8F0;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.4);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.5);
}

.btn-success {
  background: linear-gradient(135deg, #6D4C41, #8D6E63);
  color: #FFF8F0;
  box-shadow: 0 4px 15px rgba(109, 76, 65, 0.4);
}

.btn-success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(109, 76, 65, 0.5);
}

.btn-info {
  background: linear-gradient(135deg, #A1887F, #BCAAA4);
  color: #5D4037;
  box-shadow: 0 4px 15px rgba(161, 136, 127, 0.3);
}

.btn-info:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(161, 136, 127, 0.4);
}

.btn-warning {
  background: linear-gradient(135deg, #F4A460, #FFB74D);
  color: #5D4037;
  box-shadow: 0 4px 15px rgba(244, 164, 96, 0.4);
}

.btn-warning:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(244, 164, 96, 0.5);
}

.btn-secondary {
  background: transparent;
  color: #8B4513;
  border: 2px solid #8B4513;
  font-weight: 500;
}

.btn-secondary:hover:not(:disabled) {
  background: #8B4513;
  color: #FFF8F0;
  transform: translateY(-1px);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.coffee-bean {
  position: absolute;
  width: 8px;
  height: 12px;
  background: #5D4037;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 6s ease-in-out infinite;
}

.coffee-bean:nth-child(1) { top: 10%; left: 5%; animation-delay: 0s; }
.coffee-bean:nth-child(2) { top: 20%; right: 10%; animation-delay: 1s; }
.coffee-bean:nth-child(3) { bottom: 30%; left: 15%; animation-delay: 2s; }
.coffee-bean:nth-child(4) { bottom: 15%; right: 5%; animation-delay: 3s; }
.coffee-bean:nth-child(5) { top: 40%; left: 8%; animation-delay: 4s; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-success-container {
    padding: 16px;
  }
  
  .order-success-card {
    padding: 32px 24px;
    margin: 8px;
  }
  
  .success-header h1 {
    font-size: 2rem;
  }
  
  .order-details-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .receipt-content {
    padding: 24px 20px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .btn {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
  
  .items-table {
    font-size: 0.9rem;
  }
  
  .items-table th,
  .items-table td {
    padding: 12px 8px;
  }
}

@media (max-width: 480px) {
  .order-success-card {
    padding: 24px 16px;
  }
  
  .success-header h1 {
    font-size: 1.75rem;
  }
  
  .success-icon {
    width: 80px;
    height: 80px;
  }
  
  .success-icon::before {
    font-size: 36px;
  }
  
  .success-icon::after {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }
}

@media print {
  .actions-grid,
  .success-message,
  .error-message,
  .loading-container,
  .coffee-bean {
    display: none !important;
  }
  
  .order-success-container {
    background: white !important;
    padding: 0 !important;
  }
  
  .order-success-card {
    box-shadow: none !important;
    border: 1px solid #D7CCC8 !important;
    padding: 20px !important;
  }
  
  .success-icon {
    box-shadow: none !important;
  }
}
`;

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, orderId, amount, orderData } = location.state || {};
  const [loading, setLoading] = useState({});
  const [message, setMessage] = useState('');

  // Add CSS to head
  React.useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const handleDownloadReceipt = async () => {
    try {
      setLoading(prev => ({ ...prev, downloadReceipt: true }));
      setMessage('');
      
      const response = await api.get(`/orders/${orderId}/receipt`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `JavaBite-Receipt-Order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Receipt downloaded successfully!');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setMessage('Failed to download receipt. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, downloadReceipt: false }));
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setLoading(prev => ({ ...prev, downloadInvoice: true }));
      setMessage('');
      
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `JavaBite-Invoice-Order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setMessage('Invoice downloaded successfully!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setMessage('Failed to download invoice. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, downloadInvoice: false }));
    }
  };

  const handleEmailReceipt = async () => {
    try {
      setLoading(prev => ({ ...prev, emailReceipt: true }));
      setMessage('');
      
      const response = await api.post(`/orders/${orderId}/email-receipt`);
      
      if (response.data.success) {
        setMessage('Receipt sent to your email successfully!');
      } else {
        setMessage('Failed to send receipt email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email receipt:', error);
      setMessage('Failed to send receipt email. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, emailReceipt: false }));
    }
  };

  const handleEmailInvoice = async () => {
    try {
      setLoading(prev => ({ ...prev, emailInvoice: true }));
      setMessage('');
      
      const response = await api.post(`/orders/${orderId}/email-invoice`);
      
      if (response.data.success) {
        setMessage('Invoice sent to your email successfully!');
      } else {
        setMessage('Failed to send invoice email. Please try again.');
      }
    } catch (error) {
      console.error('Error sending email invoice:', error);
      setMessage('Failed to send invoice email. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, emailInvoice: false }));
    }
  };

  const handlePrintReceipt = () => {
    const receiptContent = document.getElementById('receipt-content');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>JavaBite Receipt - Order #${orderId}</title>
          <style>
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 40px; 
              color: #5D4037;
              background: #FFF8F0;
            }
            .receipt-header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 2px solid #D7CCC8;
              padding-bottom: 20px;
            }
            .order-details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 30px;
            }
            .detail-card { 
              background: rgba(255, 255, 255, 0.8); 
              padding: 15px; 
              border-radius: 8px;
              border-left: 4px solid #8B4513;
            }
            .items-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 25px 0; 
              border: 1px solid #D7CCC8;
            }
            .items-table th, .items-table td { 
              border: 1px solid #D7CCC8; 
              padding: 12px; 
              text-align: left; 
            }
            .items-table th {
              background: #8B4513;
              color: white;
              font-weight: 600;
            }
            .thank-you { 
              text-align: center; 
              margin-top: 40px; 
              font-style: italic; 
              color: #8D6E63;
              border-top: 2px dashed #D7CCC8;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <DashboardLayout title="Order Confirmed - JavaBite">
      <div className="order-success-container">
        {/* Floating coffee beans */}
        <div className="coffee-bean"></div>
        <div className="coffee-bean"></div>
        <div className="coffee-bean"></div>
        <div className="coffee-bean"></div>
        <div className="coffee-bean"></div>
        
        <div className="order-success-card">
          <div className="success-header">
            <div className="success-icon"></div>
            <h1>Order Confirmed!</h1>
            <p>Your coffee journey at JavaBite begins now</p>
          </div>
          
          {/* Receipt Content */}
          <div id="receipt-content" className="receipt-content">
            <div className="receipt-header">
              <h2>☕ JavaBite Coffee Shop</h2>
              <p>Order Receipt</p>
            </div>
            
            <div className="order-details-grid">
              <div className="detail-card">
                <div className="detail-label">Order Number</div>
                <div className="detail-value">#{orderId}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Payment ID</div>
                <div className="detail-value">{paymentId}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Order Date</div>
                <div className="detail-value">{new Date().toLocaleDateString('en-IN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Amount Paid</div>
                <div className="detail-value">₹{amount?.toFixed(2)}</div>
              </div>
            </div>
            
            {/* Order Items */}
            {orderData?.items && (
              <div className="items-section">
                <div className="section-title">Your Coffee Selection</div>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style={{ textAlign: 'center' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td style={{ textAlign: 'center' }}>{item.qty}</td>
                        <td style={{ textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{amount?.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
            
            <div className="thank-you">
              Thank you for choosing JavaBite! We're brewing happiness in every cup. ☕
            </div>
          </div>

          {/* Success Message */}
          {message && (
            <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
              {message.includes('successfully') ? '✅' : '❌'} {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="actions-grid">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/menu')}
            >
              ☕ Order More Coffee
            </button>
            
            <button 
              className="btn btn-info"
              onClick={handlePrintReceipt}
            >
              🖨️ Print Receipt
            </button>
            
            <button 
              className="btn btn-success"
              onClick={handleDownloadReceipt}
              disabled={loading.downloadReceipt}
            >
              {loading.downloadReceipt ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  Downloading...
                </div>
              ) : (
                '📄 Download Receipt'
              )}
            </button>
            
            <button 
              className="btn btn-success"
              onClick={handleDownloadInvoice}
              disabled={loading.downloadInvoice}
            >
              {loading.downloadInvoice ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  Downloading...
                </div>
              ) : (
                '🧾 Download Invoice'
              )}
            </button>
            
            <button 
              className="btn btn-warning"
              onClick={handleEmailReceipt}
              disabled={loading.emailReceipt}
            >
              {loading.emailReceipt ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  Sending...
                </div>
              ) : (
                '📧 Email Receipt'
              )}
            </button>
            
            <button 
              className="btn btn-warning"
              onClick={handleEmailInvoice}
              disabled={loading.emailInvoice}
            >
              {loading.emailInvoice ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  Sending...
                </div>
              ) : (
                '📨 Email Invoice'
              )}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/customer/orders')}
            >
              📋 View Orders
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderSuccess;
import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout.jsx";
import { useAuth } from "../../auth/AuthContext.jsx";
import "../customer.css";

const CustomerBookTable = () => {
  const { user } = useAuth();

  const [people, setPeople] = useState(2);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [special, setSpecial] = useState("");
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Load user active booking
  const loadActiveBooking = async () => {
    if (!user) return;

    try {
      console.log("🔄 Loading active booking for user:", user.id);
      const res = await api.get(`/customer/booking/active/${user.id}`);
      
      console.log("📦 Response data:", res.data);
      
      if (res.data && typeof res.data === 'object' && res.data.id) {
        console.log("✅ Valid booking object found:", res.data);
        setActiveBooking(res.data);
      } else {
        console.log("✅ No active booking");
        setActiveBooking(null);
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      setActiveBooking(null);
    }
  };

  // Find available tables
  const findTables = async () => {
    if (!date || !slot) {
      setMessage("⚠️ Please select both date and slot");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      console.log("🔍 Finding tables for:", { date, slot, guests: people });
      
      const res = await api.get("/customer/tables/available", {
        params: {
          guests: people,
          date: date,
          slot: slot,
        },
      });

      console.log("✅ Available tables response:", res.data);
      setAvailableTables(res.data);
      
      if (res.data.length === 0) {
        setMessage("⚠️ No tables available for the selected criteria. Try a different date or time.");
      }
      
    } catch (err) {
      console.error("❌ Error fetching tables:", err.response?.data);
      const errorMsg = err.response?.data?.error || "Failed to fetch available tables";
      setMessage(`❌ Error: ${errorMsg}`);
      setAvailableTables([]);
    } finally {
      setLoading(false);
    }
  };

  // Book table
  const bookTable = async () => {
    if (!selectedTable) {
      setMessage("⚠️ Please select a table first");
      return;
    }

    if (!date || !slot) {
      setMessage("⚠️ Please select date and slot");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        user: { id: user.id },
        table: { id: selectedTable.id },
        numberOfGuests: people,
        duration: 2,
        bookingDate: date,
        slot: slot,
        specialRequests: special,
      };

      console.log("📤 Booking payload:", payload);
      
      const res = await api.post("/customer/book", payload);
      console.log("✅ Booking successful:", res.data);

      setMessage("✅ Table booked successfully!");

      // Reset form
      setSelectedTable(null);
      setAvailableTables([]);
      setSpecial("");
      loadActiveBooking();
      
    } catch (err) {
      console.error("❌ Booking error:", err.response?.data);
      const errorMessage = err.response?.data?.error || "Booking failed";
      setMessage(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancel booking
  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      setLoading(true);
      console.log("🗑️ Cancelling booking:", id);
      await api.put(`/customer/booking/${id}/cancel`);
      console.log("✅ Booking cancelled successfully");
      
      setMessage("✅ Booking cancelled successfully");
      setActiveBooking(null);
      
    } catch (err) {
      console.error("❌ Cancel error:", err.response?.data);
      setMessage("❌ Failed to cancel booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadActiveBooking();
    }
  }, [user]);

  return (
    <DashboardLayout title="Book a Table">
      {/* Message Alert */}
      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : message.includes('⚠️') ? 'alert-warning' : 'alert-success'}`}>
          <span>{message}</span>
        </div>
      )}

      {/* Active Booking Section */}
      {activeBooking && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.1))',
          border: '2px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem',
            color: '#4ade80',
            marginBottom: '1.5rem'
          }}>
            ✅ Your Current Booking
          </h3>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.5rem' 
          }}>
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem', 
                marginBottom: '0.3rem' 
              }}>
                Table
              </div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.2rem' }}>
                {activeBooking.table?.tableNumber ?? activeBooking.tableNumber ?? "-"}
              </div>
            </div>
            
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem', 
                marginBottom: '0.3rem' 
              }}>
                Date
              </div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.2rem' }}>
                {activeBooking.bookingDate ?? activeBooking.date ?? activeBooking.booking_date ?? "-"}
              </div>
            </div>
            
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem', 
                marginBottom: '0.3rem' 
              }}>
                Time Slot
              </div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.2rem' }}>
                {activeBooking.slot ?? "-"}
              </div>
            </div>
            
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem', 
                marginBottom: '0.3rem' 
              }}>
                Guests
              </div>
              <div style={{ color: '#fff', fontWeight: '600', fontSize: '1.2rem' }}>
                {activeBooking.numberOfGuests ?? activeBooking.guests ?? "-"}
              </div>
            </div>
            
            <div>
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem', 
                marginBottom: '0.3rem' 
              }}>
                Status
              </div>
              <div>
                <span className="status-badge status-confirmed">
                  {activeBooking.status ?? "CONFIRMED"}
                </span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-danger" 
            onClick={() => cancelBooking(activeBooking.id)}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : '🗑️ Cancel Booking'}
          </button>
        </div>
      )}

      {/* Booking Form - Only show if no active booking */}
      {!activeBooking && (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.8rem',
              color: '#d4a574',
              marginBottom: '1.5rem'
            }}>
              📅 Reserve Your Table
            </h3>

            <div className="form-group">
              <label className="form-label">Number of Guests</label>
              <select
                className="form-select"
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff'
                }}
              >
                <option value={1} style={{ background: '#1a1a1a', color: '#fff' }}>1 Guest</option>
                <option value={2} style={{ background: '#1a1a1a', color: '#fff' }}>2 Guests</option>
                <option value={4} style={{ background: '#1a1a1a', color: '#fff' }}>4 Guests</option>
                <option value={6} style={{ background: '#1a1a1a', color: '#fff' }}>6 Guests</option>
                <option value={8} style={{ background: '#1a1a1a', color: '#fff' }}>8 Guests</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Select Time Slot</label>
              <select 
                className="form-select"
                value={slot} 
                onChange={(e) => setSlot(e.target.value)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#fff'
                }}
              >
                <option value="" style={{ background: '#1a1a1a', color: '#fff' }}>Select a time slot</option>
                <option value="MORNING" style={{ background: '#1a1a1a', color: '#fff' }}>Morning (9AM–12PM)</option>
                <option value="AFTERNOON" style={{ background: '#1a1a1a', color: '#fff' }}>Afternoon (12PM–4PM)</option>
                <option value="EVENING" style={{ background: '#1a1a1a', color: '#fff' }}>Evening (4PM–8PM)</option>
                <option value="NIGHT" style={{ background: '#1a1a1a', color: '#fff' }}>Night (8PM–11PM)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests (Optional)</label>
              <textarea
                className="form-textarea"
                value={special}
                onChange={(e) => setSpecial(e.target.value)}
                placeholder="Birthday setup, candle, dietary requirements, etc."
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={findTables} 
              disabled={loading || !date || !slot}
              style={{ width: '100%' }}
            >
              {loading ? "🔍 Finding Tables..." : "Find Available Tables"}
            </button>
          </div>

          {/* Available Tables */}
          {availableTables.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                color: '#d4a574',
                marginBottom: '1.5rem'
              }}>
                Available Tables ({availableTables.length} found)
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                {availableTables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => setSelectedTable(table)}
                    style={{
                      padding: '1.5rem',
                      background: selectedTable?.id === table.id 
                        ? 'linear-gradient(135deg, rgba(139, 69, 19, 0.2), rgba(160, 130, 109, 0.15))'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: selectedTable?.id === table.id 
                        ? '2px solid rgba(160, 130, 109, 0.5)' 
                        : '2px solid rgba(160, 130, 109, 0.2)',
                      borderRadius: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div>
                        <h4 style={{ 
                          color: '#d4a574', 
                          fontWeight: '700', 
                          fontSize: '1.3rem', 
                          marginBottom: '0.5rem' 
                        }}>
                          Table {table.tableNumber}
                        </h4>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          fontSize: '0.95rem', 
                          margin: '0.3rem 0' 
                        }}>
                          <strong>Capacity:</strong> {table.capacity} people
                        </p>
                        <p style={{ 
                          color: 'rgba(255, 255, 255, 0.6)', 
                          fontSize: '0.95rem', 
                          margin: '0.3rem 0' 
                        }}>
                          <strong>Location:</strong> {table.location}
                        </p>
                        {table.tableType && (
                          <p style={{ 
                            color: 'rgba(255, 255, 255, 0.6)', 
                            fontSize: '0.95rem', 
                            margin: '0.3rem 0' 
                          }}>
                            <strong>Type:</strong> {table.tableType}
                          </p>
                        )}
                      </div>
                      {selectedTable?.id === table.id && (
                        <div style={{ 
                          color: '#d4a574', 
                          fontWeight: '700', 
                          fontSize: '1.5rem' 
                        }}>
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTable && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <p style={{ 
                    marginBottom: '1.5rem', 
                    fontSize: '1.1rem', 
                    color: 'rgba(255, 255, 255, 0.8)' 
                  }}>
                    Ready to book <strong style={{ color: '#d4a574' }}>
                      Table {selectedTable.tableNumber}
                    </strong> for {people} guest{people !== 1 ? 's' : ''}?
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={bookTable}
                    disabled={loading}
                    style={{ minWidth: '250px' }}
                  >
                    {loading ? '⏳ Booking...' : '🎉 Confirm Booking'}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default CustomerBookTable;

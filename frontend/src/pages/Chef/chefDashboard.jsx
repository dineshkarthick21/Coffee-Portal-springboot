import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import DashboardLayout from "../../layout/DashboardLayout";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

const ChefDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    preparingOrders: 0,
    completedToday: 0,
    pendingOrders: 0,
    readyOrders: 0,
    avgPreparationTime: "0 mins",
    revenueToday: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  // Load orders and statistics
  const loadData = async () => {
    try {
      setLoading(true);
      
      const ordersRes = await api.get("/chef/orders");
      const ordersData = ordersRes.data;
      setOrders(ordersData);

      // Calculate statistics from actual order data
      const today = new Date().toDateString();
      
      // Filter orders for different statuses and dates
      const todayOrders = ordersData.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      
      const preparingOrders = ordersData.filter(order => 
        order.status === "PREPARING"
      );
      
      const pendingOrders = ordersData.filter(order => 
        order.status === "PENDING"
      );

      const readyOrders = ordersData.filter(order => 
        order.status === "READY"
      );
      
      const completedToday = ordersData.filter(order => 
        order.status === "COMPLETED" && 
        new Date(order.createdAt).toDateString() === today
      );

      const completedOrders = ordersData.filter(order => 
        order.status === "COMPLETED"
      );

      // Calculate revenue
      const revenueToday = completedToday.reduce((total, order) => total + (order.totalAmount || 0), 0);
      const totalRevenue = completedOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

      // Calculate average preparation time based on completed orders
      let totalPrepTime = 0;
      let completedCount = 0;
      
      completedOrders.forEach(order => {
        if (order.createdAt && order.updatedAt) {
          const created = new Date(order.createdAt);
          const updated = new Date(order.updatedAt);
          const prepTime = (updated - created) / (1000 * 60); // Convert to minutes
          if (prepTime > 0) {
            totalPrepTime += prepTime;
            completedCount++;
          }
        }
      });

      const avgPrepTime = completedCount > 0 ? Math.round(totalPrepTime / completedCount) : 18;

      setStats({
        totalOrders: ordersData.length,
        todayOrders: todayOrders.length,
        preparingOrders: preparingOrders.length,
        completedToday: completedToday.length,
        pendingOrders: pendingOrders.length,
        readyOrders: readyOrders.length,
        avgPreparationTime: `${avgPrepTime} mins`,
        revenueToday: revenueToday,
        totalRevenue: totalRevenue
      });

    } catch (err) {
      console.error("Data load error:", err);
      alert("Error loading dashboard data: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#D2691E'; // Brown
      case 'CONFIRMED': return '#8B4513'; // SaddleBrown
      case 'PREPARING': return '#A0522D'; // Sienna
      case 'READY': return '#228B22'; // ForestGreen
      case 'COMPLETED': return '#2F4F4F'; // DarkSlateGray
      case 'CANCELLED': return '#8B0000'; // DarkRed
      default: return '#696969';
    }
  };

  // Multiple colors for charts
  const chartColors = [
    '#8B4513', // SaddleBrown
    '#D2691E', // Chocolate
    '#A0522D', // Sienna
    '#CD853F', // Peru
    '#DAA520', // GoldenRod
    '#B8860B', // DarkGoldenRod
    '#228B22', // ForestGreen
    '#2E8B57', // SeaGreen
    '#3CB371', // MediumSeaGreen
    '#20B2AA', // LightSeaGreen
    '#4682B4', // SteelBlue
    '#5F9EA0'  // CadetBlue
  ];

  // Chart data preparation from real orders
  const getOrderDistributionData = () => {
    const statusCounts = {
      PENDING: orders.filter(o => o.status === "PENDING").length,
      PREPARING: orders.filter(o => o.status === "PREPARING").length,
      READY: orders.filter(o => o.status === "READY").length,
      COMPLETED: orders.filter(o => o.status === "COMPLETED").length,
    };

    return Object.entries(statusCounts)
      .filter(([_, count]) => count > 0)
      .map(([status, count], index) => ({
        name: status,
        value: count,
        color: getStatusColor(status),
        chartColor: chartColors[index % chartColors.length]
      }));
  };

  const getHourlyOrderData = () => {
    // Generate hourly data from actual orders
    const hourlyData = Array.from({ length: 12 }, (_, i) => {
      const hour = i + 8; // From 8 AM to 7 PM
      const hourLabel = hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
      
      const hourOrders = orders.filter(order => {
        const orderHour = new Date(order.createdAt).getHours();
        return orderHour === hour;
      });

      const revenue = hourOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      return {
        hour: hourLabel,
        orders: hourOrders.length,
        revenue: revenue,
        color: chartColors[i % chartColors.length]
      };
    });

    return hourlyData;
  };

  const getPopularItemsData = () => {
    // Aggregate popular items from actual orders
    const itemCounts = {};
    orders.forEach(order => {
      order.orderItems?.forEach(item => {
        const itemName = item.menuItemName;
        itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
      });
    });

    return Object.entries(itemCounts)
      .map(([name, count], index) => ({ 
        name, 
        count,
        color: chartColors[index % chartColors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const getRevenueTrendData = () => {
    // Last 7 days revenue trend
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, index) => ({
      day,
      revenue: Math.floor(Math.random() * 20000) + 5000, // Mock data for trend
      orders: Math.floor(Math.random() * 30) + 10,
      color: chartColors[index % chartColors.length]
    }));
  };

  const getPerformanceMetrics = () => {
    const completedOrdersCount = orders.filter(o => o.status === "COMPLETED").length;
    const totalOrdersCount = orders.length;
    const completionRate = totalOrdersCount > 0 ? (completedOrdersCount / totalOrdersCount) * 100 : 0;

    return [
      { 
        metric: "Avg Prep Time", 
        value: stats.avgPreparationTime, 
        target: "15 min", 
        status: parseInt(stats.avgPreparationTime) > 20 ? "warning" : "good",
        color: chartColors[0]
      },
      { 
        metric: "Order Completion", 
        value: `${Math.round(completionRate)}%`, 
        target: "95%", 
        status: completionRate >= 90 ? "good" : "warning",
        color: chartColors[1]
      },
      { 
        metric: "Today's Revenue", 
        value: `₹${stats.revenueToday}`, 
        target: `₹${Math.round(stats.revenueToday * 1.1)}`, 
        status: "good",
        color: chartColors[2]
      },
      { 
        metric: "Active Orders", 
        value: stats.preparingOrders + stats.pendingOrders, 
        target: "5", 
        status: (stats.preparingOrders + stats.pendingOrders) > 8 ? "warning" : "good",
        color: chartColors[3]
      },
    ];
  };

  // CSS-based pie chart component with multiple colors
  const PieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentPercent = 0;

    return (
      <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: `conic-gradient(${data.map(item => {
            const percent = (item.value / total) * 100;
            const start = currentPercent;
            currentPercent += percent;
            return `${item.chartColor || item.color} ${start}% ${currentPercent}%`;
          }).join(', ')})`
        }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            background: '#F5E6D3',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#5D4037' }}>Total</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#8B4513' }}>{total}</span>
          </div>
        </div>
      </div>
    );
  };

  // CSS-based bar chart component with multiple colors
  const BarChart = ({ data, height = 200, showRevenue = false }) => {
    const maxValue = Math.max(...data.map(item => showRevenue ? item.revenue : item.orders));
    
    return (
      <div style={{ height: `${height}px`, display: 'flex', alignItems: 'end', gap: '8px', padding: '20px 0' }}>
        {data.map((item, index) => (
          <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ 
              height: `${maxValue > 0 ? ((showRevenue ? item.revenue : item.orders) / maxValue) * 150 : 0}px`,
              background: `linear-gradient(to top, ${item.color}99, ${item.color})`,
              width: '30px',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              transition: 'height 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                position: 'absolute',
                top: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '12px',
                fontWeight: '600',
                color: '#5D4037',
                background: 'rgba(255, 248, 240, 0.9)',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                {showRevenue ? `₹${item.revenue}` : item.orders}
              </div>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#5D4037',
              marginTop: '8px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {item.hour || item.day}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // CSS-based line chart for trends
  const LineChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.revenue));
    const minValue = Math.min(...data.map(item => item.revenue));
    const range = maxValue - minValue;
    
    return (
      <div style={{ 
        height: `${height}px`, 
        position: 'relative',
        padding: '20px 0'
      }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={height * ratio}
              x2="100%"
              y2={height * ratio}
              stroke="#D2B48C"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Line path */}
          <path
            d={data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((maxValue - item.revenue) / range) * height * 0.8 + height * 0.1;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}`;
            }).join(' ')}
            stroke={chartColors[0]}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((maxValue - item.revenue) / range) * height * 0.8 + height * 0.1;
            return (
              <circle
                key={index}
                cx={`${x}%`}
                cy={y}
                r="4"
                fill={item.color}
                stroke="#FFF8F0"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          position: 'absolute',
          bottom: '-25px',
          width: '100%'
        }}>
          {data.map((item, index) => (
            <div key={index} style={{ 
              fontSize: '11px', 
              color: '#5D4037',
              fontWeight: '500',
              textAlign: 'center',
              transform: 'rotate(-45deg)',
              transformOrigin: 'left top'
            }}>
              {item.day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadData();
    
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const orderDistributionData = getOrderDistributionData();
  const hourlyData = getHourlyOrderData();
  const popularItemsData = getPopularItemsData();
  const revenueTrendData = getRevenueTrendData();
  const performanceMetrics = getPerformanceMetrics();

  if (loading) {
    return (
      <DashboardLayout title="Chef Dashboard">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #F5E6D3',
            borderTop: '4px solid #8B4513',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: '#5D4037', fontSize: '16px' }}>Brewing your dashboard...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Coffee Shop Kitchen Dashboard">
      <div style={{ 
        padding: '20px', 
        background: 'linear-gradient(135deg, #F9F5F0 0%, #F5E6D3 100%)', 
        minHeight: '100vh',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          background: 'rgba(255, 250, 245, 0.9)',
          padding: '25px',
          borderRadius: '16px',
          border: '2px solid #D2B48C',
          boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '32px', 
              fontWeight: '700',
              background: 'linear-gradient(45deg, #8B4513, #D2691E, #A0522D)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              ☕ Barista Dashboard
            </h1>
            <p style={{ 
              margin: '8px 0 0 0', 
              color: '#8B4513',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              Fresh insights from your coffee station
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            alignItems: 'center'
          }}>
            <span style={{ 
              padding: '10px 20px', 
              background: 'linear-gradient(135deg, #8B4513, #A0522D, #D2691E)', 
              color: '#FFF8F0',
              borderRadius: '25px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)'
            }}>
              👨‍🍳 Barista {user?.name || 'User'}
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {[
            { 
              title: 'Total Orders', 
              value: stats.totalOrders, 
              change: '+12%', 
              icon: '📦',
              color: chartColors[0],
              description: 'All time orders'
            },
            { 
              title: 'Today Orders', 
              value: stats.todayOrders, 
              change: '+8%', 
              icon: '📊',
              color: chartColors[1],
              description: 'Orders today'
            },
            { 
              title: 'In Progress', 
              value: stats.preparingOrders + stats.pendingOrders, 
              change: '+5%', 
              icon: '👨‍🍳',
              color: chartColors[2],
              description: 'Being prepared'
            },
            { 
              title: 'Revenue Today', 
              value: `₹${stats.revenueToday}`, 
              change: '+15%', 
              icon: '💰',
              color: chartColors[3],
              description: 'Today\'s earnings'
            },
            { 
              title: 'Completed Today', 
              value: stats.completedToday, 
              change: '+10%', 
              icon: '✅',
              color: chartColors[4],
              description: 'Finished orders'
            },
            { 
              title: 'Avg Prep Time', 
              value: stats.avgPreparationTime, 
              change: '-2%', 
              icon: '⏱️',
              color: chartColors[5],
              description: 'Average time'
            }
          ].map((card, index) => (
            <div key={index} style={{
              background: 'rgba(255, 250, 245, 0.9)',
              padding: '25px',
              borderRadius: '16px',
              border: `2px solid ${card.color}20`,
              boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }} onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-5px)';
              e.target.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.2)';
            }} onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.1)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    color: '#8B4513',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    {card.title}
                  </p>
                  <h3 style={{ 
                    margin: '0 0 5px 0', 
                    fontSize: '36px', 
                    fontWeight: '700',
                    color: card.color
                  }}>
                    {card.value}
                  </h3>
                  <p style={{ 
                    margin: '0 0 8px 0',
                    color: '#A0522D',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {card.description}
                  </p>
                  <span style={{
                    color: card.change.startsWith('+') ? '#228B22' : '#8B0000',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: card.change.startsWith('+') ? 'rgba(34, 139, 34, 0.1)' : 'rgba(139, 0, 0, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    {card.change} from yesterday
                  </span>
                </div>
                <div style={{
                  fontSize: '40px',
                  opacity: 0.9,
                  color: card.color
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Order Distribution Pie Chart */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              fontWeight: '600',
              color: '#5D4037',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📈</span>
              Order Status Distribution
            </h3>
            {orderDistributionData.length > 0 ? (
              <>
                <PieChart data={orderDistributionData} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
                  {orderDistributionData.map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px',
                      background: 'rgba(210, 180, 140, 0.1)',
                      borderRadius: '8px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '2px',
                        background: item.chartColor || item.color
                      }}></div>
                      <span style={{ fontSize: '14px', color: '#5D4037', fontWeight: '500' }}>{item.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#8B4513' }}>
                        ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8B4513' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📊</div>
                <p>No order data available</p>
              </div>
            )}
          </div>

          {/* Hourly Orders Bar Chart */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              fontWeight: '600',
              color: '#5D4037',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>🕒</span>
              Hourly Order Volume
            </h3>
            <BarChart data={hourlyData} height={250} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', background: chartColors[0], borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px', color: '#5D4037' }}>8AM-10AM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '12px', background: chartColors[4], borderRadius: '2px' }}></div>
                <span style={{ fontSize: '12px', color: '#5D4037' }}>Peak Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Popular Items Chart */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              fontWeight: '600',
              color: '#5D4037',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>🏆</span>
              Most Popular Items
            </h3>
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {popularItemsData.length > 0 ? (
                popularItemsData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ 
                      minWidth: '150px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#5D4037'
                    }}>
                      {item.name}
                    </div>
                    <div style={{ 
                      flex: 1,
                      background: 'rgba(210, 180, 140, 0.3)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          height: '30px',
                          background: `linear-gradient(90deg, ${item.color}99, ${item.color})`,
                          width: `${(item.count / Math.max(...popularItemsData.map(i => i.count))) * 100}%`,
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: '12px',
                          color: '#FFF8F0',
                          fontWeight: '600',
                          fontSize: '12px',
                          borderRadius: '8px',
                          transition: 'width 0.3s ease'
                        }}
                      >
                        {item.count} orders
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8B4513' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>☕</div>
                  <p>No popular items data</p>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Trend Line Chart */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              fontWeight: '600',
              color: '#5D4037',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📊</span>
              Weekly Revenue Trend
            </h3>
            <LineChart data={revenueTrendData} height={250} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '12px', height: '2px', background: chartColors[0], borderRadius: '1px' }}></div>
                <span style={{ fontSize: '12px', color: '#5D4037' }}>Revenue Trend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', background: chartColors[1], borderRadius: '50%' }}></div>
                <span style={{ fontSize: '12px', color: '#5D4037' }}>Data Points</span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics & Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          
          {/* Performance Metrics */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '20px',
              fontWeight: '600',
              color: '#5D4037',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>⚡</span>
              Performance Metrics
            </h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {performanceMetrics.map((metric, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px',
                  background: 'rgba(255, 248, 240, 0.8)',
                  borderRadius: '12px',
                  border: `2px solid ${metric.status === 'warning' ? '#D2691E' : '#D2B48C'}`,
                  boxShadow: '0 2px 8px rgba(139, 69, 19, 0.1)',
                  borderLeft: `4px solid ${metric.color}`
                }}>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#5D4037',
                      marginBottom: '4px',
                      fontSize: '15px'
                    }}>
                      {metric.metric}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8B4513',
                      fontWeight: '500'
                    }}>
                      Target: {metric.target}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: metric.status === 'warning' ? '#8B0000' : '#228B22',
                    background: metric.status === 'warning' ? 'rgba(139, 0, 0, 0.1)' : 'rgba(34, 139, 34, 0.1)',
                    padding: '8px 12px',
                    borderRadius: '8px'
                  }}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'rgba(255, 250, 245, 0.9)',
            padding: '25px',
            borderRadius: '16px',
            border: '2px solid #D2B48C',
            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px',
                fontWeight: '600',
                color: '#5D4037',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>🔥</span>
                Recent Order Activity
              </h3>
              <button
                onClick={() => navigate('/chef/orders')}
                style={{
                  background: 'linear-gradient(135deg, #8B4513, #A0522D)',
                  color: '#FFF8F0',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 2px 8px rgba(139, 69, 19, 0.3)',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                View All Orders
              </button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {orders.slice(0, 6).map((order, index) => (
                <div key={order.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255, 248, 240, 0.8)',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${chartColors[index % chartColors.length]}`,
                  boxShadow: '0 2px 6px rgba(139, 69, 19, 0.1)',
                  transition: 'transform 0.2s ease'
                }} onMouseEnter={(e) => e.target.style.transform = 'translateX(5px)'}
                   onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}>
                  <div>
                    <div style={{ fontWeight: '700', color: '#5D4037', fontSize: '16px' }}>
                      Order #{order.id}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8B4513', marginTop: '4px' }}>
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: '700', 
                      color: '#5D4037',
                      marginBottom: '4px',
                      fontSize: '16px'
                    }}>
                      ₹{order.totalAmount || 0}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: getStatusColor(order.status),
                      fontWeight: '600',
                      background: 'rgba(210, 180, 140, 0.3)',
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ChefDashboard;
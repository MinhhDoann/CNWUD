import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:5000/api";

interface DashboardStats {
  containers: {
    total: number;
    inTransit: number;
    empty: number;
    full: number;
  };
  partners: number;
  staff: number;
  finance: {
    totalRevenue: number;
    totalInvoices: number;
    paidRevenue: number;
  };
  recentContainers: Array<{
    no: string;
    status: string;
    loc: string;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  if (loading) {
    return <div className="content">Đang tải dữ liệu tổng quan...</div>;
  }

  if (!stats) {
    return <div className="content">Không thể tải dữ liệu.</div>;
  }

  const transitPercent = stats.containers.total > 0 
    ? (stats.containers.inTransit / stats.containers.total) * 100 
    : 0;

  return (
    <div>
      <h2>Tổng quan hệ thống</h2>
      
      <div className="dashboard-summary">
        <div className="summary-card blue">
          <div className="summary-label">Tổng Container</div>
          <div className="summary-value">{stats.containers.total}</div>
          <div className="summary-sub">Đang quản lý trong hệ thống</div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: '100%', background: '#3b82f6' }}
            ></div>
          </div>
        </div>

        <div className="summary-card orange">
          <div className="summary-label">Đang vận chuyển</div>
          <div className="summary-value">{stats.containers.inTransit}</div>
          <div className="summary-sub">{transitPercent.toFixed(1)}% tổng số lượng</div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${transitPercent}%`, background: '#f59e0b' }}
            ></div>
          </div>
        </div>

        <div className="summary-card green">
          <div className="summary-label">Doanh thu (Hóa đơn)</div>
          <div className="summary-value">{formatCurrency(stats.finance.totalRevenue)}</div>
          <div className="summary-sub">{stats.finance.totalInvoices} hóa đơn đã lập</div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${(stats.finance.paidRevenue / (stats.finance.totalRevenue || 1)) * 100}%`, 
                background: '#10b981' 
              }}
            ></div>
          </div>
        </div>

        <div className="summary-card purple">
          <div className="summary-label">Đối tác & Nhân sự</div>
          <div className="summary-value">{stats.partners + stats.staff}</div>
          <div className="summary-sub">{stats.partners} Đối tác | {stats.staff} Nhân sự</div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: '100%', background: '#8b5cf6' }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Container mới cập nhật</h3>
          <table id="tblRecentContainers">
            <thead>
              <tr>
                <th>Số hiệu</th>
                <th>Trạng thái</th>
                <th>Vị trí</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentContainers.map((c, i) => (
                <tr key={i}>
                  <td><strong>{c.no}</strong></td>
                  <td>
                    <span className={`badge ${
                      c.status === 'Đang vận chuyển' ? 'warning' : 
                      c.status === 'Đầy hàng' ? 'success' : 
                      c.status === 'Bảo trì' ? 'danger' : 'info'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.loc || '-'}</td>
                </tr>
              ))}
              {stats.recentContainers.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8' }}>
                    Chưa có dữ liệu container
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📦</div>
              <div className="activity-info">
                <div className="activity-title">Kiểm kê định kỳ</div>
                <div className="activity-desc">Vừa hoàn thành kiểm kê tại kho chính</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">💰</div>
              <div className="activity-info">
                <div className="activity-title">Thanh toán mới</div>
                <div className="activity-desc">Hóa đơn #INV-001 đã được xác nhận</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🚛</div>
              <div className="activity-info">
                <div className="activity-title">Lộ trình mới</div>
                <div className="activity-desc">Container CONT-20-001 bắt đầu vận chuyển</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
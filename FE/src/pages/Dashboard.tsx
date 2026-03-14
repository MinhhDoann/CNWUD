import { useDB } from '../useDB';
import { Container, Transport } from '../types';

export default function Dashboard() {
  const { db } = useDB();

  const total = db.containers.length;
  const inTransit = db.containers.filter((c: Container) => c.status === 'Đang vận chuyển').length;
  const pending = db.containers.filter((c: Container) => ['Rỗng', 'Đầy hàng'].includes(c.status)).length;

  const recentContainers = db.containers.slice(0, 2);
  const recentBookings = db.transports.slice(0, 1);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'container_logistics_db.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content">
      <div className="header">
        <h2>Tổng quan</h2>
        <div className="header-right">
          <input placeholder="Tìm kiếm..." />
          <button className="btn" onClick={exportJSON}>Export JSON</button>
          <div className="user-icon">👤</div>
        </div>
      </div>

      <div className="grid">
        <div className="card top-stats">
          <div className="stat"><div className="small">Tổng số Container</div><div>{total}</div></div>
          <div className="stat"><div className="small">Đang vận chuyển</div><div>{inTransit}</div></div>
          <div className="stat"><div className="small">Chờ xử lý</div><div>{pending}</div></div>
        </div>

        <div className="card full-width">
          <h3 className="small">Thao tác nhanh</h3>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button className="btn" onClick={() => window.location.hash = '#containers'}>+ Thêm Container</button>
            <button className="btn" onClick={() => window.location.hash = '#cargo'}>+ Thêm Lô Hàng</button>
            <button className="btn" onClick={() => window.location.hash = '#transport'}>+ Tạo Lịch Trình</button>
          </div>
        </div>

        <div className="card">
          <h4>Containers gần đây</h4>
          <table>
            <thead><tr><th>STT</th><th>Container</th><th>Loại</th><th>Vị trí</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {recentContainers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có container</td></tr>
              ) : recentContainers.map((c: Container, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td><td><strong>{c.no}</strong></td><td>{c.type}</td><td>{c.loc}</td><td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h4>Bookings gần đây</h4>
          <table>
            <thead><tr><th>STT</th><th>Mã</th><th>Loại</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</td></tr>
              ) : recentBookings.map((t: Transport, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td><td><strong>{t.ref}</strong></td><td>Vận tải</td><td>{t.eta ? 'Có ETA' : 'Chờ ETA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
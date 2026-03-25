// Transport.tsx
import React, { useEffect, useState } from 'react';
import { Transport, Container, Vehicle } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Transports: React.FC = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [tRef, setTRef] = useState<string>('');
  const [tContainer, setTContainer] = useState<string>('');
  const [tVehicle, setTVehicle] = useState<string>('');
  const [tNgayKhoiHanh, setTNgayKhoiHanh] = useState<string>('');   // ← Thêm
  const [tETA, setTETA] = useState<string>('');
  const [tStatus, setTStatus] = useState<string>('Chuẩn bị');       // ← Thêm
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchTransports();
    fetchContainers();
    fetchVehicles();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/transports`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: Transport[] = await response.json();
      setTransports(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách lịch trình:', err);
      alert('Không thể tải danh sách lịch trình vận tải');
    } finally {
      setLoading(false);
    }
  };

  const fetchContainers = async () => {
    try {
      const res = await fetch(`${API_BASE}/containers`);
      const data: Container[] = await res.json();
      setContainers(data || []);
    } catch (err) {
      console.error('Lỗi tải container:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicles`);
      const data: Vehicle[] = await res.json();
      setVehicles(data || []);
    } catch (err) {
      console.error('Lỗi tải phương tiện:', err);
    }
  };

  const handleSave = async () => {
    if (!tRef.trim() || !tContainer || !tVehicle || !tNgayKhoiHanh || !tETA) {
      alert('Vui lòng nhập đầy đủ: Mã chuyến, Container, Phương tiện, Ngày khởi hành và Ngày dự kiến đến!');
      return;
    }

    const payload = {
      ref: tRef.trim(),
      containerId: Number(tContainer),
      vehicleId: Number(tVehicle),
      ngayKhoiHanh: tNgayKhoiHanh,
      eta: tETA,
      status: tStatus,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        response = await fetch(`${API_BASE}/transports/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/transports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      alert(editingId ? 'Cập nhật lịch trình thành công!' : 'Tạo lịch trình thành công!');
      await fetchTransports();
      handleClear();
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi lưu');
      console.error(err);
    }
  };

  const handleEdit = (t: Transport) => {
    setTRef(t.ref);
    setTContainer(t.containerId ? String(t.containerId) : '');
    setTNgayKhoiHanh(t.ngayKhoiHanh);
    setTETA(t.eta);
    setTStatus(t.status);

    // Tìm vehicleId để fill vào select
    const foundVehicle = vehicles.find(v => 
      v.LoaiPhuongTien === t.vehicleType && v.BienSo === t.vehicleNo
    );
    if (foundVehicle) setTVehicle(String(foundVehicle.PhuongTienID));

    setEditingId(t.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa lịch trình này?')) return;
    try {
      await fetch(`${API_BASE}/transports/${id}`, { method: 'DELETE' });
      await fetchTransports();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const handleClear = () => {
    setTRef('');
    setTContainer('');
    setTVehicle('');
    setTNgayKhoiHanh('');
    setTETA('');
    setTStatus('Chuẩn bị');
    setEditingId(null);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Danh sách Lịch trình Vận tải</h3>
        <table id="tblTransport">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã chuyến</th>
              <th>Số Container</th>
              <th>Loại phương tiện</th>
              <th>Biển kiểm soát</th>
              <th>Ngày khởi hành</th>
              <th>Dự kiến đến</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
            ) : transports.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch trình</td></tr>
            ) : (
              transports.map((t, index) => (
                <tr key={t.id}>
                  <td>{index + 1}</td>
                  <td><strong>{t.ref}</strong></td>
                  <td>{t.containerNo}</td>
                  <td>{t.vehicleType}</td>
                  <td><strong>{t.vehicleNo}</strong></td>
                  <td>{t.ngayKhoiHanh}</td>
                  <td>{t.eta}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      backgroundColor: t.status === 'Đang đi' ? '#22c55e' :
                                      t.status === 'Hoàn thành' ? '#3b82f6' : '#eab308',
                      color: '#fff'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{ background: '#3b82f6', marginRight: '8px' }} onClick={() => handleEdit(t)}>
                      Sửa
                    </button>
                    <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleDelete(t.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{editingId ? 'Sửa Lịch trình Vận tải' : 'Tạo Lịch trình Vận tải mới'}</h3>

        <div className="form-row">
          <input placeholder="Mã chuyến (MaChuyen)" value={tRef} onChange={e => setTRef(e.target.value)} />
        </div>

        <div className="form-row">
          <select value={tContainer} onChange={e => setTContainer(e.target.value)}>
            <option value="">-- Chọn Container --</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.no}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <select value={tVehicle} onChange={e => setTVehicle(e.target.value)}>
            <option value="">-- Chọn Phương tiện --</option>
            {vehicles.map(v => (
              <option key={v.PhuongTienID} value={v.PhuongTienID}>
                {v.LoaiPhuongTien} - {v.BienSo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <input type="date" placeholder="Ngày khởi hành" value={tNgayKhoiHanh} onChange={e => setTNgayKhoiHanh(e.target.value)} />
        </div>

        <div className="form-row">
          <input type="date" placeholder="Ngày dự kiến đến" value={tETA} onChange={e => setTETA(e.target.value)} />
        </div>

        <div className="form-row">
          <select value={tStatus} onChange={e => setTStatus(e.target.value)}>
            <option value="Chuẩn bị">Chuẩn bị</option>
            <option value="Đang đi">Đang đi</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Lưu lịch trình'}
          </button>
          <button className="btn" style={{ background: '#6b7280' }} onClick={handleClear}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transports;
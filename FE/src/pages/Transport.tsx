// src/pages/Transport.tsx
import React, { useEffect, useState } from 'react';
import { Transport, Container, Vehicle } from '../types';

const API_BASE = 'http://localhost:5000/api';

const TransportPage: React.FC = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [form, setForm] = useState({
    ref: '',
    containerId: '',
    vehicleId: '',
    ngayKhoiHanh: '',
    eta: '',
    status: 'Chuẩn bị' as 'Chuẩn bị' | 'Đang đi' | 'Hoàn thành',
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [transRes, contRes, vehRes] = await Promise.all([
        fetch(`${API_BASE}/transport`),     // ← Sửa thành /transport (theo Postman)
        fetch(`${API_BASE}/containers`),
        fetch(`${API_BASE}/vehicles`),
      ]);

      const transData: Transport[] = await transRes.json();
      const contData: Container[] = await contRes.json();
      const vehData: Vehicle[] = await vehRes.json();

      setTransports(transData || []);
      setContainers(contData || []);
      setVehicles(vehData || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      alert('Không thể tải dữ liệu. Kiểm tra backend đang chạy chưa?');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const { ref, containerId, vehicleId, ngayKhoiHanh, eta, status } = form;

    if (!ref.trim() || !containerId || !ngayKhoiHanh || !eta) {
      alert('Vui lòng nhập đầy đủ Mã chuyến, Container, Ngày khởi hành và Ngày dự kiến đến!');
      return;
    }

    const payload = {
      ref: ref.trim(),
      containerId: Number(containerId),
      vehicleId: vehicleId ? Number(vehicleId) : null,
      ngayKhoiHanh,
      eta,
      status,
    };

    try {
      const url = editingId 
        ? `${API_BASE}/transport/${editingId}`
        : `${API_BASE}/transport`;

      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Lưu thất bại');

      alert(editingId ? 'Cập nhật thành công!' : 'Tạo lịch trình thành công!');
      await fetchAllData();
      handleClear();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi khi lưu dữ liệu');
    }
  };

  const handleEdit = (t: Transport) => {
    setForm({
      ref: t.ref,
      containerId: t.containerId ? String(t.containerId) : '',
      vehicleId: '', // sẽ tìm sau
      ngayKhoiHanh: t.ngayKhoiHanh,
      eta: t.eta,
      status: t.status as any,
    });

    // Tìm vehicleId tương ứng
    const foundVehicle = vehicles.find(v => 
      v.LoaiPhuongTien === t.vehicleType && v.BienSo === t.vehicleNo
    );
    if (foundVehicle) {
      setForm(prev => ({ ...prev, vehicleId: String(foundVehicle.PhuongTienID) }));
    }

    setEditingId(t.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa lịch trình này?')) return;

    try {
      await fetch(`${API_BASE}/transport/${id}`, { method: 'DELETE' });
      await fetchAllData();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const handleClear = () => {
    setForm({
      ref: '',
      containerId: '',
      vehicleId: '',
      ngayKhoiHanh: '',
      eta: '',
      status: 'Chuẩn bị',
    });
    setEditingId(null);
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
      {/* Danh sách */}
      <div className="card">
        <h3>Danh sách Lịch trình Vận tải</h3>
        <table id="tblTransport">
          <thead>
            <tr>
              <th>#</th>
              <th>Mã chuyến</th>
              <th>Số Container</th>
              <th>Loại PT</th>
              <th>Biển số</th>
              <th>Khởi hành</th>
              <th>Dự kiến đến</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center' }}>Đang tải dữ liệu...</td></tr>
            ) : transports.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch trình vận tải</td></tr>
            ) : (
              transports.map((t, i) => (
                <tr key={t.id}>
                  <td>{i + 1}</td>
                  <td><strong>{t.ref}</strong></td>
                  <td>{t.containerNo}</td>
                  <td>{t.vehicleType}</td>
                  <td><strong>{t.vehicleNo}</strong></td>
                  <td>{t.ngayKhoiHanh}</td>
                  <td>{t.eta}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      backgroundColor: t.status === 'Đang đi' ? '#22c55e' : 
                                      t.status === 'Hoàn thành' ? '#3b82f6' : '#eab308',
                      color: '#fff'
                    }}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{ background: '#3b82f6', marginRight: '6px' }} onClick={() => handleEdit(t)}>
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

      {/* Form */}
      <div className="card">
        <h3>{editingId ? 'Sửa Lịch trình Vận tải' : 'Tạo Lịch trình Vận tải mới'}</h3>

        <div className="form-row">
          <input name="ref" placeholder="Mã chuyến (MaChuyen)" value={form.ref} onChange={handleInputChange} />
        </div>

        <div className="form-row">
          <select name="containerId" value={form.containerId} onChange={handleInputChange}>
            <option value="">-- Chọn Container --</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.no}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <select name="vehicleId" value={form.vehicleId} onChange={handleInputChange}>
            <option value="">-- Chọn Phương tiện --</option>
            {vehicles.map(v => (
              <option key={v.PhuongTienID} value={v.PhuongTienID}>
                {v.LoaiPhuongTien} - {v.BienSo}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <input type="date" name="ngayKhoiHanh" value={form.ngayKhoiHanh} onChange={handleInputChange} />
        </div>

        <div className="form-row">
          <input type="date" name="eta" value={form.eta} onChange={handleInputChange} />
        </div>

        <div className="form-row">
          <select name="status" value={form.status} onChange={handleInputChange}>
            <option value="Chuẩn bị">Chuẩn bị</option>
            <option value="Đang đi">Đang đi</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Lưu lịch trình'}
          </button>
          <button className="btn" style={{ background: '#6b7280' }} onClick={handleClear}>
            Hủy / Làm mới
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransportPage;
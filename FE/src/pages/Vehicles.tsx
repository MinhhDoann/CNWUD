// Vehicles.tsx
import React, { useEffect, useState } from 'react';
import { Vehicle } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [loaiPhuongTien, setLoaiPhuongTien] = useState<string>('');
  const [bienSo, setBienSo] = useState<string>('');
  const [taiTrong, setTaiTrong] = useState<string>('');
  const [trangThai, setTrangThai] = useState<string>('Sẵn sàng');
  const [moTa, setMoTa] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/vehicles`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: Vehicle[] = await response.json();
      setVehicles(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách phương tiện:', err);
      alert('Không thể tải danh sách phương tiện từ server');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!loaiPhuongTien.trim() || !bienSo.trim()) {
      alert('Vui lòng nhập Loại phương tiện và Biển số!');
      return;
    }

    const payload = {
      loaiPhuongTien: loaiPhuongTien.trim(),
      bienSo: bienSo.trim().toUpperCase(),
      taiTrong: Number(taiTrong) || 0,
      trangThai,
      moTa: moTa.trim() || null,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        response = await fetch(`${API_BASE}/vehicles/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/vehicles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      alert(editingId ? 'Cập nhật phương tiện thành công!' : 'Thêm phương tiện thành công!');
      await fetchVehicles();
      handleClear();
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi lưu');
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setLoaiPhuongTien(vehicle.LoaiPhuongTien);
    setBienSo(vehicle.BienSo);
    setTaiTrong(String(vehicle.TaiTrong || ''));
    setTrangThai(vehicle.TrangThai || 'Sẵn sàng');
    setMoTa(vehicle.MoTa || '');
    setEditingId(vehicle.PhuongTienID);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa phương tiện này?')) return;

    try {
      const response = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Xóa thất bại');
      await fetchVehicles();
      alert('Xóa phương tiện thành công!');
    } catch (err: any) {
      alert('Không thể xóa phương tiện');
    }
  };

  const handleClear = () => {
    setLoaiPhuongTien('');
    setBienSo('');
    setTaiTrong('');
    setTrangThai('Sẵn sàng');
    setMoTa('');
    setEditingId(null);
  };

  return (
    <div className="grid">
      {/* Danh sách phương tiện */}
      <div className="card">
        <h3>Danh sách Phương tiện</h3>
        <table id="tblVehicles">
          <thead>
            <tr>
              <th>#</th>
              <th>Loại phương tiện</th>
              <th>Biển số</th>
              <th>Tải trọng (tấn)</th>
              <th>Trạng thái</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có phương tiện
                </td>
              </tr>
            ) : (
              vehicles.map((v, index) => (
                <tr key={v.PhuongTienID}>
                  <td>{index + 1}</td>
                  <td>{v.LoaiPhuongTien}</td>
                  <td><strong>{v.BienSo}</strong></td>
                  <td>{v.TaiTrong}</td>
                  <td>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      backgroundColor: v.TrangThai === 'Sẵn sàng' ? '#22c55e' :
                                       v.TrangThai === 'Đang di giao' ? '#eab308' : '#3b82f6',
                      color: '#fff'
                    }}>
                      {v.TrangThai}
                    </span>
                  </td>
                  <td>{v.MoTa || '-'}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ background: '#3b82f6', marginRight: '8px' }}
                      onClick={() => handleEdit(v)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#ef4444' }}
                      onClick={() => handleDelete(v.PhuongTienID)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form thêm / sửa */}
      <div className="card">
        <h3>{editingId ? 'Sửa Phương tiện' : 'Thêm Phương tiện mới'}</h3>

        <div className="form-row">
          <input
            placeholder="Loại phương tiện (Xe đầu kéo, Xe tải...)"
            value={loaiPhuongTien}
            onChange={(e) => setLoaiPhuongTien(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            placeholder="Biển số xe (ví dụ: 29H-12345)"
            value={bienSo}
            onChange={(e) => setBienSo(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            type="number"
            step="0.1"
            placeholder="Tải trọng (tấn)"
            value={taiTrong}
            onChange={(e) => setTaiTrong(e.target.value)}
          />
        </div>

        <div className="form-row">
          <select value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
            <option value="Sẵn sàng">Sẵn sàng</option>
            <option value="Đang di giao">Đang di giao</option>
            <option value="Bảo trì">Bảo trì</option>
            <option value="Hỏng">Hỏng</option>
          </select>
        </div>

        <div className="form-row">
          <textarea
            placeholder="Mô tả thêm (tùy chọn)"
            rows={3}
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Thêm phương tiện'}
          </button>
          <button
            className="btn"
            style={{ background: '#6b7280' }}
            onClick={handleClear}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
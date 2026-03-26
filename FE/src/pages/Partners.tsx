// Partners.tsx
import React, { useEffect, useState } from 'react';
import { Partner } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Partners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [pName, setPName] = useState<string>('');
  const [pType, setPType] = useState<string>('Khách hàng');
  const [pContact, setPContact] = useState<string>('');
  const [pAddress, setPAddress] = useState<string>('');
  const [pStatus, setPStatus] = useState<string>('Hoạt động');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/partners`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: Partner[] = await response.json();
      setPartners(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đối tác:', err);
      alert('Không thể tải danh sách đối tác / khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!pName.trim() || !pContact.trim()) {
      alert('Vui lòng nhập Tên và Thông tin liên hệ!');
      return;
    }

    const payload = {
      tenKH: pName.trim(),
      loaiDoiTac: pType,
      sdt: pContact.trim(),
      diaChi: pAddress.trim() || null,
      trangThai: pStatus,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        response = await fetch(`${API_BASE}/partners/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/partners`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Lưu thất bại');

      alert(editingId ? 'Cập nhật đối tác thành công!' : 'Thêm đối tác thành công!');
      await fetchPartners();
      handleClear();
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi lưu');
    }
  };

  const handleEdit = (partner: Partner) => {
    setPName(partner.name);
    setPType(partner.type);
    setPContact(partner.contact);
    setPAddress(partner.address || '');
    setPStatus(partner.status);
    setEditingId(partner.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa đối tác / khách hàng này?')) return;

    try {
      await fetch(`${API_BASE}/partners/${id}`, { method: 'DELETE' });
      await fetchPartners();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const handleClear = () => {
    setPName('');
    setPType('Khách hàng');
    setPContact('');
    setPAddress('');
    setPStatus('Hoạt động');
    setEditingId(null);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Danh sách Đối tác / Khách hàng</h3>
        <table id="tblPartners">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Loại</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có đối tác / khách hàng</td></tr>
            ) : (
              partners.map((p, index) => (
                <tr key={p.id}>
                  <td>{index + 1}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.type}</td>
                  <td>{p.contact}</td>
                  <td>{p.address || '-'}</td>
                  <td>
                    <span 
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '500',
                        backgroundColor: p.status === 'Hoạt động' ? '#22c55e' : '#ef4444',
                        color: '#fff',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ background: '#3b82f6', marginRight: '8px', padding: '6px 12px' }} 
                      onClick={() => handleEdit(p)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn" 
                      style={{ background: '#ef4444', padding: '6px 12px' }} 
                      onClick={() => handleDelete(p.id)}
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

      <div className="card">
        <h3>{editingId ? 'Sửa Đối tác / Khách hàng' : 'Thêm Đối tác / Khách hàng'}</h3>

        <div className="form-row">
          <input 
            placeholder="Tên đối tác / khách hàng" 
            value={pName} 
            onChange={e => setPName(e.target.value)} 
          />
        </div>

        <div className="form-row">
          <select value={pType} onChange={e => setPType(e.target.value)}>
            <option>Khách hàng</option>
            <option>Đối tác</option>
            <option>Người gửi</option>
            <option>Người nhận</option>
          </select>
        </div>

        <div className="form-row">
          <input 
            placeholder="SĐT / Email liên hệ" 
            value={pContact} 
            onChange={e => setPContact(e.target.value)} 
          />
        </div>

        <div className="form-row">
          <input 
            placeholder="Địa chỉ (tùy chọn)" 
            value={pAddress} 
            onChange={e => setPAddress(e.target.value)} 
          />
        </div>

        <div className="form-row">
          <select value={pStatus} onChange={e => setPStatus(e.target.value)}>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Tạm ngưng">Tạm ngưng</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Lưu'}
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

export default Partners;
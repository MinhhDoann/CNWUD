import React, { useEffect, useState } from 'react';
import { Contract } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [cNo, setCNo] = useState<string>('');
  const [cPartnerId, setCPartnerId] = useState<string>('');
  const [cStart, setCStart] = useState<string>('');
  const [cEnd, setCEnd] = useState<string>('');
  const [cType, setCType] = useState<string>('');
  const [cStatus, setCStatus] = useState<string>('Chờ ký');
  const [cNote, setCNote] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchContracts();
    fetchPartners();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/contracts`);
      if (!res.ok) throw new Error('Lỗi server');
      const data = await res.json();
      setContracts(data || []);
    } catch (err) {
      console.error('Lỗi tải hợp đồng:', err);
      alert('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch(`${API_BASE}/partners`);
      const data = await res.json();
      setPartners(data || []);
    } catch (err) {
      console.error('Lỗi tải đối tác:', err);
    }
  };

  const handleSave = async () => {
    if (!cNo.trim() || !cPartnerId || !cStart) {
      alert('Vui lòng nhập đầy đủ: Số hợp đồng, Đối tác và Ngày ký!');
      return;
    }

    const payload = {
      partnerId: Number(cPartnerId),
      start: cStart,
      end: cEnd || null,
      type: cType.trim() || null,
      status: cStatus,
      note: cNote.trim() || null,
    };

    try {
      const url = editingId 
        ? `${API_BASE}/contracts/${editingId}`
        : `${API_BASE}/contracts`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      alert(editingId ? 'Cập nhật thành công!' : 'Tạo hợp đồng mới thành công!');
      await fetchContracts();
      handleClear();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Có lỗi khi lưu hợp đồng');
    }
  };

const handleEdit = (c: Contract) => {
  setCNo(c.no);
  setCPartnerId(String(c.partnerId));
  setCStart(c.start ? c.start.split('T')[0] : '');   // chỉ lấy phần yyyy-mm-dd
  setCEnd(c.end ? c.end.split('T')[0] : '');
  setCType(c.type || '');
  setCStatus(c.status);
  setCNote(c.note || '');
  setEditingId(c.id);
};

const handleDelete = async (id: number) => {
  if (!window.confirm('Xóa hợp đồng này?')) return;
  try {
    await fetch(`${API_BASE}/contracts/${id}`, { method: 'DELETE' });
    await fetchContracts();
  } catch (err) {
    alert('Xóa thất bại');
  }
};

const handleClear = () => {
  setCNo('');
  setCPartnerId('');
  setCStart('');
  setCEnd('');
  setCType('');
  setCStatus('Chờ ký');
  setCNote('');
  setEditingId(null);
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—'; // trường hợp ngày không hợp lệ

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

return (
  <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
    {/* Danh sách hợp đồng */}
    <div className="card">
      <h3>Hợp đồng</h3>
      <table id="tblContracts">
        <thead>
          <tr>
            <th>STT</th>
            <th>Số HĐ</th>
            <th>Đối tác</th>
            <th>Loại dịch vụ</th>
            <th>Hiệu lực</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={7} style={{ textAlign: 'center' }}>Đang tải...</td></tr>
          ) : contracts.length === 0 ? (
            <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có hợp đồng</td></tr>
          ) : (
            contracts.map((c, index) => (
              <tr key={c.id}>
                <td>{index + 1}</td>
                <td><strong>{c.no}</strong></td>
                <td>{c.partner}</td>
                <td>{c.type || '-'}</td>
                <td>{formatDate(c.start)} → {formatDate(c.end) || '∞'}</td>
                <td>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '13px',
                    backgroundColor: c.status === 'Đã ký' || c.status === 'Hiệu lực' ? '#22c55e' : '#eab308',
                    color: '#fff'
                  }}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="btn" 
                    style={{ background: '#3b82f6', marginRight: '6px' }} 
                    onClick={() => handleEdit(c)}
                  >
                    Sửa
                  </button>
                  <button 
                    className="btn" 
                    style={{ background: '#ef4444' }} 
                    onClick={() => handleDelete(c.id)}
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
      <h3>{editingId ? 'Sửa Hợp đồng' : 'Thêm Hợp đồng mới'}</h3>

      <div className="form-row">
        <input 
          placeholder="Số hợp đồng" 
          value={cNo} 
          onChange={e => setCNo(e.target.value)} 
        />
      </div>

      <div className="form-row">
        <select value={cPartnerId} onChange={e => setCPartnerId(e.target.value)}>
          <option value="">-- Chọn Khách hàng / Đối tác --</option>
          {partners.map(p => (
            <option key={p.id} value={p.id}>
              {p.name || p.TenKH}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row form-row-2">
        <input 
          type="date" 
          value={cStart} 
          onChange={e => setCStart(e.target.value)} 
        />
        <input 
          type="date" 
          value={cEnd} 
          onChange={e => setCEnd(e.target.value)} 
        />
      </div>

      <div className="form-row">
        <input 
          placeholder="Loại dịch vụ (Ví dụ: Lưu kho, Vận chuyển...)" 
          value={cType} 
          onChange={e => setCType(e.target.value)} 
        />
      </div>

      <div className="form-row">
        <select value={cStatus} onChange={e => setCStatus(e.target.value)}>
          <option value="Chờ ký">Chờ ký</option>
          <option value="Đã ký">Đã ký</option>
          <option value="Hiệu lực">Hiệu lực</option>
          <option value="Hết hạn">Hết hạn</option>
        </select>
      </div>

        <div className="form-row">
          <textarea 
            placeholder="Ghi chú" 
            rows={3} 
            value={cNote} 
            onChange={e => setCNote(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật hợp đồng' : 'Lưu hợp đồng'}
          </button>
          <button className="btn" style={{ background: '#6b7280' }} onClick={handleClear}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
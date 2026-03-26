// Staff.tsx
import React, { useEffect, useState } from 'react';
import { Staff } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Staffs: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form state
  const [sUsername, setSUsername] = useState<string>('');
  const [sFullName, setSFullName] = useState<string>('');
  const [sEmail, setSEmail] = useState<string>('');
  const [sStatus, setSStatus] = useState<string>('Hoạt động');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/staff`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data: Staff[] = await response.json();
      setStaffList(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách nhân sự:', err);
      alert('Không thể tải danh sách nhân sự');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sUsername.trim() || !sFullName.trim()) {
      alert('Vui lòng nhập Username và Họ tên!');
      return;
    }

    const payload = {
      username: sUsername.trim(),
      hoTen: sFullName.trim(),
      email: sEmail.trim() || null,
      trangThai: sStatus,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        response = await fetch(`${API_BASE}/staff/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/staff`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Lưu thất bại');

      alert(editingId ? 'Cập nhật nhân sự thành công!' : 'Thêm nhân sự thành công!');
      await fetchStaff();
      handleClear();
    } catch (err: any) {
      alert(err.message || 'Có lỗi khi lưu');
    }
  };

  const handleEdit = (staff: Staff) => {
    setSUsername(staff.username);
    setSFullName(staff.fullName);
    setSEmail(staff.email || '');
    setSStatus(staff.status);
    setEditingId(staff.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa nhân sự này?')) return;
    try {
      await fetch(`${API_BASE}/staff/${id}`, { method: 'DELETE' });
      await fetchStaff();
    } catch (err) {
      alert('Xóa thất bại');
    }
  };

  const handleClear = () => {
    setSUsername('');
    setSFullName('');
    setSEmail('');
    setSStatus('Hoạt động');
    setEditingId(null);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Danh sách Nhân sự</h3>
        <table id="tblStaff">
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có nhân sự</td></tr>
            ) : (
              staffList.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td><strong>{s.username}</strong></td>
                  <td>{s.fullName}</td>
                  <td>{s.email || '-'}</td>
                  <td>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '13px', backgroundColor: s.status === 'Hoạt động' ? '#22c55e' : '#ef4444', color: '#fff' }}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn" style={{ background: '#3b82f6', marginRight: '8px' }} onClick={() => handleEdit(s)}>Sửa</button>
                    <button className="btn" style={{ background: '#ef4444' }} onClick={() => handleDelete(s.id)}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{editingId ? 'Sửa Nhân sự' : 'Thêm Nhân sự mới'}</h3>

        <div className="form-row"><input placeholder="Username" value={sUsername} onChange={e => setSUsername(e.target.value)} /></div>
        <div className="form-row"><input placeholder="Họ và tên" value={sFullName} onChange={e => setSFullName(e.target.value)} /></div>
        <div className="form-row"><input type="email" placeholder="Email" value={sEmail} onChange={e => setSEmail(e.target.value)} /></div>
        <div className="form-row">
          <select value={sStatus} onChange={e => setSStatus(e.target.value)}>
            <option>Hoạt động</option>
            <option>Tạm ngưng</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Lưu'}
          </button>
          <button className="btn" style={{ background: '#6b7280' }} onClick={handleClear}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default Staffs;
import React, { useState, useEffect } from 'react';
import { Container } from '../types'; 

const API_BASE = 'http://localhost:5000/api'; 

const Containers: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cNumber, setCNumber] = useState<string>('');
  const [cType, setCType] = useState<string>('20DC');
  const [cLocation, setCLocation] = useState<string>('');
  const [cStatus, setCStatus] = useState<string>('Rỗng');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/containers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Container[] = await response.json();
      setContainers(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách container:', err);
      alert('Không thể tải danh sách container từ server');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý nút Lưu / Cập nhật
  const handleSave = async () => {
    if (!cNumber.trim()) {
      alert('Vui lòng nhập số Container!');
      return;
    }

    const payload: Omit<Container, 'id'> = {
      no: cNumber.trim(),
      type: cType,
      loc: cLocation.trim(),
      status: cStatus,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        // PUT - cập nhật
        response = await fetch(`${API_BASE}/containers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // POST - tạo mới
        response = await fetch(`${API_BASE}/containers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      // Refresh danh sách
      await fetchContainers();

      // Reset form
      setCNumber('');
      setCType('20DC');
      setCLocation('');
      setCStatus('Rỗng');
      setEditingId(null);

      // Đổi lại text nút
      const saveBtn = document.getElementById('saveContainer');
      if (saveBtn) saveBtn.textContent = 'Lưu';
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu');
      console.error(err);
    }
  };

  // Điền dữ liệu vào form khi nhấn Sửa
  const handleEdit = (container: Container) => {
    setCNumber(container.no);
    setCType(container.type);
    setCLocation(container.loc || '');
    setCStatus(container.status);
    setEditingId(container.id);

    // Đổi text nút thành Cập nhật
    const saveBtn = document.getElementById('saveContainer');
    if (saveBtn) saveBtn.textContent = 'Cập nhật';
  };

  // Xóa container
  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa container này?')) return;

    try {
      const response = await fetch(`${API_BASE}/containers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Xóa thất bại');
      }

      await fetchContainers();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa container');
    }
  };

  // Hủy form
  const handleClear = () => {
    setCNumber('');
    setCType('20DC');
    setCLocation('');
    setCStatus('Rỗng');
    setEditingId(null);

    const saveBtn = document.getElementById('saveContainer');
    if (saveBtn) saveBtn.textContent = 'Lưu';
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Danh sách Container</h3>
        <table id="tblContainers">
          <thead>
            <tr>
              <th>#</th>
              <th>Số</th>
              <th>Loại</th>
              <th>Vị trí</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : containers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có container
                </td>
              </tr>
            ) : (
              containers.map((container, index) => (
                <tr key={container.id}>
                  <td>{index + 1}</td>
                  <td><strong>{container.no}</strong></td>
                  <td>{container.type}</td>
                  <td>{container.loc || '-'}</td>
                  <td>{container.status}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ background: '#3b82f6', marginRight: '8px' }}
                      onClick={() => handleEdit(container)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#ef4444' }}
                      onClick={() => handleDelete(container.id)}
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
        <h3>{editingId ? 'Sửa Container' : 'Thêm / Sửa Container'}</h3>
        <div className="form-row">
          <input
            id="cNumber"
            placeholder="Container No"
            value={cNumber}
            onChange={(e) => setCNumber(e.target.value)}
          />
        </div>
        <div className="form-row">
          <select
            id="cType"
            value={cType}
            onChange={(e) => setCType(e.target.value)}
          >
            <option>20DC</option>
            <option>40HC</option>
            <option>REEFER</option>
            <option>OPEN_TOP</option>
          </select>
        </div>
        <div className="form-row">
          <input
            id="cLocation"
            placeholder="Vị trí (Depot / Port / Onboard)"
            value={cLocation}
            onChange={(e) => setCLocation(e.target.value)}
          />
        </div>
        <div className="form-row">
          <select
            id="cStatus"
            value={cStatus}
            onChange={(e) => setCStatus(e.target.value)}
          >
            <option>Rỗng</option>
            <option>Đầy hàng</option>
            <option>Đang vận chuyển</option>
            <option>Bảo trì</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" id="saveContainer" onClick={handleSave}>
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

export default Containers;
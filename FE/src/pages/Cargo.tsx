import React, { useEffect, useState } from 'react';
import { Cargo, Container } from '../types';

const API_BASE = 'http://localhost:5000/api';

type CargoApiItem = Cargo & {
  containerID?: number | null;
  loaiHangID?: number | null;
};

const CargoPage: React.FC = () => {
  const [cargoList, setCargoList] = useState<CargoApiItem[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [gDesc, setGDesc] = useState<string>('');
  const [gQty, setGQty] = useState<string>('');
  const [gType, setGType] = useState<string>('General');
  const [gContainer, setGContainer] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCargo();
    fetchContainers();
  }, []);

  const fetchCargo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/cargo`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: CargoApiItem[] = await response.json();
      setCargoList(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách cargo:', err);
      alert('Không thể tải danh sách lô hàng từ server');
    } finally {
      setLoading(false);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${API_BASE}/containers`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Container[] = await response.json();
      setContainers(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách container:', err);
    }
  };

  const getLoaiHangIDFromType = (type: string): number => {
    switch (type) {
      case 'Reefer':
        return 2;
      case 'Dangerous (DG)':
        return 3;
      case 'General':
      default:
        return 1;
    }
  };

  const handleSave = async () => {
    if (!gDesc.trim()) {
      alert('Vui lòng nhập mô tả hàng!');
      return;
    }

    const payload = {
      tenHang: gDesc.trim(),
      soLuong: Number(gQty || 0),
      loaiHangID: getLoaiHangIDFromType(gType),
      containerID: gContainer ? Number(gContainer) : null,
    };

    try {
      let response: Response;

      if (editingId !== null) {
        response = await fetch(`${API_BASE}/cargo/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE}/cargo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      await fetchCargo();
      handleClear();
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu');
      console.error(err);
    }
  };

  const handleEdit = (cargo: CargoApiItem) => {
    setGDesc(cargo.desc);
    setGQty(String(cargo.qty || ''));
    setGType(cargo.type || 'General');
    setGContainer(cargo.containerID ? String(cargo.containerID) : '');
    setEditingId(cargo.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa lô hàng này?')) return;

    try {
      const response = await fetch(`${API_BASE}/cargo/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Xóa thất bại');
      }

      await fetchCargo();
    } catch (err: any) {
      alert(err.message || 'Không thể xóa lô hàng');
    }
  };

  const handleClear = () => {
    setGDesc('');
    setGQty('');
    setGType('General');
    setGContainer('');
    setEditingId(null);
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Danh sách Lô hàng</h3>
        <table id="tblCargo">
          <thead>
            <tr>
              <th>#</th>
              <th>Mô tả</th>
              <th>Container</th>
              <th>Trọng lượng</th>
              <th>Loại</th>
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
            ) : cargoList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có lô hàng
                </td>
              </tr>
            ) : (
              cargoList.map((cargo, index) => (
                <tr key={cargo.id}>
                  <td>{index + 1}</td>
                  <td>{cargo.desc}</td>
                  <td>{cargo.container || '-'}</td>
                  <td>{cargo.qty}</td>
                  <td>{cargo.type}</td>
                  <td>
                    <button
                      className="btn"
                      style={{ background: '#3b82f6', marginRight: '8px' }}
                      onClick={() => handleEdit(cargo)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn"
                      style={{ background: '#ef4444' }}
                      onClick={() => handleDelete(cargo.id)}
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
        <h3>{editingId ? 'Sửa Lô hàng' : 'Thêm / Sửa Lô hàng'}</h3>

        <div className="form-row">
          <input
            id="gDesc"
            placeholder="Mô tả hàng"
            value={gDesc}
            onChange={(e) => setGDesc(e.target.value)}
          />
        </div>

        <div className="form-row">
          <input
            id="gQty"
            placeholder="Trọng lượng (kg)"
            type="number"
            value={gQty}
            onChange={(e) => setGQty(e.target.value)}
          />
        </div>

        <div className="form-row">
          <select
            id="gType"
            value={gType}
            onChange={(e) => setGType(e.target.value)}
          >
            <option>General</option>
            <option>Reefer</option>
            <option>Dangerous (DG)</option>
          </select>
        </div>

        <div className="form-row">
          <select
            id="gContainer"
            value={gContainer}
            onChange={(e) => setGContainer(e.target.value)}
          >
            <option value="">- Chọn container -</option>
            {containers.map((container) => (
              <option key={container.id} value={container.id}>
                {container.no}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" id="saveCargo" onClick={handleSave}>
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

export default CargoPage;
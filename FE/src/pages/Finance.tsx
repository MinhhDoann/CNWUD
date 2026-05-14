import React, { useState, useEffect } from "react";
import { Container, Finance } from "../types";

const API_BASE = 'http://localhost:5000/api';

const FinancePage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [finances, setFinances] = useState<Finance[]>([]);

  // Form states
  const [selectedContainerId, setSelectedContainerId] = useState<string>('');
  const [base, setBase] = useState<string>('');
  const [demdet, setDemdet] = useState<string>('');
  const [local, setLocal] = useState<string>('');
  const [extra, setExtra] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<string>('');

  useEffect(() => {
    fetchContainers();
    fetchFinances();
  }, []);

  const fetchContainers = async () => {
    try {
      const response = await fetch(`${API_BASE}/containers`);
      if (response.ok) {
        const data = await response.json();
        setContainers(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách container:', err);
    }
  };

  const fetchFinances = async () => {
    try {
      const response = await fetch(`${API_BASE}/finance`);
      if (response.ok) {
        const data = await response.json();
        setFinances(data || []);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách chi phí:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedContainerId) {
      alert("Vui lòng chọn Container!");
      return;
    }

    try {
      const payload = {
        containerId: Number(selectedContainerId),
        base: Number(base) || 0,
        demdet: Number(demdet) || 0,
        local: Number(local) || 0,
        extra: Number(extra) || 0
      };

      const response = await fetch(`${API_BASE}/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Lưu thất bại');
      }

      setResultMessage('Đã lưu chi phí thành công!');
      
      // Refresh the list and reset form
      fetchFinances();
      setSelectedContainerId('');
      setBase('');
      setDemdet('');
      setLocal('');
      setExtra('');

      setTimeout(() => setResultMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra khi lưu chi phí');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa chi phí của Container này?")) return;
    try {
      const response = await fetch(`${API_BASE}/finance/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchFinances();
      } else {
        throw new Error("Xóa thất bại");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa chi phí");
    }
  };

  const handleEdit = (f: Finance) => {
    setSelectedContainerId(String(f.id));
    setBase(String(f.base));
    setDemdet(String(f.demdet));
    setLocal(String(f.local));
    setExtra(String(f.extra));
  };

  const handleClear = () => {
    setSelectedContainerId('');
    setBase('');
    setDemdet('');
    setLocal('');
    setExtra('');
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Chi phí theo Container</h3>
        <table id="tblFinance">
          <thead>
            <tr>
              <th>Container</th>
              <th>Cước chính</th>
              <th>DEM/DET</th>
              <th>Local charge</th>
              <th>Phí khác</th>
              <th>Tổng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {finances.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8" }}>
                  Chưa có dữ liệu chi phí
                </td>
              </tr>
            ) : (
              finances.map(f => (
                <tr key={f.id}>
                  <td><strong>{f.container}</strong></td>
                  <td>{f.base.toLocaleString('vi-VN')} đ</td>
                  <td>{f.demdet.toLocaleString('vi-VN')} đ</td>
                  <td>{f.local.toLocaleString('vi-VN')} đ</td>
                  <td>{f.extra.toLocaleString('vi-VN')} đ</td>
                  <td style={{ fontWeight: 'bold', color: '#ef4444' }}>{f.total.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ background: '#3b82f6', padding: '4px 8px', fontSize: '12px', marginRight: '6px' }}
                      onClick={() => handleEdit(f)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn" 
                      style={{ background: '#ef4444', padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDelete(f.id)}
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
        <h3>Tính toán chi phí</h3>
        <div className="form-row">
          <select 
            id="fSelectContainer" 
            value={selectedContainerId} 
            onChange={e => setSelectedContainerId(e.target.value)}
          >
            <option value="">- Chọn Container cần tính -</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.no} - {c.type}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input 
            id="fBase" 
            type="number" 
            placeholder="Cước cơ bản (VND)" 
            value={base}
            onChange={e => setBase(e.target.value)}
          />
        </div>
        <div className="form-row">
          <input 
            id="fDemDet" 
            type="number" 
            placeholder="Phí DEM/DET (VND)" 
            value={demdet}
            onChange={e => setDemdet(e.target.value)}
          />
        </div>
        <div className="form-row">
          <input 
            id="fLocal" 
            type="number" 
            placeholder="Phí Local/Seal (VND)" 
            value={local}
            onChange={e => setLocal(e.target.value)}
          />
        </div>
        <div className="form-row">
          <input 
            id="fExtra" 
            type="number" 
            placeholder="Phí phát sinh (VND)" 
            value={extra}
            onChange={e => setExtra(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" id="btnSaveFinance" onClick={handleSave}>Lưu chi phí</button>
          <button className="btn" style={{ background: '#6b7280' }} onClick={handleClear}>Hủy</button>
        </div>
        {resultMessage && (
          <div id="costResult" style={{ marginTop: "15px", fontWeight: "bold", color: "#0b76ef" }}>
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancePage;
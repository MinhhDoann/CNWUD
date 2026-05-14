import React, { useState, useEffect } from "react";
import { Invoice, Contract, Container } from "../types";

const API_BASE = 'http://localhost:5000/api';

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [iNo, setINo] = useState<string>('');
  const [iContractId, setIContractId] = useState<string>('');
  const [iContainerId, setIContainerId] = useState<string>('');
  const [iPartner, setIPartner] = useState<string>('');
  const [iIssue, setIIssue] = useState<string>('');
  const [iDue, setIDue] = useState<string>('');
  const [iAmount, setIAmount] = useState<string>('');
  const [iVat, setIVat] = useState<string>('10');
  const [iTotal, setITotal] = useState<number>(0);
  const [iPaid, setIPaid] = useState<string>('Chưa thanh toán');
  const [iNote, setINote] = useState<string>('');
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, conRes, cntRes] = await Promise.all([
        fetch(`${API_BASE}/invoices`),
        fetch(`${API_BASE}/contracts`),
        fetch(`${API_BASE}/containers`)
      ]);

      if (invRes.ok && conRes.ok && cntRes.ok) {
        setInvoices(await invRes.json());
        setContracts(await conRes.json());
        setContainers(await cntRes.json());
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  // Tự động tính tổng tiền khi tiền hàng hoặc VAT thay đổi
  useEffect(() => {
    const amount = parseFloat(iAmount) || 0;
    const vat = parseFloat(iVat) || 0;
    setITotal(amount + (amount * vat / 100));
  }, [iAmount, iVat]);

  // Tự động điền đối tác khi chọn hợp đồng
  useEffect(() => {
    if (iContractId) {
      const selected = contracts.find(c => c.id === parseInt(iContractId));
      setIPartner(selected ? selected.partner : '');
    } else {
      setIPartner('');
    }
  }, [iContractId, contracts]);

  const handleSave = async () => {
    if (!iNo || !iContractId) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc!');
      return;
    }

    const payload = {
      no: iNo,
      contractId: parseInt(iContractId),
      issue: iIssue,
      due: iDue,
      total: iTotal,
      vat: parseFloat(iVat),
      paid: iPaid,
      note: iNote
    };

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE}/invoices/${editingId}` : `${API_BASE}/invoices`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        fetchData();
        handleClear();
      } else {
        alert('Có lỗi xảy ra khi lưu hóa đơn');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (inv: any) => {
    setINo(inv.no);
    setIContractId(String(inv.contractId));
    setIIssue(inv.issue ? inv.issue.split('T')[0] : '');
    setIDue(inv.due ? inv.due.split('T')[0] : '');
    const vat = inv.vat || 0;
    const total = inv.total || 0;
    setIVat(String(vat));
    setIAmount(String(Math.round(total / (1 + vat / 100))));
    setIPaid(inv.paid);
    setINote(inv.note || '');
    setEditingId(inv.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa hóa đơn này?')) return;
    try {
      const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = () => {
    setINo('');
    setIContractId('');
    setIContainerId('');
    setIPartner('');
    setIIssue('');
    setIDue('');
    setIAmount('');
    setIVat('10');
    setIPaid('Chưa thanh toán');
    setINote('');
    setEditingId(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="grid">
      <div className="card">
        <h3>Hóa đơn</h3>
        <table id="tblInvoices">
          <thead>
            <tr>
              <th>STT</th>
              <th>Số HĐơn</th>
              <th>Hợp đồng</th>
              <th>Đối tác</th>
              <th>Ngày xuất</th>
              <th>Hạn TT</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: "center" }}>Đang tải...</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: "center", color: "#94a3b8" }}>Chưa có hóa đơn</td></tr>
            ) : (
              invoices.map((inv, idx) => (
                <tr key={inv.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{inv.no}</strong></td>
                  <td>{inv.contractNo || '-'}</td>
                  <td>{inv.partner || '-'}</td>
                  <td>{formatDate(inv.issue)}</td>
                  <td>{formatDate(inv.due)}</td>
                  <td style={{ fontWeight: "bold", color: "#ef4444" }}>
                    {inv.total.toLocaleString('vi-VN')} đ
                  </td>
                  <td>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: inv.paid === 'Đã thanh toán' ? '#dcfce7' : '#fee2e2',
                      color: inv.paid === 'Đã thanh toán' ? '#166534' : '#991b1b'
                    }}>
                      {inv.paid}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn" 
                      style={{ background: "#3b82f6", marginRight: "6px" }}
                      onClick={() => handleEdit(inv)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn" 
                      style={{ background: "#ef4444" }}
                      onClick={() => handleDelete(inv.id)}
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
        <h3>{editingId ? 'Sửa hóa đơn' : 'Thêm hóa đơn'}</h3>
        <div className="form-row">
          <input 
            placeholder="Số hóa đơn" 
            value={iNo} 
            onChange={e => setINo(e.target.value)} 
          />
        </div>
        <div className="form-row">
          <select 
            value={iContractId} 
            onChange={e => setIContractId(e.target.value)}
          >
            <option value="">Chọn hợp đồng</option>
            {contracts.map(c => (
              <option key={c.id} value={c.id}>{c.no}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <input 
            placeholder="Đối tác" 
            value={iPartner} 
            disabled 
            style={{ backgroundColor: "#f3f4f6" }}
          />
        </div>

        <div className="form-row form-row-2">
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280" }}>Ngày xuất</label>
            <input type="date" value={iIssue} onChange={e => setIIssue(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6b7280" }}>Hạn thanh toán</label>
            <input type="date" value={iDue} onChange={e => setIDue(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <input 
            type="number" 
            placeholder="Tiền hàng (VNĐ)" 
            value={iAmount} 
            onChange={e => setIAmount(e.target.value)} 
          />
        </div>

        <div className="form-row form-row-2">
          <input 
            type="number" 
            placeholder="VAT (%)" 
            value={iVat} 
            onChange={e => setIVat(e.target.value)} 
          />
          <input 
            type="text" 
            placeholder="Tổng tiền" 
            value={iTotal.toLocaleString('vi-VN') + ' đ'} 
            disabled 
            style={{ backgroundColor: "#f3f4f6", fontWeight: "bold" }}
          />
        </div>

        <div className="form-row">
          <select value={iPaid} onChange={e => setIPaid(e.target.value)}>
            <option>Chưa thanh toán</option>
            <option>Đã thanh toán</option>
            <option>Quá hạn</option>
          </select>
        </div>

        <div className="form-row">
          <textarea 
            placeholder="Ghi chú" 
            rows={3} 
            value={iNote} 
            onChange={e => setINote(e.target.value)}
          ></textarea>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn" onClick={handleSave}>
            {editingId ? 'Cập nhật' : 'Lưu'}
          </button>
          <button className="btn" style={{ background: "#6b7280" }} onClick={handleClear}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
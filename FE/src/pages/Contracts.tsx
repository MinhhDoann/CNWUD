import React, { useEffect, useState } from 'react';
import { Contract } from '../types';

const API_BASE = 'http://localhost:5000/api';

const Contracts: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [partners, setPartners] = useState<any[]>([]); // danh sách KhachHang
  const [loading, setLoading] = useState(true);

class Contracts extends React.Component {
  render() {
    return (
      <div className="grid">
        <div className="card">
          <h3>Hợp đồng</h3>
          <table id="tblContracts">
            <thead>
              <tr>
                <th>STT</th>
                <th>Số HĐ</th>
                <th>Đối tác</th>
                <th>Hiệu lực</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#94a3b8" }}>
                  Chưa có hợp đồng
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 id="contractFormTitle">Thêm hợp đồng</h3>
          <div className="form-row"><input id="cNo" placeholder="Số hợp đồng" /></div>
          <div className="form-row"><input id="cPartner" placeholder="Khách hàng / Đối tác" /></div>
          <div className="form-row form-row-2">
            <input id="cStart" type="date" />
            <input id="cEnd" type="date" />
          </div>
          <div className="form-row">
            <input id="cValue" type="number" placeholder="Giá trị (VNĐ)" />
          </div>
          <div className="form-row">
            <select id="contractStatus">
              <option>Chờ ký</option>
              <option>Đã ký</option>
            </select>
          </div>
          <div className="form-row">
            <textarea id="cNote" placeholder="Ghi chú" rows={3}></textarea>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn" id="saveContract">Lưu</button>
            <button className="btn" id="clearContract" style={{ background: "#6b7280" }}>Hủy</button>
            <button className="btn" id="deleteContract" style={{ background: "#ef4444", display: "none" }}>Xóa</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Contracts;
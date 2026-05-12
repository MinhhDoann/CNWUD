import React from "react";

class Invoices extends React.Component {
  render() {
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
                <th>Container</th>
                <th>Đối tác</th>
                <th>Ngày xuất</th>
                <th>Hạn TT</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "#94a3b8" }}>
                  Chưa có hóa đơn
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 id="invoiceFormTitle">Thêm hóa đơn</h3>
          <div className="form-row"><input id="iNo" placeholder="Số hóa đơn" /></div>
          <div className="form-row">
            <select id="iContract">
              <option value="" disabled selected>Chọn hợp đồng</option>
            </select>
          </div>
          <div className="form-row">
            <select id="iContainer">
              <option value="">Chọn container</option>
            </select>
          </div>
          <div className="form-row"><input id="iPartner" placeholder="Đối tác" disabled /></div>

          <div className="form-row form-row-2">
            <input id="iIssue" type="date" />
            <input id="iDue" type="date" />
          </div>

          <div className="form-row"><input id="iAmount" type="number" placeholder="Tiền hàng (VNĐ)" /></div>

          <div className="form-row form-row-2">
            <input id="iVat" type="number" placeholder="VAT (%)" />
            <input id="iTotal" type="number" placeholder="Tổng tiền" disabled />
          </div>

          <div className="form-row">
            <select id="iPaid">
              <option>Chưa thanh toán</option>
              <option>Đã thanh toán</option>
            </select>
          </div>

          <div className="form-row">
            <input id="iPaidDate" type="date" />
          </div>

          <div className="form-row">
            <textarea id="iNote" placeholder="Ghi chú" rows={3}></textarea>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn" id="saveInvoice">Lưu</button>
            <button className="btn" id="clearInvoice" style={{ background: "#6b7280" }}>Hủy</button>
            <button className="btn" id="deleteInvoice" style={{ background: "#ef4444", display: "none" }}>Xóa</button>
          </div>
        </div>
      </div>
    );
  }
}

export default Invoices;
import React from "react";

interface Props {
  activeSection: string;
  onChange: (section: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Tổng quan" },
  { id: "containers", label: "Quản lý Container" },
  { id: "cargo", label: "Hàng trong Container" },
  { id: "transport", label: "Vận tải" },
  { id: "finance", label: "Tài chính & Chi phí" },
  { id: "contracts", label: "Hợp đồng" },
  { id: "invoices", label: "Hóa đơn" },
  { id: "partners", label: "Khách hàng & Đối tác" },
  { id: "staff", label: "Nhân sự" },
  { id: "vehicles", label: "Phương tiện" },
];

class Sidebar extends React.Component<Props> {
  render() {
    return (
      <aside className="sidebar">
        <div className="brand">
          Container Logistics
        </div>

        <nav className="nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-button ${this.props.activeSection === item.id ? "active" : ""}`}
              onClick={() => this.props.onChange(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    );
  }
}

export default Sidebar;
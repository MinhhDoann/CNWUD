import { useState } from 'react';

const menu = [
  { id: 'dashboard', label: 'Tổng quan' },
  { id: 'containers', label: 'Quản lý Container' },
  { id: 'cargo', label: 'Hàng trong Container' },
  { id: 'transport', label: 'Vận tải' },
  { id: 'finance', label: 'Tài chính & Chi phí' },
  { id: 'contracts', label: 'Hợp đồng' },
  { id: 'invoices', label: 'Hóa đơn' },
  { id: 'partners', label: 'Khách hàng & Đối tác' },
  { id: 'staff', label: 'Nhân sự' },
];

interface Props { active: string; onChange: (id: string) => void; }

export default function Sidebar({ active, onChange }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">Container Logistics - Quản lý</div>
      <ul className="nav">
        {menu.map(item => (
          <li key={item.id}>
            <button
              className={active === item.id ? 'active' : ''}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div style={{ position: 'absolute', bottom: '18px', left: '20px', fontSize: '13px', opacity: 0.9 }}>
        Container Logistic
      </div>
    </aside>
  );
}
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (role: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password || !role) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    // Kiểm tra tài khoản cụ thể theo yêu cầu
    if (username === 'doan3' && password === '1') {
      onLogin(role);
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              placeholder="Nhập tên đăng nhập" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              placeholder="Nhập mật khẩu" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Vai trò</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">-- Chọn vai trò --</option>
              <option value="admin">Quản trị viên</option>
              <option value="staff">Nhân viên vận hành</option>
              <option value="manager">Quản lý kho</option>
            </select>
          </div>
          <button type="submit" className="login-btn">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
};

export default Login;

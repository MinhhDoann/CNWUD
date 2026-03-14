// src/App.tsx (sửa lại)
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';   // ← sửa dòng này

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <div className="app">
      <Sidebar active={activeSection} onChange={setActiveSection} />
      <main className="content">
        {activeSection === 'dashboard' && <Dashboard />}
        {/* Sau này thêm: activeSection === 'containers' && <ContainersPage /> */}
      </main>
    </div>
  );
}

export default App;
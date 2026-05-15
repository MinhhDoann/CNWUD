import React from "react";

import Sidebar from "./components/Sidebar";
import Staffs from "./pages/Staff";
import Partners from "./pages/Partners";
import Dashboard from "./pages/Dashboard";
import Containers from "./pages/Containers";
import Cargos from "./pages/Cargos";
import Transport from "./pages/Transport";
import Finance from "./pages/Finance";
import Vehicles from "./pages/Vehicles";
import Contracts from "./pages/Contracts";
import Invoices from "./pages/Invoices";
import Login from "./pages/Login";

class App extends React.Component {
  state = {
    activeSection: "dashboard",
    isLoggedIn: false,
    userRole: ""
  };

  changeSection = (section: string) => {
    this.setState({ activeSection: section });
  };

  handleLogin = (role: string) => {
    this.setState({
      isLoggedIn: true,
      userRole: role,
      activeSection: "dashboard"
    });
  };

  handleLogout = () => {
    this.setState({ isLoggedIn: false, userRole: "" });
  };

  render() {
    const { isLoggedIn, activeSection } = this.state;

    if (!isLoggedIn) {
      return <Login onLogin={this.handleLogin} />;
    }

    return (
      <div className="app">
        <div className="main-layout">
          <Sidebar
            activeSection={activeSection}
            onChange={this.changeSection}
          />

          <main className="content">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button onClick={this.handleLogout} className="btn" style={{ background: '#64748b' }}>
                Đăng xuất
              </button>
            </div>

            {activeSection === "dashboard" && <Dashboard />}
            {activeSection === "containers" && <Containers />}
            {activeSection === "cargo" && <Cargos />}
            {activeSection === "transport" && <Transport />}
            {activeSection === "contracts" && <Contracts />}
            {activeSection === "invoices" && <Invoices />}
            {activeSection === "finance" && <Finance />}
            {activeSection === "partners" && <Partners />}
            {activeSection === "staff" && <Staffs />}
            {activeSection === "vehicles" && <Vehicles />}
          </main>
        </div>
      </div>
    );
  }
}

export default App;
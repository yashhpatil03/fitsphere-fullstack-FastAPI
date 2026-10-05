import Sidebar from "../components/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="fs-layout">
      <Sidebar />
      <div className="fs-main">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;

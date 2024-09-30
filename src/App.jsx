import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';

function App() {
  return (
    <>
      <Sidebar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default App;

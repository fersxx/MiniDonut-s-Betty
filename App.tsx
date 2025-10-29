import React, { useContext } from 'react';
import { AppContext, View } from './context/AppContext';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientLogin from './components/client/ClientLogin';
import ClientRegister from './components/client/ClientRegister';
import ClientShop from './components/client/ClientShop';
import UserProfile from './components/client/UserProfile';
import ShoppingCart from './components/client/ShoppingCart';
import ClientHeader from './components/client/ClientHeader';

const App: React.FC = () => {
  const { state } = useContext(AppContext);

  const renderClientView = () => {
    if (!state.currentUser) {
       switch (state.currentView) {
        case View.CLIENT_LOGIN:
          return <ClientLogin />;
        case View.CLIENT_REGISTER:
          return <ClientRegister />;
        default:
          return <LandingPage />;
      }
    }

    return (
      <div className="min-h-screen">
        <ClientHeader />
        <main className="p-4 md:p-8">
          {state.currentView === View.CLIENT_SHOP && <ClientShop />}
          {state.currentView === View.CLIENT_PROFILE && <UserProfile />}
          {state.currentView === View.CLIENT_CART && <ShoppingCart />}
        </main>
      </div>
    );
  };
  
  const renderView = () => {
    switch (state.currentView) {
      case View.LANDING:
        return <LandingPage />;
      case View.ADMIN_LOGIN:
        return <AdminLogin />;
      case View.ADMIN_DASHBOARD:
        return <AdminDashboard />;
      case View.CLIENT_LOGIN:
      case View.CLIENT_REGISTER:
      case View.CLIENT_SHOP:
      case View.CLIENT_PROFILE:
      case View.CLIENT_CART:
        return renderClientView();
      default:
        return <LandingPage />;
    }
  };

  return <div className="bg-amber-50 min-h-screen">{renderView()}</div>;
};

export default App;
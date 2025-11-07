import React, { useContext } from 'react';
import { AppContext, View } from './context/AppContext';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientLogin from './components/client/ClientLogin';
import ClientRegister from './components/client/ClientRegister';
import ClientShop from './components/client/ClientShop';
import UserProfile from './components/client/UserProfile';
import ShoppingCart from './components/client/ShoppingCart';
import ClientHeader from './components/client/ClientHeader';
import ClientOffers from './components/client/ClientOffers';
import ClientGallery from './components/client/ClientGallery';
import Logo from './components/Logo';

const App: React.FC = () => {
  const { state } = useContext(AppContext);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-amber-50">
        <Logo className="h-24 w-24 animate-pulse" />
      </div>
    );
  }

  const renderClientView = () => {
    // If user is logged in, show the main client area
    if (state.currentUser) {
       // Admin users are immediately redirected, this is for clients
       return (
         <div className="min-h-screen">
           <ClientHeader />
           <main className="p-4 md:p-8">
             {state.currentView === View.CLIENT_SHOP && <ClientShop />}
             {state.currentView === View.CLIENT_PROFILE && <UserProfile />}
             {state.currentView === View.CLIENT_CART && <ShoppingCart />}
             {state.currentView === View.CLIENT_OFFERS && <ClientOffers />}
             {state.currentView === View.CLIENT_GALLERY && <ClientGallery />}
           </main>
         </div>
       );
    }
    
    // If no user, show login/register or landing
    switch (state.currentView) {
      case View.CLIENT_LOGIN:
        return <ClientLogin />;
      case View.CLIENT_REGISTER:
        return <ClientRegister />;
      default:
        return <LandingPage />;
    }
  };
  
  const renderView = () => {
    if (state.currentUser) {
      if (state.currentUser.role === 'admin') {
        return <AdminDashboard />;
      }
      // Logged-in clients default to the shop view
      // The specific view is handled by renderClientView based on state.currentView
      return renderClientView();
    }

    // Not logged in
    switch (state.currentView) {
      case View.CLIENT_LOGIN:
        return <ClientLogin />;
      case View.CLIENT_REGISTER:
        return <ClientRegister />;
      case View.LANDING:
      default:
        return <LandingPage />;
    }
  };

  return <div className="bg-amber-50 min-h-screen">{renderView()}</div>;
};

export default App;
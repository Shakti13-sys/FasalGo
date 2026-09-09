import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, ThemeProvider } from '@/context/AppContext';
import { FarmerLayout } from '@/layouts/FarmerLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/farmer/Dashboard';
import VisitPlanner from '@/pages/farmer/VisitPlanner';
import FindCentre from '@/pages/farmer/FindCentre';
import BookSlot from '@/pages/farmer/BookSlot';
import LiveQueue from '@/pages/farmer/LiveQueue';
import Heatmap from '@/pages/farmer/Heatmap';
import Procurement from '@/pages/farmer/Procurement';
import Payment from '@/pages/farmer/Payment';
import Notifications from '@/pages/farmer/Notifications';
import AdminOverview from '@/pages/admin/Overview';
import AdminCentres from '@/pages/admin/Centres';
import AdminBottlenecks from '@/pages/admin/Bottlenecks';
import AdminForecast from '@/pages/admin/Forecast';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <FarmerLayout>
                <Dashboard />
              </FarmerLayout>
            }
          />
          <Route
            path="/visit-planner"
            element={
              <FarmerLayout>
                <VisitPlanner />
              </FarmerLayout>
            }
          />
          <Route
            path="/find-centre"
            element={
              <FarmerLayout>
                <FindCentre />
              </FarmerLayout>
            }
          />
          <Route
            path="/book-slot"
            element={
              <FarmerLayout>
                <BookSlot />
              </FarmerLayout>
            }
          />
          <Route
            path="/live-queue"
            element={
              <FarmerLayout>
                <LiveQueue />
              </FarmerLayout>
            }
          />
          <Route
            path="/heatmap"
            element={
              <FarmerLayout>
                <Heatmap />
              </FarmerLayout>
            }
          />
          <Route
            path="/procurement"
            element={
              <FarmerLayout>
                <Procurement />
              </FarmerLayout>
            }
          />
          <Route
            path="/payment"
            element={
              <FarmerLayout>
                <Payment />
              </FarmerLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <FarmerLayout>
                <Notifications />
              </FarmerLayout>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminOverview />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/centres"
            element={
              <AdminLayout>
                <AdminCentres />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/bottlenecks"
            element={
              <AdminLayout>
                <AdminBottlenecks />
              </AdminLayout>
            }
          />
          <Route
            path="/admin/forecast"
            element={
              <AdminLayout>
                <AdminForecast />
              </AdminLayout>
            }
          />
        </Routes>
      </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;

// file: dashboard/pages/_app.js
import '../styles/globals.css'; // Adjust path if needed
import DashboardLayout from '../components/DashboardLayout';

function MyApp({ Component, pageProps }) {
  return (
    <DashboardLayout>
      <Component {...pageProps} />
    </DashboardLayout>
  );
}

export default MyApp;
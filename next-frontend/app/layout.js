import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'LIB-MAN Enterprise | Next-Gen Library Management System',
  description: 'Production-ready cloud-enabled Library Management System for universities and institutions.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-slate-50 text-slate-900">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

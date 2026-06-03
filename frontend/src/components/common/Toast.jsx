import { toast } from 'react-hot-toast';

export const toastConfig = {
  style: {
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid #334155',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#1e293b',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#1e293b',
    },
  },
};

export default toast;

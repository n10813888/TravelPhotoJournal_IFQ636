import React, { createContext, useCallback, useContext, useState } from 'react';

const AlertContext = createContext({ showAlert: () => {} });

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((message, title = 'Notice') => {
    setAlert({ message, title });
  }, []);

  const close = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6"
          >
            <h2 className="text-lg font-semibold mb-2">{alert.title}</h2>
            <p className="text-gray-700 mb-6">{alert.message}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                className="px-4 py-2 rounded-lg bg-black text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);

import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-galaxy-900 text-white bg-galaxy-pattern bg-cover bg-center bg-no-repeat bg-blend-overlay bg-fixed overflow-x-hidden">
      <div className="min-h-screen flex flex-col backdrop-blur-[2px] bg-black/30">
        <div className="flex-grow">
          {children}
        </div>
        <footer className="w-full py-6 text-center border-t border-white/10 bg-galaxy-900/50 backdrop-blur-md mt-auto">
          <p className="text-sm text-gray-400">
            Copyright &copy; {currentYear} Winner's Corporation. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
};

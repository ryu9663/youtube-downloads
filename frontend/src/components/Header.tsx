import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-[16px] py-[16px]">
        <h1 className="text-[20px] font-bold text-gray-800">YouTube Downloader</h1>
      </div>
    </header>
  );
};

export default Header;
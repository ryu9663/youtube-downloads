import React from 'react';

const DownloadPage: React.FC = () => {
  return (
    <div className="container mx-auto px-[16px] py-[32px]">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-[24px]">
        <h1 className="text-[24px] font-bold text-center mb-[24px]">다운로드 진행 중...</h1>
        
        <div className="space-y-[16px]">
          <div>
            <div className="text-[14px] text-gray-600 mb-[8px]">
              제목: Rick Astley - Never Gonna Give You Up Official Vid
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-[10px] mb-[8px]">
              <div className="bg-blue-600 h-[10px] rounded-full w-[75%]"></div>
            </div>
            
            <div className="text-center text-[14px] text-gray-600">
              75% - 변환 중...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
import React from 'react';

const CompletePage: React.FC = () => {
  return (
    <div className="container mx-auto px-[16px] py-[32px]">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-[24px]">
        <h1 className="text-[24px] font-bold text-center mb-[24px] text-green-600">다운로드 완료!</h1>
        
        <div className="space-y-[16px]">
          <div className="text-center">
            <div className="text-[14px] text-gray-600 mb-[8px]">
              파일명: video_title.mp3
            </div>
            <div className="text-[14px] text-gray-600 mb-[16px]">
              크기: 3.27MB
            </div>
            
            <button className="w-full bg-green-500 text-white py-[8px] px-[16px] rounded-md hover:bg-green-600 transition-colors mb-[16px]">
              📥 다운로드
            </button>
            
            <button className="w-full bg-blue-500 text-white py-[8px] px-[16px] rounded-md hover:bg-blue-600 transition-colors">
              새 다운로드
            </button>
            
            <div className="text-center text-[14px] text-gray-600 mt-[16px]">
              남은 횟수: 4/5
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletePage;
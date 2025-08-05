import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-[32px]">
      <div className="container mx-auto px-[16px] py-[16px] text-center">
        <p className="text-[12px] text-gray-500">
          ⚠️ 본 서비스는 개인적, 교육적 목적으로만 사용 가능합니다.
        </p>
        <p className="text-[12px] text-gray-500">
          저작권이 보호되는 콘텐츠의 무단 복제 및 배포는 금지됩니다.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
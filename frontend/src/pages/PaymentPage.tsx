import React from 'react';

const PaymentPage: React.FC = () => {
  return (
    <div className="container mx-auto px-[16px] py-[32px]">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-[24px]">
        <h1 className="text-[24px] font-bold text-center mb-[24px]">무료 다운로드 소진</h1>
        
        <div className="space-y-[16px]">
          <div className="text-center text-[16px] text-gray-700 mb-[24px]">
            추가 다운로드를 위해 결제가 필요합니다.
          </div>
          
          <div className="text-center text-[20px] font-bold text-blue-600 mb-[24px]">
            10회 다운로드: $9
          </div>
          
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-[8px]">
              결제 수단:
            </label>
            <div className="space-y-[8px]">
              <label className="flex items-center">
                <input type="radio" name="payment" value="card" defaultChecked className="mr-[8px]" />
                신용카드
              </label>
              <label className="flex items-center">
                <input type="radio" name="payment" value="paypal" className="mr-[8px]" />
                PayPal
              </label>
            </div>
          </div>
          
          <button className="w-full bg-blue-500 text-white py-[12px] px-[16px] rounded-md hover:bg-blue-600 transition-colors text-[16px] font-medium">
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
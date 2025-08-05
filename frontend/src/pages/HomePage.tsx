import React from "react";
import { useForm } from "react-hook-form";

interface FormData {
  youtubeUrl: string;
  format: "mp3" | "mp4";
}

const HomePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      youtubeUrl: "",
      format: "mp3",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log("Form submitted:", data);
      // TODO: Implement actual download logic here
      // For now, just log the data
      alert(`다운로드 요청: ${data.youtubeUrl} (${data.format})`);
      reset();
    } catch (error) {
      console.error("Download error:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="container mx-auto px-[16px] py-[32px]">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-[24px]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-[16px]">
          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-[8px]">
              YouTube URL 입력
            </label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full px-[12px] py-[8px] border rounded-md focus:outline-none focus:ring-[2px] focus:ring-blue-500 ${
                errors.youtubeUrl
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              {...register("youtubeUrl", {
                required: "YouTube URL을 입력해주세요",
                pattern: {
                  value: /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
                  message: "올바른 YouTube URL을 입력해주세요",
                },
              })}
            />
            {errors.youtubeUrl && (
              <p className="mt-[4px] text-[12px] text-red-500">
                {errors.youtubeUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[14px] font-medium text-gray-700 mb-[8px]">
              포맷 선택
            </label>
            <div className="flex space-x-[16px]">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="mp3"
                  className="mr-[8px]"
                  {...register("format")}
                />
                MP3
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="mp4"
                  className="mr-[8px]"
                  {...register("format")}
                />
                MP4
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-[8px] px-[16px] rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "처리 중..." : "다운로드"}
          </button>

          <div className="text-center text-[14px] text-gray-600">
            남은 다운로드: 5/5 (무료)
          </div>
        </form>
      </div>
    </div>
  );
};

export default HomePage;

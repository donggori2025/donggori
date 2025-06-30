import React from "react";

interface ContentCardProps {
  title: string;
  description: string;
  imageUrl?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ title, description, imageUrl }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-start">
    {imageUrl && (
      <img src={imageUrl} alt={title} className="w-full h-40 object-cover rounded-xl mb-4" />
    )}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    <button className="mt-auto bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
      자세히 보기
    </button>
  </div>
);

export default ContentCard;
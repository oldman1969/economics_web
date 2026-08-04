import { useState } from 'react';
import { ECONOMIC_MACHINE_VIDEO_ID, ECONOMIC_KEY_POINTS } from '@/utils/constants';
import { ChevronDown, ChevronUp, Video } from 'lucide-react';

export default function EconomicMachine() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          经济机器是怎样运行的
        </h1>
        <p className="text-gray-500">
          How The Economic Machine Works — by Ray Dalio / Bridgewater Associates
        </p>
      </div>

      {/* Video */}
      <div className="card mb-10 overflow-hidden p-0">
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ECONOMIC_MACHINE_VIDEO_ID}`}
            title="How The Economic Machine Works"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Key points */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">核心知识点</h2>
      <div className="space-y-4">
        {ECONOMIC_KEY_POINTS.map((point, i) => (
          <div key={i} className="card">
            <button
              onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
              className="w-full flex items-start justify-between gap-4 text-left"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">{point.title}</h3>
                </div>
                <p className="text-gray-600 text-sm ml-8">{point.summary}</p>
              </div>
              {expandedIndex === i ? (
                <ChevronUp size={20} className="text-gray-400 flex-shrink-0 mt-1" />
              ) : (
                <ChevronDown size={20} className="text-gray-400 flex-shrink-0 mt-1" />
              )}
            </button>
            {expandedIndex === i && (
              <div className="mt-4 ml-8 pl-4 border-l-2 border-blue-200">
                <p className="text-gray-600 text-sm leading-relaxed">{point.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Attribution */}
      <div className="mt-8 flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <Video size={20} className="text-red-500 flex-shrink-0" />
        <p className="text-sm text-gray-500">
          视频来源：Bridgewater Associates（桥水基金）。本页面仅用于教育学习目的。
        </p>
      </div>
    </div>
  );
}

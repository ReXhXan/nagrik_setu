import React from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp } from 'lucide-react';

export const IssueCard = ({ report }) => {
  const statusColors = {
    Reported: 'bg-red-100 text-red-800 border-red-200',
    InProgress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Resolved: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <Link to={`/report/${report.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex h-32">
        <div className="w-32 h-full flex-shrink-0">
          <img src={report.photoUrl} alt="Issue" className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex flex-col justify-between flex-grow">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                {report.user ? (
                  <img src={report.user.avatar} alt="User" className="w-6 h-6 rounded-full border border-gray-200" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold border border-gray-300">
                    A
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight">{report.category}</h3>
                  <p className="text-[10px] text-gray-500">{report.user ? report.user.name : 'Anonymous'}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[report.status] || statusColors.Reported}`}>
                {report.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1">
              {report.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span className="flex items-center">
              <ThumbsUp size={14} className="mr-1" /> {report.upvotes}
            </span>
            <span>Routed: {report.routedTo?.department || 'Unknown'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

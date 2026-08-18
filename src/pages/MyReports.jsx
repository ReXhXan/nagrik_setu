import React, { useEffect, useState } from 'react';
import { fetchReports } from '../firebase/db';
import { IssueCard } from '../components/IssueCard';
import { useAuth } from '../context/AuthContext';

export const MyReports = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchReports();
      // Filter by current user (or the fallback demo user)
      const userId = currentUser?.uid || 'anonymous_user';
      const myData = data.filter(r => r.reportedBy === userId);
      setReports(myData);
      setLoading(false);
    };
    // Even if currentUser is null, we can load 'anonymous_user' demo reports
    loadReports();
  }, [currentUser]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your reports...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">My Submitted Reports</h2>
      
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map(report => (
            <IssueCard key={report.id} report={report} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            You haven't submitted any reports yet.
          </div>
        )}
      </div>
    </div>
  );
};

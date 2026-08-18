import React, { useEffect, useState } from 'react';
import { fetchReports } from '../firebase/db';
import { IssueCard } from '../components/IssueCard';

export const Feed = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReports();
        setReports(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  const filteredReports = reports.filter(r => {
    if (filterCategory !== 'All' && r.category !== filterCategory) return false;
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  const categories = ['All', 'Pothole', 'Waterlogging', 'Streetlight', 'Garbage', 'StrayAnimal', 'SewageLeak', 'WaterLeak', 'Other'];
  const statuses = ['All', 'Reported', 'InProgress', 'Resolved'];

  if (loading) return <div className="p-8 text-center text-gray-500">Loading feed...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Recent Issues</h2>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map(report => (
            <IssueCard key={report.id} report={report} />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            No issues found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};

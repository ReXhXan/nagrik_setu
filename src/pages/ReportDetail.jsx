import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport, upvoteReport } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { ArrowLeft, MapPin, Mail, ThumbsUp } from 'lucide-react';
import L from 'leaflet';

export const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const data = await getReport(id);
      setReport(data);
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  const handleUpvote = async () => {
    if (!currentUser || report.upvotedBy.includes(currentUser.uid)) return;
    await upvoteReport(id, currentUser.uid);
    setReport({
      ...report,
      upvotes: report.upvotes + 1,
      upvotedBy: [...report.upvotedBy, currentUser.uid]
    });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
  if (!report) return <div className="p-8 text-center text-gray-500">Report not found.</div>;

  const hasUpvoted = report.upvotedBy.includes(currentUser?.uid);
  
  const statusColors = {
    Reported: 'bg-red-100 text-red-800',
    InProgress: 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800'
  };

  const icon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 bg-white min-h-[calc(100vh-4rem)]">
      <button onClick={() => navigate(-1)} className="flex items-center text-pink-600 mb-4 font-medium">
        <ArrowLeft size={20} className="mr-1" /> Back
      </button>

      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-6">
        <img src={report.photoUrl} alt="Issue" className="w-full h-64 object-cover" />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{report.category}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[report.status] || statusColors.Reported}`}>
            Status: {report.status}
          </span>
        </div>
        <button 
          onClick={handleUpvote}
          disabled={hasUpvoted}
          className={`flex items-center flex-col p-2 rounded-lg border ${hasUpvoted ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <ThumbsUp size={24} className={hasUpvoted ? 'fill-current' : ''} />
          <span className="text-sm font-bold mt-1">{report.upvotes}</span>
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
          {report.description || 'No additional description provided.'}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <MapPin size={20} className="mr-2" /> Location
        </h3>
        <div className="h-48 rounded-lg overflow-hidden border border-gray-200 z-0 relative">
          {report.location && (
            <MapContainer 
              center={[report.location.lat, report.location.lng]} 
              zoom={16} 
              scrollWheelZoom={false} 
              className="h-full w-full z-0"
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[report.location.lat, report.location.lng]} icon={icon} />
            </MapContainer>
          )}
        </div>
      </div>

      <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
        <h3 className="text-lg font-semibold text-pink-900 mb-2">Routing Details</h3>
        <p className="text-pink-800 text-sm mb-2">
          This issue has been routed to: <br/>
          <strong>{report.routedTo?.officerName}</strong> ({report.routedTo?.department}, {report.routedTo?.email})
        </p>
        {report.emailSent && (
          <p className="flex items-center text-green-700 text-sm font-medium">
            <Mail size={16} className="mr-1" /> 📧 Notification sent to official
          </p>
        )}
      </div>
    </div>
  );
};

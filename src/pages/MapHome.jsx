import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Plus } from 'lucide-react';
import { fetchReports } from '../firebase/db';
import { ReportModal } from '../components/ReportModal';
import { useNavigate } from 'react-router-dom';

// Custom icons based on status
const createIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const icons = {
  Reported: createIcon('red'),
  InProgress: createIcon('yellow'),
  Resolved: createIcon('green')
};

export const MapHome = () => {
  const [reports, setReports] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadReports = async () => {
    const data = await fetchReports();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      <MapContainer 
        center={[20.2961, 85.8245]} 
        zoom={13} 
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => (
          report.location && (
            <Marker 
              key={report.id} 
              position={[report.location.lat, report.location.lng]}
              icon={icons[report.status] || icons.Reported}
            >
              <Popup>
                <div className="w-48">
                  <img src={report.photoUrl} alt="Issue" className="w-full h-24 object-cover rounded mb-2" />
                  <h4 className="font-bold">{report.category}</h4>
                  <p className="text-sm mb-2">{report.status}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">↑ {report.upvotes} upvotes</span>
                    <button 
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="text-xs text-blue-600 font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>

      {!isModalOpen && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white rounded-full px-8 py-4 shadow-2xl hover:bg-blue-700 transition-colors flex items-center font-bold text-lg border-4 border-white"
        >
          <Plus size={24} className="mr-2" /> Report Issue
        </button>
      )}

      <ReportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onReportSuccess={loadReports}
      />
    </div>
  );
};

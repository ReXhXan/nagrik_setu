import React, { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, X, Upload } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { uploadPhoto } from '../firebase/storage';
import { submitReport } from '../firebase/db';
import { useAuth } from '../context/AuthContext';
import { getRoutingDetails } from '../utils/email';
import { categorizeIssueImage } from '../utils/gemini';

const CATEGORIES = ["Pothole", "Waterlogging", "Streetlight", "Garbage", "StrayAnimal", "SewageLeak", "WaterLeak", "Other"];

import L from 'leaflet';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customMarkerIcon}></Marker>
  );
}

export const ReportModal = ({ isOpen, onClose, onReportSuccess }) => {
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1); // 1: Location & Photo, 2: Details
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !location) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          (err) => console.error(err),
          { enableHighAccuracy: true }
        );
      } else {
        // Fallback to Bhubaneswar center if geo fails
        setLocation({ lat: 20.2961, lng: 85.8245 });
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo || !location) {
      setError("Photo and Location are required.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const reportData = {
        category,
        description,
        photoUrl: photoPreview,
        location: {
          lat: location.lat,
          lng: location.lng
        }
      };

      const userId = currentUser?.uid || 'anonymous_user';
      await submitReport(reportData, userId);

      alert("Report submitted successfully! Notification sent to authority.");

      onReportSuccess();
      resetAndClose();
    } catch (err) {
      console.error(err);
      setError("Failed to submit report. " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setPhoto(null);
    setPhotoPreview(null);
    setCategory(CATEGORIES[0]);
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">Report an Issue</h3>
          <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Add Photo (AI will auto-categorize)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handlePhotoCapture} 
                />
                
                {photoPreview ? (
                  <div className="relative rounded-lg overflow-hidden h-48 bg-gray-100 group">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="mr-2" /> Change Photo
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-pink-500 hover:text-pink-500 transition-colors"
                  >
                    <Camera size={32} className="mb-2" />
                    <span>Take Photo or Choose from Gallery</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin size={16} className="mr-1" /> 2. Confirm Location
                </label>
                <div className="h-48 rounded-lg overflow-hidden border border-gray-300">
                  {location ? (
                    <MapContainer center={location} zoom={16} scrollWheelZoom={false} className="h-full w-full">
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                      <LocationMarker position={location} setPosition={setLocation} />
                    </MapContainer>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500">
                      Finding your location...
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Drag the map to adjust pin position</p>
              </div>

              <button 
                onClick={async () => {
                  setLoading(true);
                  setError('');
                  try {
                    const detectedCategory = await categorizeIssueImage(photo, photoPreview);
                    setCategory(detectedCategory);
                    setStep(2);
                  } catch (err) {
                    console.error("AI classification error:", err);
                    setError("Failed to classify image. Proceeding with manual selection.");
                    setCategory("Other");
                    setStep(2);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={!photo || !location || loading}
                className="w-full py-3 bg-pink-600 text-black rounded-lg font-medium disabled:opacity-50 mt-4 flex justify-center items-center"
              >
                {loading ? '🤖 AI Analyzing Image...' : 'Next Step'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">3. Detected Issue Category</label>
                <div className="flex items-center justify-between p-3 bg-pink-50 border border-pink-100 rounded-lg">
                   <div className="flex items-center">
                     <span className="text-xl mr-2">🤖</span>
                     <span className="font-semibold text-pink-900">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                   </div>
                   <select 
                     value={category} 
                     onChange={(e) => setCategory(e.target.value)}
                     className="bg-transparent border-none text-sm text-pink-600 underline cursor-pointer focus:ring-0 p-0 font-medium"
                   >
                     {CATEGORIES.map(c => <option key={c} value={c}>Change to: {c.replace(/([A-Z])/g, ' $1').trim()}</option>)}
                   </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">Our AI automatically categorized this image. You can change it if it's incorrect.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">4. Description (Optional)</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4" 
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-pink-500 focus:border-pink-500 p-2 border"
                  placeholder="Add any extra details..."
                ></textarea>
              </div>

              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex-[2] py-3 bg-pink-600 text-black rounded-lg font-medium flex justify-center items-center"
                >
                  Review Draft Email
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                <h4 className="font-semibold text-pink-900 mb-2">Routing to Correct Authority:</h4>
                <div className="text-sm text-pink-800">
                  <p><strong>Department:</strong> {getRoutingDetails(category).department}</p>
                  <p><strong>Officer:</strong> {getRoutingDetails(category).officerName}</p>
                  <p><strong>Email:</strong> {getRoutingDetails(category).email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drafted Official Letter:</label>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono whitespace-pre-wrap">
{`To ${getRoutingDetails(category).officerName},
${getRoutingDetails(category).department},
Bhubaneswar Municipal Corporation.

Subject: Urgent Civic Issue - ${category.replace(/([A-Z])/g, ' $1').trim()}

Respected Sir/Madam,

I am writing to formally report an issue regarding ${category.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} at the attached coordinates. 
${description ? `\nAdditional details provided by the citizen:\n"${description}"\n` : ''}
Please review the attached photographic evidence and take necessary action at the earliest.

Sincerely,
Nagrik Setu Citizen Portal`}
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button 
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[2] py-3 bg-green-600 text-black rounded-lg font-medium flex justify-center items-center disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center"><Upload size={18} className="animate-bounce mr-2" /> Sending to BMC...</span>
                  ) : (
                    'Confirm & Send Letter'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

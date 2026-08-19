import { getRoutingDetails, sendNotificationEmail } from "../utils/email";

// HACKATHON DEMO BYPASS:
// Firebase is hanging due to missing rules/config. We are mocking all DB calls
// so the app runs smoothly for the pitch using an in-memory state.

const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// In-memory mock database (resets if you refresh the page)
let localReports = [
  {
    id: 'demo-1',
    category: 'Pothole',
    status: 'Reported',
    description: 'Massive pothole on the main road, causing traffic jams.',
    photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Pothole_in_the_road.jpg/640px-Pothole_in_the_road.jpg',
    upvotes: 42,
    upvotedBy: [],
    location: { lat: 20.2961, lng: 85.8245 },
    routedTo: { department: 'Roads & Engineering', officerName: "Sri Janardan Tahasildar (Executive Engineer, Div I)", email: "ee1@bmc.gov.in" },
    reportedBy: 'demo-user-id',
    reportedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    user: { name: 'Rahul S.', avatar: 'https://i.pravatar.cc/150?img=11' }
  },
  {
    id: 'demo-2',
    category: 'Garbage',
    status: 'InProgress',
    description: 'Overflowing dustbin for 3 days near the market.',
    photoUrl: 'https://cdn.pixabay.com/photo/2014/12/11/17/08/garbage-564536_960_720.jpg',
    upvotes: 18,
    upvotedBy: [],
    location: { lat: 20.2940, lng: 85.8200 },
    routedTo: { department: 'Sanitation', officerName: "Sri N Ganesh Babu (Dy. Commissioner City Sanitation)", email: "dc-sanitation@bmc.gov.in" },
    reportedBy: 'demo-user-id',
    reportedAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    user: { name: 'Priya M.', avatar: 'https://i.pravatar.cc/150?img=5' }
  },
  {
    id: 'demo-3',
    category: 'Streetlight',
    status: 'Resolved',
    description: 'Streetlight is broken, street is completely dark at night.',
    photoUrl: 'https://cdn.pixabay.com/photo/2016/11/29/03/52/bulb-1867187_960_720.jpg',
    upvotes: 56,
    upvotedBy: [],
    location: { lat: 20.3000, lng: 85.8300 },
    routedTo: { department: 'Electrical', officerName: "Er. Varsha Pradhan (Executive Engineer, Electrical)", email: "ae-elect@bmc.gov.in" },
    reportedBy: 'demo-user-id',
    reportedAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    user: { name: 'Amit K.', avatar: 'https://i.pravatar.cc/150?img=12' }
  }
];

export const submitReport = async (reportData, userId) => {
  await mockDelay();
  const newId = `demo-new-id-${Date.now()}`;
  
  const newReport = {
    ...reportData,
    id: newId,
    status: "Reported",
    reportedBy: userId,
    reportedAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: [],
    routedTo: getRoutingDetails(reportData.category),
    emailSent: false,
    user: { name: 'You (Demo)', avatar: 'https://i.pravatar.cc/150?img=68' }
  };

  // Add to the beginning of the array so it shows up first!
  localReports = [newReport, ...localReports];

  return { status: "created", id: newId };
};

export const fetchReports = async () => {
  await mockDelay();
  return localReports;
};

export const getReport = async (id) => {
  await mockDelay();
  return localReports.find(r => r.id === id) || null;
};

export const upvoteReport = async (reportId, userId) => {
  await mockDelay();
  localReports = localReports.map(r => {
    if (r.id === reportId) {
      const upvotedBy = r.upvotedBy || [];
      if (upvotedBy.includes(userId)) {
        return {
          ...r,
          upvotes: Math.max(0, r.upvotes - 1),
          upvotedBy: upvotedBy.filter(uid => uid !== userId)
        };
      } else {
        return {
          ...r,
          upvotes: r.upvotes + 1,
          upvotedBy: [...upvotedBy, userId]
        };
      }
    }
    return r;
  });
};

export const updateReportStatus = async (reportId, newStatus) => {
  await mockDelay();
  localReports = localReports.map(r => 
    r.id === reportId ? { ...r, status: newStatus } : r
  );
};

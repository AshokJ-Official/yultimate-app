'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function LiveUpdatesBanner({ tournamentId }) {
  const [latestUpdate, setLatestUpdate] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!tournamentId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join-tournament', tournamentId);
    
    newSocket.on('new-update', (update) => {
      if (update.priority === 'high' || update.priority === 'urgent') {
        setLatestUpdate(update);
        setIsVisible(true);
        
        // Auto-hide after 10 seconds for non-urgent updates
        if (update.priority !== 'urgent') {
          setTimeout(() => setIsVisible(false), 10000);
        }
      }
    });

    return () => newSocket.close();
  }, [tournamentId]);

  if (!isVisible || !latestUpdate) return null;

  const getBannerColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getBannerColor(latestUpdate.priority)} p-3 shadow-lg`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="animate-pulse">🔴</div>
          <div>
            <span className="font-semibold">{latestUpdate.title}</span>
            <span className="ml-2">{latestUpdate.message}</span>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-gray-200 text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
}
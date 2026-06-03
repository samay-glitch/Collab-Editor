import React from 'react';

export default function PresenceBar({ users = [] }) {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex -space-x-2 overflow-hidden mr-1.5 md:mr-3">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className="inline-block h-6 w-6 md:h-7 md:w-7 rounded-full ring-2 ring-dark-800 bg-primary-700 text-primary-100 flex items-center justify-center text-[10px] md:text-xs font-bold uppercase cursor-default"
            title={user.userName}
          >
            {user.userName.charAt(0)}
          </div>
        ))}
        {users.length > 5 && (
          <div className="inline-block h-6 w-6 md:h-7 md:w-7 rounded-full ring-2 ring-dark-800 bg-dark-600 text-dark-200 flex items-center justify-center text-[10px] font-bold cursor-default">
            +{users.length - 5}
          </div>
        )}
      </div>
      <span className="text-[10px] md:text-xs font-medium text-dark-400 whitespace-nowrap">
        {users.length} user{users.length !== 1 ? 's' : ''} editing
      </span>
    </div>
  );
}

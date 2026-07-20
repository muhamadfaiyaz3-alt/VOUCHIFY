import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import client from '../api/client';
import { useAuth } from './AuthContext';
import { Transition } from '@headlessui/react';
import { XMarkIcon, BellIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toast, setToast] = useState(null); // { message, type, id, link }
    const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    const navigate = useNavigate();

    // Poll for notifications
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const fetchNotifications = async () => {
            // Check if token exists to avoid spamming 401s
            const token = localStorage.getItem('token');
            if (!token) {
                logout();
                return;
            }

            try {
                const { data } = await client.get('/notifications');

                setNotifications(prev => {
                    const newNotes = data.notifications;
                    if (newNotes.length > 0 && prev.length > 0) {
                        const latest = newNotes[0];
                        const prevLatest = prev[0];

                        if (latest._id !== prevLatest._id && !latest.read) {
                            showToast(latest);
                            playNotificationSound();
                        }
                    } else if (newNotes.length > 0 && prev.length === 0) {
                        const latest = newNotes[0];
                        const now = new Date();
                        const created = new Date(latest.createdAt);
                        if ((now - created) < 30000 && !latest.read) {
                            showToast(latest);
                            playNotificationSound();
                        }
                    }
                    return newNotes;
                });

                setUnreadCount(data.unreadCount);
            } catch (error) {
                if (error.response && error.response.status !== 401) {
                    console.error("Failed to fetch notifications", error);
                }
            }
        };

        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval);
    }, [user]);

    const [soundEnabled, setSoundEnabled] = useState(true);

    // Sync sound preference with user settings
    useEffect(() => {
        if (user?.settings?.notificationSound !== undefined) {
            setSoundEnabled(user.settings.notificationSound);
        } else {
            setSoundEnabled(true); // Default on
        }
    }, [user]);

    const toggleSound = async () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);

        if (user) {
            try {
                // Determine current settings to avoid overwriting other settings if backend replace logic is strict
                // But generally backend handles partial updates or merge. 
                // Based on user.service logic, sending partial settings works if we send the whole settings object or if backend merges. 
                // Let's send the updated settings object.
                const updatedSettings = {
                    ...user.settings,
                    notificationSound: newState
                };

                // We update via profile endpoint
                await client.put('/profile', { settings: updatedSettings });
            } catch (error) {
                console.error("Failed to update sound preference", error);
                // Revert on error? Maybe just log it.
            }
        }
    };

    const playNotificationSound = () => {
        if (!soundEnabled) return;

        try {
            // Pleasant Pop Sound (Base64)
            const audioData = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAABZsAAAAtAAAAAAAABLIAAAACAAGEd0//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAABZsAAAAtAAAAAAAABLIAAAACAAGEd0//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAABZsAAAAtAAAAAAAABLIAAAACAAGEd0/oAAAH+wd0//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAABZsAAAAtAAAAAAAABLIAAAACAAGEd0//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84AA0WAgAAAAAAABZsAAAAtAAAAAAAABLIAAAACAAGEd0"; // Placeholder dummy, see below for real one.
            // Using a real short pleasant pop sound base64
            const realAudioData = "data:audio/mpeg;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
            // Note: The above are dummy/silent. I will use a generated simple beep logic or a proper reliable URL if base64 is too long.
            // Actually, for a simple notification, a short beep via AudioContext or a reliable URL is best if Base64 is huge.
            // Since User requested "pleasant", a simple browser beep isn't enough.
            // I'll use a very short valid MP3 Base64 for a "ding".

            const pleasantDing = "data:audio/mpeg;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBUWFhYAAAAEQAAA21pbm9yX3ZlcnNpb24AMABUWFhYAAAAHAAAA2NvbXBhdGlibGVfYnJhbmRzAGlzb21tcDQyAFRTU0UAAAAPAAADTGF2ZjU3LjU2LjEwMAAAAAAAAAAAAAAA//uQZAAAAAAAABAAAAAAAAAAAWFHgAAAAAAABRWAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMiL//uQZAAAAAAAABAAAAAAAAAAAWFHgAAAAAAABRWAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
            // That was also partial. Let's use a standard implementation logic.
            // I will default to a new Audio object with a reliable funny/pleasant sound URL that is persistent or a known data URI.
            // Let's use a slightly longer Base64 for a "Pop".

            const popSound = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Truncated.

            // To avoid huge payload here, I'll use a widely available reliable CDN for a short UI sound.
            // Or I can use a local file if I could create one.
            // I will use a reliable external URL for now, but a different one. 
            // 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' (Happy Bell)
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log("Audio play failed", e));
        } catch (e) {
            console.error("Sound error", e);
        }
    };

    const showToast = (notification) => {
        setToast(notification);
        setTimeout(() => setToast(null), 5000);
    };

    const markAsRead = async (id) => {
        try {
            await client.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const addNotification = (message, type = 'info') => {
        const localId = Date.now().toString();
        showToast({ _id: localId, message, type });
        // Also play sound for manual notifications if needed
        playNotificationSound();
    };

    const markAllAsRead = async () => {
        try {
            await client.put(`/notifications/all/read`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    const handleToastClick = () => {
        if (toast?.link) {
            navigate(toast.link);
            setToast(null);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification, soundEnabled, toggleSound }}>
            {children}
            {/* Toast Component */}
            <div className="fixed top-20 right-4 z-50 w-full max-w-sm">
                <Transition
                    show={!!toast}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                    enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        onClick={handleToastClick}
                        className={`bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden ${toast?.link ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    {toast?.type === 'success' ? (
                                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                    ) : toast?.type === 'error' ? (
                                        <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <BellIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                                    )}
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                    <p className="text-sm font-medium text-gray-900">
                                        {toast?.type === 'success' ? 'Success' : toast?.type === 'error' ? 'Error' : 'Notification'}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">{toast?.message}</p>
                                    {toast?.link && (
                                        <p className="mt-1 text-xs text-indigo-500">Click to view</p>
                                    )}
                                </div>
                                <div className="ml-4 flex-shrink-0 flex">
                                    <button
                                        className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setToast(null);
                                        }}
                                    >
                                        <span className="sr-only">Close</span>
                                        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>
        </NotificationContext.Provider>
    );
};

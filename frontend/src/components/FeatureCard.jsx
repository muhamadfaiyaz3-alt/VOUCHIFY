// src/components/FeatureCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, bgColor, title, description, buttonLabel, buttonLink, buttonIcon }) => {
    // Robust icon container styling:
    // If bgColor is provided, we assume it sets the background. We add specific text color handling.
    // If not, we use a beautiful default indigo theme.
    const containerClasses = bgColor
        ? `${bgColor} p-4 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`
        : `p-4 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-gray-200 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-indigo-500/10`;

    return (
        <div className="w-full h-full p-2 perspective-1000">
            <div className="group relative h-full flex flex-col p-8 rounded-3xl transition-all duration-500 ease-out 
                bg-white dark:bg-slate-900/60 
                border border-gray-100 dark:border-white/10
                hover:border-indigo-200 dark:hover:border-indigo-500/30 
                hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-900/30 
                hover:-translate-y-2 backdrop-blur-xl">

                {/* Decorative background gradient splash */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                {/* Icon Section */}
                <div className={`mx-auto mb-6 w-16 h-16 ${containerClasses}`}>
                    {/* Ensure icon has size and uses the text color defined in containerClasses */}
                    {icon && React.cloneElement(icon, { className: "w-8 h-8 text-current" })}
                </div>

                {/* Content Section */}
                <div className="text-center flex-grow z-10">
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-slate-400 leading-relaxed text-sm">
                        {description}
                    </p>
                </div>

                {/* Button Section */}
                {buttonLabel && buttonLink && (
                    <div className="mt-8 text-center pt-4 border-t border-gray-50 dark:border-white/5 z-10">
                        {buttonLink.startsWith('/') ? (
                            <Link
                                to={buttonLink}
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold 
                                    text-gray-700 dark:text-white bg-gray-50 dark:bg-slate-800 
                                    hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white 
                                    transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/25 group-hover:scale-105"
                            >
                                {buttonIcon && React.cloneElement(buttonIcon, { className: "h-4 w-4 mr-2" })}
                                {buttonLabel}
                            </Link>
                        ) : (
                            <a
                                href={buttonLink}
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold 
                                    text-gray-700 dark:text-white bg-gray-50 dark:bg-slate-800 
                                    hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white 
                                    transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-indigo-500/25 group-hover:scale-105"
                            >
                                {buttonIcon && React.cloneElement(buttonIcon, { className: "h-4 w-4 mr-2" })}
                                {buttonLabel}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeatureCard;
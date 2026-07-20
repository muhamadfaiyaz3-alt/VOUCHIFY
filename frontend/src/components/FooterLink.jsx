import React from 'react';
import { Link } from 'react-router-dom';

const FooterLink = ({ to, href, icon, label, isAnchor = false }) => {
    const commonClasses = "text-gray-400 hover:text-white transition duration-300 flex flex-col items-center text-sm";
    const content = (
        <>
            {React.cloneElement(icon, { className: "h-6 w-6 mb-1" })}
            {label}
        </>
    );

    return isAnchor ? (
        <a href={href} className={commonClasses}>{content}</a>
    ) : (
        <Link to={to} className={commonClasses}>{content}</Link>
    );
};

export default FooterLink;
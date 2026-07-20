import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import BackToHomeButton from "./BackToHomeButton";

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <ScrollToTop />
            <BackToHomeButton />
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;

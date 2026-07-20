import { useState, useEffect, Fragment } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";
import { useCart } from "../Contexts/CartContext";
import { useNotifications } from "../Contexts/NotificationContext";
import { Menu, Transition } from "@headlessui/react";
import ThemeToggle from "./ThemeToggle";


/* Icons */
import {
  HomeIcon,
  InformationCircleIcon,
  EnvelopeIcon,
  TicketIcon,
  UserPlusIcon,
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpTrayIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  BellIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from "@heroicons/react/24/outline";


/* ——————————————————————————————————————————— */
/* Re‑usable class helpers                                                     */
/* ——————————————————————————————————————————— */
// Enhanced base styles for desktop links
const baseDesktop =
  "inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out group relative overflow-hidden";
const activeDesktop = "bg-blue-600 text-white shadow-md transform scale-105";
const inactiveDesktop =
  "text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white hover:shadow-lg";

// Enhanced base styles for mobile links
const baseMobile =
  "block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 ease-in-out group";
const activeMobile = "bg-blue-600 text-white shadow-md";
const inactiveMobile =
  "text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white";

const cls = (isActive, base, on, off) => `${base} ${isActive ? on : off}`;


/* ——————————————————————————————————————————— */
/* Component                                                                    */
/* ——————————————————————————————————————————— */
export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const { cart } = useCart();
  const { unreadCount, notifications, markAsRead, markAllAsRead, soundEnabled, toggleSound } = useNotifications();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();


  /* close mobile drawer on route change */
  useEffect(() => setOpen(false), [pathname]);


  /* helpers */
  const desktopLink = (to, icon, label) => (
    <NavLink to={to} className={({ isActive }) =>
      cls(isActive, baseDesktop, activeDesktop, inactiveDesktop)
    }>
      {/* Hover effect background */}
      <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-full"></span>
      <span className="relative flex items-center z-10">
        {icon} <span className="ml-1">{label}</span>
      </span>
    </NavLink>
  );


  const mobileLink = (to, icon, label) => (
    <NavLink to={to} className={({ isActive }) =>
      cls(isActive, baseMobile, activeMobile, inactiveMobile)
    }>
      <span className="relative flex items-center">
        {icon} <span className="ml-2">{label}</span>
      </span>
    </NavLink>
  );


  const mobileButton = (onClick, icon, label, extraClasses = "") => (
    <button
      onClick={onClick}
      className={`${baseMobile} ${inactiveMobile} w-full text-left ${extraClasses}`}
    >
      <span className="relative flex items-center">
        {icon} <span className="ml-2">{label}</span>
      </span>
    </button>
  );


  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-xl border-b border-gray-100 dark:border-slate-700/50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & desktop main nav */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 text-blue-600 dark:text-blue-400 font-extrabold text-2xl mr-6 tracking-wide transform hover:scale-105 transition-transform duration-300"
            >
              Vouchify
            </Link>

            <div className="hidden md:block">
              <div className="ml-8 flex items-baseline space-x-3"> {/* Reduced space-x for more compact look */}
                {desktopLink("/", <HomeIcon className="h-5 w-5" />, "Home")}
                {desktopLink(
                  "/vouchers",
                  <TicketIcon className="h-5 w-5" />,
                  "Find Vouchers"
                )}
                {desktopLink(
                  "/about",
                  <InformationCircleIcon className="h-5 w-5" />,
                  "About"
                )}
                {desktopLink(
                  "/contact",
                  <EnvelopeIcon className="h-5 w-5" />,
                  "Contact"
                )}
              </div>
            </div>
          </div>


          {/* Desktop right‑side actions */}
          <div className="hidden md:block">
            <div className="ml-4 flex min-w-0 items-center gap-3">
              <ThemeToggle />
              {isLoggedIn ? (
                <>
                  {desktopLink(
                    "/cart",
                    <div className="relative inline-block">
                      <ShoppingCartIcon className="h-5 w-5" />
                      {cart.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-short">
                          {cart.length}
                        </span>
                      )}
                    </div>,
                    "Cart"
                  )}


                  {desktopLink(
                    "/list-voucher",
                    <ArrowUpTrayIcon className="h-5 w-5" />,
                    "Sell Vouchers"
                  )}


                  {/* Notification Bell & Dropdown */}
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 dark:focus:ring-offset-slate-900">
                      <span className="sr-only">View notifications</span>
                      <BellIcon className="h-6 w-6" aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      )}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-xl py-1 bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-96 overflow-y-auto transform scale-95 opacity-0 animate-scale-in">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => { e.preventDefault(); toggleSound(); }}
                              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
                            >
                              {soundEnabled ? <SpeakerWaveIcon className="h-4 w-4" /> : <SpeakerXMarkIcon className="h-4 w-4" />}
                            </button>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification._id}>
                              {({ active }) => (
                                <div
                                  onClick={() => {
                                    if (!notification.read) markAsRead(notification._id);
                                    if (notification.link) {
                                      navigate(notification.link);
                                    }
                                  }}
                                  className={`${active ? 'bg-gray-50 dark:bg-slate-700' : ''
                                    } ${!notification.read ? 'bg-blue-50 dark:bg-blue-950' : ''} px-4 py-3 border-b border-gray-100 dark:border-slate-700 cursor-pointer transition-colors block`}
                                >
                                  <div className="flex items-start">
                                    <div className={`flex-shrink-0 h-2.5 w-2.5 mt-1.5 rounded-full ${notification.type === 'success' ? 'bg-green-500' :
                                      notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                      }`} />
                                    <div className="ml-3 w-0 flex-1">
                                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {notification.message}
                                      </p>
                                      {notification.link && (
                                        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                                          View Details <span aria-hidden="true" className="ml-1 transition-transform group-hover:translate-x-1"> &rarr;</span>
                                        </p>
                                      )}
                                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>


                  {/* User Dropdown */}
                  <Menu as="div" className="relative ml-2">
                    {({ open }) => (
                      <>
                        <Menu.Button className="flex max-w-[170px] items-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 py-1 pl-1 pr-2 transition-all duration-300 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-purple-700 lg:max-w-[190px]">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircleIcon className="h-5 w-5" />}
                          </div>
                          <span className="ml-2 hidden min-w-0 max-w-[92px] truncate text-sm font-semibold text-gray-700 dark:text-gray-200 lg:block lg:max-w-[112px]">{user?.displayName || "User"}</span>
                          <ChevronDownIcon className={`ml-1 h-3 w-3 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </Menu.Button>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 bg-white dark:bg-slate-900 ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Signed in as</p>
                              <p className="max-w-full truncate text-sm font-bold text-gray-900 dark:text-white">{user?.email}</p>
                            </div>

                            <div className="py-1">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/profile"
                                    className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'} block px-4 py-2.5 text-sm transition-colors flex items-center`}
                                  >
                                    <UserCircleIcon className="h-4 w-4 mr-3" /> Your Profile
                                  </Link>
                                )}
                              </Menu.Item>

                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/profile?tab=saved"
                                    className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'} block px-4 py-2.5 text-sm transition-colors flex items-center`}
                                  >
                                    <TicketIcon className="h-4 w-4 mr-3" /> Saved Vouchers
                                  </Link>
                                )}
                              </Menu.Item>

                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    to="/referrals"
                                    className={`${active ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'} block px-4 py-2.5 text-sm transition-colors flex items-center`}
                                  >
                                    <UserPlusIcon className="h-4 w-4 mr-3" /> Referrals
                                  </Link>
                                )}
                              </Menu.Item>
                            </div>

                            <div className="py-1 border-t border-gray-100 dark:border-slate-800">
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={logout}
                                    className={`${active ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'} block w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center`}
                                  >
                                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" /> Sign out
                                  </button>
                                )}
                              </Menu.Item>
                            </div>
                          </Menu.Items>
                        </Transition>
                      </>
                    )}
                  </Menu>
                </>
              ) : (
                <>
                  {desktopLink(
                    "/login",
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />,
                    "Login"
                  )}
                  {desktopLink(
                    "/register",
                    <UserPlusIcon className="h-5 w-5" />,
                    "Register"
                  )}
                </>
              )}
            </div>
          </div>


          {/* Mobile hamburger */}
          <div className="-mr-2 flex md:hidden">
            <ThemeToggle /> {/* Theme toggle moved to mobile hamburger section */}
            <button
              onClick={() => setOpen(!open)}
              className="ml-3 p-2 rounded-md text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {open ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>
      </div>


      {/* Mobile panel */}
      {open && (
        <div className="md:hidden space-y-1 px-2 pt-2 pb-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-700 shadow-inner">
          <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200 dark:border-slate-700 mb-2">
            <span className="text-gray-700 dark:text-gray-300 font-semibold">Navigation</span>
          </div>
          {mobileLink("/", <HomeIcon className="h-5 w-5" />, "Home")}
          {mobileLink(
            "/vouchers",
            <TicketIcon className="h-5 w-5" />,
            "Find Vouchers"
          )}
          {mobileLink(
            "/about",
            <InformationCircleIcon className="h-5 w-5" />,
            "About"
          )}
          {mobileLink(
            "/contact",
            <EnvelopeIcon className="h-5 w-5" />,
            "Contact"
          )}


          {/* User section */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-3 space-y-1">
            {isLoggedIn ? (
              <>
                <div className="flex min-w-0 items-center px-4 py-2 font-semibold text-gray-700 dark:text-gray-300">
                  <UserCircleIcon className="mr-2 h-6 w-6 shrink-0 text-blue-500" />
                  <span className="min-w-0 truncate">{user?.displayName || "User"}</span>
                </div>
                {mobileLink(
                  "/cart",
                  <div className="relative inline-block">
                    <ShoppingCartIcon className="h-5 w-5" />
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </div>,
                  "Cart"
                )}
                {mobileLink(
                  "/list-voucher",
                  <ArrowUpTrayIcon className="h-5 w-5" />,
                  "Sell Vouchers"
                )}
                {mobileLink(
                  "/profile",
                  <UserCircleIcon className="h-5 w-5" />,
                  "Profile"
                )}
                {mobileLink(
                  "/profile?tab=saved",
                  <TicketIcon className="h-5 w-5" />,
                  "Saved Vouchers"
                )}
                {mobileLink(
                  "/referrals",
                  <UserPlusIcon className="h-5 w-5" />,
                  "Referrals"
                )}
                {mobileButton(
                  logout,
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />,
                  "Logout",
                  "text-red-600 hover:text-white hover:bg-red-500 dark:text-red-400 dark:hover:bg-red-700"
                )}
                {/* Mobile Notifications - simplified for dropdown here */}
                <div className="relative inline-block w-full">
                  <Menu as="div" className="relative w-full">
                    <Menu.Button className="block rounded-lg px-4 py-3 text-base font-medium transition-all duration-300 ease-in-out group w-full text-left text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-700 dark:hover:text-white flex items-center">
                      <BellIcon className="h-5 w-5 mr-2" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white dark:ring-slate-900 animate-pulse" />
                      )}
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="relative mt-1 ml-6 w-auto rounded-lg shadow-inner py-1 bg-gray-50 dark:bg-slate-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-40 max-h-64 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-600 flex justify-between items-center">
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white">Recent Notifications</h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} // Stop propagation to prevent closing menu
                              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        {notifications.length === 0 ? (
                          <div className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-xs">
                            No notifications.
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <Menu.Item key={notification._id}>
                              {({ active }) => (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent menu from closing immediately
                                    if (!notification.read) markAsRead(notification._id);
                                    if (notification.link) {
                                      navigate(notification.link);
                                    }
                                  }}
                                  className={`${active ? 'bg-gray-100 dark:bg-slate-600' : ''
                                    } ${!notification.read ? 'bg-blue-100 dark:bg-blue-900' : ''} px-4 py-2 border-b border-gray-200 dark:border-slate-600 cursor-pointer text-sm block`}
                                >
                                  <p className={`text-xs ${!notification.read ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                    {notification.message}
                                  </p>
                                  {notification.link && (
                                    <p className="mt-1 text-xs text-blue-600 dark:text-blue-400 flex items-center">
                                      View <span aria-hidden="true" className="ml-0.5">&rarr;</span>
                                    </p>
                                  )}
                                </div>
                              )}
                            </Menu.Item>
                          ))
                        )}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </>
            ) : (
              <>
                {mobileLink(
                  "/login",
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />,
                  "Login"
                )}
              </>
            )}
          </div>


          {/* Legal links */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-3 space-y-1">
            {mobileLink(
              "/privacy-policy",
              <ShieldCheckIcon className="h-5 w-5" />,
              "Privacy Policy"
            )}
            {mobileLink(
              "/terms-of-service",
              <DocumentTextIcon className="h-5 w-5" />,
              "Terms of Service"
            )}
          </div>
        </div>
      )
      }
    </nav >
  );
}
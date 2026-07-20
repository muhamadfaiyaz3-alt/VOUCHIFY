import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    CreditCardIcon,
    WalletIcon,
    QrCodeIcon,
    BanknotesIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShoppingCartIcon,
    InformationCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useVouchers } from '../Contexts/VoucherContext';
import { useWallet } from '../Contexts/WalletContext';
import client from '../api/client';
import { useAuth } from '../Contexts/AuthContext';

const PaymentPage = () => {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const { getVoucherById } = useVouchers();
    const { wallet, purchaseVoucher, refreshWallet } = useWallet();
    const { user } = useAuth();

    const [voucherDetails, setVoucherDetails] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('CASH'); // Default to Manual Cash
    const [useWalletBalance, setUseWalletBalance] = useState(false);

    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await getVoucherById(voucherId);
                setVoucherDetails(data);
            } catch (err) {
                setStatus({ type: 'error', message: 'Failed to load voucher details.' });
            }
        };
        fetchDetails();
        refreshWallet();
    }, [voucherId, getVoucherById, refreshWallet]);

    const walletBalance = wallet?.balance || 0;

    const calculateAmountDue = () => {
        if (!voucherDetails || !voucherDetails.listedPrice) return 0;
        const listedPrice = Number(voucherDetails.listedPrice) || 0;
        if (useWalletBalance) {
            return Math.max(0, listedPrice - walletBalance);
        }
        return listedPrice;
    };

    const amountDue = calculateAmountDue();

    const handlePayment = async () => {
        setIsProcessing(true);
        setStatus({ type: '', message: '' });

        try {
            if (amountDue === 0 && useWalletBalance) {
                // Full Wallet Payment
                await purchaseVoucher(voucherId);
                setStatus({ type: 'success', message: 'Payment Successful! Voucher purchased.' });
                setTimeout(() => navigate('/profile'), 2000);
            } else if (selectedMethod === 'CASH') {
                // Manual Cash Payment
                await client.post(`/transactions/purchase/${voucherId}`, {
                    paymentMethod: 'cash',
                    useWallet: useWalletBalance // Backend needs to handle this if partial wallet used
                });
                setStatus({ type: 'success', message: 'Order placed! Please contact admin to complete payment.' });
                setTimeout(() => navigate('/profile'), 3000);
            } else {
                setStatus({ type: 'error', message: 'Online payment integration coming soon. Please use Manual Cash.' });
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Payment failed";
            setStatus({ type: 'error', message: msg });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!voucherDetails && !status.message) {
        return <div className="text-center p-10">Loading voucher details...</div>;
    }
    if (status.type === 'error' && !voucherDetails) {
        return <div className="text-center p-10 text-red-600">{status.message} <Link to="/vouchers" className='text-blue-600 hover:underline'>Go back</Link></div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Column: Order Summary */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Order Summary
                        </h2>
                        {voucherDetails && (
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{voucherDetails.title || 'Voucher'}</span>
                                    <span className="font-medium">₹{Number(voucherDetails.listedPrice || 0).toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-4 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="font-bold text-2xl text-indigo-600">₹{Number(voucherDetails.listedPrice || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Wallet Section */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <label htmlFor="useWalletCheckbox" className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                                <WalletIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                Use Wallet Balance
                            </label>
                            <span className="font-bold text-gray-900">₹{Number(walletBalance || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="useWalletCheckbox"
                                checked={useWalletBalance}
                                onChange={(e) => setUseWalletBalance(e.target.checked)}
                                disabled={walletBalance <= 0}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                            />
                            <span className="ml-2 text-sm text-gray-500">
                                {walletBalance > 0 ? "Deduct from wallet" : "Insufficient balance"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Payment Method & Admin Contact */}
                <div className="space-y-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>

                        <div className="space-y-3">
                            <PaymentOption
                                id="CASH"
                                value="CASH"
                                selectedMethod={selectedMethod}
                                setSelectedMethod={setSelectedMethod}
                                icon={BanknotesIcon}
                                label="Manual Cash / UPI to Admin"
                                description="Pay directly to admin via UPI/Cash"
                            />
                            <PaymentOption
                                id="UPI"
                                value="UPI"
                                selectedMethod={selectedMethod}
                                setSelectedMethod={setSelectedMethod}
                                icon={QrCodeIcon}
                                label="Online UPI"
                                description="Coming Soon"
                                disabled
                            />
                        </div>

                        {selectedMethod === 'CASH' && (
                            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                <h3 className="text-sm font-bold text-yellow-800 mb-2">Admin Contact for Payment</h3>
                                <p className="text-xs text-yellow-700 mb-3">
                                    Please pay <strong>₹{(amountDue || 0).toFixed(2)}</strong> to the admin below and click "I Have Paid".
                                </p>
                                <div className="space-y-2 text-sm text-gray-700">
                                    <div className="flex items-center">
                                        <span className="font-semibold w-20">Name:</span> Vouchify Admin
                                    </div>
                                    <div className="flex items-center">
                                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-500" />
                                        <span className="font-semibold w-20">Phone:</span> +91 98765 43210
                                    </div>
                                    <div className="flex items-center">
                                        <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2 text-green-500" />
                                        <span className="font-semibold w-20">WhatsApp:</span> +91 98765 43210
                                    </div>
                                    <div className="flex items-center">
                                        <EnvelopeIcon className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="font-semibold w-20">Email:</span> admin@vouchify.com
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-700 font-medium">Payable Amount:</span>
                                <span className="text-xl font-bold text-indigo-600">₹{(amountDue || 0).toFixed(2)}</span>
                            </div>

                            {status.message && (
                                <div className={`mb-4 p-3 rounded-md text-sm flex items-center ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {status.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2" /> : <XCircleIcon className="h-5 w-5 mr-2" />}
                                    {status.message}
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing || status.type === 'success'}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isProcessing || status.type === 'success' ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isProcessing ? 'Processing...' : status.type === 'success' ? 'Order Placed' : selectedMethod === 'CASH' ? 'I Have Paid Admin' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentOption = ({ id, value, selectedMethod, setSelectedMethod, icon: Icon, label, description, disabled }) => (
    <label htmlFor={id} className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : selectedMethod === value ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-200 hover:bg-gray-50'}`}>
        <input
            type="radio"
            id={id}
            name="paymentMethod"
            value={value}
            checked={selectedMethod === value}
            onChange={(e) => !disabled && setSelectedMethod(e.target.value)}
            disabled={disabled}
            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 mr-3"
        />
        <Icon className="h-5 w-5 mr-3 text-gray-500" />
        <div>
            <span className="font-medium text-sm text-gray-900">{label}</span>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
    </label>
);

export default PaymentPage;
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import client from "../api/client";

const VoucherContext = createContext(null);

export const VoucherProvider = ({ children }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await client.get("/vouchers");
      setVouchers(data);
    } catch (err) {
      console.error("Failed to fetch vouchers:", err);
      setError("Failed to fetch vouchers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const addVoucher = async (payload) => {
    const { data } = await client.post("/vouchers", payload);
    setVouchers((prev) => [data, ...prev]);
    return data;
  };

  const deleteVoucher = async (id) => {
    await client.delete(`/vouchers/${id}`);
    setVouchers((prev) => prev.filter((voucher) => voucher._id !== id));
  };

  const getVoucherById = async (id) => {
    const cached = vouchers.find((voucher) => voucher._id === id);
    if (cached) return cached;
    const { data } = await client.get(`/vouchers/${id}`);
    return data;
  };

  return (
    <VoucherContext.Provider
      value={{
        vouchers,
        loading,
        error,
        refreshVouchers: fetchVouchers,
        addVoucher,
        deleteVoucher,
        getVoucherById,
      }}
    >
      {children}
    </VoucherContext.Provider>
  );
};

VoucherProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useVouchers = () => {
  const context = useContext(VoucherContext);
  if (!context) {
    throw new Error("useVouchers must be used within a VoucherProvider");
  }
  return context;
};

export default VoucherContext;

"use client";

import { useState, useEffect } from "react";
import { db, collection, addDoc, getDocs } from "@/lib/firebase/firebaseConfig";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [categories, setCategories] = useState({
    Membership: [
      { name: "Single Member", price: 125 },
      { name: "Teachers/WSU Employees", price: 83 },
      { name: "Veterans & Seniors", price: 99 },
      { name: "Household Membership", price: 50 },
    ],
    "Membership Add-Ons": [
      { name: "Hall Locker", price: 10 },
      { name: "Rolling Locker", price: 20 },
      { name: "6-Month Suite Rental", price: 250 },
    ],
    Merchandise: [
      { name: "Flash Drives", price: 15 },
      { name: "Replacement Badges", price: 20 },
      { name: "Expo Markers", price: 2 },
      { name: "Sharpie Markers", price: 2 },
      { name: "GoCreate Small-XL T-Shirts", price: 8 },
      { name: "GoCreate 2XL T-Shirts", price: 9 },
      { name: "Grommets", price: 1 },
    ],
    Textile: [
      { name: "Bobbin", price: 1 },
      { name: "Replacement Needle", price: 3 },
      { name: "Thread", price: 0 },
      { name: "1000 Stitches per Avance", price: 1 },
    ],
    "Water Jet Cost": [{ name: "1 Min Water Jet", price: 2.5 }],
    "Xerox Printer": [
      { name: "Black and White 1-Sided", price: 0.1 },
      { name: "Black and White 2-Sided", price: 0.15 },
      { name: "Color 1-Sided", price: 0.5 },
      { name: "Color 2-Sided", price: 0.9 },
      { name: "8.5x11 Lamination Sheet", price: 1 },
      { name: "11x17 Lamination Sheet", price: 1.5 },
    ],
    "Mutoh Printer": [
      { name: "Gloss Vinyl Adhesive", price: 2.5 },
      { name: "Matt Vinyl Adhesive", price: 2.5 },
      { name: "Clear Vinyl Adhesive", price: 3.5 },
      { name: "Clear Cling", price: 4.5 },
      { name: "Translucent Vinyl Adhesive", price: 2.5 },
      { name: "Window Vinyl", price: 3 },
      { name: "Canvas", price: 8 },
      { name: "Lightweight Banner", price: 2.2 },
    ],
    "Canon Printer": [
      { name: "Glossy Photo Paper", price: 2.5 },
      { name: "Large Bond Paper", price: 2.2 },
      { name: "Fine Art Bright Paper", price: 2.2 },
      { name: "Plain Paper", price: 1 },
    ],
    Sublimation: [{ name: "Sublimation Paper", price: 1.25 }],
    Welding: [
      { name: "Lincoln 1/8 Stick Rod", price: 1 },
      { name: "Lincoln 3/32 Stick Rod", price: 1 },
      { name: "3/32 4043 Aluminum Tig Rod", price: 1 },
      { name: "1/8 4043 Aluminum Tig Rod", price: 1 },
      { name: "3/32 Mild Steel 70S-6", price: 1 },
      { name: "1/16 Mild Steel 70S-6", price: 1 },
      { name: "308L 1/8 Stainless Tig Rod", price: 1.15 },
      { name: "0.045 33# Dual Shield 17-t Mig", price: 6 },
      { name: "70S-6 0.035 45# Spool", price: 6 },
      { name: "3/32 Tungsten Electrode", price: 4.5 },
      { name: "1/8 Tungsten Electrode", price: 7 },
    ],
    CRIO: [
      { name: "T.One", price: 6 },
      { name: "CPM", price: 6 },
      { name: "Forever Dark", price: 6 },
    ],
    "MakerBot 3D Filament": [
      { name: "Replicator+ (PLA)", price: 0.15 },
      { name: "Method X (ABS)", price: 0.3 },
    ],
    "Stratasys 3D Filament": [
      { name: "Resin", price: 1 },
      { name: "F190", price: 1 },
    ],
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch members
  const fetchMembers = async () => {
    const membersRef = collection(db, "memberships");
    const querySnapshot = await getDocs(membersRef);
    const membersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMembers(membersData);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const calculateTotal = (itemName, quantity) => {
    const item = categories[selectedCategory]?.find((i) => i.name === itemName);
    return item ? item.price * quantity : 0;
  };

  const handleSavePayment = async () => {
    if (
      !selectedCategory ||
      !selectedItem ||
      !quantity ||
      !status ||
      !selectedMember
    ) {
      alert("Please fill in all required fields.");
      return;
    }
    if (status === "Paid" && !referenceNumber) {
      alert("Please provide a reference number for paid status.");
      return;
    }

    const paymentData = {
      date: new Date().toISOString(),
      member: selectedMember.name,
      category: selectedCategory,
      item: selectedItem,
      quantity,
      total: calculateTotal(selectedItem, quantity),
      status,
      reference: status === "Paid" ? referenceNumber : null,
    };

    setLoading(true);
    try {
      const paymentsRef = collection(db, "payments");
      await addDoc(paymentsRef, paymentData);
      setPayments((prev) => [...prev, paymentData]);
      setShowPaymentModal(false);
      setShowMemberModal(false);
      alert("Payment logged successfully.");
    } catch (err) {
      console.error("Failed to save payment:", err);
      alert("Failed to log payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Payments</h1>
      <button
        onClick={() => setShowPaymentModal(true)}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        New Payment
      </button>
      <table className="w-full border-collapse bg-gray-100 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-4 text-left">Date</th>
            <th className="p-4 text-left">Member</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Item</th>
            <th className="p-4 text-left">Quantity</th>
            <th className="p-4 text-left">Total</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Reference</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-t border-gray-300">
              <td className="p-4">
                {new Date(payment.date).toLocaleDateString()}
              </td>
              <td className="p-4">{payment.member}</td>
              <td className="p-4">{payment.category}</td>
              <td className="p-4">{payment.item}</td>
              <td className="p-4">{payment.quantity}</td>
              <td className="p-4">${payment.total.toFixed(2)}</td>
              <td className="p-4">{payment.status}</td>
              <td className="p-4">{payment.reference || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">New Payment</h2>
            <div className="space-y-4">
              <button
                onClick={() => setShowMemberModal(true)}
                className="w-full p-2 bg-blue-500 text-white rounded text-sm"
              >
                {selectedMember
                  ? `Selected: ${selectedMember.name}`
                  : "Select Member"}
              </button>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedItem("");
                }}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {selectedCategory && (
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Select Item</option>
                  {categories[selectedCategory]?.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter Quantity/Sqft"
                className="w-full p-2 border rounded text-sm"
              />
              <p className="text-gray-700">
                Total:{" "}
                <strong>
                  ${calculateTotal(selectedItem, quantity).toFixed(2)}
                </strong>
              </p>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Partially Paid">Partially Paid</option>
              </select>
              {status === "Paid" && (
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Enter Reference Number"
                  className="w-full p-2 border rounded text-sm"
                />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                disabled={loading}
                className={`px-4 py-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded transition`}
              >
                {loading ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Select Member</h2>
            <input
              type="text"
              placeholder="Search by name or email"
              className="w-full p-2 border rounded mb-4"
              onChange={(e) => {
                const search = e.target.value.toLowerCase();
                const filtered = members.filter(
                  (m) =>
                    m.primaryContact.firstName.toLowerCase().includes(search) ||
                    m.primaryContact.lastName.toLowerCase().includes(search) ||
                    m.email.toLowerCase().includes(search)
                );
                setMembers(filtered.length > 0 ? filtered : members);
              }}
            />
            <div className="max-h-64 overflow-y-auto">
              {members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember({
                      name:
                        member.primaryContact.firstName +
                        " " +
                        member.primaryContact.lastName,
                    });
                    setShowMemberModal(false);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 transition"
                >
                  {member.primaryContact.firstName}{" "}
                  {member.primaryContact.lastName} ({member.email})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

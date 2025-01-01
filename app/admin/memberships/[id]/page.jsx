"use client";

import { useEffect, useState } from "react";
import { db, doc, getDoc, updateDoc } from "@/lib/firebase/firebaseConfig";
import BadgeCreator from "@/components/BadgeCreator";
import { useParams } from "next/navigation"; // Import `useParams` hook

export default function MembershipDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [membership, setMembership] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBadgeCreator, setShowBadgeCreator] = useState(false); // To toggle badge creator
  const [badge, setBadge] = useState(null); // Current badge details
  const [editing, setEditing] = useState(false); // Added here
  const [showAddVehicle, setShowAddVehicle] = useState(false); // Toggle for add vehicle popover
  const [newVehicle, setNewVehicle] = useState({
    licensePlate: "",
    make: "",
    style: "",
    color: "",
    state: "",
  });
  const [newContact, setNewContact] = useState({}); // New contact data
  const [showAddContact, setShowAddContact] = useState(false); // Add Contact Modal State

  const handleAddContact = () => {
    const updatedContacts = [
      ...(membership.emergencyContacts || []),
      newContact,
    ];
    const membershipRef = doc(db, "memberships", id);

    updateDoc(membershipRef, { emergencyContacts: updatedContacts })
      .then(() => {
        setMembership((prev) => ({
          ...prev,
          emergencyContacts: updatedContacts,
        }));
        setNewContact({});
        setShowAddContact(false);
      })
      .catch((err) => setError(`Failed to add contact: ${err.message}`));
  };

  const handleDeleteContact = (index) => {
    const updatedContacts = membership.emergencyContacts.filter(
      (_, i) => i !== index
    );
    const membershipRef = doc(db, "memberships", id);

    updateDoc(membershipRef, { emergencyContacts: updatedContacts })
      .then(() => {
        setMembership((prev) => ({
          ...prev,
          emergencyContacts: updatedContacts,
        }));
      })
      .catch((err) => setError(`Failed to delete contact: ${err.message}`));
  };

  // Fetch membership details from Firestore
  const fetchMembership = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "memberships", id);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const membershipData = { id: id, ...docSnapshot.data() };
        setMembership(membershipData);
        setBadge(membershipData.badge || null); // Set badge if exists
      } else {
        setError("Membership not found.");
      }
    } catch (err) {
      setError(`Failed to load membership: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedData) => {
    try {
      const membershipRef = doc(db, "memberships", id);
      await updateDoc(membershipRef, updatedData);
      setMembership((prev) => ({ ...prev, ...updatedData }));
      setEditing(false);
    } catch (err) {
      setError(`Failed to save changes: ${err.message}`);
    }
  };

  const handleAddVehicle = async () => {
    try {
      const updatedParking = [
        ...(membership.parkingRegistrations || []),
        newVehicle,
      ];
      const membershipRef = doc(db, "memberships", id);
      await updateDoc(membershipRef, { parkingRegistrations: updatedParking });
      setMembership((prev) => ({
        ...prev,
        parkingRegistrations: updatedParking,
      }));
      setNewVehicle({
        licensePlate: "",
        make: "",
        style: "",
        color: "",
        state: "",
      });
      setShowAddVehicle(false); // Close the popover
    } catch (err) {
      setError(`Failed to add vehicle: ${err.message}`);
    }
  };
  const handleDeleteVehicle = (index) => {
    const updatedParking = membership.parkingRegistrations.filter(
      (_, i) => i !== index
    );
    const membershipRef = doc(db, "memberships", id);

    updateDoc(membershipRef, { parkingRegistrations: updatedParking })
      .then(() => {
        setMembership((prev) => ({
          ...prev,
          parkingRegistrations: updatedParking,
        }));
      })
      .catch((err) => setError(`Failed to delete vehicle: ${err.message}`));
  };

  const assignBadge = (badgeData) => {
    // Update badge in Firestore
    const membershipRef = doc(db, "memberships", id);
    updateDoc(membershipRef, { badge: badgeData })
      .then(() => {
        setBadge(badgeData);
        setShowBadgeCreator(false);
      })
      .catch((err) => setError(`Failed to assign badge: ${err.message}`));
  };

  const deleteBadge = () => {
    // Remove badge from Firestore
    const membershipRef = doc(db, "memberships", id);
    updateDoc(membershipRef, { badge: null })
      .then(() => setBadge(null))
      .catch((err) => setError(`Failed to delete badge: ${err.message}`));
  };

  useEffect(() => {
    fetchMembership();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">Loading...</div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-6">Membership Details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Primary Contact Section */}
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Primary Contact</h2>
          {editing ? (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={membership.primaryContact.firstName || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      firstName: e.target.value,
                    },
                  }))
                }
                placeholder="First Name"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.lastName || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      lastName: e.target.value,
                    },
                  }))
                }
                placeholder="Last Name"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.address || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      address: e.target.value,
                    },
                  }))
                }
                placeholder="Address"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.city || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      city: e.target.value,
                    },
                  }))
                }
                placeholder="City"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.state || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      state: e.target.value,
                    },
                  }))
                }
                placeholder="State"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.zip || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      zip: e.target.value,
                    },
                  }))
                }
                placeholder="ZIP Code"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.phone1 || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      phone1: e.target.value,
                    },
                  }))
                }
                placeholder="Phone 1"
                className="p-2 border rounded"
              />
              <input
                type="text"
                value={membership.primaryContact.phone2 || ""}
                onChange={(e) =>
                  setMembership((prev) => ({
                    ...prev,
                    primaryContact: {
                      ...prev.primaryContact,
                      phone2: e.target.value,
                    },
                  }))
                }
                placeholder="Phone 2"
                className="p-2 border rounded"
              />
              <button
                onClick={() => {
                  handleSave({ primaryContact: membership.primaryContact });
                  setEditing(false);
                }}
                className="col-span-2 mt-4 px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600 transition"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div>
              <p>
                <strong>First Name:</strong>{" "}
                {membership.primaryContact?.firstName || "N/A"}
              </p>
              <p>
                <strong>Last Name:</strong>{" "}
                {membership.primaryContact?.lastName || "N/A"}
              </p>
              <p>
                <strong>Address:</strong>{" "}
                {membership.primaryContact?.address || "N/A"}
              </p>
              <p>
                <strong>City:</strong>{" "}
                {membership.primaryContact?.city || "N/A"}
              </p>
              <p>
                <strong>State:</strong>{" "}
                {membership.primaryContact?.state || "N/A"}
              </p>
              <p>
                <strong>ZIP Code:</strong>{" "}
                {membership.primaryContact?.zip || "N/A"}
              </p>
              <p>
                <strong>Phone 1:</strong>{" "}
                {membership.primaryContact?.phone1 || "N/A"}
              </p>
              <p>
                <strong>Phone 2:</strong>{" "}
                {membership.primaryContact?.phone2 || "N/A"}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Membership Information Section */}
        <div className="bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Membership Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <p>
              <strong>Membership Type:</strong>{" "}
              {membership.membershipType || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {membership.status || "Pending"}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="font-bold text-lg">Badge</h3>
            {badge ? (
              <div className="mt-4">
                <p>
                  <strong>Door Number:</strong> {badge.doorNumber}
                </p>
                <p>
                  <strong>Scan Number:</strong> {badge.scanNumber}
                </p>
                <button
                  onClick={deleteBadge}
                  className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600 transition"
                >
                  Delete Badge
                </button>
              </div>
            ) : (
              <div>
                <p>No badge assigned.</p>
                <button
                  onClick={() => setShowBadgeCreator(true)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600 transition"
                >
                  Assign Badge
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Parking Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Parking Information
        </h2>
        {membership.parkingRegistrations?.length > 0 ? (
          membership.parkingRegistrations.map((parking, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>License Plate:</strong>{" "}
                    {parking.licensePlate || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Make:</strong> {parking.make || "N/A"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>Style:</strong> {parking.style || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Color:</strong> {parking.color || "N/A"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>State:</strong> {parking.state || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleDeleteVehicle(index)}
                  className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No parking registrations available.</p>
        )}
        <button
          onClick={() => setShowAddVehicle(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Add Vehicle
        </button>
      </div>

      {/* Add Vehicle Popover */}
      {showAddVehicle && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowAddVehicle(false)} // Close popover on background click
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()} // Prevent closing on content click
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Add Vehicle
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newVehicle.licensePlate}
                onChange={(e) =>
                  setNewVehicle((prev) => ({
                    ...prev,
                    licensePlate: e.target.value,
                  }))
                }
                placeholder="License Plate"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={newVehicle.make}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, make: e.target.value }))
                }
                placeholder="Make"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={newVehicle.style}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, style: e.target.value }))
                }
                placeholder="Style"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={newVehicle.color}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, color: e.target.value }))
                }
                placeholder="Color"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                value={newVehicle.state}
                onChange={(e) =>
                  setNewVehicle((prev) => ({ ...prev, state: e.target.value }))
                }
                placeholder="State"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowAddVehicle(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVehicle}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Emergency Contacts Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Emergency Contacts
        </h2>
        {membership.emergencyContacts?.length > 0 ? (
          membership.emergencyContacts.map((contact, index) => (
            <div key={index} className="border-b border-gray-300 pb-4 mb-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>First Name:</strong> {contact.firstName || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Last Name:</strong> {contact.lastName || "N/A"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>Phone 1:</strong> {contact.phone1 || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <strong>Phone 2:</strong> {contact.phone2 || "N/A"}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-gray-600">
                    <strong>City:</strong> {contact.city || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <strong>State:</strong> {contact.state || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                {membership.emergencyContacts.length > 1 && (
                  <button
                    onClick={() => handleDeleteContact(index)}
                    className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                  >
                    Delete Contact
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No emergency contacts available.</p>
        )}
        <button
          onClick={() => setShowAddContact(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Add Emergency Contact
        </button>

        {showAddContact && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                Add Emergency Contact
              </h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newContact.firstName || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newContact.lastName || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone 1"
                  value={newContact.phone1 || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      phone1: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Phone 2"
                  value={newContact.phone2 || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      phone2: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newContact.city || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newContact.state || ""}
                  onChange={(e) =>
                    setNewContact((prev) => ({
                      ...prev,
                      state: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddContact(false)}
                  className="mr-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Save Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badge Creator */}
      {showBadgeCreator && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <BadgeCreator
              member={{
                id: membership.id,
                name: `${membership.primaryContact.firstName} ${membership.primaryContact.lastName}`,
                status: membership.status || "Member",
              }}
              onClose={() => setShowBadgeCreator(false)}
              onSave={(badgeData) => console.log("Badge Data:", badgeData)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

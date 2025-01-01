"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc, // Add this
  updateDoc, // Add this
} from "@/lib/firebase/firebaseConfig";
import { v4 as uuidv4 } from "uuid"; // Import a UUID library

export default function TrackerClient() {
  const [input, setInput] = useState("");
  const [step, setStep] = useState(1); // 1: Scan, 2: Studio Selection, 3: Guests, 4: Thank You
  const [member, setMember] = useState(null);
  const [guests, setGuests] = useState([]);
  const [newGuest, setNewGuest] = useState(null);
  const [studio, setStudio] = useState(null);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [activeClock, setActiveClock] = useState(null);

  const resetToScan = () => {
    setInput("");
    setStep(1);
    setStudio(null);
    setGuests([]);
    setMember(null);
    setNewGuest(null);
  };

  const handleInteraction = () => {
    setLastInteractionTime(Date.now());
  };

  useEffect(() => {
    console.log("Current step:", step);

    const interval = setInterval(() => {
      if (Date.now() - lastInteractionTime > 7000 && ![1, 6].includes(step)) {
        resetToScan();
      }
    }, 1000);
    console.log("Updated member:", member);

    return () => clearInterval(interval);
  }, [lastInteractionTime, step, member]);

  useEffect(() => {
    window.addEventListener("mousemove", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    window.addEventListener("click", handleInteraction);

    return () => {
      window.removeEventListener("mousemove", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
      window.removeEventListener("click", handleInteraction);
    };
  }, []);

  const handleScan = async (scanNumber) => {
    try {
      console.log("Scanning badge:", scanNumber);

      const q = query(
        collection(db, "memberships"),
        where("badge.scanNumber", "==", scanNumber)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const memberDoc = querySnapshot.docs[0];
        const memberData = memberDoc.data();

        console.log("Fetched member data:", memberData);

        const clocksRef = collection(db, "memberships", memberDoc.id, "clocks");
        const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

        // Check for today's clock-in
        const clocksQuery = query(clocksRef, where("inTime", ">=", todayStart));
        const clocksSnapshot = await getDocs(clocksQuery);
        const latestClock = clocksSnapshot.docs.find(
          (doc) => !doc.data().outTime
        );

        if (latestClock) {
          console.log("Existing clock found for the day.");

          const clockData = latestClock.data();
          setActiveClock({ id: latestClock.id, ...clockData });

          if (memberData.status === "member") {
            setMember({
              id: memberDoc.id,
              name: `${memberData.primaryContact.firstName} ${memberData.primaryContact.lastName}`,
              picture: memberData.badge?.photoURL || "/placeholder.jpg",
            });
            setStep(6); // Add Guest or Sign Out
          } else {
            if (clockData.isShift) {
              setStep(8); // Show Clock Out Option
            } else {
              setStep(6); // Add Guest or Sign Out
            }
          }
          return;
        }

        // No existing clock for the day; create a new one
        const newClock = {
          inTime: Math.floor(Date.now() / 1000),
          studio: null,
          guests: [],
          isShift: false, // Default for members
        };
        const docRef = await addDoc(clocksRef, newClock);
        setActiveClock({ id: docRef.id, ...newClock });

        setMember({
          id: memberDoc.id,
          name: `${memberData.primaryContact.firstName} ${memberData.primaryContact.lastName}`,
          picture: memberData.badge?.photoURL || "/placeholder.jpg",
        });

        if (memberData.status === "member") {
          setStep(2); // Studio Selection
        } else {
          setStep(8); // Ask if Clocking In or Signing In
        }
      } else {
        alert("No member or employee found with this badge. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
      alert("Error fetching information. Please try again.");
    }
  };

  const handleMemberFlow = async (memberDoc, memberData) => {
    const clocksRef = collection(db, "memberships", memberDoc.id, "clocks");
    const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

    // Check for today's clock-in
    const clocksQuery = query(clocksRef, where("inTime", ">=", todayStart));
    const clocksSnapshot = await getDocs(clocksQuery);
    const latestClock = clocksSnapshot.docs.find((doc) => !doc.data().outTime);

    if (latestClock) {
      console.log("Existing clock found for the day.");
      setActiveClock({ id: latestClock.id, ...latestClock.data() });
      setMember({
        id: memberDoc.id,
        name: `${memberData.primaryContact.firstName} ${memberData.primaryContact.lastName}`,
        picture: memberData.badge?.photoURL || "/placeholder.jpg",
      });
      setStep(6); // Add Guest or Sign Out
      return;
    }

    console.log("Creating a new clock for member.");
    const newClock = {
      inTime: Math.floor(Date.now() / 1000),
      studio: null,
      guests: [],
      isShift: false, // Default for members
    };
    const docRef = await addDoc(clocksRef, newClock);
    setActiveClock({ id: docRef.id, ...newClock });

    setMember({
      id: memberDoc.id,
      name: `${memberData.primaryContact.firstName} ${memberData.primaryContact.lastName}`,
      picture: memberData.badge?.photoURL || "/placeholder.jpg",
    });
    setStep(2); // Studio Selection
  };

  const handleEmployeeAction = async (isShift) => {
    try {
      console.log(isShift ? "Clocking In for Shift" : "Signing In");

      const clocksRef = collection(db, "memberships", member.id, "clocks");

      const newClock = {
        inTime: Math.floor(Date.now() / 1000),
        isShift,
        studio: null,
        guests: [],
      };

      const docRef = await addDoc(clocksRef, newClock);
      setActiveClock({ id: docRef.id, ...newClock });

      console.log("Clock-in document created:", newClock);
      setStep(2); // Proceed to Studio Selection
    } catch (error) {
      console.error("Error during employee action:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const renderEmployeeActions = () => {
    if (!member) {
      return (
        <motion.div
          className="flex flex-col items-center justify-center h-full space-y-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-bold">No Member Data Found</h1>
          <p className="text-lg">Please scan your badge again.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="flex flex-col items-center justify-center h-full space-y-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-4xl font-bold">
          Welcome, {member.name.split(" ")[0]}!
        </h1>

        {/* Check if the member currently has an active shift */}
        {activeClock?.isShift ? (
          <button
            onClick={handleClockOut} // Clock Out for shift
            className="px-6 py-4 bg-red-600 text-white text-xl rounded-lg"
          >
            Clock Out
          </button>
        ) : (
          <div className="flex flex-col space-y-4 items-center">
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => handleEmployeeAction(false)} // Sign In (non-shift)
                className="px-6 py-4 bg-blue-600 text-white text-xl rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => handleEmployeeAction(true)} // Clock In for shift
                className="px-6 py-4 bg-green-600 text-white text-xl rounded-lg"
              >
                Clock In
              </button>
            </div>
            <p className="text-gray-500 text-sm">
              Sign In to access studios without starting a shift. Clock In to
              start a work shift.
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  const handleAddGuest = async (guest) => {
    if (guest.firstName && guest.lastName && guest.phone) {
      const clocksRef = collection(db, "memberships", member.id, "clocks");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const clocksQuery = query(
        clocksRef,
        where("inTime", ">=", today.toISOString())
      );
      const clocksSnapshot = await getDocs(clocksQuery);

      if (!clocksSnapshot.empty) {
        const latestClock = clocksSnapshot.docs.find(
          (doc) => !doc.data().outTime
        );

        if (latestClock) {
          const clockDocRef = doc(
            db,
            "memberships",
            member.id,
            "clocks",
            latestClock.id
          );

          const updatedGuest = {
            ...guest,
            id: uuidv4(),
            timestamp: new Date().toLocaleString(),
          };

          await updateDoc(clockDocRef, {
            guests: [...(latestClock.data().guests || []), updatedGuest],
          });

          setGuests((prevGuests) => [...prevGuests, updatedGuest]);
          setNewGuest(null); // Reset guest form
        } else {
          alert("No active clock-in found.");
        }
      }
    } else {
      alert("Please fill out all guest fields.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const getFarewell = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Have a great day!";
    if (hour < 18) return "Have a great afternoon!";
    return "Have a great evening!";
  };

  const handleRemoveGuest = (id) => {
    setGuests((prevGuests) => prevGuests.filter((guest) => guest.id !== id));
  };

  const blobVariants = {
    animate: {
      y: [0, -50, 0],
      x: [0, 50, -50],
      transition: {
        duration: 12,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };

  const handleClockOut = async () => {
    try {
      console.log("Handling Clock Out");
      const clocksRef = collection(db, "memberships", member.id, "clocks");
      const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);

      const clocksQuery = query(clocksRef, where("inTime", ">=", todayStart));
      const clocksSnapshot = await getDocs(clocksQuery);

      const latestClock = clocksSnapshot.docs.find(
        (doc) => !doc.data().outTime
      );

      if (latestClock) {
        const clockDocRef = doc(
          db,
          "memberships",
          member.id,
          "clocks",
          latestClock.id
        );

        await updateDoc(clockDocRef, {
          outTime: Math.floor(Date.now() / 1000),
        });

        console.log("Clock-out successful.");
        setStep(4); // Thank You Screen
      } else {
        alert("No active session found to sign out/clock out.");
      }
    } catch (error) {
      console.error("Error while clocking out:", error);
      alert("Error while clocking out. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      const clocksRef = collection(db, "memberships", member.id, "clocks");
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const clocksQuery = query(
        clocksRef,
        where("inTime", ">=", today.toISOString())
      );
      const clocksSnapshot = await getDocs(clocksQuery);

      if (!clocksSnapshot.empty) {
        const latestClock = clocksSnapshot.docs.find(
          (doc) => !doc.data().outTime
        );

        if (latestClock) {
          const clockDocRef = doc(
            db,
            "memberships",
            member.id,
            "clocks",
            latestClock.id
          );

          await updateDoc(clockDocRef, { outTime: new Date().toISOString() });

          setStep(4); // Thank You Screen
        } else {
          alert("No active session found.");
        }
      }
    } catch (error) {
      alert("Error signing out. Please try again.");
    }
  };

  const renderClockedIn = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 h-full text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-4xl font-bold">
        {getGreeting()}, {member.name.split(" ")[0]}!
      </h1>
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => setStep(3)} // Navigate to Add Guest Screen
          className="px-6 py-4 bg-blue-600 text-white text-xl rounded-lg"
        >
          Add Guest
        </button>
        <button
          onClick={handleSignOut} // Sign Out Logic
          className="px-6 py-4 bg-red-600 text-white text-xl rounded-lg"
        >
          Sign Out
        </button>
      </div>
    </motion.div>
  );

  const renderScan = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 h-full"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-4xl font-semibold">Welcome to GoCreate</h1>
      <input
        id="badgeInput"
        type="text"
        placeholder="Please scan your badge..."
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          if (e.target.value.length === 10) {
            handleScan(e.target.value);
          }
        }}
        className="text-lg text-center focus:outline-none w-full"
      />
    </motion.div>
  );

  const handleStudioSelection = async (studioName) => {
    try {
      console.log("Handling studio selection:", studioName);

      if (!activeClock) {
        alert("No active session found. Please sign in or clock in first.");
        return;
      }

      const clockDocRef = doc(
        db,
        "memberships",
        member.id,
        "clocks",
        activeClock.id
      );

      await updateDoc(clockDocRef, { studio: studioName });
      console.log("Studio updated successfully in Firestore.");

      setStudio(studioName);
      setStep(3); // Guest Screen
    } catch (error) {
      console.error("Error in handleStudioSelection:", error);
    }
  };

  const renderWelcome = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 text-center h-full"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <img
        src={member.picture}
        alt={member.name}
        className="w-48 h-48 mx-auto border border-gray-300 shadow-lg rounded-lg object-cover"
      />
      <div>
        <h2 className="text-5xl font-semibold">Good Afternoon</h2>
        <h3 className="text-4xl font-medium mt-2">{member.name}</h3>
      </div>
    </motion.div>
  );

  const renderStudios = () => {
    if (!member) {
      console.warn("renderStudios called with null member");
      return (
        <motion.div
          className="flex flex-col items-center justify-center h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-3xl font-semibold">No member data found.</h1>
          <p className="text-lg">Please scan your badge again.</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="flex flex-row justify-center items-center h-full space-x-12 text-center"
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "-100%" }}
        transition={{ duration: 1 }}
      >
        <div className="flex flex-col items-center space-y-4 w-1/3">
          <img
            src={member.picture}
            alt={member.name}
            className="w-40 h-48 mx-auto border border-gray-300 shadow-lg rounded-[30px] object-cover"
          />
          <div>
            <h2 className="text-3xl font-semibold">{getGreeting()}</h2>
            <h3 className="text-2xl font-medium">{member.name}</h3>
          </div>
        </div>

        <div className="h-1/2 w-px bg-gray-300"></div>

        <div className="grid grid-cols-2 gap-8 w-2/3">
          {[
            "All Studios",
            "Design",
            "Woods",
            "Metals",
            "Textiles",
            "Electronics",
          ].map((studioName) => (
            <button
              key={studioName}
              onClick={() => handleStudioSelection(studioName)}
              className={`px-12 py-8 text-xl bg-white/30 border ${
                studioName === "All Studios"
                  ? "border-blue-500 text-blue-600"
                  : "border-gray-300 text-gray-700"
              } font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-white/50 focus:outline-none backdrop-blur-md transition duration-300 transform hover:scale-105`}
            >
              {studioName}
            </button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderGuestConfirmation = () => (
    <motion.div
      className="flex flex-row justify-center items-center h-full space-x-12 text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center space-y-4 w-1/3">
        <img
          src={member.picture}
          alt={member.name}
          className="w-40 h-48 mx-auto border border-gray-300 shadow-lg rounded-[30px] object-cover" // More rounded, but not a circle
        />
        <div>
          <h2 className="text-3xl font-semibold">{getGreeting()}</h2>
          <h3 className="text-2xl font-medium">{member.name}</h3>
        </div>
      </div>
      {/* Divider */}
      <div className="h-1/2 w-px bg-gray-300"></div> {/* Shortened divider */}
      {/* Guest List and Buttons */}
      <div className="flex flex-col items-center space-y-6 w-2/3">
        <h1 className="text-4xl font-semibold">Guests</h1>

        {/* Guest List */}
        {guests.length > 0 ? (
          <div className="w-full max-w-xl">
            <ul className="space-y-4">
              {guests.map((guest) => (
                <li
                  key={guest.id} // Use the unique `id` as the key
                  className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow"
                >
                  <div>
                    <p className="font-semibold">{`${guest.firstName} ${guest.lastName}`}</p>
                    <p className="text-sm text-gray-600">{guest.phone}</p>
                    <p className="text-xs text-gray-500">{guest.timestamp}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveGuest(guest.id)}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-lg text-gray-600">No guests added yet.</p>
        )}

        {/* Buttons */}
        <div className="flex justify-center space-x-8">
          <button
            onClick={() => setStep(4)} // Proceed to Thank You screen
            className="px-8 py-4 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
          >
            Done
          </button>
          <button
            onClick={() =>
              setNewGuest({
                firstName: "",
                lastName: "",
                phone: "",
                timestamp: "",
              })
            } // Add another guest
            className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600"
          >
            {guests.length > 0 ? "Add Another Guest" : "Add Guest"}
          </button>
        </div>

        {/* Add Guest Popup */}
        {newGuest && renderGuestFormPopup()}
      </div>
    </motion.div>
  );

  const renderGuestFormPopup = () => (
    <motion.div
      className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="bg-white bg-opacity-80 border border-gray-200 shadow-lg rounded-xl p-6 backdrop-blur-md"
        style={{ maxWidth: "400px", width: "90%" }}
      >
        <h3 className="text-xl font-semibold mb-4">
          {guests.length > 0 ? "Add another guest" : "Add Guest"}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={newGuest?.firstName || ""}
            onChange={(e) =>
              setNewGuest({ ...newGuest, firstName: e.target.value })
            }
            className="w-full p-3 border rounded shadow"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={newGuest?.lastName || ""}
            onChange={(e) =>
              setNewGuest({ ...newGuest, lastName: e.target.value })
            }
            className="w-full p-3 border rounded shadow"
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={newGuest?.phone || ""}
            onChange={(e) =>
              setNewGuest({ ...newGuest, phone: e.target.value })
            }
            className="w-full p-3 border rounded shadow"
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => {
              handleAddGuest(newGuest);
              setNewGuest(null); // Close the popup
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            Add Guest
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderThankYou = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-6 h-full text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      {member?.isEmployee ? (
        <>
          <h1 className="text-4xl font-bold">
            Thank you, {member.name.split(" ")[0]}!
          </h1>
          <p className="text-lg">
            {member?.isShift
              ? "You are now clocked out. Have a great day!"
              : "You are signed into the studio. Enjoy your time!"}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold">Thank You for Signing In!</h1>
          <p className="text-lg">
            Please use your badge to scan the door and enter.
          </p>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-white flex flex-col justify-between items-center">
      {/* Blobs */}
      <motion.div
        className="absolute -top-20 -left-40 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30"
        variants={blobVariants}
        animate="animate"
      ></motion.div>
      <motion.div
        className="absolute -bottom-20 -right-40 w-96 h-96 bg-yellow-400 rounded-full blur-3xl opacity-30"
        variants={blobVariants}
        animate="animate"
      ></motion.div>

      <AnimatePresence mode="wait">
        {(() => {
          switch (step) {
            case 1:
              return renderScan();
            case 2:
              return renderStudios();
            case 3:
              return renderGuestConfirmation();
            case 4:
              return renderThankYou();
            case 6:
              return renderClockedIn();
            case 8:
              return renderEmployeeActions();
            default:
              return renderScan(); // Default to the Scan Screen
          }
        })()}
      </AnimatePresence>

      {/* Logo */}
      <div className="absolute bottom-10">
        <img
          src="/GCVertical_ColorAndBlack.svg"
          alt="GoCreate Logo"
          className="h-20"
        />
      </div>
    </div>
  );
}

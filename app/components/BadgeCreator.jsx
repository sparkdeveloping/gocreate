"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  db,
  doc,
  updateDoc,
} from "@/lib/firebase/firebaseConfig";

export default function BadgeCreator({ member, onClose, onSave }) {
  const webcamRef = useRef(null);
  const [photo, setPhoto] = useState(null);
  const [badgeNumber, setBadgeNumber] = useState("");
  const [scanNumber, setScanNumber] = useState("");
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setStep(2);
    }
  };

  const handleNext = () => {
    if (step === 2 && (!badgeNumber || !scanNumber)) {
      alert(
        "Please fill in the badge number and scan number before proceeding."
      );
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePrint = () => {
    const card = document.querySelector(".print-card");
    card.classList.add("print-only");
    window.print();
    card.classList.remove("print-only");

    incrementPrintCount();
  };

  const incrementPrintCount = async () => {
    if (!member.id) return;
    try {
      const memberRef = doc(db, "memberships", member.id);
      await updateDoc(memberRef, {
        "badge.printCount": (member.badge?.printCount || 0) + 1,
      });
    } catch (error) {
      console.error("Failed to increment print count:", error.message);
    }
  };

  const handleSave = async () => {
    if (!photo) {
      alert("No photo captured. Please take a photo first.");
      return;
    }
    console.log("Member Object:", member);

    if (!member?.id) {
      alert(
        "Member ID is missing. Please ensure the member data is passed correctly."
      );
      return;
    }
    try {
      setUploading(true);

      // Upload photo to Firebase Storage
      const photoRef = ref(storage, `badges/${member.id}-${Date.now()}.jpg`);
      const snapshot = await uploadBytes(photoRef, dataURItoBlob(photo));
      const photoURL = await getDownloadURL(snapshot.ref);

      // Update Firestore with badge details
      const badgeData = {
        badgeNumber,
        scanNumber,
        photoURL,
        printCount: member.badge?.printCount || 0,
      };

      const memberRef = doc(db, "memberships", member.id);
      await updateDoc(memberRef, { badge: badgeData });

      alert("Badge saved successfully!");
      if (onSave) {
        onSave(badgeData); // Notify parent component if callback is provided
      }
    } catch (error) {
      console.error("Failed to save badge:", error.message);
      alert(`Failed to save badge. Error: ${error.message}`);
    } finally {
      setUploading(false); // Ensure the state is reset
    }
  };

  const getBackgroundImage = () => {
    if (!member || !member.status) return "/background.svg";
    switch (member.status) {
      case "Student Tech":
        return "/background_blue.svg";
      case "Member":
        return "/background_yellow.svg";
      default:
        return "/background.svg";
    }
  };

  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        {step === 1 && (
          <div
            className="relative bg-white rounded-lg shadow-lg w-[2.175in] h-[3.325in] flex items-center justify-center"
            style={{
              backgroundImage: `url(${getBackgroundImage()})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="w-full h-full bg-gray-200 rounded">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  width: 300,
                  height: 300,
                  facingMode: "user",
                }}
              />
            </div>
            <button
              onClick={capturePhoto}
              className="absolute bottom-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Take Photo
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input
              type="text"
              value={badgeNumber}
              onChange={(e) => setBadgeNumber(e.target.value)}
              placeholder="Enter badge number"
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <input
              type="text"
              value={scanNumber}
              onChange={(e) => setScanNumber(e.target.value)}
              placeholder="Enter scan number"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        )}

        {step === 3 && (
          <div
            className="relative bg-white rounded-lg shadow-lg w-[2.175in] h-[3.325in] flex flex-col justify-start pl-4 print-card"
            style={{
              backgroundImage: `url(${getBackgroundImage()})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="w-28 h-28 overflow-hidden rounded-2xl border-4 border-white mt-12">
              <img
                src={photo}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full text-left text-sm mt-6 space-y-1">
              <div className="font-bold">{member.name || "Name Here"}</div>
              <div
                className={`w-20 h-1 mt-1 rounded-full ${
                  member.status === "Student Tech"
                    ? "bg-blue-500"
                    : member.status === "Member"
                    ? "bg-yellow-500"
                    : "bg-black"
                }`}
                aria-hidden="true"
              ></div>
              <div className="uppercase font-semibold">
                {member.status || "ROLE HERE"}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Since {currentYear}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded hover:bg-gray-600 transition"
            >
              Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
          {step === 3 && (
            <div className="space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition"
              >
                Print Card
              </button>
              <button
                onClick={handleSave}
                disabled={uploading || !badgeNumber || !scanNumber || !photo}
                className={`px-4 py-2 ${
                  uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                } text-white font-semibold rounded transition`}
              >
                {uploading ? "Saving..." : "Save Badge"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

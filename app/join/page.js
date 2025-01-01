"use client";

import React, { useState } from "react";
import {
  db,
  auth,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  createUserWithEmailAndPassword,
} from "@/lib/firebase/firebaseConfig";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { states, relationships, membershipTypes } from "@/data/dropdowns";

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [parkingRegistrations, setParkingRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    primaryContact: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      phone1: "",
      phone2: "",
    },
    emergencyContacts: [
      {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone1: "",
        phone2: "",
      },
    ],
    status: "member",
    membershipType: "",
    agreeModelRelease: false,
    fullNameSignature: "",
    password: "",
  });

  const [error, setError] = useState("");

  // Handle Next Step
  const nextStep = async () => {
    if (step === 1) {
      const isValid = await validateEmail();
      if (!isValid) return;
    }

    // Mandatory field validation
    if (!validateStep()) return;

    setStep((prev) => prev + 1);
  };

  // Handle Submit
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { email, password, ...membershipData } = formData;

      // Ensure `createUserWithEmailAndPassword` is called with `auth`, `email`, and `password`
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save user to Firestore
      await addDoc(collection(db, "memberships"), { email, ...membershipData });

      alert("Membership created successfully!");
    } catch (err) {
      setError(`Failed to create membership. ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (section, field, e) => {
    setFormData({
      ...formData,
      [section]: { ...formData[section], [field]: e.target.value },
    });
  };

  // Check if email already exists in Firestore (Step 1)
  const validateEmail = async () => {
    if (!formData.email) {
      showError("Email is required.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Please enter a valid email address.");
      return false;
    }

    setLoading(true);
    const q = query(
      collection(db, "memberships"),
      where("email", "==", formData.email)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      showError("This email already has an active membership.");
      setLoading(false);
      return false;
    }

    setLoading(false);
    return true;
  };

  // Validate Primary Contact (Step 1)
  const validateStep1 = async () => {
    if (!(await validateEmail())) return false;

    const { primaryContact } = formData;

    if (
      !primaryContact.firstName ||
      !primaryContact.lastName ||
      !primaryContact.address ||
      !primaryContact.city ||
      !primaryContact.state ||
      !primaryContact.zip ||
      !primaryContact.phone1
    ) {
      showError("All required fields in Primary Contact must be filled.");
      return false;
    }
    return true;
  };

  // Validate Emergency Contacts (Step 2)
  const validateStep2 = () => {
    for (const contact of formData.emergencyContacts) {
      if (
        !contact.firstName ||
        !contact.lastName ||
        !contact.address ||
        !contact.city ||
        !contact.state ||
        !contact.phone1
      ) {
        showError("All required fields in Emergency Contact must be filled.");
        return false;
      }
    }
    return true;
  };

  // Validate Membership Type (Step 3)
  const validateStep3 = () => {
    if (!formData.membershipType) {
      showError("Membership Type is required.");
      return false;
    }
    return true;
  };

  // Validate Parking Registration (Step 4)
  const validateStep4 = () => {
    if (formData.membershipType !== "Student") {
      for (const parking of parkingRegistrations) {
        if (
          !parking.licensePlate ||
          !parking.make ||
          !parking.style ||
          !parking.state ||
          !parking.color
        ) {
          showError("All fields in Parking Registration must be filled.");
          return false;
        }
      }
    }
    return true;
  };

  // Validate Model Release (Step 5)
  const validateStep5 = () => {
    if (!formData.agreeModelRelease) {
      showError("You must agree to the Model Release terms.");
      return false;
    }
    if (!formData.fullNameSignature.trim()) {
      showError("Full Name (as Signature) is required.");
      return false;
    }
    return true;
  };

  // Validate Password (Step 6)
  const validateStep6 = () => {
    const passwordRequirements = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{6,}$/;

    if (!passwordRequirements.test(formData.password)) {
      showError(
        "Password must be at least 6 characters long, include an uppercase letter, a lowercase letter, and a number."
      );
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match.");
      return false;
    }
    return true;
  };

  // Styled Error Dialog
  function ErrorDialog({ error }) {
    if (!error) return null;

    return (
      <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded-md mb-6">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  // Helper to Set Error
  const showError = (message) => {
    setError(message);
  };

  // Parking Registration Helper Functions
  const addParkingRegistration = () =>
    setParkingRegistrations((prev) => [
      ...prev,
      {
        licensePlate: "",
        make: "",
        style: "",
        state: "",
        color: "",
      },
    ]);

  // Validation for Required Fields in Step 1
  const validateStep1Fields = () => {
    const { primaryContact } = formData;

    return (
      formData.email &&
      primaryContact.firstName &&
      primaryContact.lastName &&
      primaryContact.address &&
      primaryContact.city &&
      primaryContact.state &&
      primaryContact.zip &&
      primaryContact.phone1
    );
  };

  // Check All Required Fields for Step 1
  const canProceedStep1 = async () => {
    if (!validateStep1Fields()) return false;

    const emailValid = await validateEmail();
    return emailValid;
  };

  // General Validation Dispatcher
  const validateStep = async () => {
    setError(""); // Clear previous error
    if (step === 1) return await canProceedStep1();
    if (step === 2) return validateStep2();
    if (step === 3) return validateStep3();
    if (step === 4) return validateStep4();
    if (step === 5) return validateStep5();
    if (step === 6) return validateStep6();
    return true;
  };

  const updateParkingRegistration = (index, field, value) => {
    const updated = [...parkingRegistrations];
    updated[index][field] = value;
    setParkingRegistrations(updated);
  };

  const removeParkingRegistration = (index) => {
    setParkingRegistrations((prev) => prev.filter((_, i) => i !== index));
  };

  // Helper functions for emergency contacts
  const addEmergencyContact = () => {
    setFormData((prevData) => ({
      ...prevData,
      emergencyContacts: [
        ...prevData.emergencyContacts,
        {
          firstName: "",
          lastName: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          phone1: "",
          phone2: "",
        },
      ],
    }));
  };

  const updateEmergencyContact = (index, field, e) => {
    setFormData((prevData) => {
      const updatedContacts = [...prevData.emergencyContacts];
      updatedContacts[index][field] = e.target.value;
      return { ...prevData, emergencyContacts: updatedContacts };
    });
  };

  const removeEmergencyContact = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      emergencyContacts: prevData.emergencyContacts.filter(
        (_, i) => i !== index
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-dot-gray-300 p-8 pt-28">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6">
        {/* Step Progress */}
        <StepProgress currentStep={step} totalSteps={6} />

        {/* Error Dialog */}
        <ErrorDialog error={error} />

        <form>
          {/* Step 1: Primary Contact Information */}
          {step === 1 && (
            <Section title="Step 1: Primary Contact Information">
              <LabelInput
                label="Email Address"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <TwoColumnGrid>
                <LabelInput
                  label="First Name"
                  placeholder="John"
                  value={formData.primaryContact.firstName}
                  onChange={(e) =>
                    updateField("primaryContact", "firstName", e)
                  }
                />
                <LabelInput
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.primaryContact.lastName}
                  onChange={(e) => updateField("primaryContact", "lastName", e)}
                />
              </TwoColumnGrid>
              <LabelInput
                label="Street Address"
                placeholder="123 Main St"
                value={formData.primaryContact.address}
                onChange={(e) => updateField("primaryContact", "address", e)}
              />
              <ThreeColumnGrid>
                <LabelInput
                  label="City"
                  placeholder="City"
                  value={formData.primaryContact.city}
                  onChange={(e) => updateField("primaryContact", "city", e)}
                />
                <LabelSelect
                  label="State"
                  options={states}
                  value={formData.primaryContact.state}
                  onChange={(e) => updateField("primaryContact", "state", e)}
                />
                <LabelInput
                  label="Zip Code"
                  placeholder="12345"
                  value={formData.primaryContact.zip}
                  onChange={(e) => updateField("primaryContact", "zip", e)}
                />
              </ThreeColumnGrid>
              <TwoColumnGrid>
                <LabelInput
                  label="Phone 1"
                  placeholder="(123) 456-7890"
                  value={formData.primaryContact.phone1}
                  onChange={(e) => updateField("primaryContact", "phone1", e)}
                />
                <LabelInput
                  label="Phone 2 (Optional)"
                  placeholder="(123) 456-7890"
                  value={formData.primaryContact.phone2}
                  onChange={(e) => updateField("primaryContact", "phone2", e)}
                />
              </TwoColumnGrid>
            </Section>
          )}

          {/* Step 2: Emergency Contacts */}
          {step === 2 && (
            <div>
              {formData.emergencyContacts.map((contact, index) => (
                <Section
                  key={index}
                  title={`Step 2: Emergency Contact ${index + 1}`}
                >
                  <TwoColumnGrid>
                    <LabelInput
                      label="First Name"
                      placeholder="Jane"
                      value={contact.firstName}
                      onChange={(e) =>
                        updateEmergencyContact(index, "firstName", e)
                      }
                    />
                    <LabelInput
                      label="Last Name"
                      placeholder="Doe"
                      value={contact.lastName}
                      onChange={(e) =>
                        updateEmergencyContact(index, "lastName", e)
                      }
                    />
                  </TwoColumnGrid>
                  <LabelInput
                    label="Street Address"
                    placeholder="123 Main St"
                    value={contact.address}
                    onChange={(e) =>
                      updateEmergencyContact(index, "address", e)
                    }
                  />
                  <ThreeColumnGrid>
                    <LabelInput
                      label="City"
                      placeholder="City"
                      value={contact.city}
                      onChange={(e) => updateEmergencyContact(index, "city", e)}
                    />
                    <LabelSelect
                      label="State"
                      options={states}
                      value={contact.state}
                      onChange={(e) =>
                        updateEmergencyContact(index, "state", e)
                      }
                    />
                    <LabelInput
                      label="Zip Code"
                      placeholder="12345"
                      value={contact.zip}
                      onChange={(e) => updateEmergencyContact(index, "zip", e)}
                    />
                  </ThreeColumnGrid>
                  <TwoColumnGrid>
                    <LabelInput
                      label="Phone 1"
                      placeholder="(123) 456-7890"
                      value={contact.phone1}
                      onChange={(e) =>
                        updateEmergencyContact(index, "phone1", e)
                      }
                    />
                    <LabelInput
                      label="Phone 2 (Optional)"
                      placeholder="(123) 456-7890"
                      value={contact.phone2}
                      onChange={(e) =>
                        updateEmergencyContact(index, "phone2", e)
                      }
                    />
                  </TwoColumnGrid>
                  {formData.emergencyContacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmergencyContact(index)}
                      className="mt-4 text-red-500 hover:text-red-700"
                    >
                      Remove Contact
                    </button>
                  )}
                </Section>
              ))}

              <button
                type="button"
                onClick={addEmergencyContact}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add Another Contact
              </button>
            </div>
          )}
          {/* Step 3: Membership Type */}

          {step === 3 && (
            <Section title="Step 3: Membership Type">
              <LabelSelect
                label="Select Membership Type"
                options={membershipTypes.map((type) => type.label)}
                value={formData.membershipType}
                onChange={(e) =>
                  setFormData({ ...formData, membershipType: e.target.value })
                }
              />
            </Section>
          )}
          {/* Step 4: Parking */}

          {step === 4 && formData.membershipType !== "Student" && (
            <Section title="Step 4: Parking Registration">
              <button
                type="button"
                onClick={addParkingRegistration}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Add Vehicle
              </button>
              {parkingRegistrations.map((parking, index) => (
                <Section key={index} title={`Vehicle ${index + 1}`}>
                  <ThreeColumnGrid>
                    <LabelInput
                      label="License Plate"
                      placeholder="ABC123"
                      value={parking.licensePlate}
                      onChange={(e) =>
                        updateParkingRegistration(
                          index,
                          "licensePlate",
                          e.target.value
                        )
                      }
                    />
                    <LabelInput
                      label="Make"
                      placeholder="Toyota"
                      value={parking.make}
                      onChange={(e) =>
                        updateParkingRegistration(index, "make", e.target.value)
                      }
                    />
                    <LabelInput
                      label="Style"
                      placeholder="Sedan"
                      value={parking.style}
                      onChange={(e) =>
                        updateParkingRegistration(
                          index,
                          "style",
                          e.target.value
                        )
                      }
                    />
                  </ThreeColumnGrid>
                  <TwoColumnGrid>
                    <LabelSelect
                      label="State"
                      options={states}
                      value={parking.state}
                      onChange={(e) =>
                        updateParkingRegistration(
                          index,
                          "state",
                          e.target.value
                        )
                      }
                    />
                    <LabelInput
                      label="Color"
                      placeholder="Red"
                      value={parking.color}
                      onChange={(e) =>
                        updateParkingRegistration(
                          index,
                          "color",
                          e.target.value
                        )
                      }
                    />
                  </TwoColumnGrid>
                  <button
                    type="button"
                    onClick={() => removeParkingRegistration(index)}
                    className="mt-4 text-red-500 hover:text-red-700"
                  >
                    Remove Vehicle
                  </button>
                </Section>
              ))}
            </Section>
          )}

          {/* Step 5: Model Release and Disclosure */}
          {step === 5 && (
            <Section title="Step 5: Model Release and Disclosure">
              <p className="mb-4">
                By signing below, you agree or disagree to allow your images or
                likeness to be used in promotional materials, publications, or
                other media.
              </p>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.agreeModelRelease}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      agreeModelRelease: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                I agree to the Model Release terms.
              </label>
              <LabelInput
                label="Full Name (as Signature)"
                placeholder="John Doe"
                value={formData.fullNameSignature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fullNameSignature: e.target.value,
                  })
                }
              />
            </Section>
          )}

          {/* Step 6: Password Creation */}
          {step === 6 && (
            <Section title="Step 6: Password Creation">
              <LabelInput
                label="Create Password"
                type="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              <LabelInput
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
              />
            </Section>
          )}
        </form>
        <NavigationButtons
          step={step}
          totalSteps={6}
          nextStep={async () => {
            if (await validateStep()) setStep((prev) => prev + 1);
          }}
          prevStep={() => setStep((prev) => prev - 1)}
          handleSubmit={handleSubmit} // Pass handleSubmit here
          loading={loading}
          canProceed={step === 1 ? validateStep1Fields() : true}
        />
      </div>
    </div>
  );
}

// Helper Components
function StepProgress({ currentStep, totalSteps }) {
  return (
    <div className="flex mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 mx-1 ${
            i < currentStep ? "bg-blue-500" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function TwoColumnGrid({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>;
}

function ThreeColumnGrid({ children }) {
  return <div className="grid grid-cols-3 gap-4">{children}</div>;
}

function LabelInput({ label, ...props }) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      <Input className="mt-1" {...props} />
    </div>
  );
}

function LabelSelect({ label, options, ...props }) {
  return (
    <div className="flex flex-col">
      <Label>{label}</Label>
      <select
        className="mt-1 h-10 px-3 border border-gray-300 rounded-md"
        {...props}
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function NavigationButtons({
  step,
  totalSteps,
  nextStep,
  prevStep,
  handleSubmit,
  loading,
  canProceed,
}) {
  return (
    <div className="flex justify-between mt-8">
      {/* Back Button */}
      {step > 1 && (
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-500 text-white px-4 py-2 rounded-md"
        >
          Back
        </button>
      )}

      {/* Next or Submit Button */}
      {step < totalSteps ? (
        <button
          type="button"
          onClick={nextStep}
          disabled={!canProceed || loading} // Disable if cannot proceed
          className={`${
            canProceed && !loading
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          } text-white px-4 py-2 rounded-md`}
        >
          Next
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading} // Disable during loading
          className={`${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-2 rounded-md`}
        >
          Submit
        </button>
      )}
    </div>
  );
}

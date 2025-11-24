import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png';

// Equipment type options based on your schema
const EQUIPMENT_TYPES = [
  'Earthmoving Equipment',
  'Lifting & Material Handling Equipment',
  'Concrete & Roadwork Equipment',
  'Drilling & Piling Equipment',
  'Compaction & Demolition Equipment',
  'Utility & Support Equipment',
  'Other'
];

// Condition options based on your schema
const CONDITION_OPTIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Under Repair'
];

const AddMachineForm = () => {
  const navigate = useNavigate();
  const [isRentedForm, setIsRentedForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Track which fields have been touched
  const [touchedFields, setTouchedFields] = useState({});
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  
  const [newMachine, setNewMachine] = useState({
    name: '',
    type: '',
    manufacturer: '',
    serialNumber: '',
    status: 'Stocked',
    condition: 'Good',
    location: '',
    notes: '',
    // Fields for owned machines
    purchaseDate: '',
    lastMaintenanceDate: '',
    // Fields for rented machines
    rentalStart: '',
    rentalEnd: '',
    vendorName: '',
    vendorContact: '',
    rentalCost: ''
  });

  // Validate the form data as it changes
  useEffect(() => {
    validateForm();
  }, [newMachine, isRentedForm]);

  const validateForm = () => {
    const errors = {};
    
    // Equipment name validation - at least 3 chars, max 50
    if (!newMachine.name.trim()) {
      errors.name = 'Equipment name is required';
    } else if (newMachine.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (newMachine.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
    
    // Manufacturer validation - alphanumeric, at least 3 chars, max 50
    if (newMachine.manufacturer.trim()) {
      if (!/^[A-Za-z0-9\s]+$/.test(newMachine.manufacturer)) {
        errors.manufacturer = 'Manufacturer should only contain letters and numbers';
      } else if (newMachine.manufacturer.length < 3) {
        errors.manufacturer = 'Manufacturer must be at least 3 characters';
      } else if (newMachine.manufacturer.length > 50) {
        errors.manufacturer = 'Manufacturer cannot exceed 50 characters';
      }
    }
    
    if (!newMachine.type) {
      errors.type = 'Equipment type is required';
    }
    
    // Location validation
    if (!newMachine.location.trim()) {
      errors.location = 'Location is required';
    } else if (newMachine.location.length < 3) {
      errors.location = 'Location must be at least 3 characters';
    } else if (newMachine.location.length > 100) {
      errors.location = 'Location cannot exceed 100 characters';
    } else if (!/^[A-Za-z0-9\s,.-]+$/.test(newMachine.location)) {
      errors.location = 'Location should only contain letters, numbers, spaces, commas, periods, and hyphens';
    }
    
    // Serial number validation (if provided)
    if (newMachine.serialNumber && !/^[A-Za-z0-9-]+$/.test(newMachine.serialNumber)) {
      errors.serialNumber = 'Serial number should only contain letters, numbers, and hyphens';
    }
    
    // Date validations
    if (!isRentedForm) {
      if (newMachine.purchaseDate && newMachine.lastMaintenanceDate) {
        if (new Date(newMachine.purchaseDate) > new Date(newMachine.lastMaintenanceDate)) {
          errors.lastMaintenanceDate = 'Maintenance date cannot be before purchase date';
        }
      }
    } else {
      if (newMachine.rentalStart && newMachine.rentalEnd) {
        if (new Date(newMachine.rentalStart) > new Date(newMachine.rentalEnd)) {
          errors.rentalEnd = 'End date must be after start date';
        }
      }
      
      // Validate rental cost as a number if provided
      if (newMachine.rentalCost && isNaN(parseFloat(newMachine.rentalCost))) {
        errors.rentalCost = 'Rental cost must be a valid number';
      }
      
      // Vendor name validation - letters only, at least 3 chars, max 50
      if (newMachine.vendorName.trim()) {
        if (!/^[A-Za-z\s]+$/.test(newMachine.vendorName)) {
          errors.vendorName = 'Vendor name should only contain letters and spaces';
        } else if (newMachine.vendorName.length < 3) {
          errors.vendorName = 'Vendor name must be at least 3 characters';
        } else if (newMachine.vendorName.length > 50) {
          errors.vendorName = 'Vendor name cannot exceed 50 characters';
        }
      }
      
      // Vendor contact phone number validation
      if (newMachine.vendorContact.trim()) {
        // Remove common phone number formatting characters for validation
        const cleanedPhoneNumber = newMachine.vendorContact.replace(/[\s()-]/g, '');
        
        // Check if the phone number contains only digits after cleaning
        if (!/^\+?[0-9]{10,15}$/.test(cleanedPhoneNumber)) {
          errors.vendorContact = 'Please enter a valid phone number (10-15 digits, may include +, spaces, parentheses, or hyphens)';
        }
      }
    }
    
    setValidationErrors(errors);
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMachine({
      ...newMachine,
      [name]: value
    });
    
    // Mark this field as touched
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouchedFields({
      ...touchedFields,
      [name]: true
    });
  };

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) < new Date(endDate);
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allTouched = {};
    Object.keys(newMachine).forEach(key => {
      allTouched[key] = true;
    });
    setTouchedFields(allTouched);
    
    // Perform full validation
    const errors = validateForm();
    
    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      setErrorMessage('Please fix the validation errors before submitting.');
      return;
    }

    try {
      // Format dates to ISO string before sending to MongoDB
      const formattedData = {
        ...newMachine,
        status: isRentedForm ? 'Rented' : 'Stocked',
        // Convert dates to ISO strings
        purchaseDate: newMachine.purchaseDate ? new Date(newMachine.purchaseDate).toISOString() : null,
        lastMaintenanceDate: newMachine.lastMaintenanceDate ? new Date(newMachine.lastMaintenanceDate).toISOString() : null,
        rentalStart: newMachine.rentalStart ? new Date(newMachine.rentalStart).toISOString() : null,
        rentalEnd: newMachine.rentalEnd ? new Date(newMachine.rentalEnd).toISOString() : null
      };

      await axios.post('http://localhost:4000/api/equipment', formattedData);
      setSuccessMessage('Equipment added successfully!');
      navigate('/machineInventory');
    } catch (error) {
      setErrorMessage('Failed to add equipment. Please try again.');
      console.error('Error:', error);
    }
  };

  // Determine input class based on validation state
  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-2 rounded-lg border-2 transition-all";
    
    if (!touchedFields[fieldName]) {
      return `${baseClass} border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500`;
    }
    
    return validationErrors[fieldName]
      ? `${baseClass} border-red-500 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-red-50`
      : `${baseClass} border-green-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-500`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header with Logo */}
          <div className="flex items-center gap-3 mb-8">
            <motion.img src={logo} alt="REDBRICK Logo" className="w-10 h-10 object-contain" />
            <span className="text-red-600 text-xl font-bold">RedBrick</span>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              {errorMessage}
            </div>
          )}

          {/* Add New Equipment Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Add New Equipment</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsRentedForm(false);
                    setNewMachine({...newMachine, status: 'Stocked'});
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    !isRentedForm 
                    ? 'bg-red-600 text-white shadow-sm hover:bg-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Company Owned
                </button>
                <button
                  onClick={() => {
                    setIsRentedForm(true);
                    setNewMachine({...newMachine, status: 'Rented'});
                  }}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isRentedForm 
                    ? 'bg-red-600 text-white shadow-sm hover:bg-red-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Rental Equipment
                </button>
              </div>
            </div>

            {/* Form content */}
            <form onSubmit={handleAddMachine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipment Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newMachine.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('name')}
                  maxLength={50}
                  required
                />
                {touchedFields.name && validationErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                )}
              </div>
              
              {/* Equipment Type Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  name="type"
                  value={newMachine.type}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('type')}
                  required
                >
                  <option value="" disabled>Select equipment type</option>
                  {EQUIPMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {touchedFields.type && validationErrors.type && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.type}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={newMachine.manufacturer}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('manufacturer')}
                  maxLength={50}
                />
                {touchedFields.manufacturer && validationErrors.manufacturer && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.manufacturer}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={newMachine.serialNumber}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('serialNumber')}
                />
                {touchedFields.serialNumber && validationErrors.serialNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.serialNumber}</p>
                )}
              </div>
              
              {/* Condition Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={newMachine.condition}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('condition')}
                  required
                >
                  {CONDITION_OPTIONS.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                {touchedFields.condition && validationErrors.condition && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.condition}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={newMachine.location}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('location')}
                  maxLength={100}
                  required
                />
                {touchedFields.location && validationErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={newMachine.notes}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={getInputClassName('notes')}
                />
                {touchedFields.notes && validationErrors.notes && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.notes}</p>
                )}
              </div>

              {/* Conditional fields */}
              {!isRentedForm ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={newMachine.purchaseDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('purchaseDate')}
                    />
                    {touchedFields.purchaseDate && validationErrors.purchaseDate && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.purchaseDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance Date</label>
                    <input
                      type="date"
                      name="lastMaintenanceDate"
                      value={newMachine.lastMaintenanceDate}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('lastMaintenanceDate')}
                    />
                    {touchedFields.lastMaintenanceDate && validationErrors.lastMaintenanceDate && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.lastMaintenanceDate}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental Start Date</label>
                    <input
                      type="date"
                      name="rentalStart"
                      value={newMachine.rentalStart}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('rentalStart')}
                    />
                    {touchedFields.rentalStart && validationErrors.rentalStart && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.rentalStart}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental End Date</label>
                    <input
                      type="date"
                      name="rentalEnd"
                      value={newMachine.rentalEnd}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('rentalEnd')}
                    />
                    {touchedFields.rentalEnd && validationErrors.rentalEnd && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.rentalEnd}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name</label>
                    <input
                      type="text"
                      name="vendorName"
                      value={newMachine.vendorName}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('vendorName')}
                      maxLength={50}
                      placeholder="Enter vendor name"
                    />
                    {touchedFields.vendorName && validationErrors.vendorName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.vendorName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Contact</label>
                    <input
                      type="tel"
                      name="vendorContact"
                      value={newMachine.vendorContact}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('vendorContact')}
                      placeholder="Enter phone number"
                    />
                    {touchedFields.vendorContact && validationErrors.vendorContact && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.vendorContact}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental Cost</label>
                    <input
                      type="text"
                      name="rentalCost"
                      value={newMachine.rentalCost}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={getInputClassName('rentalCost')}
                      placeholder="Enter amount"
                    />
                    {touchedFields.rentalCost && validationErrors.rentalCost && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.rentalCost}</p>
                    )}
                  </div>
                </>
              )}

              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/machineInventory')}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                  >
                    Add Equipment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMachineForm;
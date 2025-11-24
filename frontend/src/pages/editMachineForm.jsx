import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

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

const EditMachineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isRentedForm, setIsRentedForm] = useState(false);
  // Track which fields have been touched
  const [touchedFields, setTouchedFields] = useState({});
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState({});
  const [machine, setMachine] = useState({
    name: '',
    type: '',
    manufacturer: '',
    serialNumber: '',
    status: 'Stocked',
    condition: 'Good',
    location: '',
    notes: '',
    purchaseDate: '',
    lastMaintenanceDate: '',
    rentalStart: '',
    rentalEnd: '',
    vendorName: '',
    vendorContact: '',
    rentalCost: ''
  });

  useEffect(() => {
    const fetchMachine = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/equipment/${id}`);
        setMachine(response.data);
        setIsRentedForm(response.data.status === 'Rented');
      } catch (error) {
        setErrorMessage('Failed to load equipment details');
      } finally {
        setLoading(false);
      }
    };

    fetchMachine();
  }, [id]);

  // Validate the form data as it changes
  useEffect(() => {
    validateForm();
  }, [machine, isRentedForm]);

  const validateForm = () => {
    const errors = {};
    
    // Equipment name validation - at least 3 chars, max 50
    if (!machine.name.trim()) {
      errors.name = 'Equipment name is required';
    } else if (machine.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (machine.name.length > 50) {
      errors.name = 'Name cannot exceed 50 characters';
    }
    
    // Manufacturer validation - alphanumeric, at least 3 chars, max 50
    if (machine.manufacturer.trim()) {
      if (!/^[A-Za-z0-9\s]+$/.test(machine.manufacturer)) {
        errors.manufacturer = 'Manufacturer should only contain letters and numbers';
      } else if (machine.manufacturer.length < 3) {
        errors.manufacturer = 'Manufacturer must be at least 3 characters';
      } else if (machine.manufacturer.length > 50) {
        errors.manufacturer = 'Manufacturer cannot exceed 50 characters';
      }
    }
    
    if (!machine.type) {
      errors.type = 'Equipment type is required';
    }
    
    // Location validation
    if (!machine.location.trim()) {
      errors.location = 'Location is required';
    } else if (machine.location.length < 3) {
      errors.location = 'Location must be at least 3 characters';
    } else if (machine.location.length > 100) {
      errors.location = 'Location cannot exceed 100 characters';
    } else if (!/^[A-Za-z0-9\s,.-]+$/.test(machine.location)) {
      errors.location = 'Location should only contain letters, numbers, spaces, commas, periods, and hyphens';
    }
    
    // Serial number validation (if provided)
    if (machine.serialNumber && !/^[A-Za-z0-9-]+$/.test(machine.serialNumber)) {
      errors.serialNumber = 'Serial number should only contain letters, numbers, and hyphens';
    }

    // Date validations based on form type
    if (!isRentedForm) {
      if (machine.purchaseDate && machine.lastMaintenanceDate) {
        if (new Date(machine.purchaseDate) > new Date(machine.lastMaintenanceDate)) {
          errors.lastMaintenanceDate = 'Maintenance date cannot be before purchase date';
        }
      }
    } else {
      if (machine.rentalStart && machine.rentalEnd) {
        if (new Date(machine.rentalStart) > new Date(machine.rentalEnd)) {
          errors.rentalEnd = 'End date must be after start date';
        }
      }
      
      if (machine.rentalCost && isNaN(parseFloat(machine.rentalCost))) {
        errors.rentalCost = 'Rental cost must be a valid number';
      }
      
      if (machine.vendorName.trim()) {
        if (!/^[A-Za-z\s]+$/.test(machine.vendorName)) {
          errors.vendorName = 'Vendor name should only contain letters and spaces';
        } else if (machine.vendorName.length < 3) {
          errors.vendorName = 'Vendor name must be at least 3 characters';
        } else if (machine.vendorName.length > 50) {
          errors.vendorName = 'Vendor name cannot exceed 50 characters';
        }
      }
      
      if (machine.vendorContact.trim()) {
        const cleanedPhoneNumber = machine.vendorContact.replace(/[\s()-]/g, '');
        if (!/^\+?[0-9]{10,15}$/.test(cleanedPhoneNumber)) {
          errors.vendorContact = 'Please enter a valid phone number (10-15 digits, may include +, spaces, parentheses, or hyphens)';
        }
      }
    }
    
    setValidationErrors(errors);
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMachine(prev => ({
      ...prev,
      [name]: value
    }));
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    const allTouched = {};
    Object.keys(machine).forEach(key => {
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
      // Format dates before sending
      const formattedData = {
        ...machine,
        purchaseDate: machine.purchaseDate ? new Date(machine.purchaseDate).toISOString() : null,
        lastMaintenanceDate: machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toISOString() : null,
        rentalStart: machine.rentalStart ? new Date(machine.rentalStart).toISOString() : null,
        rentalEnd: machine.rentalEnd ? new Date(machine.rentalEnd).toISOString() : null
      };

      await axios.put(`http://localhost:4000/api/equipment/${id}`, formattedData);
      setSuccessMessage('Equipment updated successfully!');
      setTimeout(() => {
        navigate('/machineInventory');
      }, 2000);
    } catch (error) {
      setErrorMessage('Failed to update equipment');
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

  if (loading) return <div>Loading...</div>;
  if (!machine) return <div>Equipment not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Edit Equipment</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsRentedForm(false);
                  setMachine(prev => ({ ...prev, status: 'Stocked' }));
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
                type="button"
                onClick={() => {
                  setIsRentedForm(true);
                  setMachine(prev => ({ ...prev, status: 'Rented' }));
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
              <input
                type="text"
                name="name"
                value={machine.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getInputClassName('name')}
                required
                maxLength={50}
              />
              {touchedFields.name && validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Add all the same form fields as in addMachineForm.jsx */}
            {/* Just change the value and onChange props to use machine and handleChange */}

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
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMachineForm;

// In your backend router
router.put('/api/equipment/:id', async (req, res) => {
  try {
    const updatedMachine = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedMachine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
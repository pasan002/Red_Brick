
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBox, FaCog, FaClipboardList, FaTruck, FaChartBar, FaUserCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo.png'; // adjust the path as needed
import axios from 'axios';

const InventoryManagement = () => {
  // Initial data for company machines
  const initialMachines = [
    {
      id: '1',
      name: 'Excavator XL2000',
      type: 'Heavy Equipment',
      manufacturer: 'Caterpillar',
      serialNumber: 'CAT-EX-12345',
      purchaseDate: '2022-05-15',
      status: 'Stocked', // Company owned
      condition: 'Good',
      lastMaintenanceDate: '2024-01-10',
      location: 'Main Warehouse', 
      notes: 'Regular maintenance up to date'
    },
    {
      id: '2',
      name: 'Concrete Mixer CM500',
      type: 'Concrete Equipment',
      manufacturer: 'DeWalt',
      serialNumber: 'DW-CM-78901',
      purchaseDate: '2023-08-20',
      status: 'Stocked', // Company owned
      condition: 'Excellent',
      lastMaintenanceDate: '2024-02-15',
      location: 'Site B',
      notes: 'New mixer purchased last year'
    },
    {
      id: '3',
      name: 'Tower Crane TC300',
      type: 'Lifting Equipment',
      manufacturer: 'Liebherr',
      serialNumber: 'N/A',
      rentalStart: '2024-01-05',
      rentalEnd: '2024-06-05',
      status: 'Rented', // Rented from elsewhere
      condition: 'Good',
      location: 'Downtown Project',
      vendorName: 'ConstructRent Co.',
      vendorContact: '555-123-4567',
      rentalCost: 'Rs.5000/month',
      notes: 'Rented for the high-rise project'
    },
    {
      id: '4',
      name: 'Bulldozer D8R',
      type: 'Earth Moving',
      manufacturer: 'Komatsu',
      serialNumber: 'N/A',
      rentalStart: '2024-02-10',
      rentalEnd: '2024-04-10',
      status: 'Rented', // Rented from elsewhere
      condition: 'Fair',
      location: 'Highway Extension Project',
      vendorName: 'HeavyMachine Rentals',
      vendorContact: '555-987-6543',
      rentalCost: 'Rs.3800/month',
      notes: 'Minor hydraulic leak reported to vendor'
    }
  ];

  const validateDates = (startDate, endDate) => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) < new Date(endDate);
  };

  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('All');
  const [isRentedForm, setIsRentedForm] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const API_URL = 'http://localhost:4000/api/equipment';  // Make sure port matches your backend

  // Load equipment from backend
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);
        setMachines(response.data);
      } catch (error) {
        setErrorMessage('Failed to load equipment. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMachine({
      ...newMachine,
      [name]: value
    });

    // When status changes, update form type
    if (name === 'status') {
      setIsRentedForm(value === 'Rented');
    }
  };

  const handleAddMachine = async (e) => {
    e.preventDefault();
    
    // Date validation for rental equipment
    if (isRentedForm) {
      if (!validateDates(newMachine.rentalStart, newMachine.rentalEnd)) {
        setErrorMessage('Rental end date must be after the start date');
        return;
      }
    } else {
      // Date validation for company-owned equipment
      if (newMachine.lastMaintenanceDate && newMachine.purchaseDate) {
        if (!validateDates(newMachine.purchaseDate, newMachine.lastMaintenanceDate)) {
          setErrorMessage('Maintenance date cannot be before purchase date');
          return;
        }
      }
    }

    try {
      setLoading(true);
      
      // Prepare the equipment data
      const equipmentData = {
        ...newMachine,
        status: isRentedForm ? 'Rented' : 'Stocked',
        // Convert date strings to Date objects
        purchaseDate: newMachine.purchaseDate ? new Date(newMachine.purchaseDate) : null,
        lastMaintenanceDate: newMachine.lastMaintenanceDate ? new Date(newMachine.lastMaintenanceDate) : null,
        rentalStart: newMachine.rentalStart ? new Date(newMachine.rentalStart) : null,
        rentalEnd: newMachine.rentalEnd ? new Date(newMachine.rentalEnd) : null
      };

      // Send POST request to backend
      const response = await axios.post(API_URL, equipmentData);
      
      // Update the local state with the new equipment
      setMachines(prevMachines => [...prevMachines, response.data]);
      
      // Reset form
      setNewMachine({
        name: '',
        type: '',
        manufacturer: '',
        serialNumber: '',
        status: isRentedForm ? 'Rented' : 'Stocked',
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
      
      setSuccessMessage('Equipment added successfully!');
      
      // Refresh the equipment list
      const updatedEquipment = await axios.get(API_URL);
      setMachines(updatedEquipment.data);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add equipment. Please try again.');
    } finally {
      setLoading(false);
      // Clear success/error messages after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleRemoveMachine = async (id) => {
    if (window.confirm('Are you sure you want to remove this equipment?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/${id}`);
        
        // Update local state to remove the deleted item
        setMachines(prevMachines => prevMachines.filter(machine => machine._id !== id));
        
        setSuccessMessage('Equipment removed successfully!');
      } catch (error) {
        setErrorMessage('Failed to remove equipment. Please try again.');
      } finally {
        setLoading(false);
        // Clear messages after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  const handleEdit = (machine) => {
    setEditingMachine({...machine});
    setShowEditModal(true);
  };

  const handleUpdateMachine = async (e) => {
    e.preventDefault();

    // Date validation for rental equipment
    if (editingMachine.status === 'Rented') {
      if (!validateDates(editingMachine.rentalStart, editingMachine.rentalEnd)) {
        setErrorMessage('Rental end date must be after the start date');
        return;
      }
    } else {
      // Date validation for company-owned equipment
      if (editingMachine.lastMaintenanceDate && editingMachine.purchaseDate) {
        if (!validateDates(editingMachine.purchaseDate, editingMachine.lastMaintenanceDate)) {
          setErrorMessage('Maintenance date cannot be before purchase date');
          return;
        }
      }
    }

    try {
      setLoading(true);
      
      // Prepare the equipment data
      const equipmentData = {
        ...editingMachine,
        // Convert date strings to Date objects
        purchaseDate: editingMachine.purchaseDate ? new Date(editingMachine.purchaseDate) : null,
        lastMaintenanceDate: editingMachine.lastMaintenanceDate ? new Date(editingMachine.lastMaintenanceDate) : null,
        rentalStart: editingMachine.rentalStart ? new Date(editingMachine.rentalStart) : null,
        rentalEnd: editingMachine.rentalEnd ? new Date(editingMachine.rentalEnd) : null
      };

      const response = await axios.put(`${API_URL}/${editingMachine._id}`, equipmentData);
      
      // Update the machines list with the updated machine
      setMachines(prevMachines => 
        prevMachines.map(machine => 
          machine._id === editingMachine._id ? response.data : machine
        )
      );
      
      setSuccessMessage('Equipment updated successfully!');
      setShowEditModal(false);
      setEditingMachine(null);
      
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to update equipment. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingMachine(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter machines based on selected filter
  const filteredMachines = filter === 'All' 
    ? machines 
    : machines.filter(machine => machine.status === filter);

  const inputClassName = "w-full px-4 py-2 rounded-lg border-2 border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="fixed h-full w-64 bg-white border-r border-gray-200 shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <motion.img 
              src={logo} 
              alt="REDBRICK Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-red-600 text-xl font-bold">RedBrick</span>
          </div>

          <div className="space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
            
            <Link 
              to="/task" 
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Tasks</span>
            </Link>
            <Link 
              to="/purchase" 
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span>Purchase</span>
            </Link>
            <Link 
              to="/machineInventory" 
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Machinery Inventory</span>
            </Link>
            <Link 
              to="/inventory" 
              className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Site Diary</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 ml-64 bg-gray-50">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Construction Equipment Inventory</h1>
            
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

              {/* Update form inputs with modern styling */}
              <form onSubmit={handleAddMachine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Example of updated input styling */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newMachine.name}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <input
                    type="text"
                    name="type"
                    placeholder="e.g., Heavy Equipment, Power Tools, etc."
                    value={newMachine.type}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                  <input
                    type="text"
                    name="manufacturer"
                    value={newMachine.manufacturer}
                    onChange={handleInputChange}
                    className={inputClassName}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g., Main Warehouse, Project Site, etc."
                    value={newMachine.location}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    name="condition"
                    value={newMachine.condition}
                    onChange={handleInputChange}
                    className={inputClassName}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                    <option value="Under Repair">Under Repair</option>
                  </select>
                </div>
                
                {/* Conditional fields based on whether it's company owned or rented */}
                {!isRentedForm ? (
                  // Fields for company owned equipment
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                      <input
                        type="text"
                        name="serialNumber"
                        value={newMachine.serialNumber}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                      <input
                        type="date"
                        name="purchaseDate"
                        value={newMachine.purchaseDate}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance Date</label>
                      <input
                        type="date"
                        name="lastMaintenanceDate"
                        value={newMachine.lastMaintenanceDate}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>
                  </>
                ) : (
                  // Fields for rented equipment
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Start Date *</label>
                      <input
                        type="date"
                        name="rentalStart"
                        value={newMachine.rentalStart}
                        onChange={handleInputChange}
                        max={newMachine.rentalEnd}
                        className={inputClassName}
                        required={isRentedForm}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental End Date *</label>
                      <input
                        type="date"
                        name="rentalEnd"
                        value={newMachine.rentalEnd}
                        onChange={handleInputChange}
                        min={newMachine.rentalStart}
                        className={inputClassName}
                        required={isRentedForm}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                      <input
                        type="text"
                        name="vendorName"
                        value={newMachine.vendorName}
                        onChange={handleInputChange}
                        className={inputClassName}
                        required={isRentedForm}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Contact</label>
                      <input
                        type="text"
                        name="vendorContact"
                        value={newMachine.vendorContact}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rental Cost</label>
                      <input
                        type="text"
                        name="rentalCost"
                        placeholder="e.g., Rs.5000/day, Rs.50000/month"
                        value={newMachine.rentalCost}
                        onChange={handleInputChange}
                        className={inputClassName}
                      />
                    </div>
                  </>
                )}
                
                {/* Notes field - common to both types */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={newMachine.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className={inputClassName}
                    placeholder="Any additional information about the equipment..."
                  ></textarea>
                </div>
                
                <div className="md:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-sm"
                  >
                    Add Equipment
                  </button>
                </div>
              </form>
            </div>

            {/* Inventory List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Equipment Inventory</h2>
                <div className="flex gap-3">
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className={`${inputClassName} appearance-none pr-10`}
                    >
                      <option value="All">All Equipment</option>
                      <option value="Stocked">Company Owned</option>
                      <option value="Rented">Rental Equipment</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() => setFilter('All')}
                    className="whitespace-nowrap px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredMachines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No equipment found. Add some equipment to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Equipment</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Type/Details</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Location</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Key Dates</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMachines.map((machine) => (
                        <tr key={machine._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                            <div className="text-sm text-gray-500">{machine.manufacturer}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{machine.type}</div>
                            {machine.status === 'Stocked' ? (
                              <div className="text-sm text-gray-500">SN: {machine.serialNumber || 'N/A'}</div>
                            ) : (
                              <div className="text-sm text-gray-500">Vendor: {machine.vendorName || 'N/A'}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              machine.status === 'Stocked' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {machine.status === 'Stocked' ? 'Company Owned' : 'Rental'}
                            </span>
                            <div className="mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                machine.condition === 'Excellent' ? 'bg-green-100 text-green-800' : 
                                machine.condition === 'Good' ? 'bg-green-100 text-green-800' : 
                                machine.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' : 
                                machine.condition === 'Poor' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {machine.condition}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {machine.location || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {machine.status === 'Stocked' ? (
                              <>
                                <div>Purchased: {machine.purchaseDate ? new Date(machine.purchaseDate).toLocaleDateString() : 'N/A'}</div>
                                <div>Last Maintenance: {machine.lastMaintenanceDate ? new Date(machine.lastMaintenanceDate).toLocaleDateString() : 'N/A'}</div>
                              </>
                            ) : (
                              <>
                                <div>Start: {machine.rentalStart ? new Date(machine.rentalStart).toLocaleDateString() : 'N/A'}</div>
                                <div>End: {machine.rentalEnd ? new Date(machine.rentalEnd).toLocaleDateString() : 'N/A'}</div>
                                {machine.rentalCost && <div className="font-medium">{machine.rentalCost}</div>}
                              </>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(machine)}
                                className="group relative bg-blue-500 px-4 py-2 rounded-xl text-white font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 transform hover:scale-105"
                              >
                                Edit
                                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              </button>
                              <button
                                onClick={() => handleRemoveMachine(machine._id)}
                                className="group relative bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 rounded-xl text-white font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-red-500/30 transform hover:scale-105"
                              >
                                Remove
                                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Edit Equipment</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateMachine} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editingMachine?.name || ''}
                  onChange={handleEditInputChange}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <input
                  type="text"
                  name="type"
                  value={editingMachine?.type || ''}
                  onChange={handleEditInputChange}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={editingMachine?.manufacturer || ''}
                  onChange={handleEditInputChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={editingMachine?.location || ''}
                  onChange={handleEditInputChange}
                  className={inputClassName}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  name="condition"
                  value={editingMachine?.condition || 'Good'}
                  onChange={handleEditInputChange}
                  className={inputClassName}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                  <option value="Under Repair">Under Repair</option>
                </select>
              </div>

              {/* Status-specific fields */}
              {editingMachine?.status === 'Stocked' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                    <input
                      type="text"
                      name="serialNumber"
                      value={editingMachine?.serialNumber || ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={editingMachine?.purchaseDate ? new Date(editingMachine.purchaseDate).toISOString().split('T')[0] : ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Maintenance Date</label>
                    <input
                      type="date"
                      name="lastMaintenanceDate"
                      value={editingMachine?.lastMaintenanceDate ? new Date(editingMachine.lastMaintenanceDate).toISOString().split('T')[0] : ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental Start Date *</label>
                    <input
                      type="date"
                      name="rentalStart"
                      value={editingMachine?.rentalStart ? new Date(editingMachine.rentalStart).toISOString().split('T')[0] : ''}
                      onChange={handleEditInputChange}
                      max={editingMachine?.rentalEnd ? new Date(editingMachine.rentalEnd).toISOString().split('T')[0] : undefined}
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental End Date *</label>
                    <input
                      type="date"
                      name="rentalEnd"
                      value={editingMachine?.rentalEnd ? new Date(editingMachine.rentalEnd).toISOString().split('T')[0] : ''}
                      onChange={handleEditInputChange}
                      min={editingMachine?.rentalStart ? new Date(editingMachine.rentalStart).toISOString().split('T')[0] : undefined}
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                    <input
                      type="text"
                      name="vendorName"
                      value={editingMachine?.vendorName || ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Contact</label>
                    <input
                      type="text"
                      name="vendorContact"
                      value={editingMachine?.vendorContact || ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rental Cost</label>
                    <input
                      type="text"
                      name="rentalCost"
                      value={editingMachine?.rentalCost || ''}
                      onChange={handleEditInputChange}
                      className={inputClassName}
                    />
                  </div>
                </>
              )}

              {/* Notes field */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={editingMachine?.notes || ''}
                  onChange={handleEditInputChange}
                  rows="3"
                  className={inputClassName}
                ></textarea>
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-sm"
                  >
                    Update Equipment
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
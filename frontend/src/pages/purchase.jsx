import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const inputClassName = "w-full px-4 py-2 rounded-lg border-2 border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

const PurchaseOrder = () => {
  // Add state for form data
  const [formData, setFormData] = useState({
    projectCode: '',
    materialType: '',
    quantity: '',
    unit: '',
    price: '',
    description: ''
  });

  // Add state for purchases list
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');

  // Add state for status messages
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all purchases on component mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Function to fetch all purchases
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/purchases');
      setPurchases(response.data);
    } catch (error) {
      setErrorMessage('Failed to load purchases. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:4000/api/purchases', formData);
      setSuccessMessage('Purchase order created successfully!');
      // Reset form
      setFormData({
        projectCode: '',
        materialType: '',
        quantity: '',
        unit: '',
        price: '',
        description: ''
      });
      // Refresh purchases list
      fetchPurchases();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error creating purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a purchase
  const handleDeletePurchase = async (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:4000/api/purchases/${id}`);
        setPurchases(prevPurchases => prevPurchases.filter(purchase => purchase._id !== id));
        setSuccessMessage('Purchase order deleted successfully!');
      } catch (error) {
        setErrorMessage('Failed to delete purchase order. Please try again.');
      } finally {
        setLoading(false);
        setTimeout(() => {
          setSuccessMessage('');
          setErrorMessage('');
        }, 3000);
      }
    }
  };

  // Function to download purchases as PDF
  const downloadPDF = () => {
    if (!filteredPurchases || filteredPurchases.length === 0) {
      setErrorMessage('No data available to download');
      return;
    }

    try {
      // Create PDF document in landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      
      // Define colors
      const primaryColor = [99, 0, 0]; // Dark red for header background
      const textGray = [50, 50, 50]; // Dark gray for text
      const lightBeige = [252, 234, 187]; // Light beige for table headers
      const lightCream = [255, 248, 235]; // Light cream for table rows
      
      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add header background - dark red
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // Add logo to the header - convert the imported logo to base64
      const logoImg = new Image();
      logoImg.src = logo;
      
      logoImg.onload = function() {
        // Once the image is loaded, continue with PDF generation
        // Create a canvas to draw the image and convert it to base64
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.width;
        canvas.height = logoImg.height;
        ctx.drawImage(logoImg, 0, 0);
        
        // Get base64 representation
        const logoBase64 = canvas.toDataURL('image/png');
        
        // Add the logo - match the position in the image
        const logoHeight = 16; // Smaller logo
        const logoWidth = (logoImg.width / logoImg.height) * logoHeight;
        
        // Calculate vertical positions to center-align logo and text
        const headerHeight = 25; // Total header height
        const logoY = (headerHeight - logoHeight) / 2; // Center the logo vertically
        const textY = headerHeight / 2 + 2; // Center the text (with slight adjustment for visual alignment)
        
        doc.addImage(logoBase64, 'PNG', 35, logoY, logoWidth, logoHeight);
        
        // Add company name in header - position to match image
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.text('Red Brick Constructions', 35 + logoWidth + 10, textY);
        
        // Add generated date - match position in top right
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 15, 16, { align: 'right' });
        
        // Add title section with white background - match the positioning
        doc.setTextColor(...textGray);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Purchase Orders Report', 35, 45);
        
        // Add total count of purchases - match position
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total purchases: ${filteredPurchases.length}`, pageWidth - 35, 45, { align: 'right' });
        
        // If filter is active, add filter criteria
        if (searchQuery) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(`Filtered by search: "${searchQuery}"`, 35, 50);
        }
        
        // Prepare columns with custom widths
        const columns = [
          { header: 'Project Code', dataKey: 'projectCode' },
          { header: 'Material Type', dataKey: 'materialType' },
          { header: 'Quantity', dataKey: 'quantity' },
          { header: 'Unit', dataKey: 'unit' },
          { header: 'Price', dataKey: 'price' },
          { header: 'Total', dataKey: 'total' },
          { header: 'Date', dataKey: 'date' },
        ];
        
        // Prepare rows
        const rows = filteredPurchases.map(purchase => {
          return {
            projectCode: purchase.projectCode,
            materialType: purchase.materialType,
            quantity: purchase.quantity.toString(),
            unit: purchase.unit,
            price: `$${purchase.price.toFixed(2)}`,
            total: `$${(purchase.price * purchase.quantity).toFixed(2)}`,
            date: new Date(purchase.createdAt).toLocaleDateString(),
          };
        });
        
        // Create table with styling
        autoTable(doc, {
          head: [columns.map(col => col.header)],
          body: rows.map(row => columns.map(col => row[col.dataKey])),
          startY: 60,
          theme: 'grid',
          tableWidth: 'auto',
          margin: { left: 35, right: 35 },
          styles: {
            fontSize: 10,
            cellPadding: { top: 8, right: 5, bottom: 8, left: 5 },
            lineColor: [220, 220, 220],
            lineWidth: 0.1,
            overflow: 'linebreak',
          },
          headStyles: {
            fillColor: [...lightBeige],
            textColor: [...textGray],
            fontStyle: 'bold',
            halign: 'left',
          },
          bodyStyles: {
            fillColor: [...lightCream],
          },
          alternateRowStyles: {
            fillColor: [...lightCream],
          },
        });
        
        // Save the PDF
        const fileName = `purchase-orders-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        
        setSuccessMessage('PDF downloaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      };
      
      // Add error handler for logo loading
      logoImg.onerror = function() {
        setErrorMessage('Error loading logo image');
      };
    } catch (error) {
      console.error('PDF generation error:', error);
      setErrorMessage(`Failed to generate PDF: ${error.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Filter purchases based on search query
  const filteredPurchases = purchases.filter(purchase => {
    const searchLower = searchQuery.toLowerCase();
    return (
      purchase.projectCode.toLowerCase().includes(searchLower) ||
      purchase.materialType.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">Purchase Orders</h1>

            {/* Form Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Purchase Order</h2>
              
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

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Project Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Code *</label>
                  <input 
                    type="text"
                    name="projectCode"
                    value={formData.projectCode}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter project code"
                    required
                  />
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Material Type *</label>
                  <input 
                    type="text"
                    name="materialType"
                    value={formData.materialType}
                    onChange={handleInputChange}
                    className={inputClassName}
                    placeholder="Enter material type"
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input 
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className={inputClassName}
                    placeholder="Enter quantity"
                    required
                  />
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                  <select 
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className={inputClassName}
                    required
                  >
                    <option value="">Select unit...</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="m3">Cubes (Cu)</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                  <input 
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={inputClassName}
                    placeholder="Enter price"
                    required
                  />
                </div>

                {/* Description - Full Width */}
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={inputClassName}
                    placeholder="Enter description"
                  ></textarea>
                </div>

                {/* Submit Button - Full Width */}
                <div className="col-span-full flex justify-end mt-4">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className={`px-6 py-2 bg-red-600 text-white rounded-lg font-medium transition-all shadow-sm ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                    }`}
                  >
                    {isLoading ? 'Creating...' : 'Create Purchase Order'}
                  </button>
                </div>
              </form>
            </div>

            {/* Purchases List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Purchase Orders List</h2>
                <div className="flex gap-3 items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by project code or material..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${inputClassName} min-w-[300px] pl-10`}
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="whitespace-nowrap px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="whitespace-nowrap px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredPurchases.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No purchase orders found. Create a new purchase order to get started.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Project Code
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Material Type
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Quantity
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Unit
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Price ($)
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Total ($)
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-600">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPurchases.map((purchase) => (
                        <tr key={purchase._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {purchase.projectCode}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {purchase.materialType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {purchase.quantity}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {purchase.unit === 'kg' ? 'Kilograms (kg)' : 
                             purchase.unit === 'm3' ? 'Cubes (Cu)' : 
                             purchase.unit === 'bags' ? 'Bags' : purchase.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ${purchase.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            ${(purchase.price * purchase.quantity).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDeletePurchase(purchase._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
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
    </div>
  );
};

export default PurchaseOrder;
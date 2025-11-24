import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "../assets/images/logo.png";
import ExpenseReport from "../components/ExpenseReport";
import Sidebar from "../components/Sidebar";

// Configure axios
axios.defaults.baseURL = "http://localhost:4000";
axios.defaults.headers.post["Content-Type"] = "application/json";

// Add Notification Component
const Notification = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-[300px]`}>
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Add this component before the ExpensesPage component
const ValidationMessage = ({ message }) => (
  <p className="mt-1 text-sm text-gray-500 italic">{message}</p>
);

// Add this helper function at the top of your component
const containsSpecialCharacters = (str) => {
  const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+/;
  return specialChars.test(str);
};

const ExpensesPage = () => {
  // State declarations
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [totalBudget, setTotalBudget] = useState(() => {
    const savedBudgets = localStorage.getItem("projectBudgets");
    return savedBudgets ? JSON.parse(savedBudgets) : {};
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState("");
  const [selectedProjectForBudget, setSelectedProjectForBudget] = useState("");
  const [selectedProjectForView, setSelectedProjectForView] = useState("");
  const [editingExpense, setEditingExpense] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [projects, setProjects] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state with default values
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "material",
    date: new Date().toISOString().substr(0, 10),
    description: "",
    paymentMethod: "cash",
    projectId: "",
    receipt: null,
  });

  // Add these new state declarations after your existing state declarations
  const [focusedField, setFocusedField] = useState(null);
  const [validationMessages] = useState({
    title: "Title must be at least 3 characters long",
    amount: "Amount must be greater than 0",
    category: "Please select a category",
    date: "Please select a valid date",
    paymentMethod: "Please select a payment method",
    projectId: "Please select a project",
    description: "Description is optional but helpful for record keeping",
  });

  // Add these after your existing state declarations
  const [validationErrors, setValidationErrors] = useState({});

  // Add this new state for the budget modal
  const [budgetModalData, setBudgetModalData] = useState({
    projectId: "",
    amount: ""
  });

  // Add notification state
  const [notification, setNotification] = useState(null);

  // Add receipt preview state
  const [receiptPreview, setReceiptPreview] = useState(null);

  // Add notification handler
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Update the validateField function
  const validateField = (name, value) => {
    switch (name) {
      case "title":
        if (value.length < 3) return "Title must be at least 3 characters long";
        if (containsSpecialCharacters(value)) return "Title cannot contain special characters";
        return "";
      case "amount":
        return parseFloat(value) > 0 ? "" : validationMessages.amount;
      case "projectId":
        return value ? "" : validationMessages.projectId;
      case "category":
        return value ? "" : validationMessages.category;
      case "date":
        return value ? "" : validationMessages.date;
      case "paymentMethod":
        return value ? "" : validationMessages.paymentMethod;
      default:
        return "";
    }
  };

  // Add this validation helper function
  const validateForm = () => {
    const errors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "description") {
        // Description is optional
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fetch expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get("/api/expenses");
        if (response.data) {
          // Process expenses to format receipt URLs
          const processedExpenses = Array.isArray(response.data)
            ? response.data
            : response.data.expenses || [];
            
          // Map through expenses and add full URLs to receipt paths
          const expensesWithFormattedReceipts = processedExpenses.map(expense => {
            if (expense.receipt && !expense.receipt.startsWith('data:') && !expense.receipt.startsWith('http')) {
              // Add server URL to receipt filename
              return {
                ...expense,
                receipt: `http://localhost:4000/uploads/${expense.receipt}`
              };
            }
            return expense;
          });
          
          setExpenses(expensesWithFormattedReceipts);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load expenses");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Fetch projects data
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get("/api/projects");
        setProjects(response.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate the field and update validation errors
    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    if (name === "projectId" && value) {
      setFormVisible(true);
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: "",
      title: "",
      amount: "",
      category: "material",
      date: new Date().toISOString().substr(0, 10),
      description: "",
      paymentMethod: "cash",
      receipt: null,
    });
    setReceiptPreview(null);
    setIsEditing(false);
    setEditingExpense(null);
    setFormVisible(false);
  };

  const handleReceiptChange = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptPreview(reader.result);
          setFormData(prev => ({ ...prev, receipt: reader.result }));
        };
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, store the file object
        setFormData(prev => ({ ...prev, receipt: file }));
        setReceiptPreview(null);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('projectId', formData.projectId);
      formDataToSend.append('description', formData.description);
      
      // Handle receipt data
      if (formData.receipt) {
        if (formData.receipt instanceof File) {
          formDataToSend.append('receipt', formData.receipt);
        } else if (typeof formData.receipt === 'string') {
          // If it's a base64 string (from preview), convert it to a blob
          const base64Data = formData.receipt.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          formDataToSend.append('receipt', file);
        }
      }

      const response = await axios.post("/api/expenses", formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const newExpense = response.data.data || response.data;
        // Ensure receipt data is properly set
        if (formData.receipt) {
          newExpense.receipt = formData.receipt instanceof File 
            ? URL.createObjectURL(formData.receipt)
            : formData.receipt;
        }
        setExpenses((prev) => [...prev, newExpense]);
        showNotification("Expense added successfully!");
        resetForm();
        setFormVisible(false);
        setReceiptPreview(null);
      }
    } catch (err) {
      console.error("Error creating expense:", err);
      showNotification(err.response?.data?.message || "Failed to add expense", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: new Date(expense.date).toISOString().substr(0, 10),
      description: expense.description || "",
      paymentMethod: expense.paymentMethod,
      projectId: expense.projectId,
      receipt: expense.receipt ? expense.receipt : null,
    });
    if (expense.receipt) {
      setReceiptPreview(expense.receipt);
    }
    setIsEditing(true);
    setFormVisible(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingExpense?._id) return;

    try {
      setLoading(true);
      setError(null);

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('amount', parseFloat(formData.amount));
      formDataToSend.append('category', formData.category);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('paymentMethod', formData.paymentMethod);
      formDataToSend.append('projectId', formData.projectId);
      formDataToSend.append('description', formData.description);
      
      // Handle receipt data
      if (formData.receipt) {
        if (formData.receipt instanceof File) {
          formDataToSend.append('receipt', formData.receipt);
        } else if (typeof formData.receipt === 'string') {
          // If it's a base64 string (from preview), convert it to a blob
          const base64Data = formData.receipt.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
            const slice = byteCharacters.slice(offset, offset + 1024);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: 'image/jpeg' });
          const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
          formDataToSend.append('receipt', file);
        }
      }

      const response = await axios.put(
        `/api/expenses/${editingExpense._id}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        const updatedExpense = response.data.data || response.data;
        // Ensure receipt data is properly set
        if (formData.receipt) {
          updatedExpense.receipt = formData.receipt instanceof File 
            ? URL.createObjectURL(formData.receipt)
            : formData.receipt;
        }
        setExpenses((prev) =>
          prev.map((exp) =>
            exp._id === editingExpense._id ? updatedExpense : exp
          )
        );
        showNotification("Expense updated successfully!");
        resetForm();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to update expense", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.delete(`/api/expenses/${id}`);
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      showNotification("Expense deleted successfully!");
    } catch (err) {
      showNotification(err.response?.data?.message || "Failed to delete expense", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setBudgetModalData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    if (!budgetModalData.projectId || !budgetModalData.amount || isNaN(budgetModalData.amount)) {
      showNotification("Please select a project and enter a valid budget amount", 'error');
      return;
    }

    const parsedBudget = parseFloat(budgetModalData.amount);
    setTotalBudget(prev => {
      const updated = {
        ...prev,
        [budgetModalData.projectId]: parsedBudget
      };
      localStorage.setItem("projectBudgets", JSON.stringify(updated));
      return updated;
    });

    setIsModalOpen(false);
    setBudgetModalData({ projectId: "", amount: "" });
    showNotification("Project budget updated successfully!");
  };

  const calculateProjectExpenses = (projectId) => {
    return expenses
      .filter(expense => expense.projectId === projectId)
      .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );
  const inputClassName =
    "w-full px-4 py-2 rounded-lg border-2 border-red-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all";

  // Add this with your other functions in ExpensesPage component
  const filteredExpenses = expenses.filter((expense) => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      expense.title.toLowerCase().includes(searchTerm) ||
      expense.category.toLowerCase().includes(searchTerm) ||
      expense.paymentMethod.toLowerCase().includes(searchTerm) ||
      expense.amount.toString().includes(searchTerm) ||
      new Date(expense.date).toLocaleDateString().includes(searchTerm)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-12 w-auto" />
            <h1 className="text-3xl font-bold text-gray-800">Expenses Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Pasan Kalhara</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Messages Section */}
          <div className="space-y-4">
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                {error}
              </div>
            )}
            {loading && (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-r-lg">
                Loading...
              </div>
            )}
          </div>

          {/* Budget Summary Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Project Budget</h2>
              <div className="flex items-center gap-4">
                <select
                  value={selectedProjectForView}
                  onChange={(e) => setSelectedProjectForView(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-white"
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-all shadow-sm"
                >
                  Set Project Budget
                </button>
              </div>
            </div>
            
            {selectedProjectForView ? (
              <div className="border rounded-lg p-6 bg-gray-50">
                {(() => {
                  const project = projects.find(p => p._id === selectedProjectForView);
                  const projectBudget = totalBudget[selectedProjectForView] || 0;
                  const projectExpenses = calculateProjectExpenses(selectedProjectForView);
                  const remaining = projectBudget - projectExpenses;
                  
                  return (
                    <>
                      <h3 className="text-xl font-semibold mb-6 text-gray-800">{project.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-sm text-gray-500 mb-2">Project Budget</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ${projectBudget.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                          <p className="text-sm text-gray-500 mb-2">Spent</p>
                          <p className="text-3xl font-bold text-gray-800">
                            ${projectExpenses.toFixed(2)}
                          </p>
                        </div>
                        <div className={`p-6 rounded-lg shadow-sm border ${remaining >= 0 ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}>
                          <p className="text-sm text-gray-500 mb-2">Remaining</p>
                          <p className={`text-3xl font-bold ${remaining >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                            ${remaining.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="mt-4 text-lg">Please select a project to view its budget details</p>
              </div>
            )}
          </div>

          {/* Expenses List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Expenses History</h2>
              <div className="text-2xl font-semibold text-gray-800">
                Total: ${totalExpenses.toFixed(2)}
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search expenses by title, category, amount..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Title</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Amount</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Category</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Date</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Project</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Payment Method</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Receipt</th>
                    <th className="pb-4 font-semibold text-sm text-gray-600 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8">
                        <div className="flex justify-center">
                          <svg className="animate-spin h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      </td>
                    </tr>
                  ) : filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-gray-500">
                        {searchQuery ? "No matching expenses found" : "No expenses found"}
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((expense) => {
                      const project = projects.find((p) => p._id === expense.projectId);
                      return (
                        <tr key={expense._id} className="hover:bg-gray-50">
                          <td className="py-4 text-gray-800">{expense.title}</td>
                          <td className="py-4 text-gray-800">
                            ${parseFloat(expense.amount).toFixed(2)}
                          </td>
                          <td className="py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                                ${
                                  expense.category === "material"
                                    ? "bg-blue-100 text-blue-800"
                                    : expense.category === "labor"
                                    ? "bg-green-100 text-green-800"
                                    : expense.category === "equipment"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : expense.category === "transport"
                                    ? "bg-purple-100 text-purple-800"
                                    : expense.category === "utilities"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-4 text-gray-600">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-gray-600">
                            {project ? project.name : "Unknown Project"}
                          </td>
                          <td className="py-4 text-gray-600 capitalize">
                            {expense.paymentMethod}
                          </td>
                          <td className="py-4">
                            {expense.receipt ? (
                              <button
                                onClick={() => {
                                  const project = projects.find(p => p._id === expense.projectId);
                                  setSelectedExpense({
                                    ...expense,
                                    projectName: project?.name || 'Unknown Project'
                                  });
                                }}
                                className="flex items-center space-x-2 text-green-600 hover:text-green-700"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View Receipt</span>
                              </button>
                            ) : (
                              <span className="text-gray-400">No receipt</span>
                            )}
                          </td>
                          <td className="py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(expense)}
                                className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(expense._id)}
                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                              <button
                                onClick={() => {
                                  const project = projects.find(p => p._id === expense.projectId);
                                  setSelectedExpense({
                                    ...expense,
                                    projectName: project?.name || 'Unknown Project'
                                  });
                                }}
                                className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Expense Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditing ? "Edit Expense" : "Add New Expense"}
            </h2>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Select Project
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleInputChange}
                className={inputClassName}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
              {validationErrors.projectId && (
                <ValidationMessage message={validationErrors.projectId} />
              )}
            </div>

            {(formVisible || isEditing) && (
              <form
                onSubmit={isEditing ? handleUpdate : handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("title")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    required
                  />
                  {validationErrors.title && (
                    <ValidationMessage message={validationErrors.title} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD)*
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("amount")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    min="0"
                    step="0.01"
                    required
                  />
                  {validationErrors.amount && (
                    <ValidationMessage message={validationErrors.amount} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    required
                  >
                    <option value="material">Material</option>
                    <option value="labor">Labor</option>
                    <option value="equipment">Equipment</option>
                    <option value="transport">Transport</option>
                    <option value="utilities">Utilities</option>
                    <option value="other">Other</option>
                  </select>
                  {validationErrors.category && (
                    <ValidationMessage
                      message={validationErrors.category}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date*
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("date")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    required
                  />
                  {validationErrors.date && (
                    <ValidationMessage message={validationErrors.date} />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method*
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("paymentMethod")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="credit">Credit Card</option>
                    <option value="debit">Debit Card</option>
                    <option value="check">Check</option>
                    <option value="transfer">Bank Transfer</option>
                  </select>
                  {validationErrors.paymentMethod && (
                    <ValidationMessage
                      message={validationErrors.paymentMethod}
                    />
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField("description")}
                    onBlur={() => setFocusedField(null)}
                    className={inputClassName}
                    rows="3"
                  />
                  {validationErrors.description && (
                    <ValidationMessage
                      message={validationErrors.description}
                    />
                  )}
                </div>

                {/* Add Receipt Upload Field */}
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleReceiptChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100"
                    />
                    {(receiptPreview || formData.receipt) && (
                      <div className="relative">
                        {formData.receipt && formData.receipt.startsWith('data:image') ? (
                          <img
                            src={formData.receipt}
                            alt="Receipt preview"
                            className="h-20 w-auto rounded-lg border border-gray-200"
                          />
                        ) : formData.receipt ? (
                          <div className="flex items-center space-x-2 text-red-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>PDF Receipt</span>
                          </div>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptPreview(null);
                            setFormData(prev => ({ ...prev, receipt: null }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-sm disabled:bg-red-300"
                    disabled={loading}
                  >
                    {loading
                      ? "Processing..."
                      : isEditing
                      ? "Update Expense"
                      : "Add Expense"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      {/* Add this before the closing div of your main content */}
      {selectedExpense && (
        <ExpenseReport
          expense={selectedExpense}
          totalBudget={totalBudget}
          projects={projects}
          onClose={() => setSelectedExpense(null)}
        />
      )}

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <h3 className="text-lg font-bold mb-4">Set Project Budget</h3>
            <form onSubmit={handleBudgetSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  name="projectId"
                  value={budgetModalData.projectId}
                  onChange={handleBudgetChange}
                  className={inputClassName}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount (USD)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={budgetModalData.amount}
                  onChange={handleBudgetChange}
                  className={inputClassName}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter budget amount"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setBudgetModalData({ projectId: "", amount: "" });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                >
                  Set Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Notification Component */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

// Add this inside your ExpensesPage component where the expenses are displayed
const ExpenseList = ({ expenses, projects }) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Expense History</h2>
      <div className="grid gap-4">
        {expenses.map((expense) => {
          const project = projects.find((p) => p._id === expense.projectId);
          return (
            <div key={expense._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{expense.title}</h3>
                  <p className="text-sm text-gray-600">
                    Project: {project?.name || "Unknown Project"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-xl font-bold text-green-600">
                  ${parseFloat(expense.amount).toFixed(2)}
                </p>
              </div>
              {/* Add other expense details as needed */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpensesPage;

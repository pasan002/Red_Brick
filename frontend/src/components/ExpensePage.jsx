import { useState, useEffect } from 'react';

const ExpensePage = () => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    date: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched expenses:', data); // Debug log
      setExpenses(data);
    } catch (error) {
      console.error('Fetching error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting expense:', newExpense); // Debug log

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount) // Ensure amount is a number
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to add expense');
      }
      
      console.log('Server response:', responseData); // Debug log
      
      setExpenses(prevExpenses => [...prevExpenses, responseData]);
      setNewExpense({ 
        title: '', 
        amount: '', 
        date: '', 
        category: '', 
        description: '' 
      });
    } catch (error) {
      console.error('Error details:', error);
      alert('Failed to add expense: ' + error.message);
    }
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'title':
        if (value.length < 3) {
          error = 'Title must be at least 3 characters long';
        } else if (value.length > 50) {
          error = 'Title must not exceed 50 characters';
        }
        break;
        
      case 'amount':
        if (isNaN(value) || value <= 0) {
          error = 'Amount must be a positive number';
        } else if (value > 1000000) {
          error = 'Amount cannot exceed 1,000,000';
        }
        break;
        
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        if (selectedDate > today) {
          error = 'Date cannot be in the future';
        }
        break;
        
      case 'category':
        if (value.length < 2) {
          error = 'Category must be at least 2 characters long';
        } else if (value.length > 20) {
          error = 'Category must not exceed 20 characters';
        }
        break;
        
      case 'description':
        if (value.length > 200) {
          error = 'Description must not exceed 200 characters';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  if (loading) return <div>Loading expenses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            name="title"
            value={newExpense.title}
            onChange={handleChange}
            placeholder="Expense Title"
            className="border p-2 mr-2"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="number"
            name="amount"
            value={newExpense.amount}
            onChange={handleChange}
            placeholder="Amount"
            className="border p-2 mr-2"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="date"
            name="date"
            value={newExpense.date}
            onChange={handleChange}
            className="border p-2 mr-2"
            required
          />
        </div>

        <div className="mb-3">
          <input
            type="text"
            name="category"
            value={newExpense.category}
            onChange={handleChange}
            placeholder="Category"
            className="border p-2 mr-2"
            required
          />
        </div>

        <div className="mb-3">
          <textarea
            name="description"
            value={newExpense.description}
            onChange={handleChange}
            placeholder="Description"
            className="border p-2 mr-2"
          />
        </div>

        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Expense
        </button>
      </form>

      <div className="mt-4">
        {expenses.length === 0 ? (
          <p>No expenses found</p>
        ) : (
          expenses.map((expense) => (
            <div key={expense._id} className="border p-4 mb-2">
              <h3>{expense.title}</h3>
              <p>Amount: ${expense.amount}</p>
              <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
              <p>Category: {expense.category}</p>
              <p>Description: {expense.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExpensePage;
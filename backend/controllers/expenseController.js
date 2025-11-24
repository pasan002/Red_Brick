import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';

// Get all expenses with filtering and pagination
export const getExpenses = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    startDate, 
    endDate, 
    projectId 
  } = req.query;

  const query = {};
  
  if (category) query.category = category;
  if (projectId) query.projectId = projectId;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const totalExpenses = await Expense.countDocuments(query);
  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Format the expenses to include full URLs for receipts
  const formattedExpenses = expenses.map(expense => {
    const expenseObj = expense.toObject();
    if (expenseObj.receipt) {
      expenseObj.receipt = `http://localhost:4000/uploads/${expenseObj.receipt}`;
    }
    return expenseObj;
  });

  res.status(200).json({
    expenses: formattedExpenses,
    totalExpenses,
    currentPage: page,
    totalPages: Math.ceil(totalExpenses / limit)
  });
});

// Create new expense with validation
export const createExpense = async (req, res) => {
  try {
    console.log('Received expense data:', req.body);
    
    const expense = await Expense.create(req.body);
    
    console.log('Created expense:', expense);
    return res.status(201).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message
    });
  }
};

// Get expense summary by category
export const getExpenseSummary = asyncHandler(async (req, res) => {
  const summary = await Expense.aggregate([
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);

  const total = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);

  res.status(200).json({
    summary,
    total
  });
});

// Update existing expense
export const updateExpense = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message
    });
  }
});

// Delete expense
export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  await expense.deleteOne();
  res.status(200).json({ id: req.params.id });
});
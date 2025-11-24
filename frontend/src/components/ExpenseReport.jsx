import React from 'react';

const ExpenseReport = ({ expense, totalBudget, projects, onClose }) => {
  const project = projects.find(p => p._id === expense.projectId);
  const projectBudget = totalBudget[expense.projectId] || 0;
  const remainingBudget = projectBudget - expense.amount;

  if (!expense) return null;

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Write the HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Expense Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { margin-bottom: 20px; }
            .content { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .section { margin-bottom: 20px; }
            .receipt { margin-top: 30px; page-break-inside: avoid; }
            .receipt img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            .receipt-pdf { margin-top: 10px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            @media print {
              body { margin: 0; padding: 20px; }
              .receipt { page-break-inside: avoid; }
              .receipt img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Expense Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="content">
            <div class="section">
              <h3>Title</h3>
              <p>${expense.title}</p>
              <h3>Amount</h3>
              <p>$${expense.amount.toFixed(2)}</p>
              <h3>Category</h3>
              <p>${expense.category}</p>
              <h3>Date</h3>
              <p>${new Date(expense.date).toLocaleDateString()}</p>
            </div>
            
            <div class="section">
              <h3>Project</h3>
              <p>${project?.name || 'Unknown Project'}</p>
              <h3>Payment Method</h3>
              <p>${expense.paymentMethod}</p>
              <h3>Description</h3>
              <p>${expense.description || 'No description provided'}</p>
              <h3>Budget Status</h3>
              <p>$${projectBudget.toFixed(2)} allocated</p>
              <p>$${remainingBudget.toFixed(2)} remaining</p>
            </div>
          </div>
          
          ${expense.receipt ? `
            <div class="receipt">
              <h2>Receipt</h2>
              ${expense.receipt.startsWith('data:image') 
                ? `<img src="${expense.receipt}" alt="Receipt" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`
                : expense.receipt.includes('/uploads/') 
                ? `<img src="${expense.receipt}" alt="Receipt" style="max-width: 100%; height: auto; display: block; margin: 0 auto;" />`
                : `<div class="receipt-pdf">
                    <p>PDF Receipt attached</p>
                    <p>File: ${typeof expense.receipt === 'string' ? expense.receipt.split('/').pop() : 'Receipt'}</p>
                   </div>`
              }
            </div>
          ` : ''}
          
          <div class="footer">
            <p>This is a computer-generated report. No signature is required.</p>
          </div>
        </body>
      </html>
    `);
    
    // Wait for images to load before printing
    printWindow.document.close();
    const images = printWindow.document.getElementsByTagName('img');
    let imagesLoaded = 0;
    
    if (images.length > 0) {
      Array.from(images).forEach(img => {
        img.onload = () => {
          imagesLoaded++;
          if (imagesLoaded === images.length) {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500); // Add a small delay to ensure everything is rendered
          }
        };
        // If image fails to load, still try to print
        img.onerror = () => {
          imagesLoaded++;
          if (imagesLoaded === images.length) {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          }
        };
      });
    } else {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      material: 'bg-blue-100 text-blue-800',
      labor: 'bg-green-100 text-green-800',
      equipment: 'bg-yellow-100 text-yellow-800',
      transport: 'bg-purple-100 text-purple-800',
      utilities: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Expense Report</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Title</h3>
              <p className="text-lg text-gray-800">{expense.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-lg text-gray-800">${expense.amount.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p className="text-lg text-gray-800 capitalize">{expense.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="text-lg text-gray-800">
                {new Date(expense.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Project</h3>
              <p className="text-lg text-gray-800">{project?.name || 'Unknown Project'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
              <p className="text-lg text-gray-800 capitalize">{expense.paymentMethod}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="text-lg text-gray-800">{expense.description || 'No description provided'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Budget Status</h3>
              <div className="flex items-center space-x-2">
                <p className="text-lg text-gray-800">
                  ${projectBudget.toFixed(2)} allocated
                </p>
                <span className="text-gray-400">•</span>
                <p className={`text-lg ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${remainingBudget.toFixed(2)} remaining
                </p>
              </div>
            </div>
          </div>
        </div>

        {expense.receipt && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Receipt</h3>
            <div className="border rounded-lg p-4 bg-gray-50">
              {expense.receipt && expense.receipt.startsWith('data:image') ? (
                <img
                  src={expense.receipt}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              ) : expense.receipt && expense.receipt.includes('/uploads/') ? (
                <img
                  src={expense.receipt}
                  alt="Receipt"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              ) : (
                <div className="flex items-center justify-center p-8">
                  <a
                    href={expense.receipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>View PDF Receipt</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseReport;
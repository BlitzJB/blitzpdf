import React from 'react';

const InvoiceItem = ({ item, qty, unitPrice, totalPrice }) => (
  <div className="grid grid-cols-5 gap-2 py-2">
    <div className="col-span-2">{item}</div>
    <div>{qty}</div>
    <div>{unitPrice}</div>
    <div className="text-end">{totalPrice}</div>
  </div>
);

const Invoice = ({ 
  items, 
  advancePaid = 0, 
  discount = 0,
  customer,
  paymentMethod,
  invoiceNumber,
  invoiceDate,
  trailDate
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal - discount;
  const due = total - advancePaid;
  const isSettled = due <= 0;

  return (
    <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto my-4 sm:my-10">
      <div className="sm:w-11/12 lg:w-3/4 mx-auto">
        <div className="p-4 sm:p-10 bg-white shadow-md rounded-xl dark:bg-neutral-800">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4 w-full ml-auto">
              <img src="https://statesmanbespoke.com/og-image.jpeg" alt="Statesman Bespoke Suits Logo" className="h-40 mr-auto" />
              <div className="ml-auto w-fit">
                <h1 className="text-2xl text-right font-semibold text-black dark:text-white">
                  Statesman Bespoke Suits
                </h1>
                <address className="mt-2 text-right not-italic text-gray-500 dark:text-neutral-500">
                  Rajah Annamalai Buildings Annexe 3rd Floor<br />
                  18/3, Rukmani Lakshmipathy Road, Marshalls Rd,<br />
                  Egmore, Chennai 600008<br />
                  ‭+91 90030 05557‬<br />
                  GSTIN: 33AFCFS3119R1ZO
                </address>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                Bill to:
              </h3>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
                {customer.name}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-neutral-500">
                Phone: {customer.phone}<br />
                Email: {customer.email}<br />
                GSTIN: {customer.gstin || 'N/A'}<br />
                Address: {customer.address}
              </p>
              <p className="mt-4 text-gray-500 dark:text-neutral-500">
                Job no: {customer.jobNo || 'N/A'}<br />
                Trail Date: {trailDate}
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-neutral-200">
                TAX INVOICE
              </h2>
              <p className="mt-1 text-gray-500 dark:text-neutral-500">
                Invoice Number: {invoiceNumber}
              </p>
              <p className="mt-1 text-gray-500 dark:text-neutral-500">
                Date: {invoiceDate}
              </p>
              {isSettled && (
                <div className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  Settled
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="border border-gray-200 p-4 rounded-lg space-y-4 dark:border-neutral-700">
              <div className="grid grid-cols-5 font-medium text-gray-500 dark:text-neutral-500">
                <div className="col-span-2">Item</div>
                <div>Qty</div>
                <div>Unit Price</div>
                <div className="text-end">Total Price</div>
              </div>
              {items.map((item, index) => (
                <InvoiceItem key={index} {...item} />
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <div className="w-full max-w-2xl space-y-2 mx-auto">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Subtotal:</span>
                <span className="text-gray-500 dark:text-neutral-500">Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Discount:</span>
                <span className="text-gray-500 dark:text-neutral-500">Rs. {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Total:</span>
                <span className="text-gray-500 dark:text-neutral-500 font-bold">Rs. {total.toFixed(2)}</span>
              </div>
              {/* horizontal line */}
              <div className="border-t border-gray-200 my-8"></div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Advance Paid:</span>
                <span className="text-gray-500 dark:text-neutral-500">Rs. {advancePaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-800 dark:text-neutral-200">Total due:</span>
                {due === 0 ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Settled
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-neutral-500">Rs. {due.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
              Payment Details
            </h4>
            <p className="text-gray-500 dark:text-neutral-500">{paymentMethod}</p>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
              Terms & Conditions
            </h4>
            <ul className="list-disc list-inside text-gray-500 dark:text-neutral-500">
              <li>Computer Generated Bill. Authorized Signature Not Required.</li>
              <li>Payment due in full at purchase</li>
              <li>Custom items: Non-returnable /exchangeable</li>
              <li>Cancellations: Vary for custom vs. ready-to-wear items</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
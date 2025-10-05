import React from 'react';

function EcommercePanel() {
  return (
    <div>
      <h1>Order Fulfillment Dashboard</h1>

      <p>SKU: XJ-23</p>
      <p>Customer initiated RMA due to inventory discrepancy</p>
      <p>This item is currently backordered from our West Coast fulfillment center</p>
      <p>Estimated delivery time is recalculated after ERP sync</p>

      <button>Print Packing Slip</button>
      <button>Initiate RMA</button>
    </div>
  );
}

export default EcommercePanel;
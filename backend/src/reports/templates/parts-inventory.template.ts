import { baseTemplate } from './base.template';

export interface PartsInventoryData {
  totalParts: number;
  totalQuantityParts: number;
  totalSerialParts: number;
  lowStockCount: number;
  partsList: {
    id: string;
    name: string;
    carType: string;
    carModel: string;
    trackingMode: string;
    quantity: number | null;
    serialNumber: string | null;
  }[];
  lowStockParts: {
    name: string;
    quantity: number;
    carType: string;
  }[];
  recentPurchaseRequests: {
    id: string;
    partName: string;
    quantity: number;
    estimatedCost: number;
    vendor: string;
    status: string;
    createdAt: Date;
  }[];
}

export function partsInventoryTemplate(data: PartsInventoryData, generatedAt: Date): string {
  const content = `
    <div class="section">
      <h2>Inventory Overview</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.totalParts}</div>
          <div class="label">Total Parts</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.totalQuantityParts}</div>
          <div class="label">Quantity Tracked</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.totalSerialParts}</div>
          <div class="label">Serial Tracked</div>
        </div>
        <div class="stat-card">
          <div class="value" style="color: ${data.lowStockCount > 0 ? '#dc2626' : '#16a34a'};">${data.lowStockCount}</div>
          <div class="label">Low Stock Items</div>
        </div>
      </div>
    </div>

    ${
      data.lowStockParts.length > 0
        ? `
    <div class="section">
      <h2>Low Stock Alert</h2>
      <table>
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Car Type</th>
            <th>Current Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${data.lowStockParts
            .map(
              (p) => `
            <tr style="background: #fef2f2;">
              <td>${p.name}</td>
              <td>${p.carType}</td>
              <td style="color: #dc2626; font-weight: bold;">${p.quantity}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }

    <div class="section">
      <h2>Parts Inventory</h2>
      <table>
        <thead>
          <tr>
            <th>Part Name</th>
            <th>Car Type</th>
            <th>Car Model</th>
            <th>Tracking Mode</th>
            <th>Quantity/Serial</th>
          </tr>
        </thead>
        <tbody>
          ${data.partsList
            .map(
              (p) => `
            <tr>
              <td>${p.name}</td>
              <td>${p.carType}</td>
              <td>${p.carModel}</td>
              <td>${p.trackingMode}</td>
              <td>${p.trackingMode === 'QUANTITY' ? p.quantity : p.serialNumber || 'N/A'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Recent Purchase Requests</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Part Name</th>
            <th>Quantity</th>
            <th>Est. Cost</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${data.recentPurchaseRequests
            .map(
              (pr) => `
            <tr>
              <td>${pr.id.substring(0, 8)}...</td>
              <td>${pr.partName}</td>
              <td>${pr.quantity}</td>
              <td>$${pr.estimatedCost.toLocaleString()}</td>
              <td>${pr.vendor}</td>
              <td><span class="status status-${pr.status.toLowerCase().replace('_', '-')}">${pr.status}</span></td>
              <td>${new Date(pr.createdAt).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  return baseTemplate('Parts Inventory Report', content, generatedAt);
}

import { baseTemplate } from './base.template';

export interface MaintenanceSummaryData {
  totalRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  completedRequests: number;
  internalMaintenance: number;
  externalMaintenance: number;
  totalExternalCost: number;
  requestsByStatus: { status: string; count: number }[];
  maintenanceList: {
    id: string;
    carModel: string;
    licensePlate: string;
    description: string;
    maintenanceType: string | null;
    status: string;
    externalCost: number | null;
    createdAt: Date;
  }[];
  dateRange: { start: Date; end: Date };
}

export function maintenanceTemplate(data: MaintenanceSummaryData, generatedAt: Date): string {
  const content = `
    <div class="section">
      <h2>Summary (${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()})</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.totalRequests}</div>
          <div class="label">Total Requests</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.inProgressRequests}</div>
          <div class="label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.completedRequests}</div>
          <div class="label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="value">$${data.totalExternalCost.toLocaleString()}</div>
          <div class="label">External Costs</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Maintenance Types</h2>
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="stat-card">
          <div class="value">${data.internalMaintenance}</div>
          <div class="label">Internal Maintenance</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.externalMaintenance}</div>
          <div class="label">External Maintenance</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Requests by Status</h2>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${data.requestsByStatus
            .map(
              (item) => `
            <tr>
              <td><span class="status status-${item.status.toLowerCase().replace('_', '-')}">${item.status}</span></td>
              <td>${item.count}</td>
              <td>${data.totalRequests > 0 ? ((item.count / data.totalRequests) * 100).toFixed(1) : 0}%</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Maintenance Details</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle</th>
            <th>License Plate</th>
            <th>Description</th>
            <th>Type</th>
            <th>Status</th>
            <th>Cost</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${data.maintenanceList
            .map(
              (m) => `
            <tr>
              <td>${m.id.substring(0, 8)}...</td>
              <td>${m.carModel}</td>
              <td>${m.licensePlate}</td>
              <td>${m.description.substring(0, 30)}${m.description.length > 30 ? '...' : ''}</td>
              <td>${m.maintenanceType || 'N/A'}</td>
              <td><span class="status status-${m.status.toLowerCase().replace('_', '-')}">${m.status}</span></td>
              <td>${m.externalCost ? '$' + m.externalCost.toLocaleString() : '-'}</td>
              <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  return baseTemplate('Maintenance Summary Report', content, generatedAt);
}

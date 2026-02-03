import { baseTemplate } from './base.template';

export interface CarRequestsSummaryData {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  requestsByStatus: { status: string; count: number }[];
  requestsList: {
    id: string;
    requestedCarType: string;
    destination: string;
    status: string;
    createdBy: string;
    createdAt: Date;
    departureDatetime: Date;
  }[];
  dateRange: { start: Date; end: Date };
}

export function carRequestsTemplate(data: CarRequestsSummaryData, generatedAt: Date): string {
  const content = `
    <div class="section">
      <h2>Summary (${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()})</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.totalRequests}</div>
          <div class="label">Total Requests</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.pendingRequests}</div>
          <div class="label">Pending</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.approvedRequests}</div>
          <div class="label">Approved</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.rejectedRequests}</div>
          <div class="label">Rejected</div>
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
      <h2>Request Details</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Car Type</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Requested By</th>
            <th>Departure</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${data.requestsList
            .map(
              (req) => `
            <tr>
              <td>${req.id.substring(0, 8)}...</td>
              <td>${req.requestedCarType}</td>
              <td>${req.destination}</td>
              <td><span class="status status-${req.status.toLowerCase().replace('_', '-')}">${req.status}</span></td>
              <td>${req.createdBy}</td>
              <td>${new Date(req.departureDatetime).toLocaleDateString()}</td>
              <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  return baseTemplate('Car Requests Summary Report', content, generatedAt);
}

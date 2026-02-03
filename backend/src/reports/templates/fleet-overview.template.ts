import { baseTemplate } from './base.template';

export interface FleetOverviewData {
  totalCars: number;
  availableCars: number;
  assignedCars: number;
  underMaintenance: number;
  carsByType: { type: string; count: number }[];
  recentRequests: {
    id: string;
    destination: string;
    status: string;
    createdAt: Date;
  }[];
  upcomingMaintenance: {
    carModel: string;
    licensePlate: string;
    nextMaintenanceDate: Date;
  }[];
}

export function fleetOverviewTemplate(data: FleetOverviewData, generatedAt: Date): string {
  const content = `
    <div class="section">
      <h2>Fleet Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${data.totalCars}</div>
          <div class="label">Total Vehicles</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.availableCars}</div>
          <div class="label">Available</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.assignedCars}</div>
          <div class="label">Assigned</div>
        </div>
        <div class="stat-card">
          <div class="value">${data.underMaintenance}</div>
          <div class="label">Under Maintenance</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Vehicles by Type</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Count</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${data.carsByType
            .map(
              (item) => `
            <tr>
              <td>${item.type}</td>
              <td>${item.count}</td>
              <td>${((item.count / data.totalCars) * 100).toFixed(1)}%</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Recent Car Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${data.recentRequests
            .map(
              (req) => `
            <tr>
              <td>${req.id.substring(0, 8)}...</td>
              <td>${req.destination}</td>
              <td><span class="status status-${req.status.toLowerCase().replace('_', '-')}">${req.status}</span></td>
              <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Upcoming Scheduled Maintenance</h2>
      <table>
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>License Plate</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${data.upcomingMaintenance
            .map(
              (item) => `
            <tr>
              <td>${item.carModel}</td>
              <td>${item.licensePlate}</td>
              <td>${new Date(item.nextMaintenanceDate).toLocaleDateString()}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;

  return baseTemplate('Fleet Overview Report', content, generatedAt);
}

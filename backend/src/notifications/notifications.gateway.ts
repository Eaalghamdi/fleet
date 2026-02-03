import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma';
import { Department, NotificationType } from '@prisma/client';
import { NotificationContext } from './notification-templates';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  department?: Department;
}

interface JwtPayload {
  sub: string;
  username: string;
  department: Department;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket): Promise<void> {
    try {
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = await this.verifyToken(token);
      if (!payload) {
        client.disconnect();
        return;
      }

      client.userId = payload.sub;
      client.department = payload.department;

      // Join user-specific room
      await client.join(`user:${payload.sub}`);

      // Join department room
      await client.join(`department:${payload.department}`);

      // Track connected users
      if (!this.connectedUsers.has(payload.sub)) {
        this.connectedUsers.set(payload.sub, new Set());
      }
      this.connectedUsers.get(payload.sub)?.add(client.id);

      client.emit('connected', {
        userId: payload.sub,
        department: payload.department,
      });
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket): void {
    if (client.userId) {
      const userSockets = this.connectedUsers.get(client.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.userId);
        }
      }
    }
  }

  @SubscribeMessage('ping')
  handlePing(): { event: string; data: string } {
    return { event: 'pong', data: 'pong' };
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) {
      return authToken;
    }

    return null;
  }

  private async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch {
      return null;
    }
  }

  // Send notification to a specific user
  sendToUser(
    userId: string,
    type: NotificationType,
    data: {
      id: string;
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
      context?: NotificationContext;
    },
  ): void {
    this.server.to(`user:${userId}`).emit('notification', {
      type,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  // Send notification to all users in a department
  sendToDepartment(
    department: Department,
    type: NotificationType,
    data: {
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
      context?: NotificationContext;
    },
  ): void {
    this.server.to(`department:${department}`).emit('notification', {
      type,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  // Send notification to multiple departments
  sendToMultipleDepartments(
    departments: Department[],
    type: NotificationType,
    data: {
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
      context?: NotificationContext;
    },
  ): void {
    for (const department of departments) {
      this.sendToDepartment(department, type, data);
    }
  }

  // Broadcast to all connected clients
  broadcast(
    type: NotificationType,
    data: {
      title: string;
      message: string;
      entityType?: string;
      entityId?: string;
    },
  ): void {
    this.server.emit('notification', {
      type,
      ...data,
      createdAt: new Date().toISOString(),
    });
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Get all online users
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }
}

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Emit room:released only to clients that joined this room
  emitRoomReleased(roomId: string, data: any) {
    this.server.to(`room:${roomId}`).emit(`room:released:${roomId}`, data);
  }

  // Emit leaderboard update only to clients watching this tournament
  emitLeaderboardUpdate(tournamentId: string, data: any) {
    this.server.to(`tournament:${tournamentId}`).emit(`leaderboard:update:${tournamentId}`, data);
  }

  // Emit notification only to sockets that joined this player's private channel
  emitNotification(playerId: string, notification: any) {
    this.server.to(`player:${playerId}`).emit(`notification:${playerId}`, notification);
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(`room:${roomId}`);
    return { joined: roomId };
  }

  @SubscribeMessage('join:tournament')
  handleJoinTournament(client: Socket, tournamentId: string) {
    client.join(`tournament:${tournamentId}`);
    return { joined: tournamentId };
  }

  @SubscribeMessage('join:player')
  handleJoinPlayer(client: Socket, playerId: string) {
    client.join(`player:${playerId}`);
    return { joined: playerId };
  }
}

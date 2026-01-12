import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { MessageService } from './services/message.service';
import { IMessage } from 'src/common/interfaces/message.interface';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:8000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class ChatGateway {

  @WebSocketServer()
  server: Server;

  public onlineConnection: Map<string, string[]> = new Map()


  constructor(private readonly messageService: MessageService) { }


  @SubscribeMessage("join")
  join(socket: Socket, data: { chatId: string, sender: string }) {
    socket.join(data?.chatId)

    // add to online connection
    const sockets = this.onlineConnection.get(data.sender) || [];
    sockets.push(socket.id);
    this.onlineConnection.set(data.sender, sockets);
  }

  @SubscribeMessage("leave")
  leave(socket: Socket, data: { chatId: string, sender: string }) {
    socket.leave(data?.chatId)

    // remove from online connection
    const sockets = this.onlineConnection.get(data.sender) || [];
    this.onlineConnection.set(
      data.sender,
      sockets.filter((id) => id !== socket.id)
    );
  }


  @SubscribeMessage("sendMessage")
  async receiveMessage(socket: Socket, payload: IMessage) {
    const message = await this.messageService.create(payload);
    socket.to(payload.chat as string).emit("receiveMessage", message)
    return { success: true, message };
  }


}
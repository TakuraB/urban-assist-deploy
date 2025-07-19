from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import jwt_required, get_jwt_identity, decode_token
from src.models.user import db, ChatMessage, User
from datetime import datetime
import json

def init_socketio(app):
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    @socketio.on('connect')
    def on_connect(auth):
        print('Client connected')
        
        # Authenticate user
        if auth and 'token' in auth:
            try:
                decoded_token = decode_token(auth['token'])
                user_id = decoded_token['sub']
                user = User.query.get(user_id)
                if user:
                    emit('connected', {'status': 'authenticated', 'user_id': user_id})
                else:
                    emit('error', {'message': 'User not found'})
            except Exception as e:
                emit('error', {'message': 'Invalid token'})
        else:
            emit('error', {'message': 'Authentication required'})
    
    @socketio.on('disconnect')
    def on_disconnect():
        print('Client disconnected')
    
    @socketio.on('join_chat')
    def on_join_chat(data):
        try:
            # Authenticate user
            token = data.get('token')
            if not token:
                emit('error', {'message': 'Authentication required'})
                return
                
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
            booking_id = data.get('booking_id')
            if not booking_id:
                emit('error', {'message': 'Booking ID required'})
                return
            
            # Join room for this booking
            room = f"booking_{booking_id}"
            join_room(room)
            
            # Load recent messages
            messages = ChatMessage.query.filter_by(booking_id=booking_id)\
                .order_by(ChatMessage.created_at.desc())\
                .limit(50).all()
            
            message_list = []
            for msg in reversed(messages):
                message_list.append({
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'sender_name': f"{msg.sender.first_name} {msg.sender.last_name}",
                    'message': msg.message,
                    'created_at': msg.created_at.isoformat(),
                    'is_read': msg.is_read
                })
            
            emit('chat_history', {'messages': message_list})
            emit('joined_chat', {'booking_id': booking_id, 'room': room})
            
        except Exception as e:
            emit('error', {'message': str(e)})
    
    @socketio.on('leave_chat')
    def on_leave_chat(data):
        booking_id = data.get('booking_id')
        if booking_id:
            room = f"booking_{booking_id}"
            leave_room(room)
            emit('left_chat', {'booking_id': booking_id})
    
    @socketio.on('send_message')
    def on_send_message(data):
        try:
            # Authenticate user
            token = data.get('token')
            if not token:
                emit('error', {'message': 'Authentication required'})
                return
                
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            user = User.query.get(user_id)
            
            booking_id = data.get('booking_id')
            message_text = data.get('message')
            
            if not booking_id or not message_text:
                emit('error', {'message': 'Booking ID and message are required'})
                return
            
            # Save message to database
            message = ChatMessage(
                booking_id=booking_id,
                sender_id=user_id,
                message=message_text,
                created_at=datetime.utcnow()
            )
            
            db.session.add(message)
            db.session.commit()
            
            # Broadcast message to room
            room = f"booking_{booking_id}"
            message_data = {
                'id': message.id,
                'sender_id': user_id,
                'sender_name': f"{user.first_name} {user.last_name}",
                'message': message_text,
                'created_at': message.created_at.isoformat(),
                'booking_id': booking_id
            }
            
            socketio.emit('new_message', message_data, room=room)
            
        except Exception as e:
            emit('error', {'message': str(e)})
    
    @socketio.on('mark_messages_read')
    def on_mark_messages_read(data):
        try:
            # Authenticate user
            token = data.get('token')
            if not token:
                emit('error', {'message': 'Authentication required'})
                return
                
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
            booking_id = data.get('booking_id')
            if not booking_id:
                emit('error', {'message': 'Booking ID required'})
                return
            
            # Mark messages as read for this user
            ChatMessage.query.filter_by(booking_id=booking_id)\
                .filter(ChatMessage.sender_id != user_id)\
                .update({'is_read': True})
            
            db.session.commit()
            
            emit('messages_marked_read', {'booking_id': booking_id})
            
        except Exception as e:
            emit('error', {'message': str(e)})
    
    return socketio


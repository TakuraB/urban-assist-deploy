from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_jwt_extended import decode_token # No need for jwt_required, get_jwt_identity here directly
from src.models.user import db, ChatMessage, User
from datetime import datetime
import json
import os # Import os to use os.getenv for REDIS_URL

def init_socketio(app):
    """
    Initializes and configures the Flask-SocketIO instance.
    Uses the CORS_ORIGINS defined in the Flask app's configuration.
    """
    # Use app.config['CORS_ORIGINS'] for SocketIO's allowed origins
    # This ensures consistency with Flask-CORS and adheres to security best practices.
    socketio = SocketIO(
        app,
        cors_allowed_origins=app.config['CORS_ORIGINS'],
        message_queue=os.getenv("REDIS_URL") # Ensure REDIS_URL is set in Render environment variables
    )
    
    @socketio.on('connect')
    def on_connect(auth):
        """Handles new client connections, including JWT authentication."""
        print('Client connected')
        
        # Authenticate user
        if auth and 'token' in auth:
            try:
                decoded_token = decode_token(auth['token'])
                user_id = decoded_token['sub']
                user = User.query.get(user_id) # Ensure this is within an app context if db operations are needed
                if user:
                    emit('connected', {'status': 'authenticated', 'user_id': user_id})
                else:
                    emit('error', {'message': 'User not found'})
            except Exception as e:
                # Log the actual error for debugging, but send a generic message to client
                print(f"Authentication error on connect: {e}")
                emit('error', {'message': 'Invalid token or authentication failed'})
        else:
            emit('error', {'message': 'Authentication required'})
    
    @socketio.on('disconnect')
    def on_disconnect():
        """Handles client disconnections."""
        print('Client disconnected')
    
    @socketio.on('join_chat')
    def on_join_chat(data):
        """Handles a user joining a specific chat room (booking)."""
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
            
            # Load recent messages for the booking
            # It's good practice to ensure this runs within an application context
            with app.app_context():
                messages = ChatMessage.query.filter_by(booking_id=booking_id)\
                    .order_by(ChatMessage.created_at.desc())\
                    .limit(50).all()
            
            message_list = []
            for msg in reversed(messages): # Reverse to show oldest first
                # Ensure sender is loaded for sender_name
                sender_name = "Unknown User"
                if msg.sender:
                    sender_name = f"{msg.sender.first_name} {msg.sender.last_name}"

                message_list.append({
                    'id': msg.id,
                    'sender_id': msg.sender_id,
                    'sender_name': sender_name,
                    'message': msg.message,
                    'created_at': msg.created_at.isoformat(),
                    'is_read': msg.is_read
                })
                
            emit('chat_history', {'messages': message_list}, room=room) # Emit to the joining user
            emit('joined_chat', {'booking_id': booking_id, 'room': room})
            
        except Exception as e:
            print(f"Error joining chat: {e}") # Log the error
            emit('error', {'message': str(e)})
    
    @socketio.on('leave_chat')
    def on_leave_chat(data):
        """Handles a user leaving a specific chat room."""
        booking_id = data.get('booking_id')
        if booking_id:
            room = f"booking_{booking_id}"
            leave_room(room)
            emit('left_chat', {'booking_id': booking_id})
    
    @socketio.on('send_message')
    def on_send_message(data):
        """Handles sending a new message in a chat."""
        try:
            # Authenticate user
            token = data.get('token')
            if not token:
                emit('error', {'message': 'Authentication required'})
                return
                
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']
            
            # Ensure user exists and is loaded within app context
            with app.app_context():
                user = User.query.get(user_id)
                if not user:
                    emit('error', {'message': 'Sender user not found'})
                    return

            booking_id = data.get('booking_id')
            message_text = data.get('message')
            
            if not booking_id or not message_text:
                emit('error', {'message': 'Booking ID and message are required'})
                return
                
            # Save message to database within app context
            with app.app_context():
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
                'sender_name': f"{user.first_name} {user.last_name}", # Use the loaded user's name
                'message': message_text,
                'created_at': message.created_at.isoformat(),
                'booking_id': booking_id
            }
            
            socketio.emit('new_message', message_data, room=room)
            
        except Exception as e:
            print(f"Error sending message: {e}") # Log the error
            emit('error', {'message': str(e)})
    
    @socketio.on('mark_messages_read')
    def on_mark_messages_read(data):
        """Handles marking messages as read for a specific user in a booking."""
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
                
            # Mark messages as read for this user within app context
            with app.app_context():
                ChatMessage.query.filter_by(booking_id=booking_id)\
                    .filter(ChatMessage.sender_id != user_id)\
                    .update({'is_read': True})
                
                db.session.commit()
            
            emit('messages_marked_read', {'booking_id': booking_id})
                
        except Exception as e:
            print(f"Error marking messages read: {e}") # Log the error
            emit('error', {'message': str(e)})
            
    return socketio

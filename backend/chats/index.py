'''
Business: API for managing chats, messages, and user interactions in messenger
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with chat and message data
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'get_chats')
            user_id = event.get('queryStringParameters', {}).get('user_id', '1')
            
            if action == 'get_chats':
                cursor.execute('''
                    SELECT 
                        c.id, 
                        c.name, 
                        c.type,
                        c.avatar_url,
                        (SELECT text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                        (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                        (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND user_id != %s) as unread_count
                    FROM chats c
                    INNER JOIN chat_members cm ON c.id = cm.chat_id
                    WHERE cm.user_id = %s
                    ORDER BY last_message_time DESC NULLS LAST
                ''', (user_id, user_id))
                
                chats = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'chats': [dict(chat) for chat in chats]}, default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'get_messages':
                chat_id = event.get('queryStringParameters', {}).get('chat_id')
                
                cursor.execute('''
                    SELECT 
                        m.id,
                        m.text,
                        m.created_at,
                        m.user_id,
                        u.username as author
                    FROM messages m
                    INNER JOIN users u ON m.user_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                ''', (chat_id,))
                
                messages = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'messages': [dict(msg) for msg in messages]}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_chat':
                name = body_data.get('name')
                chat_type = body_data.get('type', 'direct')
                user_id = body_data.get('user_id')
                
                cursor.execute('''
                    INSERT INTO chats (name, type) 
                    VALUES (%s, %s) 
                    RETURNING id
                ''', (name, chat_type))
                
                chat_id = cursor.fetchone()['id']
                
                cursor.execute('''
                    INSERT INTO chat_members (chat_id, user_id, is_online) 
                    VALUES (%s, %s, true)
                ''', (chat_id, user_id))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'chat_id': chat_id, 'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'send_message':
                chat_id = body_data.get('chat_id')
                user_id = body_data.get('user_id')
                text = body_data.get('text')
                
                cursor.execute('''
                    INSERT INTO messages (chat_id, user_id, text) 
                    VALUES (%s, %s, %s)
                    RETURNING id, created_at
                ''', (chat_id, user_id, text))
                
                result = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({
                        'message_id': result['id'],
                        'created_at': str(result['created_at']),
                        'success': True
                    }),
                    'isBase64Encoded': False
                }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid request'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

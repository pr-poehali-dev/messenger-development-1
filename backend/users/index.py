'''
Business: API for managing user profiles, contacts, and authentication
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with user data
'''

import json
import os
from typing import Dict, Any
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            user_id = event.get('queryStringParameters', {}).get('user_id')
            action = event.get('queryStringParameters', {}).get('action', 'get_profile')
            
            if action == 'login':
                phone = event.get('queryStringParameters', {}).get('phone')
                
                cursor.execute('''
                    SELECT id, username, phone, bio, avatar_url, created_at
                    FROM users
                    WHERE phone = %s
                ''', (phone,))
                
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'user': dict(user), 'success': True}, default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'User not found', 'success': False}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'get_profile':
                cursor.execute('''
                    SELECT id, username, phone, bio, avatar_url, created_at
                    FROM users
                    WHERE id = %s
                ''', (user_id,))
                
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': headers,
                        'body': json.dumps({'user': dict(user)}, default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': headers,
                        'body': json.dumps({'error': 'User not found'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'get_contacts':
                cursor.execute('''
                    SELECT u.id, u.username, u.phone, u.avatar_url, cm.is_online
                    FROM contacts c
                    INNER JOIN users u ON c.contact_user_id = u.id
                    LEFT JOIN chat_members cm ON cm.user_id = u.id
                    WHERE c.user_id = %s
                    GROUP BY u.id, u.username, u.phone, u.avatar_url, cm.is_online
                    ORDER BY u.username
                ''', (user_id,))
                
                contacts = cursor.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'contacts': [dict(contact) for contact in contacts]}, default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'create_user':
                username = body_data.get('username')
                phone = body_data.get('phone', '')
                
                cursor.execute('''
                    INSERT INTO users (username, phone) 
                    VALUES (%s, %s) 
                    RETURNING id
                ''', (username, phone))
                
                user_id = cursor.fetchone()['id']
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'user_id': user_id, 'success': True}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_contact':
                user_id = body_data.get('user_id')
                contact_user_id = body_data.get('contact_user_id')
                
                cursor.execute('''
                    INSERT INTO contacts (user_id, contact_user_id) 
                    VALUES (%s, %s)
                    ON CONFLICT (user_id, contact_user_id) DO NOTHING
                ''', (user_id, contact_user_id))
                
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': headers,
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            user_id = body_data.get('user_id')
            
            updates = []
            values = []
            
            if 'username' in body_data:
                updates.append('username = %s')
                values.append(body_data['username'])
            if 'phone' in body_data:
                updates.append('phone = %s')
                values.append(body_data['phone'])
            if 'bio' in body_data:
                updates.append('bio = %s')
                values.append(body_data['bio'])
            if 'avatar_url' in body_data:
                updates.append('avatar_url = %s')
                values.append(body_data['avatar_url'])
            
            if updates:
                values.append(user_id)
                cursor.execute(f'''
                    UPDATE users 
                    SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', values)
                
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'success': True}),
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
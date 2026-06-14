from functools import wraps
from flask import request
from utils.response import error_response
from utils.jwt_helper import decode_token

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return error_response("Missing or invalid Authorization header. Please obtain a token.", 401)
        
        token = auth_header.split(' ')[1]
        user_id = decode_token(token)
        
        if not user_id:
            return error_response("Invalid or expired token", 401)
            
        # Attach user_id to request
        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated

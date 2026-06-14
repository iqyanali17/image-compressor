import jwt
import datetime
import uuid
from config import Config

def generate_anonymous_token():
    user_id = str(uuid.uuid4())
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=365) # 1 year expiry
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token, user_id

def decode_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

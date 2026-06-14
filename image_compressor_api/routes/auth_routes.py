from flask import Blueprint
from utils.jwt_helper import generate_anonymous_token
from utils.response import success_response

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/token', methods=['GET'])
def get_token():
    token, user_id = generate_anonymous_token()
    return success_response(data={"token": token, "user_id": user_id}, message="Anonymous token generated successfully")

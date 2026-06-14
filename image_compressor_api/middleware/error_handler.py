from utils.response import error_response
from werkzeug.exceptions import HTTPException

def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(error):
        return error_response(str(error.description) if hasattr(error, 'description') else "Bad request", 400)

    @app.errorhandler(404)
    def not_found(error):
        return error_response("Resource not found", 404)

    @app.errorhandler(500)
    def internal_error(error):
        return error_response("Internal server error", 500)
        
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return error_response(e.description, e.code)
        return error_response(f"An unexpected error occurred: {str(e)}", 500)

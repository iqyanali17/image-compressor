from datetime import datetime

class ImageHistory:
    def __init__(
        self,
        id: int = None,
        user_id: str = None,
        original_filename: str = None,
        compressed_filename: str = None,
        original_size: int = None,
        compressed_size: int = None,
        compression_percentage: float = None,
        image_type: str = None,
        recommended_quality: int = None,
        recommended_format: str = None,
        output_format: str = None,
        download_count: int = 0,
        original_width: int = None,
        original_height: int = None,
        compressed_width: int = None,
        compressed_height: int = None,
        created_at: datetime = None
    ):
        self.id = id
        self.user_id = user_id
        self.original_filename = original_filename
        self.compressed_filename = compressed_filename
        self.original_size = original_size
        self.compressed_size = compressed_size
        self.compression_percentage = compression_percentage
        self.image_type = image_type
        self.recommended_quality = recommended_quality
        self.recommended_format = recommended_format
        self.output_format = output_format
        self.download_count = download_count
        self.original_width = original_width
        self.original_height = original_height
        self.compressed_width = compressed_width
        self.compressed_height = compressed_height
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "original_filename": self.original_filename,
            "compressed_filename": self.compressed_filename,
            "original_size": self.original_size,
            "compressed_size": self.compressed_size,
            "compression_percentage": self.compression_percentage,
            "image_type": self.image_type,
            "recommended_quality": self.recommended_quality,
            "recommended_format": self.recommended_format,
            "output_format": self.output_format,
            "download_count": self.download_count,
            "original_width": self.original_width,
            "original_height": self.original_height,
            "compressed_width": self.compressed_width,
            "compressed_height": self.compressed_height,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "analysis": {
                "image_type": self.image_type,
                "recommended_quality": self.recommended_quality,
                "recommended_format": self.recommended_format
            } if self.image_type else None
        }

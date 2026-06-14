from datetime import datetime

class AIAnalysis:
    def __init__(
        self,
        id: int = None,
        image_id: int = None,
        image_type: str = None,
        recommended_quality: int = None,
        recommended_format: str = None,
        created_at: datetime = None
    ):
        self.id = id
        self.image_id = image_id
        self.image_type = image_type
        self.recommended_quality = recommended_quality
        self.recommended_format = recommended_format
        self.created_at = created_at

    def to_dict(self):
        return {
            "id": self.id,
            "image_id": self.image_id,
            "image_type": self.image_type,
            "recommended_quality": self.recommended_quality,
            "recommended_format": self.recommended_format,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

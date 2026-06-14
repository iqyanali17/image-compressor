import os
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

from services.image_service import process_and_compress


class OptionalAnalysisTests(unittest.TestCase):
    def test_custom_compression_does_not_call_hugging_face(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            input_path = os.path.join(temp_dir, "source.png")
            output_dir = os.path.join(temp_dir, "output")
            Image.new("RGB", (800, 600), "navy").save(input_path)

            with (
                patch("services.compression_service.Config.COMPRESSED_FOLDER", output_dir),
                patch("services.image_service.save_compression_record", return_value=1),
                patch("requests.post") as hugging_face_request
            ):
                result, error = process_and_compress(
                    user_id="test-user",
                    filepath=input_path,
                    original_filename="source.png",
                    format="webp",
                    level="medium",
                    custom_quality=70
                )

            self.assertIsNone(error)
            self.assertEqual(result["analysis"], None)
            self.assertEqual(result["compressed_width"], 800)
            self.assertEqual(result["compressed_height"], 600)
            hugging_face_request.assert_not_called()


if __name__ == "__main__":
    unittest.main()

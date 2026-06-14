import os
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image

from services.compression_service import compress_image


class CompressionResizeTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.input_path = os.path.join(self.temp_dir.name, "source.png")
        Image.new("RGB", (4000, 3000), "navy").save(self.input_path)

    def tearDown(self):
        self.temp_dir.cleanup()

    def _compress(self, **resize_options):
        output_dir = os.path.join(self.temp_dir.name, "output")
        with patch("services.compression_service.Config.COMPRESSED_FOLDER", output_dir):
            result = compress_image(
                filepath=self.input_path,
                original_filename="source.png",
                format="webp",
                custom_quality=75,
                **resize_options
            )
        return result

    def test_resizes_to_exact_dimensions_when_aspect_ratio_is_disabled(self):
        result = self._compress(
            width=1000,
            height=1000,
            maintain_aspect_ratio=False
        )

        output_path = result[0]
        self.assertEqual(result[3:], (4000, 3000, 1000, 1000))
        with Image.open(output_path) as output:
            self.assertEqual(output.size, (1000, 1000))

    def test_calculates_height_from_width_when_aspect_ratio_is_enabled(self):
        result = self._compress(
            width=2000,
            height=1000,
            maintain_aspect_ratio=True
        )

        output_path = result[0]
        self.assertEqual(result[3:], (4000, 3000, 2000, 1500))
        with Image.open(output_path) as output:
            self.assertEqual(output.size, (2000, 1500))


if __name__ == "__main__":
    unittest.main()

export interface AIAnalysisRecommendation {
  type: string;
  recommended_format: string;
  recommended_quality: number;
}

export interface CompressionResult {
  historyId: number | null;
  originalFilename: string;
  compressedFilename: string;
  originalSize: number;
  compressedSize: number;
  savings: number;
  originalWidth: number;
  originalHeight: number;
  compressedWidth: number;
  compressedHeight: number;
  analysis: AIAnalysisRecommendation | null;
}

export interface HistoryRecord {
  id: number;
  original_filename: string;
  compressed_filename: string;
  original_size: number;
  compressed_size: number;
  compression_percentage: number;
  image_type?: string;
  recommended_quality?: number;
  recommended_format?: string;
  output_format?: string;
  download_count: number;
  original_width: number | null;
  original_height: number | null;
  compressed_width: number | null;
  compressed_height: number | null;
  created_at: string;
  analysis?: {
    image_type: string;
    recommended_format: string;
    recommended_quality: number;
  } | null;
}

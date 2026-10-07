import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as ws from 'ws';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads');
  private supabase: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const supabaseUrl = this.config.get('SUPABASE_URL');
    const supabaseKey = this.config.get('SUPABASE_KEY');
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_SUPABASE_URL')) {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
        realtime: { transport: ws as any },
      });
      this.logger.log('[SUPABASE STORAGE] Client initialized');
    }
  }

  /**
   * Upload file locally (dev) or to Supabase Storage.
   * Returns the public URL.
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = path.extname(file.originalname);
    const filename = `${folder}/${uuidv4()}${ext}`;

    // Upload to Supabase Storage if initialized
    if (this.supabase) {
      try {
        const bucket = this.config.get('SUPABASE_BUCKET') || 'arena-bucket';
        this.logger.log(`[SUPABASE STORAGE] Uploading ${filename} to bucket ${bucket}`);

        const { data, error } = await this.supabase.storage
          .from(bucket)
          .upload(filename, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            upsert: true,
          });

        if (error) throw error;

        const { data: { publicUrl } } = this.supabase.storage
          .from(bucket)
          .getPublicUrl(filename);

        this.logger.log(`[SUPABASE STORAGE] Uploaded successfully: ${publicUrl}`);
        return publicUrl;
      } catch (err: any) {
        this.logger.error(`[SUPABASE STORAGE] Upload failed: ${err.message}. Falling back to local storage.`);
      }
    }

    // Development Mode (or Fallback): Save to local disk directory
    const dest = path.join(this.uploadDir, filename);
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(dest, file.buffer);
    this.logger.log(`[DEV LOCAL] Saved upload locally: /uploads/${filename}`);

    const backendUrl = (this.config.get('BACKEND_URL') || `http://localhost:${this.config.get('PORT') || 3001}`).replace(/\/$/, '');
    return `${backendUrl}/uploads/${filename}`;
  }
}


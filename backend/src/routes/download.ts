import { Router, Request, Response } from 'express';
import { spawn } from 'child_process';
import { URL } from 'url';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// S3 클라이언트 생성 함수
const createS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION || 'ap-northeast-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

const S3_BUCKET = process.env.S3_BUCKET || 'aneun-dongne';
const S3_FOLDER = 'youtube-download';

interface DownloadRequest {
  url: string;
  format: 'mp3' | 'mp4';
}

const validateYouTubeURL = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    
    return hostname === 'www.youtube.com' || 
           hostname === 'youtube.com' || 
           hostname === 'youtu.be' ||
           hostname === 'm.youtube.com';
  } catch (error) {
    return false;
  }
};

// S3 연결 테스트 엔드포인트
router.get('/test-s3', async (_, res: Response) => {
  try {
    console.log('Testing S3 connection...');
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('S3_BUCKET:', S3_BUCKET);
    console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
    console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
    console.log('First 4 chars of ACCESS_KEY:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 4));
    console.log('First 4 chars of SECRET_KEY:', process.env.AWS_SECRET_ACCESS_KEY?.substring(0, 4));
    
    const testKey = `youtube-download/test-${Date.now()}.txt`;
    const testContent = 'S3 connection test';
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });

    const s3Client = createS3Client();
    await s3Client.send(command);
    console.log('S3 test upload successful:', testKey);
    
    // 테스트 파일 삭제
    await deleteFromS3(testKey);
    
    res.json({ success: true, message: 'S3 connection working' });
  } catch (error: any) {
    console.error('S3 test error details:', {
      name: error.name,
      message: error.message,
      code: error.Code,
      statusCode: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId
    });
    res.status(500).json({ 
      error: 'S3 connection failed', 
      details: {
        name: error.name,
        message: error.message,
        code: error.Code,
        statusCode: error.$metadata?.httpStatusCode
      }
    });
  }
});

// POST /api/download - 다운로드 요청 처리 및 링크 생성
router.post('/download', async (req: Request, res: Response): Promise<any> => {
  try {
    const { url, format }: DownloadRequest = req.body;

    if (!url || !format) {
      return res.status(400).json({ 
        error: 'URL and format are required' 
      });
    }

    if (!validateYouTubeURL(url)) {
      return res.status(400).json({ 
        error: 'Invalid YouTube URL' 
      });
    }

    if (format !== 'mp3' && format !== 'mp4') {
      return res.status(400).json({ 
        error: 'Format must be mp3 or mp4' 
      });
    }

    console.log('Starting download:', { url, format });

    // 1. 비디오 제목 가져오기
    console.log('Getting video title...');
    const videoTitle = await getVideoTitle(url);
    console.log('Video title:', videoTitle);
    
    const fileId = uuidv4();
    const extension = format;

    // 2. S3에 직접 업로드 (로컬 저장 없이)
    const s3Key = `${S3_FOLDER}/${fileId}.${extension}`;
    console.log('Starting download and upload to S3:', s3Key);
    const uploadSuccess = await downloadAndUploadToS3(url, format, s3Key);
    console.log('Upload result:', uploadSuccess);
    
    if (!uploadSuccess) {
      console.error('Upload failed for:', { url, format, s3Key });
      return res.status(500).json({ 
        error: 'Download and upload failed' 
      });
    }

    // 3. JWT 토큰으로 보안 링크 생성 (10분 만료)
    const token = jwt.sign(
      { 
        fileId, 
        s3Key,
        filename: `${videoTitle}.${extension}`,
        originalName: videoTitle,
        format 
      },
      JWT_SECRET,
      { expiresIn: '10m' } // 10분 만료
    );

    // 4. 다운로드 링크 제공
    const downloadUrl = `/api/file/${token}`;
    
    res.json({
      success: true,
      downloadUrl,
      filename: `${videoTitle}.${extension}`,
      expiresIn: '10 minutes'
    });

    // 5. 24시간 후 S3 파일 자동 삭제 스케줄링
    setTimeout(async () => {
      try {
        await deleteFromS3(s3Key);
        console.log('S3 file deleted:', s3Key);
      } catch (error) {
        console.error('Failed to delete S3 file:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24시간

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/file/:token - 토큰 기반 파일 다운로드 (S3에서)
router.get('/file/:token', async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params;
    
    // JWT 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { s3Key, filename, format } = decoded;
    
    // S3에서 파일 스트리밍
    const downloadSuccess = await downloadFromS3(s3Key, filename, format, res);
    
    if (!downloadSuccess) {
      return res.status(404).json({ error: 'File not found or expired' });
    }

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid or expired token' });
    } else {
      console.error('File download error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// 비디오 제목 가져오기 함수
function getVideoTitle(url: string): Promise<string> {
  return new Promise((resolve) => {
    const infoProcess = spawn('yt-dlp', ['--get-title', url]);
    let title = 'video';
    
    infoProcess.stdout.on('data', (data) => {
      title = data.toString().trim().replace(/[^\w\s-]/g, '').substring(0, 50);
    });

    infoProcess.on('close', () => {
      resolve(title || 'video');
    });

    infoProcess.on('error', () => {
      resolve('video');
    });
  });
}

// yt-dlp에서 S3로 버퍼 수집 후 업로드
function downloadAndUploadToS3(url: string, format: string, s3Key: string): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      let ytdlpArgs: string[];
      let contentType: string;

      if (format === 'mp3') {
        ytdlpArgs = [
          url,
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '192K',
          '-o', '-' // stdout으로 출력
        ];
        contentType = 'audio/mpeg';
      } else {
        ytdlpArgs = [
          url,
          '--format', 'best[ext=mp4]',
          '-o', '-' // stdout으로 출력
        ];
        contentType = 'video/mp4';
      }

      console.log('Starting yt-dlp with args:', ytdlpArgs);
      console.log('S3 Key:', s3Key);
      console.log('S3 Bucket:', S3_BUCKET);
      
      const ytdlp = spawn('yt-dlp', ytdlpArgs);

      // 데이터를 버퍼에 수집
      const chunks: Buffer[] = [];
      let totalSize = 0;

      ytdlp.stderr.on('data', (data) => {
        console.error('yt-dlp stderr:', data.toString());
      });

      ytdlp.stdout.on('data', (chunk) => {
        console.log('yt-dlp stdout chunk received, size:', chunk.length);
        chunks.push(chunk);
        totalSize += chunk.length;
      });

      ytdlp.on('close', async (code) => {
        console.log('yt-dlp process closed with code:', code);
        
        if (code === 0 && chunks.length > 0) {
          try {
            // 모든 청크를 하나의 버퍼로 결합
            const finalBuffer = Buffer.concat(chunks, totalSize);
            console.log('Final buffer size:', finalBuffer.length);

            // S3에 업로드
            const uploadCommand = new PutObjectCommand({
              Bucket: S3_BUCKET,
              Key: s3Key,
              Body: finalBuffer,
              ContentType: contentType,
            });

            const s3Client = createS3Client();
            await s3Client.send(uploadCommand);
            console.log('File uploaded to S3 successfully:', s3Key);
            resolve(true);
          } catch (error) {
            console.error('S3 upload error:', error);
            resolve(false);
          }
        } else {
          console.error('yt-dlp failed or no data received');
          resolve(false);
        }
      });

      ytdlp.on('error', (error) => {
        console.error('yt-dlp spawn error:', error);
        resolve(false);
      });

    } catch (error) {
      console.error('downloadAndUploadToS3 error:', error);
      resolve(false);
    }
  });
}

// S3에서 파일 다운로드 함수
async function downloadFromS3(s3Key: string, filename: string, format: string, res: Response): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });

    const s3Client = createS3Client();
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return false;
    }

    // 헤더 설정
    const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // S3 스트림을 HTTP 응답으로 파이프
    const stream = response.Body as any;
    stream.pipe(res);
    
    return true;
  } catch (error) {
    console.error('S3 download error:', error);
    return false;
  }
}

// S3에서 파일 삭제 함수
async function deleteFromS3(s3Key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
    });

    const s3Client = createS3Client();
    await s3Client.send(command);
    console.log('File deleted from S3:', s3Key);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw error;
  }
}

export default router;
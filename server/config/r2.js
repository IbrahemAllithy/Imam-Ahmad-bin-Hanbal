import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const {
  R2_ACCOUNT_ID,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME,
  R2_PUBLIC_URL,
} = process.env;

export const R2_ENABLED = Boolean(
  R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME && R2_PUBLIC_URL
);

let client = null;
if (R2_ENABLED) {
  client = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

const publicBase = (R2_PUBLIC_URL || '').replace(/\/$/, '');

/** Uploads a buffer to the R2 bucket under `key` and returns its public URL. */
export const uploadBufferToR2 = async (key, buffer, contentType) => {
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${publicBase}/${key}`;
};

/** Deletes an object from R2 given its public URL (no-op if the URL isn't under our public base). */
export const deleteFromR2ByUrl = async (publicUrl) => {
  if (!publicUrl || !publicUrl.startsWith(`${publicBase}/`)) return;
  const key = publicUrl.slice(publicBase.length + 1);
  try {
    await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }));
  } catch {
    // best-effort cleanup — a stray object left in the bucket isn't worth failing the request over
  }
};

export const isR2Url = (url) => R2_ENABLED && Boolean(url) && url.startsWith(`${publicBase}/`);

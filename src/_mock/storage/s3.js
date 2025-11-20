// src/_mock/storage/s3.js

// 1. Import your static mock assets here so Vite processes them correctly
// (This replaces the hardcoded string paths in your JSON)
import profilePic from "../../assets/Test/Profile.png";
import testPdf from "../../assets/Test/Test.pdf";
import testImg from "../../assets/Test/Test.jpg";
import insuranceCard from "../../assets/Test/Test.png";

// 2. Map your "Database Keys" to these imports
// This simulates an S3 bucket where specific keys hold specific files.
const INITIAL_BUCKET = {
  // Profile Pictures
  "profile/patient-uuid-001": profilePic,
  "profile/provider-uuid-001": null, // Provider image placeholder

  // Documents (Keys match the IDs or paths you want to simulate)
  "documents/registration-packet": testPdf,
  "documents/financial-policy": testPdf,
  "documents/hipaa-signed": testPdf,
  "documents/history-photo": testImg,
  "documents/insurance-front": insuranceCard,
  "documents/referral-letter": testPdf,
  "documents/teledentistry-consent": testPdf,
  "documents/xrays-panorex": testImg,
};

class MockS3Service {
  constructor() {
    this.bucket = new Map(Object.entries(INITIAL_BUCKET));
    this.latency = 800; // Simulate 800ms network delay
  }

  /**
   * Simulates network delay
   */
  _wait() {
    return new Promise((resolve) => setTimeout(resolve, this.latency));
  }

  /**
   * Uploads a file to the "Bucket"
   * @param {File} file - The browser File object
   * @param {string} folder - The target folder (e.g., 'documents', 'profile')
   * @returns {Promise<{key: string, url: string}>}
   */
  async upload(file, folder = "uploads") {
    await this._wait();

    // 1. Generate a unique S3-like key
    const fileName = file.name.replace(/\s+/g, "-").toLowerCase();
    const uniqueId = Date.now();
    const key = `${folder}/${uniqueId}-${fileName}`;

    // 2. Create a Blob URL to simulate the hosted file URL
    // In a real app, this would be the https://s3.amazonaws.com/... URL
    const url = URL.createObjectURL(file);

    // 3. Store in our map
    this.bucket.set(key, url);

    console.log(`[MockS3] Uploaded: ${key}`);
    return { key, url };
  }

  /**
   * Retrieves a URL for a given key.
   * In a real app, this might generate a presigned URL.
   */
  async getUrl(key) {
    // No wait needed for getting a public URL usually, but let's simulate async
    // in case we want to simulate signing.
    // await this._wait();

    if (this.bucket.has(key)) {
      return this.bucket.get(key);
    }

    // Fallback for pre-existing mock data that might still use direct paths
    if (key && (key.startsWith("/") || key.startsWith("http"))) {
      return key;
    }

    console.warn(`[MockS3] File not found: ${key}`);
    return null;
  }

  /**
   * Deletes a file from the "Bucket"
   */
  async delete(key) {
    await this._wait();
    if (this.bucket.has(key)) {
      const url = this.bucket.get(key);
      // Clean up memory if it's a blob
      if (url && url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
      this.bucket.delete(key);
      console.log(`[MockS3] Deleted: ${key}`);
      return true;
    }
    return false;
  }
}

// Export a single instance (Singleton)
export const s3Service = new MockS3Service();

import dotenv from 'dotenv';
import { addAIProcessingJob } from './src/queue.js';
import path from 'path';

// Load environment variables
dotenv.config();

async function testImageProcessing() {
  console.log('🧪 Testing Google Cloud Vision Integration...');
  
  // Check environment setup
  console.log('\n📋 Environment Check:');
  console.log('✅ Google Cloud Key File:', process.env.GOOGLE_CLOUD_KEY_FILE ? 'Set' : '❌ Missing');
  console.log('✅ OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : '❌ Missing');
  console.log('✅ Redis URL:', process.env.REDIS_URL || 'localhost:6379');
  
  if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
    console.log('\n⚠️ Google Cloud Vision not configured. See VISION_SETUP.md for setup instructions.');
    console.log('Test will use basic image processing fallback.');
  }

  // Create a test job (you would need an actual image file to test with)
  const testJob = {
    fileId: 'test-image-001',
    filePath: '/path/to/test/image.jpg', // Replace with actual test image
    mimeType: 'image/jpeg',
    userId: 'test-user'
  };

  try {
    console.log('\n🚀 Adding test job to queue...');
    const job = await addAIProcessingJob(testJob);
    console.log(`✅ Job ${job.id} added to queue successfully!`);
    
    console.log('\n📝 Expected processing steps:');
    console.log('1. 🖼️ Google Cloud Vision analysis');
    console.log('2. 🏷️ Label detection (objects, scenes)');
    console.log('3. 📝 OCR text extraction');
    console.log('4. 🎯 Object localization');
    console.log('5. 🏢 Logo detection');
    console.log('6. 📊 Enhanced tag classification');
    console.log('7. 💾 Database update with results');
    
    console.log('\n🎉 Test completed! Check worker logs for processing results.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testImageProcessing().then(() => {
  console.log('\n🏁 Test script finished.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});

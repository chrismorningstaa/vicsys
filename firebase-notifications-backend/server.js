const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fetch = require('node-fetch');
const projectId = 'vicsys-a6039';
const { getFirestore } = require('firebase-admin/firestore');

// const {Storage} = require('@google-cloud/storage');

// async function authenticateImplicitWithAdc() {
//   const storage = new Storage({
//     projectId,
//   });
//   const [buckets] = await storage.getBuckets();
//   console.log('Buckets:');

//   for (const bucket of buckets) {
//     console.log(`- ${bucket.name}`);
//   }

//   console.log('Listed all storage buckets.');
// }

// authenticateImplicitWithAdc();


const serviceAccount = require("./vicsys-a6039-firebase-adminsdk-cl5si-2b9da741f2.json");

// Initialize Firebase Admin with explicit project ID
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: projectId
});

const app = express();
const PORT = 5000;
const db = getFirestore();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'OPTIONS'],  
  allowedHeaders: ['Content-Type', 'Authorization'],  
  credentials: true 
}));

app.use(bodyParser.json());

// Get access token using Firebase Admin
async function getAccessToken() {
  try {
    // Use the correct method to get access token
    const accessToken = await admin.app().options.credential.getAccessToken();
    console.log('Successfully obtained access token');
    return accessToken.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}


// Backend: Update your createCampaign function
async function createCampaign(campaignData) {
  try {
    const accessToken = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    // Base message structure with cross-platform notification
    const message = {
      message: {
        notification: {
          title: campaignData.title,
          body: campaignData.body
        },
        // Android specific config
        android: {
          notification: {
            title: campaignData.title,
            body: campaignData.body,
            icon: '@mipmap/ic_launcher',
            color: '#FF0000', // Customize with your app's color
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        // iOS specific config
        apns: {
          payload: {
            aps: {
              alert: {
                title: campaignData.title,
                body: campaignData.body
              },
              sound: 'default',
              badge: 1
            }
          }
        },
        // Web specific config
        webpush: {
          notification: {
            title: campaignData.title,
            body: campaignData.body,
            icon: '/firebase-logo.png', // Update with your web app icon
            badge: '/badge-icon.png',   // Update with your badge icon
            click_action: 'https://your-web-app-url.com' // Update with your web app URL
          },
          fcm_options: {
            link: 'https://your-web-app-url.com' // Update with your web app URL
          }
        }
      }
    };
    
    switch (campaignData.targetType) {
      case 'specific':
        if (!campaignData.targetValue) {
          throw new Error('Device token is required for specific targeting');
        }
        message.message.token = campaignData.targetValue;
        break;

      case 'topic':
        if (!campaignData.targetValue) {
          throw new Error('Topic name is required for topic targeting');
        }
        message.message.topic = campaignData.targetValue;
        break;

      case 'all':
        message.message.topic = 'all'; 
        break;

      default:
        throw new Error('Invalid target type');
    }

    console.log('Sending FCM message:', JSON.stringify(message, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`FCM API Error: ${errorData}`);
    }

    const responseData = await response.json();
    console.log('FCM Response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Campaign creation error:', error);
    throw error;
  }
}

async function saveCampaignToFirestore(campaignData, fcmResponse) {
  try {
    const campaignRef = db.collection('notificationCampaigns');
    
    const campaign = {
      ...campaignData,
      status: 'sent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      fcmResponse: fcmResponse,
    };

    const docRef = await campaignRef.add(campaign);
    console.log('Campaign saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

app.post("/send-notification", async (req, res) => {
  try {
    console.log("Received notification request:", req.body);
    const { title, body, targetType, targetValue } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    const campaignResponse = await createCampaign({
      title,
      body,
      targetType,
      targetValue
    });

    const firestoreId = await saveCampaignToFirestore(req.body, campaignResponse);

    console.log("Campaign created and saved successfully:", campaignResponse);
    res.status(200).json({ 
      message: "Notification campaign created successfully", 
      response: campaignResponse,
      campaignId: firestoreId
    });

  } catch (error) {
    console.error("Error creating campaign:", error);
    res.status(500).json({ 
      error: "Failed to create notification campaign", 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
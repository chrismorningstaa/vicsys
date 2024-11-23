const { getFirestore } = require('firebase-admin/firestore');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const projectId = 'vicsys-a6039';

const serviceAccount = require("./vicsys-a6039-firebase-adminsdk-cl5si-2b9da741f2.json");

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

// Helper function to clean undefined values from an object
function cleanUndefinedValues(obj) {
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

async function getAccessToken() {
  try {
    const accessToken = await admin.app().options.credential.getAccessToken();
    console.log('Successfully obtained access token');
    return accessToken.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

async function scheduleNotification(campaignData, scheduledFor) {
  // Clean the campaign data before saving
  const cleanedData = cleanUndefinedValues(campaignData);
  
  schedule.scheduleJob(new Date(scheduledFor), async () => {
    try {
      await createCampaign(cleanedData);
      
      await db.collection('notificationCampaigns')
        .doc(cleanedData.campaignId)
        .update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
      
      await db.collection('notificationCampaigns')
        .doc(cleanedData.campaignId)
        .update({
          status: 'failed',
          error: error.message
        });
    }
  });

  const campaign = {
    ...cleanedData,
    status: 'scheduled',
    scheduledFor: admin.firestore.Timestamp.fromDate(new Date(scheduledFor)),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('notificationCampaigns').add(campaign);
  return docRef.id;
}

async function createCampaign(campaignData) {
  try {
    const accessToken = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    const message = {
      message: {
        notification: {
          title: campaignData.title,
          body: campaignData.body
        },
        android: {
          notification: {
            title: campaignData.title,
            body: campaignData.body,
            icon: '@mipmap/ic_launcher',
            color: '#FF0000',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
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
        webpush: {
          notification: {
            title: campaignData.title,
            body: campaignData.body,
            icon: '/firebase-logo.png',
            badge: '/badge-icon.png',
            click_action: 'https://your-web-app-url.com'
          },
          fcm_options: {
            link: 'https://your-web-app-url.com'
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
    // Clean the data before saving to Firestore
    const cleanedData = cleanUndefinedValues({
      ...campaignData,
      status: 'sent',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      fcmResponse: fcmResponse
    });

    // For "all" target type, ensure targetValue is not undefined
    if (cleanedData.targetType === 'all' && !cleanedData.targetValue) {
      cleanedData.targetValue = 'all';
    }

    const campaignRef = db.collection('notificationCampaigns');
    const docRef = await campaignRef.add(cleanedData);
    console.log('Campaign saved to Firestore with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    throw error;
  }
}

app.post("/send-notification", async (req, res) => {
  try {
    const { title, body, targetType, targetValue, scheduledFor } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    const campaignData = cleanUndefinedValues({
      title,
      body,
      targetType,
      targetValue: targetType === 'all' ? 'all' : targetValue
    });

    let response;
    let campaignId;

    if (scheduledFor) {
      campaignId = await scheduleNotification(campaignData, scheduledFor);
      response = { scheduled: true, scheduledFor };
    } else {
      response = await createCampaign(campaignData);
      campaignId = await saveCampaignToFirestore(campaignData, response);
    }

    res.status(200).json({ 
      message: scheduledFor ? "Notification scheduled successfully" : "Notification sent successfully",
      campaignId,
      response
    });

  } catch (error) {
    console.error("Error handling notification:", error);
    res.status(500).json({ 
      error: "Failed to process notification", 
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
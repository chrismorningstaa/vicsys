import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Space, 
  Modal, 
  message, 
  Popconfirm, 
  Tag, 
  Typography 
} from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { db } from '../../../firebase/firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import dayjs from 'dayjs';

const { Text } = Typography;

interface StatusColors {
  sent: 'success';
  failed: 'error';
  scheduled: 'warning';
}

const statusColors: StatusColors = {
  sent: 'success',
  failed: 'error',
  scheduled: 'warning'
} as const;

type NotificationStatus = keyof typeof statusColors;

const isValidStatus = (status: string): status is NotificationStatus => {
  return status === 'sent' || status === 'failed' || status === 'scheduled';
};

interface NotificationData {
  id: string;
  title: string;
  body: string;
  targetType: 'all' | 'specific' | 'topic';
  targetValue: string;
  status: NotificationStatus;
  createdAt: any; // Firestore Timestamp
  scheduledTime?: any; // Optional scheduled time
}

const ViewNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    visible: boolean;
    notification: NotificationData | null;
  }>({
    visible: false,
    notification: null
  });

  // Check and update scheduled notifications
  const updateScheduledNotifications = async (notifications: NotificationData[]) => {
    const currentTime = new Date();
    
    for (const notification of notifications) {
      if (notification.status === 'scheduled' && notification.scheduledTime) {
        const scheduledTime = notification.scheduledTime.toDate();
        
        if (currentTime >= scheduledTime) {
          try {
            // Update the notification status in Firestore
            await updateDoc(doc(db, 'notificationCampaigns', notification.id), {
              status: 'sent'
            });
          } catch (error) {
            console.error('Error updating notification status:', error);
          }
        }
      }
    }
  };

  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notificationCampaigns');
      const q = query(notificationsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const notificationData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationData[];

      // Update scheduled notifications if needed
      await updateScheduledNotifications(notificationData);
      
      // Fetch the updated data
      const updatedQuerySnapshot = await getDocs(q);
      const updatedNotificationData = updatedQuerySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationData[];

      setNotifications(updatedNotificationData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Set up an interval to check scheduled notifications every minute
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, []);

  // Handle notification deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notificationCampaigns', id));
      message.success('Notification deleted successfully');
      fetchNotifications(); // Refresh the list
    } catch (error) {
      console.error('Error deleting notification:', error);
      message.error('Failed to delete notification');
    }
  };

  // Format target information
  const formatTarget = (targetType: string, targetValue: string) => {
    switch (targetType) {
      case 'all':
        return <Tag color="blue">All Users</Tag>;
      case 'topic':
        return <Tag color="green">Topic: {targetValue}</Tag>;
      case 'specific':
        return <Tag color="orange">Specific Device</Tag>;
      default:
        return <Tag color="default">Unknown</Tag>;
    }
  };

  // Status tag colors
  const getStatusTag = (status: string) => {
    if (isValidStatus(status)) {
      return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
    }
    return <Tag color="default">{status.toUpperCase()}</Tag>;
  };
  
  const columns = [
    {
      title: 'Date and Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: any) => {
        const date = createdAt?.toDate ? createdAt.toDate() : new Date(createdAt);
        return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: (a: NotificationData, b: NotificationData) => {
        const dateA = new Date(a.createdAt?.toDate()).getTime();
        const dateB = new Date(b.createdAt?.toDate()).getTime();
        return dateA - dateB;
      },
    },
    {
      title: 'Content',
      dataIndex: 'body',
      key: 'body',
      render: (text: string) => (
        <Text ellipsis={{ tooltip: text }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Target',
      key: 'target',
      render: (record: NotificationData) => formatTarget(record.targetType, record.targetValue),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: NotificationData) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EyeOutlined />}
            onClick={() => setPreviewModal({ visible: true, notification: record })}
          />
          <Popconfirm
            title="Delete this notification?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card title="Notification History">
      <Table 
        columns={columns} 
        dataSource={notifications} 
        rowKey="id"
        loading={loading}
        pagination={{ 
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} notifications`
        }}
      />

      <Modal
        title="Notification Preview"
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, notification: null })}
        footer={[
          <Button 
            key="close" 
            onClick={() => setPreviewModal({ visible: false, notification: null })}
          >
            Close
          </Button>
        ]}
      >
        {previewModal.notification && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card>
              <Space direction="vertical">
                <Text strong>Title:</Text>
                <Text>{previewModal.notification.title}</Text>
                
                <Text strong>Content:</Text>
                <Text>{previewModal.notification.body}</Text>
                
                <Text strong>Target:</Text>
                {formatTarget(
                  previewModal.notification.targetType, 
                  previewModal.notification.targetValue
                )}
                
                <Text strong>Status:</Text>
                {getStatusTag(previewModal.notification.status)}
                
                <Text strong>Created At:</Text>
                <Text>
                  {dayjs(previewModal.notification.createdAt?.toDate()).format('YYYY-MM-DD HH:mm:ss')}
                </Text>
              </Space>
            </Card>
          </Space>
        )}
      </Modal>
    </Card>
  );
};

export default ViewNotification;
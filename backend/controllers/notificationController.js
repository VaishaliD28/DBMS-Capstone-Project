const db = require('../config/db');

// 1. GET CURRENT USER'S NOTIFICATIONS
async function getMyNotifications(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY is_read ASC, created_at DESC 
       LIMIT 30`,
      [userId]
    );

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (err) {
    console.error('[Get Notifications Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
}

// 2. MARK NOTIFICATION AS READ
async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update notification.' });
  }
}

// 3. MARK ALL AS READ
async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notifications.' });
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead
};

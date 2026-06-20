import { Bell, X, CheckCircle2, AlertCircle, Info } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { radius, spacing, typography } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { AppNotification } from '@/types';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export function NotificationModal({ visible, onClose, notifications }: NotificationModalProps) {
  const { theme, isDarkMode } = useTheme();

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle size={18} color={theme.crimson} />;
      case 'success':
        return <CheckCircle2 size={18} color={theme.success} />;
      default:
        return <Info size={18} color={theme.teal} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.backdrop, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]} />
        
        <Pressable style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Bell size={20} color={theme.crimson} />
              <Text style={[styles.title, { color: theme.ink }]}>Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.inkMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: theme.inkFaint }]}>No notifications yet</Text>
              </View>
            ) : (
              notifications.map((n) => (
                <View 
                  key={n.id} 
                  style={[
                    styles.item, 
                    { borderBottomColor: theme.border },
                    !n.read && { backgroundColor: isDarkMode ? 'rgba(179, 18, 42, 0.05)' : 'rgba(179, 18, 42, 0.03)' }
                  ]}
                >
                  <View style={styles.itemHeader}>
                    <View style={styles.typeIcon}>
                      {getIcon(n.type)}
                    </View>
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemTitle, { color: theme.ink }]}>{n.title}</Text>
                      <Text style={[styles.itemBody, { color: theme.inkMuted }]}>{n.body}</Text>
                      <Text style={[styles.itemTime, { color: theme.inkFaint }]}>
                        {new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 64,
    paddingRight: spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
  },
  closeButton: {
    padding: 4,
  },
  list: {
    paddingBottom: spacing.lg,
  },
  item: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeIcon: {
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    ...typography.bodyStrong,
    fontSize: 16,
  },
  itemBody: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
  },
  itemTime: {
    ...typography.caption,
    marginTop: 4,
  },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
  },
});

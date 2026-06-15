import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyApplicationsScreen from '../screens/MyApplicationsScreen';
import IncomingRequestsScreen from '../screens/IncomingRequestsScreen';
import { TYPOGRAPHY } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const TAB_ICON = {
  Dashboard:  { focused: 'view-dashboard',         unfocused: 'view-dashboard-outline' },
  Feed:       { focused: 'clipboard-text',           unfocused: 'clipboard-text-outline' },
  MyApps:     { focused: 'file-document',            unfocused: 'file-document-outline' },
  Requests:   { focused: 'inbox-multiple',           unfocused: 'inbox-multiple-outline' },
  Profile:    { focused: 'account-circle',           unfocused: 'account-circle-outline' },
};

export default function MainStack() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICON[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          ...TYPOGRAPHY.caption,
          fontSize: 10,
        },
      })}
    >
      <Tab.Screen name="Dashboard"  component={DashboardScreen}       options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Feed"       component={FeedScreen}            options={{ tabBarLabel: 'Discover' }} />
      <Tab.Screen name="MyApps"     component={MyApplicationsScreen}  options={{ tabBarLabel: 'Applied' }} />
      <Tab.Screen name="Requests"   component={IncomingRequestsScreen} options={{ tabBarLabel: 'Requests' }} />
      <Tab.Screen name="Profile"    component={ProfileScreen}          options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

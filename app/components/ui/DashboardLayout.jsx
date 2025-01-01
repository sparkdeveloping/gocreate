"use client";

import React from "react";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Home,
  CalendarToday,
  People,
  Work,
  DirectionsCar,
  BarChart,
  Logout,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";

// Sidebar configuration
const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <Home />, path: "/admin" },
  { text: "Memberships", icon: <People />, path: "/admin/memberships" },
  {
    text: "Tracker",
    icon: <BarChart />,
    children: [
      { text: "Employees", path: "/admin/tracker/employees" },
      { text: "Members", path: "/admin/tracker/members" },
    ],
  },
  { text: "Workforce", icon: <Work />, path: "/admin/workforce" },
  {
    text: "Parking",
    icon: <DirectionsCar />,
    path: "/admin/parking",
  },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "#3f51b5",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) =>
              item.children ? (
                <Box key={item.text}>
                  <ListItem>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItem>
                  {item.children.map((child) => (
                    <ListItem
                      key={child.text}
                      button
                      onClick={() => router.push(child.path)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={child.text} />
                    </ListItem>
                  ))}
                </Box>
              ) : (
                <ListItem
                  key={item.text}
                  button
                  onClick={() => router.push(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            )}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={() => router.push("/logout")}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          backgroundColor: "#f9f9f9",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

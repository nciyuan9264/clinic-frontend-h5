import Chat from "@/view/Chat";
import React from "react";
import { Navigate } from "react-router-dom";
export interface AppRoute {
    path: string;
    element: React.ReactNode;
    auth?: boolean;
    children?: AppRoute[];
}

export const routes: AppRoute[] = [
    {
      path: "/chat",
      element: <Chat />
    },
    { path: "*", element: <Navigate to="/chat" /> }, // 处理未匹配路由
  ];
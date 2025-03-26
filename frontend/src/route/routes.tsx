import React from "react";
import Home from "@/view/Home";
import MainLayout from "@/layout/main/MainLayout";
import { Navigate } from "react-router-dom";
import Wallet from "@/view/Wallet";
import Bill from "@/view/Bill";
import Mine from "@/view/Mine";
import Login from "@/view/Login";
import EditMedicine from "@/view/medicine/edit";
import MedicineList from "@/view/medicine/list";
import MedicineDetail from "@/view/medicine/detail";
import EditRecord from "@/view/record/edit";
import RecordList from "@/view/record/list";
import RecordDetail from "@/view/record/detail";

export interface AppRoute {
    path: string;
    element: React.ReactNode;
    auth?: boolean;
    children?: AppRoute[];
}

export const routes: AppRoute[] = [
    {
      path: "/",
      element: <MainLayout />,
      auth: true,
      children: [
        { path: "/", element: <Home /> },
        { path: "/wallet", element: <Wallet /> },
        { path: "/bill", element: <Bill /> },
        { path: "/mine", element: <Mine /> },
      ],
    },
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/medicine/edit",
      element: <EditMedicine />
    },
    {
      path: "/medicine/list",
      element: <MedicineList/>
    },
    {
      path: "/medicine/detail/:id",
      element: <MedicineDetail/>
    },
    {
      path: "/record/edit",
      element: <EditRecord />
    },
    {
      path: "/record/list",
      element: <RecordList />
    },
    {
      path: "/record/detail/:id",
      element: <RecordDetail />
    },
    { path: "*", element: <Navigate to="/" /> }, // 处理未匹配路由
  ];
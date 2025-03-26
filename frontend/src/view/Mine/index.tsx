import React from "react";
import { Avatar, List, Button } from "antd-mobile";
import "./index.less";
import { closeWebView, removeItem, setItem } from "@/util/jsBridge";
import { rootFontSize } from "@/const/env";
import { usePersonStore } from "@/store/config";
import { useLogout } from "@/api/login";
import { useNavigate } from "react-router-dom";

const Mine: React.FC = () => {
  const { env } = usePersonStore();
  const { logout } = useLogout();
  const navigate = useNavigate();

  return (
    <div className="mine-page" style={{ paddingTop: `${(env?.statusBarHeight ?? 0) / rootFontSize}rem` }}>
      {/* 用户信息区域 */}
      <div className="profile-header">
        <Avatar
          className="avatar"
          src="https://via.placeholder.com/80"
          style={{ "--size": "80px" }}
        />
        <div className="user-info">
          <h2 className="username">John Doe</h2>
          <p className="email">john.doe@example.com</p>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="profile-list">
        <List header="Account Settings">
          <List.Item arrow="horizontal" onClick={() => console.log("Edit Profile")}>
            Edit Profile
          </List.Item>
          <List.Item arrow="horizontal" onClick={() => console.log("Change Password")}>
            Change Password
          </List.Item>
          <List.Item arrow="horizontal" onClick={() => console.log("Manage Address")}>
            Manage Address
          </List.Item>
        </List>

        <List header="Other">
          <List.Item arrow="horizontal" onClick={() => closeWebView()}>
            About Us
          </List.Item>
          <List.Item arrow="horizontal" onClick={() => console.log("Help & Support")}>
            Help & Support
          </List.Item>
        </List>
      </div>

      {/* 登出按钮 */}
      <div className="logout-section">
        <div onClick={() => { setItem('wzy1', '666') }}>setItem</div>
        <div onClick={() => { removeItem('wzy1') }}>removeItem</div>

        <Button block color="danger" size="large" onClick={async () => {
          await logout();
          navigate("/login"); // 退出后跳转到登录页
        }}>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Mine;

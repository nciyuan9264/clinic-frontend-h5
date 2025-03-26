import React, { useState } from "react";
import { Form, Input, Button, Toast } from "antd-mobile";
import styles from "./index.module.less";
import { useLogin, useRegister } from "@/api/login";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // 用于切换登录和注册

  const { data: registerResponse, register } = useRegister();
  const { login } = useLogin();


  const handleFinish = async (values: any) => {
    if (isLogin) {
      try {
        const loginResponse = await login({
          data: {
            username: values.username,
            password: values.password,
          },
        });
        navigate('/'); // 如果未认证且路由需要认证，则重定向到登录
        Toast.show({ icon: 'success', content: loginResponse?.data?.message, duration: 1000 });
      } catch (err: any) {
        console.log('wzy err', err);
        Toast.show({ icon: 'fail', content: err?.response?.data?.message, duration: 1000 });
        console.error("登录失败:", err);
      }
    } else {
      try {
        await register({
          data: JSON.stringify({
            username: values.username,
            password: values.password,
            email: values.email
          })
        });
        Toast.show({ icon: 'success', content: registerResponse.data.message, duration: 1000 });
      } catch (err) {
        Toast.show({ icon: 'fail', content: registerResponse.data.message, duration: 1000 });
        console.error("注册失败:", err);
      }
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['form-container']}>
        <h2 className={styles['title']}>{isLogin ? "登录" : "注册"}</h2>
        <Form
          onFinish={handleFinish}
          footer={
            <Button block type="submit" color="primary" size="large">
              {isLogin ? "登录" : "注册"}
            </Button>
          }
        >
          {/* 用户名 */}
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名!" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input placeholder="请输入密码" type="password" />
          </Form.Item>

          {/* 注册额外字段 */}
          {!isLogin && (
            <>
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                rules={[
                  { required: true, message: "请确认密码!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value === getFieldValue("password")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("两次密码输入不一致!"));
                    },
                  }),
                ]}
              >
                <Input placeholder="请再次输入密码" type="password" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: "请输入邮箱!" },
                  { type: "email", message: "邮箱格式不正确!" },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </>
          )}
        </Form>

        {/* 切换按钮 */}
        <div className={styles['switch-container']}>
          <span>
            {isLogin ? "没有账号？" : "已有账号？"}
            <Button
              type="submit"
              size="small"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "注册" : "登录"}
            </Button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;

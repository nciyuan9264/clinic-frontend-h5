import React, { useEffect, useState } from "react";
import { Card, Button, Space, Image, Tag } from "antd-mobile";
import styles from "./index.module.less";
import { closeWebView, openWebView } from "@/util/jsBridge";
import Header from "@/component/header";
import { useParams } from "react-router-dom";
import { useGetRecordDetails } from "@/api/record";
import { local } from "@/const/env";
import dayjs from "dayjs";

const RecordDetail: React.FC = () => {
  const [recordInfo, setRecordInfo] = useState<RecordEntity>();
  const { loading, fetchRecordDetails } = useGetRecordDetails();
  const { id } = useParams(); // 获取 URL 参数中的 `id`

  const fetchRecord = async () => {
    if (!id) {
      return;
    }
    const fetchData = await fetchRecordDetails(id);
    setRecordInfo(fetchData.data);
  }

  useEffect(() => {
    fetchRecord(); // 初次加载时获取数据

    // 监听 WebView 关闭事件
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchRecord(); // 重新获取数据
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [])

  if (loading) {
    return <div className={styles.loading}>加载中...</div>;
  }

  return (
    <div className={styles.container}>
      <Header title="详情" onBack={() => closeWebView()} />
      <Card className={styles.card}>
        <div className={styles.info}>
          <p><strong>姓名：</strong>{recordInfo?.patientName}</p>
          <p><strong>年龄：</strong>{recordInfo?.patientAge}</p>
          <p><strong>性别：</strong>{recordInfo?.patientGender === 'male' ? '男' : '女'}</p>
          <p><strong>处方：</strong><br />
            <Space wrap>
              {
                recordInfo?.prescriptionImageUrls.map(item => {
                  return <Image key={item} src={item} width={100} height={100} fit='contain' />
                })
              }
            </Space>
          </p>
          <p><strong>日期：</strong>{dayjs(recordInfo?.startDate).format('YYYY-MM-DD')} ~ {dayjs(recordInfo?.endDate).format('YYYY-MM-DD')}</p>
          <p><strong>价格：</strong>{recordInfo?.totalPrice}</p>
          <p><strong>药品：</strong><br /><br />
            {
              recordInfo?.medications?.map((item) => (
                <Tag
                  key={item.medicine.id}
                  color='default'
                  fill='outline'
                  style={{
                    marginBottom: '8px',
                    marginRight: '8px',
                    borderRadius: '8px',
                    padding: '6px 12px',
                  }}
                >
                  {item.medicine.goods_name} / {item.medicine.company} x {item.amount}
                </Tag>
              ))
            }</p>
        </div>
      </Card>
      <div className={styles.buttons}>
        <Button className={styles.edit} block color='default' onClick={() => openWebView(`${local}/record/edit?id=${id}`)}>
          编辑
        </Button>
        <Button className={styles.close} block color="primary" onClick={() => closeWebView()}>
          关闭
        </Button>
      </div>
    </div>
  );
};

export default RecordDetail;

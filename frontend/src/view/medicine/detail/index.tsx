import React, { useEffect, useState } from "react";
import { Card, Button } from "antd-mobile";
import styles from "./index.module.less";
import { closeWebView, openWebView } from "@/util/jsBridge";
import Header from "@/component/header";
import { useParams } from "react-router-dom";
import { useGetMedicineDetails } from "@/api/medicine";
import { local } from "@/const/env";


const MedicineDetail: React.FC = () => {
  const [goodInfo, setGoodInfo] = useState<MedicineInfoFromBackend>();
  const { loading, fetchMedicineDetails } = useGetMedicineDetails();
  const { id } = useParams(); // 获取 URL 参数中的 `id`

  const fetchMedicine = async() =>{
    if (!id) {
      return;
    }
    const fetchData = await fetchMedicineDetails(id);
    setGoodInfo(fetchData.data);
  }

  useEffect(() => {
    fetchMedicine(); // 初次加载时获取数据

    // 监听 WebView 关闭事件
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchMedicine(); // 重新获取数据
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
          <p><strong>名称：</strong>{goodInfo?.goods_name}</p>
          <p><strong>条形码：</strong>{goodInfo?.barcode}</p>
          <p><strong>类别：</strong>{goodInfo?.category_name}</p>
          <p><strong>品牌：</strong>{goodInfo?.brand}</p>
          <p><strong>售价：</strong>¥{goodInfo?.sale_price}</p>
          <p><strong>描述：</strong>{goodInfo?.description || "暂无描述"}</p>
        </div>
      </Card>
      <Button block color="primary" onClick={() => openWebView(`${local}/medicine/edit?id=${id}`)} style={{ marginTop: 20 }}>
        编辑
      </Button>
      <Button block color="primary" onClick={() => closeWebView()} style={{ marginTop: 20 }}>
        关闭
      </Button>
    </div>
  );
};

export default MedicineDetail;

import React, { useRef, useState } from "react";
import { Form, Input, Button } from "antd-mobile";
import styles from "./index.module.less";
import { closeWebView, scanBarcode } from "@/util/jsBridge";
import Header from "@/component/header";
import { FormInstance } from "antd-mobile/es/components/form";
import { useCreateMedicine, useEditMedicine, useGetGoodInfo, useGetMedicineDetails } from "@/api/medicine";
import { useSearchParams } from "react-router-dom";
import { useAsyncEffect } from "ahooks";
import { local } from "@/const/env";
import { GetBarcodeInfoType } from "@/const/medicine";

const EditMedicine: React.FC = () => {
  const formRef = useRef<FormInstance>(null);
  const [goodInfo, setGoodInfo] = useState<MedicineInfo>();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id"); // 获取 id 参数
  const isEdit = Boolean(id);

  const { fetchMedicineDetails } = useGetMedicineDetails();
  const { createMedicine } = useCreateMedicine();
  const { editMedicine } = useEditMedicine();
  const { fetchGoodInfo } = useGetGoodInfo();


  useAsyncEffect(async () => {
    if (!id) {
      return;
    }
    const fetchData = await fetchMedicineDetails(id);
    fillForm(fetchData.data);
  }, []);

  const onFinish = async (values: any) => {
    const mergedInfo = { ...goodInfo, ...values };
    const res = isEdit ? await editMedicine({ data: mergedInfo }) : await createMedicine({ data: mergedInfo })
    if (isEdit) {
      closeWebView()
    } else {
      window.location.href = `${local}/medicine/list`; // 直接修改当前 WebView 的 URL
    }
    console.log(`${isEdit}的数据:`, mergedInfo, res);
  };

  const getInfo = async () => {
    const {barcode} = await scanBarcode();
    const info = await fetchGoodInfo(barcode, GetBarcodeInfoType.API);
    fillForm(info?.data?.data);
  };

  const fillForm = (info: MedicineInfo | MedicineInfoFromBackend) => {
    setGoodInfo(info);
    formRef.current?.setFieldsValue({
      goods_name: info.goods_name,
      barcode: info.barcode,
      category_name: info.category_name,
      brand: info.brand
    });
    if ("description" in info) {
      formRef.current?.setFieldValue('description', info.description)
    }
    if ("purchase_price" in info) {
      formRef.current?.setFieldValue('purchase_price', info.purchase_price)
    }
    if ("sale_price" in info) {
      formRef.current?.setFieldValue('sale_price', info.sale_price)
    }
  }

  return (
    <div className={styles.container}>
      <Header
        title={isEdit ? '编辑' : '创建'}
        onBack={() => closeWebView()}
      />
      <Form
        ref={formRef} // 使用 ref 绑定 Form
        layout="vertical"
        onFinish={onFinish}
        footer={
          <>
            <Button onClick={getInfo} block color="success" size="large" style={{ marginBottom: '10px' }}>
              扫码填充数据
            </Button>
            <Button block type="submit" color="primary" size="large">
              提交
            </Button>
          </>
        }
      >
        <Form.Item name="goods_name" label="名称" rules={[{ required: true }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>
        <Form.Item name="barcode" label="条形码">
          <Input placeholder="请输入条形码" />
        </Form.Item>
        <Form.Item name="category_name" label="类别">
          <Input placeholder="请输入类别" />
        </Form.Item>
        <Form.Item name="brand" label="品牌">
          <Input placeholder="请输入品牌" />
        </Form.Item>
        <Form.Item name="purchase_price" label="进价" rules={[{ required: true }]}>
          <Input type="number" placeholder="请输入进价" />
        </Form.Item>
        <Form.Item name="sale_price" label="进价" rules={[{ required: true }]}>
          <Input type="number" placeholder="请输入售价" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input placeholder="请输入描述（可选）" />
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditMedicine;

import React, { useRef, useState } from "react";
import { Form, Input, Button, Radio, Space, ImageUploader, Toast, CalendarPicker } from "antd-mobile";
import styles from "./index.module.less";
import { closeWebView } from "@/util/jsBridge";
import Header from "@/component/header";
import { FormInstance } from "antd-mobile/es/components/form";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import SearchList from "@/component/checkList";
import { useCreateRecord, useEditRecord, useGetRecordDetails } from "@/api/record";
import { useGetMedicineList } from "@/api/medicine";
import { useAsyncEffect } from "ahooks";
import { local } from "@/const/env";

const uploadToOSS = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    // TODO: 替换为你的 OSS 上传 API
    const response = await fetch(`${local}:3000/upload`, {
      method: "POST",
      body: formData,
    });
    const res = await response.json();
    if (res.url) {
      return res.url; // 返回 OSS 图片 URL
    } else {
      throw new Error("上传失败");
    }
  } catch (error) {
    console.error("上传失败:", error);
    Toast.show({ content: "上传失败", position: "top" });
    throw error;
  }
};
const EditRecord: React.FC = () => {
  const formRef = useRef<FormInstance>(null);
  const [fileList, setFileList] = useState<{ url: string }[]>([]);

  const [startVisible, setStartVisible] = useState(false);
  const [endVisible, setEndVisible] = useState(false);

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id"); // 获取 id 参数
  const isEdit = Boolean(id);

  const { createRecord } = useCreateRecord();
  const { editRecord } = useEditRecord();

  const { data: medicineData, getMedicineList } = useGetMedicineList();
  const { fetchRecordDetails } = useGetRecordDetails();
  useAsyncEffect(async () => {
    getMedicineList();
    if (!id) {
      return;
    }
    const fetchData = await fetchRecordDetails(id);
    formRef.current?.setFieldsValue(fetchData.data)
  }, []);

  const onFinish = async (values: any) => {
    const res = isEdit ? await editRecord({ data: {...values, id} }) : await createRecord({ data: {...values, id} })
    if (isEdit) {
      closeWebView()
    } else {
      window.location.href = `${local}/reecord/list`; // 直接修改当前 WebView 的 URL
    }
    console.log(`${isEdit}的数据:`, values, res);
  };
  const [form] = Form.useForm(); // 获取 Form 实例

  return (
    <div className={styles.container}>
      <Header
        title={isEdit ? '编辑' : '创建'}
        onBack={() => closeWebView()}
      />
      <Form
        className={styles.form}
        ref={formRef} // 使用 ref 绑定 Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ patientGender: 'male', prescriptionImageUrls: [] }}
      >
        <Form.Item name="patientName" label="姓名" rules={[{ required: true }]}>
          <Input placeholder="请输入姓名" />
        </Form.Item>
        <Form.Item name="patientAge" label="年龄">
          <Input placeholder="请输入年龄" />
        </Form.Item>
        <Form.Item name="patientGender" label="性别">
          <Radio.Group>
            <Space>
              <Radio value='male'>男</Radio>
              <Radio value='female'>女</Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="prescriptionImageUrls" label="处方照片">
        </Form.Item>
        <div style={{
          padding: '0 10px 10px'
        }}>
          <ImageUploader
            value={fileList}
            onChange={(newFileList) => {
              setFileList(newFileList); // 更新图片列表
              console.log('wzy newFileList', newFileList);
              formRef.current?.setFieldsValue({
                prescriptionImageUrls: newFileList.map(file => file.url) // 提取 URL 并写入表单
              });
            }} // 更新图片列表
            upload={async (file) => {
              const url = await uploadToOSS(file);
              return { url };
            }}
            multiple // 支持多张图片
            maxCount={5} // 最多上传 5 张
            showUpload={fileList.length < 5} // 只在没达到 maxCount 时显示上传按钮
          />
        </div>
        <Form.Item
          name="startDate"
          label="开始时间"
          onClick={() => setStartVisible(true)}
        >
          <>{formRef.current?.getFieldValue("startDate") || "请选择开始时间"}</>
        </Form.Item>
        <CalendarPicker
          visible={startVisible}
          selectionMode="single"
          onClose={() => setStartVisible(false)}
          onConfirm={(date: any) => {
            formRef.current?.setFieldsValue({
              startDate: dayjs(date).format("YYYY-MM-DD")
            });
            setStartVisible(false);
          }}
        />

        {/* 选择结束日期 */}
        <Form.Item
          name="endDate"
          label="结束时间"
          onClick={() => setEndVisible(true)}
        >
          <>{formRef.current?.getFieldValue("endDate") || "请选择结束时间"}</>
        </Form.Item>

        <CalendarPicker
          visible={endVisible}
          selectionMode="single"
          onClose={() => setEndVisible(false)}
          onConfirm={(date) => {
            const startDate = form.getFieldValue("startDate");
            if (date && startDate && date < startDate) {
              Toast.show("结束日期不能早于开始日期");
              return;
            }
            formRef.current?.setFieldsValue({
              endDate: dayjs(date).format("YYYY-MM-DD")
            });
            setEndVisible(false);
          }}
        />
        <Form.Item name="totalPrice" label="价格">
          <Input placeholder="请输入价格" />
        </Form.Item>
        <Form.Item name="medications" label="药品">
          <SearchList
            value={formRef.current?.getFieldValue('medications')}
            onChange={(item) => formRef.current?.setFieldValue('medications', item)}
            defaultData={medicineData?.data}
            label={'goods_name'}
            filterFunc={(searchText) => medicineData?.data?.filter((medicine: MedicineInfoFromBackend) => medicine.goods_name.toLowerCase().includes(searchText.toLowerCase()))}
          />
        </Form.Item>
      </Form>
      <div className={styles.footer}>
        <Button block type="submit" color="primary" size="large" onClick={() => formRef.current?.submit()}>
          提交
        </Button>
      </div>
    </div>
  );
};

export default EditRecord;

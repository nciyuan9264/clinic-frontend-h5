import { useEffect, useState } from "react";
import { List, Card, Button, Input, Modal, Toast } from "antd-mobile";
import styles from "./index.module.less";
import Header from "@/component/header";
import { closeWebView, openWebView } from "@/util/jsBridge";
import { local } from "@/const/env";
import { useDeleteRecord, useGetRecordList } from "@/api/record";
import dayjs from "dayjs";

const RecordList = () => {
  const [search, setSearch] = useState("");
  const [recordList, setRecordList] = useState<Array<RecordEntity>>();
  const [filteredList, setFilteredList] = useState(recordList);
  const { getRecordList } = useGetRecordList();
  const { deleteRecord } = useDeleteRecord();

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteRecord(id);
      fetchRecord();
      console.log('删除成功', response.data);
    } catch (err) {
      console.error('删除失败', err);
    }
  };
  const fetchRecord = async () => {
    try {
      const res = await getRecordList();
      console.log('请求列表', res);

      setRecordList(res?.data?.data);
    } catch (e) {
      console.error('请求列表报错', e);
    }
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

  useEffect(() => {
    if (search) {
      const filtered = recordList?.filter((record) =>
        record.patientName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(recordList);
      return;
    }
  }, [search, recordList]);

  return (
    <div className={styles.container}>
      <Header
        title="列表"
        onBack={() => closeWebView()}
      />
      {/* 顶部筛选区域 */}
      <div className={styles.filterBar}>
        <Input
          className={styles.searchInput}
          placeholder="搜索用户名称"
          value={search}
          onChange={setSearch}
        />
      </div>

      {/* 中间滚动列表 */}
      <div className={styles.listWrapper}>
        <List>
          {(filteredList?.length ?? 0) > 0 ? (
            filteredList?.map((record) => (
              <List.Item key={record.id}>
                <Card className={styles.card} onClick={() => {
                  openWebView(`${local}/record/detail/${record.id}`)
                }}>
                  <p><strong>姓名：</strong>{record.patientName}</p>
                  <p><strong>年龄：</strong>{record.patientAge}</p>
                  <p><strong>性别：</strong>{record.patientGender === 'male' ? '男' : '女'}</p>
                  <p><strong>日期：</strong>{dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}</p>
                  <Button
                    style={{ marginTop: '10px' }}
                    block
                    fill="outline"
                    size="mini"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      Modal.confirm({
                        content: '确定要删除该病历吗？',
                        confirmText: '删除',
                        cancelText: '取消',
                        onConfirm: async () => {
                          try {
                            await handleDelete(record.id);
                            Toast.show({ icon: 'success', content: '删除成功' });
                          } catch (err) {
                            Toast.show({ icon: 'fail', content: '删除失败' });
                          }
                        },
                      });
                    }}
                  >
                    删除病历
                  </Button>
                </Card>
              </List.Item>
            ))
          ) : (
            <div className={styles.empty}>暂无药品信息</div>
          )}
        </List>
      </div>

      {/* 底部固定按钮 */}
      <div className={styles.fixedBottom}>
        <Button block color="primary" onClick={() => openWebView(`${local}/record/edit`)}>
          添加病历
        </Button>
      </div>
    </div>
  );
};

export default RecordList;

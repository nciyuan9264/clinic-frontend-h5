import { useEffect, useState } from "react";
import { List, Card, Button, Input, Toast } from "antd-mobile";
import styles from "./index.module.less";
import Header from "@/component/header";
import { closeWebView, openWebView } from "@/util/jsBridge";
import { useGetGoodInfo, useGetMedicineList } from "@/api/medicine";
import { local } from "@/const/env";
import { GetBarcodeInfoType } from "@/const/medicine";

const MedicineList = () => {
  const [search, setSearch] = useState("");
  const [medicineList, setMedicineList] = useState<Array<MedicineInfoFromBackend>>();
  const [filteredList, setFilteredList] = useState(medicineList);
  // const mock = [
  //   {id: 1, barcode: "6908471004470", brand: "养元", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"},
  //   {id: 2, barcode: "6954767425382", brand: "可口可乐", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"},
  //   {id: 3, barcode: "6954767425382", brand: "可口可乐", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"},
  //   {id: 4, barcode: "6954767425382", brand: "可口可乐", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"},
  //   {id: 5, barcode: "6954767425382", brand: "可口可乐", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"},
  //   {id: 6, barcode: "6954767425382", brand: "可口可乐", goods_name: "养元六个核桃精品型核桃乳", price: '12', company: "河北养元智汇饮品股份有限公司"}
  // ]
  const { getMedicineList } = useGetMedicineList();
  const { fetchGoodInfo } = useGetGoodInfo();

  const fetchMedicine = async () => {
    try {
      const res = await getMedicineList();
      console.log('请求列表', res);

      setMedicineList(res?.data?.data);
    } catch (e) {
      console.error('请求列表报错', e);
    }
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

  // const filterOptions = [
  //   { label: "全部", value: "" },
  //   { label: "感冒药", value: "cold" },
  //   { label: "消炎药", value: "antibiotic" },
  // ];

  useEffect(() => {
    if (search) {
      const filtered = medicineList?.filter((medicine) =>
        medicine.goods_name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredList(filtered);
    } else {
      setFilteredList(medicineList);
      return;
    }
  }, [search, medicineList]);

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
          placeholder="搜索药品名称"
          value={search}
          onChange={setSearch}
        />
        <div
          className={styles.scan}
          onClick={async () => {
            const { barcode } = { barcode: '695476742582' }; //await scanBarcode();
            const info = await fetchGoodInfo(barcode, GetBarcodeInfoType.ONLY_DATABASE);
            console.log('info', info);
            if (info.data.success == true) {
              openWebView(`${local}/medicine/detail/${info.data.data.id}`)
            } else {
              Toast.show({ icon: 'fail', content: info.data.message, duration: 2000 });
            }
          }}
        >扫码</div>
        {/* <Dropdown>
          <Dropdown.Item key="1" title="选择分类">
            {filterOptions.map((option) => (
              <Dropdown.Item
                title={option.label}
                key={option.value}
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Item>
        </Dropdown> */}
      </div>

      {/* 中间滚动列表 */}
      <div className={styles.listWrapper}>
        <List>
          {(filteredList?.length ?? 0) > 0 ? (
            filteredList?.map((medicine) => (
              <List.Item key={medicine.id}>
                <Card className={styles.card} onClick={() => {
                  console.log('wzy ', medicine.id);
                  openWebView(`${local}/medicine/detail/${medicine.id}`)
                }}>
                  <p><strong>名称：</strong>{medicine.goods_name}</p>
                  <p><strong>品牌：</strong>{medicine.brand}</p>
                  <p><strong>价格：</strong>¥{medicine.sale_price}</p>
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
        <Button block color="primary" onClick={() => openWebView(`${local}/medicine/edit`)}>
          添加药品
        </Button>
      </div>
    </div>
  );
};

export default MedicineList;

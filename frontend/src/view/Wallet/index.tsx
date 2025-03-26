import React from "react";
import styles from "./index.module.less"; // 使用 CSS Modules

const Wallet: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.homeTitle}>欢迎来到首页</h1>

      <div className={styles.featureModule}>
        <h2>Wallet</h2>
        <div className={styles.buttonGroup}>
          <button onClick={() => alert("功能1被点击")}>功能 1</button>
          <button onClick={() => alert("功能2被点击")}>功能 2</button>
          <button onClick={() => alert("功能3被点击")}>功能 3</button>
        </div>
      </div>
    </div>
  );};

export default Wallet;

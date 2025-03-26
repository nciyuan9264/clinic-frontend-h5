import React from "react";
import styles from "./index.module.less"; // 使用 CSS Modules
import { openWebView } from "@/util/jsBridge";
import { Add, MedicineChest, Notepad, Right, Tool, ViewList } from "@icon-park/react";
import { local } from "@/const/env";

const Home: React.FC = () => {

    return (
        <div className={styles.homeContainer}>
            <div className={styles.header}>xxxxxxxx</div>
            <div className={styles.primaryModule}>
                <div className={`${styles.function1} ${styles.function}`}>
                    <div className={styles.icon}><Add theme="outline" size="40" fill="#fff" /></div>
                    <div className={styles.text}>功能1</div>
                </div>
                <div className={`${styles.function2} ${styles.function}`}>
                    <div className={styles.icon}><ViewList theme="outline" size="40" fill="#fff" /></div>
                    <div className={styles.text}>功能2</div>
                </div>
            </div>
            <div className={styles.minorModule}>
                <div className={styles.minorItem} onClick={() => openWebView(`${local}/medicine/edit`)}>
                    <div> <span className={styles.minorItemIcon}><MedicineChest theme="outline" size="20" fill="#F29100" /></span><span className={styles.minorItemText}>功能 1</span></div>
                    <Right theme="outline" size="20" fill="#333" />
                </div>
                <div className={styles.minorItem} onClick={() => openWebView(`${local}/record/list`)}>
                    <div> <span className={styles.minorItemIcon}><Notepad theme="outline" size="20" fill="#F29100" /></span><span className={styles.minorItemText}>功能 2</span></div>
                    <Right theme="outline" size="20" fill="#333" />
                </div>
                <div className={styles.minorItem} onClick={() => openWebView(`${local}/medicine/detail/1`)}>
                    <div> <span className={styles.minorItemIcon}><Tool theme="outline" size="20" fill="#F29100" /></span><span className={styles.minorItemText}>功能 3</span></div>
                    <Right theme="outline" size="20" fill="#333" />
                </div>
            </div>
            <div className={styles.lastModule}>
                lastModule
            </div>
        </div>
    );
};

export default Home;
